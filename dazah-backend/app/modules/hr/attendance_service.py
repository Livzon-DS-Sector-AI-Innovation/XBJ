"""Attendance / 考勤 business logic.

- position_level 自动判定
- 加班计算引擎
- Excel 导入解析
- 日历初始化
"""

import uuid
from datetime import date, datetime, time, timedelta
from typing import Any

import openpyxl

from app.modules.hr.attendance_models import (
    AttendanceCalendar,
    AttendanceConfig,
    AttendanceImportBatch,
    AttendanceRecord,
    LeaveBalance,
    OvertimeRecord,
)
from app.modules.hr.calendar_data import generate_year_calendar
from app.modules.hr.models import Department, Employee


# ─── 职位级别判定 ──────────────────────────────────────────────────

# 默认关键词（数据库配置优先）
_DEFAULT_SUPERVISOR_KEYWORDS = ["主管", "经理", "主任", "科长", "部长", "厂长", "总监", "副总"]
_DEFAULT_ENGINEER_KEYWORDS = ["工程师", "技术员", "技师", "研究员"]


def determine_position_level(
    position: str,
    supervisor_keywords: list[str] | None = None,
    engineer_keywords: list[str] | None = None,
) -> str:
    """根据职位名称关键词自动判定职位级别。

    Returns: '主管级' | '工程师级' | '普通员工'
    """
    if supervisor_keywords is None:
        supervisor_keywords = _DEFAULT_SUPERVISOR_KEYWORDS
    if engineer_keywords is None:
        engineer_keywords = _DEFAULT_ENGINEER_KEYWORDS

    for kw in supervisor_keywords:
        if kw in position:
            return "主管级"
    for kw in engineer_keywords:
        if kw in position:
            return "工程师级"
    return "普通员工"


# ─── 加班计算引擎 ──────────────────────────────────────────────────

def _parse_time(time_str: str | None) -> time:
    """Parse HH:MM string to time object."""
    if not time_str:
        return time(17, 0)  # default end
    h, m = time_str.strip().split(":")
    return time(int(h), int(m))


def _round_to_half(hours: float) -> float:
    """Round to nearest 0.5h."""
    return round(hours * 2) / 2


def calculate_overtime(
    *,
    record: AttendanceRecord,
    calendar: AttendanceCalendar,
    employee: Employee | None,
    department: Department | None,
    configs: dict[str, str],
) -> OvertimeRecord | None:
    """Calculate overtime for one attendance record.

    Returns an OvertimeRecord if there's overtime, or None.
    """
    # 无打卡时间 → 无法计算加班
    if record.clock_in is None or record.clock_out is None:
        return None
    # 异常标记 → 不计加班
    if record.is_abnormal:
        return None

    overtime_type = _determine_overtime_type(calendar)
    if overtime_type is None:
        return None

    # 确定标准工时结束时间
    if department and department.production_start_time and department.production_end_time:
        standard_start = _parse_time(department.production_start_time)
        standard_end = _parse_time(department.production_end_time)
    else:
        standard_start = _parse_time(configs.get("standard_start_time", "08:30"))
        standard_end = _parse_time(configs.get("standard_end_time", "17:00"))

    standard_work_minutes = int(configs.get("standard_work_minutes", "450"))

    # 计算加班时长
    if overtime_type == "weekday":
        # 工作日：下班超出标准时间 + 上班早于标准时间（如有）
        clock_out_t = record.clock_out.time() if isinstance(record.clock_out, datetime) else record.clock_out
        clock_in_t = record.clock_in.time() if isinstance(record.clock_in, datetime) else record.clock_in

        # 只计算超出标准工时的部分
        if record.actual_minutes and record.actual_minutes > standard_work_minutes:
            extra_minutes = record.actual_minutes - standard_work_minutes
        else:
            # Fallback: 直接从打卡时间计算
            end_dt = datetime.combine(record.record_date, standard_end)
            clock_out_dt = datetime.combine(record.record_date, clock_out_t)
            extra_minutes_out = max(0, (clock_out_dt - end_dt).total_seconds() / 60)

            start_dt = datetime.combine(record.record_date, standard_start)
            clock_in_dt = datetime.combine(record.record_date, clock_in_t)
            extra_minutes_in = max(0, (start_dt - clock_in_dt).total_seconds() / 60)

            extra_minutes = extra_minutes_out + extra_minutes_in

        overtime_hours = _round_to_half(extra_minutes / 60)
    else:
        # 休息日/节假日：按实际出勤分钟算加班
        if record.actual_minutes and record.actual_minutes > 0:
            overtime_hours = _round_to_half(record.actual_minutes / 60)
        else:
            # fallback: 从打卡时间计算
            if isinstance(record.clock_in, datetime) and isinstance(record.clock_out, datetime):
                diff = (record.clock_out - record.clock_in).total_seconds() / 3600
                overtime_hours = _round_to_half(diff)
            else:
                return None

    # 太小不算
    if overtime_hours < 0.5:
        return None

    # 判定转换类型
    conversion_type = _determine_conversion_type(employee, department)

    # 计算金额
    overtime_rate = float(configs.get("overtime_rate", "10.00"))
    comp_leave_hours = overtime_hours if conversion_type == "comp_leave" else 0.0
    overtime_pay = overtime_hours * overtime_rate if conversion_type == "overtime_pay" else 0.0

    now = datetime.utcnow()
    return OvertimeRecord(
        id=uuid.uuid4(),
        employee_id=record.employee_id,
        attendance_record_id=record.id,
        record_date=record.record_date,
        overtime_type=overtime_type,
        overtime_hours=overtime_hours,
        conversion_type=conversion_type,
        comp_leave_hours=comp_leave_hours,
        overtime_pay=overtime_pay,
        overtime_rate=overtime_rate,
        calculated_at=now,
        import_batch=record.import_batch,
    )


def _determine_overtime_type(calendar: AttendanceCalendar) -> str | None:
    """Determine the overtime category for a date."""
    if calendar.is_workday and calendar.day_type == "workday":
        return "weekday"
    elif not calendar.is_workday and calendar.day_type == "weekend":
        return "weekend"
    elif not calendar.is_workday and calendar.day_type == "holiday":
        return "holiday"
    elif calendar.is_workday and calendar.day_type == "weekend":
        # 调休上班的周末 → 算工作日
        return "weekday"
    return None


def _determine_conversion_type(
    employee: Employee | None,
    department: Department | None,
) -> str:
    """Determine whether overtime converts to comp_leave or overtime_pay."""
    # 主管级 / 工程师级 → 无加班费，全部调休
    if employee and employee.position_level in ("主管级", "工程师级"):
        return "comp_leave"
    # 非生产部门 → 调休
    if department is None or not department.is_production:
        return "comp_leave"
    # 生产部门普通员工 → 加班费
    return "overtime_pay"


# ─── Excel 导入 ─────────────────────────────────────────────────────

# 预期的 Excel 列映射（0-based index → model field）
EXCEL_COLUMN_MAP: dict[int, tuple[str, type]] = {
    0:  ("record_date", "date"),       # A: 日期
    1:  ("employee_number", "str"),    # B: 工号
    2:  ("_name", "str"),              # C: 姓名（仅校验用）
    3:  ("_department", "str"),        # D: 部门（不存储）
    4:  ("shift", "str"),              # E: 班次
    5:  ("is_abnormal", "bool"),       # F: 异常
    6:  ("actual_minutes", "int"),     # G: 实际出勤分钟
    7:  ("clock_in", "datetime"),      # H: 进卡
    8:  ("clock_out", "datetime"),     # I: 出卡
    9:  ("absent_minutes", "int"),     # J: 缺勤分钟
    10: ("absent_days", "float"),      # K: 旷工天数
    11: ("late_minutes", "int"),       # L: 迟到分钟
    12: ("late_count", "int"),         # M: 迟到次数
    13: ("early_minutes", "int"),      # N: 早退分钟
    14: ("early_count", "int"),        # O: 早退次数
    15: ("_weekday_ot", "float"),      # P: 工作日加班（Excel列，不存）
    16: ("_weekend_ot", "float"),      # Q: 休息日加班（Excel列，不存）
    17: ("_holiday_ot", "float"),      # R: 节假日加班（Excel列，不存）
    18: ("_ot_to_comp", "float"),      # S: 加班转调休（Excel列，不存）
    19: ("annual_leave_days", "float"),# T: 年假
    20: ("personal_leave", "float"),   # U: 事假
    21: ("comp_leave", "float"),       # V: 调休
    22: ("sick_leave_days", "float"),  # W: 病假
    23: ("marriage_leave_days", "float"),  # X: 婚假
    24: ("maternity_leave_days", "float"), # Y: 产假
    25: ("funeral_leave_days", "float"),   # Z: 丧假
    26: ("injury_leave_days", "float"),    # AA: 工伤假
    27: ("business_trip", "float"),        # AB: 出差
    28: ("nursing_leave_days", "float"),   # AC: 看护假
    29: ("training_days", "float"),        # AD: 培训
    30: ("area", "str"),              # AE: 区域
    31: ("shutdown_comp_leave", "float"),  # AF: 停工调休
}


def _parse_cell_value(value: Any, target_type: str) -> Any:
    """Parse Excel cell value to target Python type."""
    if value is None:
        return None

    if target_type == "str":
        return str(value).strip() if value else None

    if target_type == "int":
        try:
            return int(float(str(value)))
        except (ValueError, TypeError):
            return None

    if target_type == "float":
        try:
            return float(str(value))
        except (ValueError, TypeError):
            return None

    if target_type == "date":
        if isinstance(value, datetime):
            return value.date()
        if isinstance(value, date):
            return value
        return None

    if target_type == "datetime":
        if isinstance(value, datetime):
            return value
        if isinstance(value, date):
            return datetime.combine(value, time(0, 0))
        return None

    if target_type == "bool":
        if isinstance(value, bool):
            return value
        if isinstance(value, str):
            return value.strip() == "是"
        return False

    return value


def parse_excel_row(row_data: list[Any]) -> dict[str, Any]:
    """Parse one Excel row into a dict of model fields.

    Returns dict with keys matching AttendanceRecord fields.
    Fields prefixed with '_' are skipped (not stored).
    """
    result: dict[str, Any] = {}
    for col_idx, (field_name, field_type) in EXCEL_COLUMN_MAP.items():
        if field_name.startswith("_"):
            continue
        if col_idx < len(row_data):
            result[field_name] = _parse_cell_value(row_data[col_idx], field_type)
    return result


async def import_excel_file(
    file_path: str,
    file_name: str,
    file_size: int,
    db_session,
    employee_map: dict[str, Employee],     # employee_number → Employee
    department_map: dict[str, Department],  # name → Department
    calendar_map: dict[date, AttendanceCalendar],
    configs: dict[str, str],
    imported_by: str | None = None,
) -> AttendanceImportBatch:
    """Import attendance Excel file.

    Steps:
    1. Parse all rows from Excel
    2. Match employees by employee_number
    3. Write AttendanceRecords (incl. unmatched)
    4. Calculate overtime for matched records
    5. Return batch summary
    """
    batch_id = str(uuid.uuid4())
    batch = AttendanceImportBatch(
        id=uuid.UUID(batch_id),
        file_name=file_name,
        file_size=file_size,
        status="processing",
        imported_by=imported_by,
        imported_at=datetime.utcnow(),
    )
    db_session.add(batch)
    await db_session.flush()

    # Parse Excel
    wb = openpyxl.load_workbook(file_path, read_only=True, data_only=True)
    ws = wb.active
    rows = list(ws.iter_rows(min_row=2, values_only=True))  # skip header
    wb.close()

    if not rows:
        batch.status = "failed"
        batch.error_message = "Excel 文件中无数据行"
        await db_session.flush()
        return batch

    records: list[AttendanceRecord] = []
    warnings: list[str] = []
    date_min: date | None = None
    date_max: date | None = None

    for row_idx, row_data in enumerate(rows):
        if all(v is None for v in row_data):
            continue  # skip empty rows

        parsed = parse_excel_row(list(row_data))
        emp_number = parsed.get("employee_number", "")
        if not emp_number:
            warnings.append(f"第 {row_idx + 2} 行：工号为空，跳过")
            continue

        employee = employee_map.get(emp_number)

        # Build record
        record = AttendanceRecord(
            id=uuid.uuid4(),
            employee_id=employee.id if employee else None,
            employee_number=emp_number,
            record_date=parsed.get("record_date"),
            shift=parsed.get("shift"),
            is_abnormal=parsed.get("is_abnormal", False),
            actual_minutes=parsed.get("actual_minutes"),
            clock_in=parsed.get("clock_in"),
            clock_out=parsed.get("clock_out"),
            absent_minutes=parsed.get("absent_minutes"),
            absent_days=parsed.get("absent_days"),
            late_minutes=parsed.get("late_minutes"),
            late_count=parsed.get("late_count"),
            early_minutes=parsed.get("early_minutes"),
            early_count=parsed.get("early_count"),
            annual_leave_days=parsed.get("annual_leave_days"),
            personal_leave=parsed.get("personal_leave"),
            comp_leave=parsed.get("comp_leave"),
            sick_leave_days=parsed.get("sick_leave_days"),
            marriage_leave_days=parsed.get("marriage_leave_days"),
            maternity_leave_days=parsed.get("maternity_leave_days"),
            funeral_leave_days=parsed.get("funeral_leave_days"),
            injury_leave_days=parsed.get("injury_leave_days"),
            business_trip=parsed.get("business_trip"),
            nursing_leave_days=parsed.get("nursing_leave_days"),
            training_days=parsed.get("training_days"),
            area=parsed.get("area"),
            shutdown_comp_leave=parsed.get("shutdown_comp_leave"),
            source_file=file_name,
            import_batch=batch_id,
        )
        records.append(record)

        # Track date range
        rd = parsed.get("record_date")
        if rd and isinstance(rd, date):
            if date_min is None or rd < date_min:
                date_min = rd
            if date_max is None or rd > date_max:
                date_max = rd

        if not employee:
            warnings.append(f"工号 {emp_number}（第 {row_idx + 2} 行）：未匹配到员工")

    # Bulk insert records
    if records:
        db_session.add_all(records)
        await db_session.flush()

    # Calculate overtime
    overtime_records: list[OvertimeRecord] = []
    for record in records:
        if not record.employee_id:
            continue  # skip unmatched

        cal = calendar_map.get(record.record_date) if record.record_date else None
        if cal is None:
            continue

        employee = employee_map.get(record.employee_number)
        if employee is None:
            continue

        # Get department
        dept = department_map.get(employee.department) if employee.department else None

        ot = calculate_overtime(
            record=record,
            calendar=cal,
            employee=employee,
            department=dept,
            configs=configs,
        )
        if ot:
            overtime_records.append(ot)

    if overtime_records:
        db_session.add_all(overtime_records)

    # Update batch
    batch.record_count = len(records)
    batch.overtime_count = len(overtime_records)
    batch.date_range_start = date_min
    batch.date_range_end = date_max
    batch.warnings = warnings if warnings else None
    batch.status = "completed"
    await db_session.flush()

    return batch


# ─── 日历初始化 ─────────────────────────────────────────────────────

async def init_calendar(db_session, year: int = 2026) -> int:
    """Initialize attendance calendar for a year.

    Deletes existing data for the year first, then inserts.
    Returns count of inserted rows.
    """
    from sqlalchemy import text

    await db_session.execute(
        text("DELETE FROM hr.attendance_calendars WHERE year = :year"),
        {"year": year},
    )

    rows = generate_year_calendar(year)
    now = datetime.utcnow()

    for r in rows:
        await db_session.execute(
            text("""
                INSERT INTO hr.attendance_calendars
                    (id, date, year, month, day, day_of_week, day_type, holiday_name, is_workday, is_deleted, created_at, updated_at)
                VALUES
                    (:id, :date, :year, :month, :day, :day_of_week, :day_type, :holiday_name, :is_workday, :is_deleted, :created_at, :updated_at)
            """),
            {
                "id": uuid.uuid4(),
                "date": r["date"],
                "year": r["year"],
                "month": r["month"],
                "day": r["day"],
                "day_of_week": r["day_of_week"],
                "day_type": r["day_type"],
                "holiday_name": r["holiday_name"],
                "is_workday": r["is_workday"],
                "is_deleted": False,
                "created_at": now,
                "updated_at": now,
            },
        )

    await db_session.flush()
    return len(rows)


# ─── 职位级别批量更新 ──────────────────────────────────────────────

async def refresh_position_levels(db_session) -> int:
    """Re-calculate position_level for all employees based on their position field.

    Returns count of updated employees.
    """
    from sqlalchemy import select, update

    result = await db_session.execute(select(Employee).where(Employee.is_deleted == False))
    employees: list[Employee] = list(result.scalars().all())

    updated = 0
    for emp in employees:
        new_level = determine_position_level(emp.position)
        if emp.position_level != new_level:
            emp.position_level = new_level
            updated += 1

    await db_session.flush()
    return updated
