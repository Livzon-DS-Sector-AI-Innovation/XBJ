"""Attendance / 考勤 API routes.

Mounted at /api/v1/hr/attendance/...
"""

import os
import tempfile
from datetime import date
from uuid import UUID
import logging

from fastapi import APIRouter, Depends, File, HTTPException, Query, UploadFile
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.response import success_response, paginated_response
from app.modules.hr.attendance_models import (
    AttendanceCalendar,
    OvertimeRecord,
)
from app.modules.hr.attendance_repository import (
    AttendanceRecordRepository,
    CalendarRepository,
    ConfigRepository,
    ImportBatchRepository,
    LeaveBalanceRepository,
    OvertimeRecordRepository,
)
from app.modules.hr.attendance_schemas import (
    AllConfigResponse,
    AttendanceConfigResponse,
    AttendanceConfigUpdate,
    AttendanceRecordListParams,
    AttendanceRecordListResponse,
    AttendanceRecordResponse,
    CalendarDayResponse,
    CalendarMonthResponse,
    CalendarYearResponse,
    ImportBatchListResponse,
    ImportBatchResponse,
    ImportResult,
    LeaveBalanceResponse,
    LeaveBalanceUpdate,
    OvertimeListParams,
    OvertimeListResponse,
    OvertimeRecordResponse,
    OvertimeSummaryItem,
    OvertimeSummaryParams,
    OvertimeSummaryResponse,
)
from app.modules.hr.attendance_service import (
    import_excel_file,
    init_calendar,
    refresh_position_levels,
)
from app.modules.hr.models import Department, Employee

router = APIRouter(prefix="/attendance", tags=["HR - 考勤管理"])

logger = logging.getLogger(__name__)


# ─── 工作日历 ───────────────────────────────────────────────────────

@router.post("/calendar/init/{year}", summary="初始化年度日历")
async def init_year_calendar(year: int, db: AsyncSession = Depends(get_db)):
    """初始化指定年份的工作日历（覆盖已有数据）。"""
    count = await init_calendar(db, year)
    return success_response(
        data={"year": year, "days_created": count},
        message=f"成功初始化 {year} 年日历，共 {count} 天",
    )


@router.get("/calendar/{year}", summary="查询年度日历")
async def get_year_calendar(year: int, db: AsyncSession = Depends(get_db)):
    days = await CalendarRepository.get_year(db, year)

    # Group by month
    from collections import defaultdict
    months_map: dict[int, list] = defaultdict(list)
    for d in days:
        months_map[d.month].append(d)

    months = []
    total_workdays = 0
    for month in range(1, 13):
        month_days = months_map.get(month, [])
        workdays = sum(1 for d in month_days if d.is_workday)
        holidays = sum(1 for d in month_days if d.day_type == "holiday")
        rest_days = sum(1 for d in month_days if d.day_type == "weekend" and not d.is_workday)
        total_workdays += workdays
        months.append(CalendarMonthResponse(
            year=year,
            month=month,
            workdays=workdays,
            holidays=holidays,
            rest_days=rest_days,
            days=[CalendarDayResponse.model_validate(d) for d in month_days],
        ))

    return success_response(data=CalendarYearResponse(
        year=year,
        total_workdays=total_workdays,
        months=months,
    ))


@router.get("/calendar/{year}/{month}", summary="查询月度日历")
async def get_month_calendar(year: int, month: int, db: AsyncSession = Depends(get_db)):
    days = await CalendarRepository.get_month(db, year, month)
    workdays = sum(1 for d in days if d.is_workday)
    return success_response(data=CalendarMonthResponse(
        year=year,
        month=month,
        workdays=workdays,
        holidays=sum(1 for d in days if d.day_type == "holiday"),
        rest_days=sum(1 for d in days if d.day_type == "weekend" and not d.is_workday),
        days=[CalendarDayResponse.model_validate(d) for d in days],
    ))


# ─── Excel 导入 ─────────────────────────────────────────────────────

@router.post("/import", summary="上传考勤Excel并导入")
async def import_attendance(
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
):
    """上传公司导出的考勤日报Excel文件，自动解析并计算加班。"""
    if not file.filename or not file.filename.endswith((".xlsx", ".xls")):
        raise HTTPException(status_code=400, detail="仅支持 .xlsx 或 .xls 格式")

    # Save uploaded file to temp
    content = await file.read()
    file_size = len(content)

    with tempfile.NamedTemporaryFile(delete=False, suffix=".xlsx") as tmp:
        tmp.write(content)
        tmp_path = tmp.name

    try:
        # Load employee map — 老厂 + 新厂
        emp_result = await db.execute(
            select(Employee).where(Employee.is_deleted == False)
        )
        employees: list[Employee] = list(emp_result.scalars().all())
        employee_map: dict[str, Employee] = {e.employee_number: e for e in employees}

        # 新厂员工（从 employees_new clone 表）
        from sqlalchemy import text as sa_text
        new_emp_result = await db.execute(
            sa_text("SELECT * FROM hr.employees_new WHERE is_deleted = false")
        )
        new_emp_rows = new_emp_result.mappings().all()
        for row in new_emp_rows:
            en = row.get("employee_number")
            if en and en not in employee_map:
                emp = Employee(
                    id=row.get("id"),
                    employee_number=en,
                    name=row.get("name", ""),
                    department=row.get("department", ""),
                    position=row.get("position", ""),
                    hire_date=row.get("hire_date"),
                )
                employee_map[en] = emp

        # Debug
        sample_keys = sorted(employee_map.keys())[:5]
        logger.info(f"Employee map size: {len(employee_map)}, sample keys: {sample_keys}")
        logger.info(f"'105000490' in map: {'105000490' in employee_map}")
        logger.info(f"'105000625' in map: {'105000625' in employee_map}")

        # Load department map
        dept_result = await db.execute(
            select(Department).where(Department.is_deleted == False)
        )
        depts: list[Department] = list(dept_result.scalars().all())
        department_map = {d.name: d for d in depts}

        # Load configs
        configs = await ConfigRepository.get_all(db)

        # Parse all dates from Excel to pre-load calendar
        import openpyxl
        wb = openpyxl.load_workbook(tmp_path, read_only=True, data_only=True)
        ws = wb.active
        all_dates: list[date] = []
        for row in ws.iter_rows(min_row=2, values_only=True):
            if row and len(row) > 0 and row[0]:
                val = row[0]
                if isinstance(val, date):
                    all_dates.append(val)
                elif isinstance(val, str):
                    try:
                        all_dates.append(date.fromisoformat(val[:10]))
                    except ValueError:
                        pass
        wb.close()

        calendar_map = await CalendarRepository.get_map(db, all_dates)

        # Auto-determine position_level for all employees before import
        for emp in employees:
            if not emp.position_level:
                from app.modules.hr.attendance_service import determine_position_level
                emp.position_level = determine_position_level(emp.position)

        # Import
        batch = await import_excel_file(
            file_path=tmp_path,
            file_name=file.filename or "unknown.xlsx",
            file_size=file_size,
            db_session=db,
            employee_map=employee_map,
            department_map=department_map,
            calendar_map=calendar_map,
            configs=configs,
            imported_by=None,
        )

        await db.commit()

        return success_response(
            data=ImportResult(
                batch_id=batch.id,
                file_name=batch.file_name,
                record_count=batch.record_count,
                overtime_count=batch.overtime_count,
                skipped_count=len(batch.warnings or []),
                warnings=batch.warnings or [],
            ),
            message=f"导入完成：{batch.record_count} 条考勤记录，{batch.overtime_count} 条加班记录",
        )

    except Exception as e:
        logger.exception("Excel import failed")
        raise HTTPException(status_code=500, detail=f"导入失败: {str(e)}")
    finally:
        # Clean up temp file
        try:
            os.unlink(tmp_path)
        except OSError:
            pass


# ─── 导入批次 ───────────────────────────────────────────────────────

@router.get("/batches", summary="查询导入批次列表")
async def list_batches(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    items, total = await ImportBatchRepository.list_batches(db, page, page_size)
    return paginated_response(
        data=[ImportBatchResponse.model_validate(b) for b in items],
        total=total,
        page=page,
        page_size=page_size,
    )


@router.get("/batches/{batch_id}", summary="查询批次详情")
async def get_batch_detail(batch_id: UUID, db: AsyncSession = Depends(get_db)):
    batch = await ImportBatchRepository.get_by_id(db, batch_id)
    if not batch:
        raise HTTPException(status_code=404, detail="批次不存在")
    return success_response(data=ImportBatchResponse.model_validate(batch))


# ─── 考勤记录 ───────────────────────────────────────────────────────

@router.get("/records", summary="查询考勤记录")
async def list_records(
    date_from: date | None = Query(None),
    date_to: date | None = Query(None),
    employee_number: str | None = Query(None),
    employee_name: str | None = Query(None),
    department: str | None = Query(None),
    is_abnormal: bool | None = Query(None),
    import_batch: str | None = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    items, total = await AttendanceRecordRepository.list_records(
        db,
        date_from=date_from,
        date_to=date_to,
        employee_number=employee_number,
        employee_name=employee_name,
        department=department,
        is_abnormal=is_abnormal,
        import_batch=import_batch,
        page=page,
        page_size=page_size,
    )

    def to_response(rec) -> dict:
        return AttendanceRecordResponse(
            id=rec.id,
            record_date=rec.record_date,
            employee_id=rec.employee_id,
            employee_number=rec.employee_number,
            employee_name=None,
            department_name=None,
            shift=rec.shift,
            is_abnormal=rec.is_abnormal,
            actual_minutes=rec.actual_minutes,
            clock_in=rec.clock_in,
            clock_out=rec.clock_out,
            absent_minutes=rec.absent_minutes,
            absent_days=rec.absent_days,
            late_minutes=rec.late_minutes,
            late_count=rec.late_count,
            early_minutes=rec.early_minutes,
            early_count=rec.early_count,
            annual_leave_days=rec.annual_leave_days,
            personal_leave=rec.personal_leave,
            comp_leave=rec.comp_leave,
            sick_leave_days=rec.sick_leave_days,
            marriage_leave_days=rec.marriage_leave_days,
            maternity_leave_days=rec.maternity_leave_days,
            funeral_leave_days=rec.funeral_leave_days,
            injury_leave_days=rec.injury_leave_days,
            business_trip=rec.business_trip,
            nursing_leave_days=rec.nursing_leave_days,
            training_days=rec.training_days,
            area=rec.area,
            shutdown_comp_leave=rec.shutdown_comp_leave,
            source_file=rec.source_file,
            import_batch=rec.import_batch,
            created_at=rec.created_at,
        )

    return paginated_response(
        data=[to_response(r) for r in items],
        total=total,
        page=page,
        page_size=page_size,
    )


@router.get("/records/{record_id}", summary="查询单条考勤记录")
async def get_record(record_id: UUID, db: AsyncSession = Depends(get_db)):
    record = await AttendanceRecordRepository.get_by_id(db, record_id)
    if not record:
        raise HTTPException(status_code=404, detail="考勤记录不存在")

    return success_response(data=AttendanceRecordResponse(
        id=record.id,
        record_date=record.record_date,
        employee_id=record.employee_id,
        employee_number=record.employee_number,
        employee_name=None,
        department_name=None,
        shift=record.shift,
        is_abnormal=record.is_abnormal,
        actual_minutes=record.actual_minutes,
        clock_in=record.clock_in,
        clock_out=record.clock_out,
        absent_minutes=record.absent_minutes,
        absent_days=record.absent_days,
        late_minutes=record.late_minutes,
        late_count=record.late_count,
        early_minutes=record.early_minutes,
        early_count=record.early_count,
        annual_leave_days=record.annual_leave_days,
        personal_leave=record.personal_leave,
        comp_leave=record.comp_leave,
        sick_leave_days=record.sick_leave_days,
        marriage_leave_days=record.marriage_leave_days,
        maternity_leave_days=record.maternity_leave_days,
        funeral_leave_days=record.funeral_leave_days,
        injury_leave_days=record.injury_leave_days,
        business_trip=record.business_trip,
        nursing_leave_days=record.nursing_leave_days,
        training_days=record.training_days,
        area=record.area,
        shutdown_comp_leave=record.shutdown_comp_leave,
        source_file=record.source_file,
        import_batch=record.import_batch,
        created_at=record.created_at,
    ))


# ─── 加班记录 ───────────────────────────────────────────────────────

@router.get("/overtime", summary="查询加班记录")
async def list_overtime(
    date_from: date | None = Query(None),
    date_to: date | None = Query(None),
    employee_number: str | None = Query(None),
    employee_name: str | None = Query(None),
    department: str | None = Query(None),
    overtime_type: str | None = Query(None),
    conversion_type: str | None = Query(None),
    import_batch: str | None = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    items, total = await OvertimeRecordRepository.list_records(
        db,
        date_from=date_from,
        date_to=date_to,
        employee_number=employee_number,
        employee_name=employee_name,
        department=department,
        overtime_type=overtime_type,
        conversion_type=conversion_type,
        import_batch=import_batch,
        page=page,
        page_size=page_size,
    )

    def to_response(ot) -> OvertimeRecordResponse:
        return OvertimeRecordResponse(
            id=ot.id,
            employee_id=ot.employee_id,
            employee_number=None,
            employee_name=None,
            department_name=None,
            attendance_record_id=ot.attendance_record_id,
            record_date=ot.record_date,
            overtime_type=ot.overtime_type,
            overtime_hours=ot.overtime_hours,
            conversion_type=ot.conversion_type,
            comp_leave_hours=ot.comp_leave_hours or 0.0,
            overtime_pay=ot.overtime_pay or 0.0,
            overtime_rate=ot.overtime_rate or 10.0,
            calculated_at=ot.calculated_at,
            import_batch=ot.import_batch,
            created_at=ot.created_at,
        )

    return paginated_response(
        data=[to_response(r) for r in items],
        total=total,
        page=page,
        page_size=page_size,
    )


@router.get("/overtime/summary", summary="加班汇总")
async def overtime_summary(
    year: int = Query(..., description="年份"),
    month: int | None = Query(None, description="月份，不传则全年"),
    group_by: str = Query("department", description="汇总维度: department/employee/month"),
    db: AsyncSession = Depends(get_db),
):
    if group_by not in ("department", "employee", "month"):
        raise HTTPException(status_code=400, detail="group_by 仅支持: department, employee, month")

    rows = await OvertimeRecordRepository.get_summary(
        db, year=year, month=month, group_by=group_by
    )

    items = [OvertimeSummaryItem(**r) for r in rows]
    total_ot = sum(item.total_ot_hours for item in items)
    total_comp = sum(item.comp_leave_hours for item in items)
    total_pay = sum(item.overtime_pay for item in items)

    return success_response(data=OvertimeSummaryResponse(
        items=items,
        total_overtime_hours=total_ot,
        total_comp_leave_hours=total_comp,
        total_overtime_pay=total_pay,
    ))


# ─── 假期余额 ───────────────────────────────────────────────────────

@router.get("/leave-balances/{employee_id}", summary="查询员工假期余额")
async def get_leave_balances(
    employee_id: UUID,
    year: int | None = Query(None, description="年份，不传则当前年"),
    db: AsyncSession = Depends(get_db),
):
    balances = await LeaveBalanceRepository.get_by_employee(db, employee_id, year)

    # Enrich with employee info
    emp_result = await db.execute(
        select(Employee).where(Employee.id == employee_id, Employee.is_deleted == False)
    )
    emp = emp_result.scalar_one_or_none()

    result = []
    for b in balances:
        result.append(LeaveBalanceResponse(
            id=b.id,
            employee_id=b.employee_id,
            employee_number=emp.employee_number if emp else None,
            employee_name=emp.name if emp else None,
            year=b.year,
            leave_type=b.leave_type,
            total_days=b.total_days,
            used_days=b.used_days,
            remaining_days=b.total_days - b.used_days,
            created_at=b.created_at,
        ))

    return success_response(data=result)


@router.put("/leave-balances/{balance_id}", summary="调整假期余额")
async def update_leave_balance(
    balance_id: UUID,
    body: LeaveBalanceUpdate,
    db: AsyncSession = Depends(get_db),
):
    balance = await LeaveBalanceRepository.get_by_id(db, balance_id)
    if not balance:
        raise HTTPException(status_code=404, detail="假期余额记录不存在")

    if body.total_days is not None:
        balance.total_days = body.total_days
    if body.used_days is not None:
        balance.used_days = body.used_days

    await db.commit()
    return success_response(data=LeaveBalanceResponse(
        id=balance.id,
        employee_id=balance.employee_id,
        year=balance.year,
        leave_type=balance.leave_type,
        total_days=balance.total_days,
        used_days=balance.used_days,
        remaining_days=balance.total_days - balance.used_days,
        created_at=balance.created_at,
    ), message="更新成功")


# ─── 系统配置 ───────────────────────────────────────────────────────

@router.get("/config", summary="查询考勤配置")
async def get_configs(db: AsyncSession = Depends(get_db)):
    configs = await ConfigRepository.get_all(db)
    items = []
    # Also load all config objects for full info
    result = await db.execute(
        select(AttendanceCalendar).where(False)  # dummy
    )
    del result  # unused; fetch real configs below

    from app.modules.hr.attendance_models import AttendanceConfig
    config_result = await db.execute(
        select(AttendanceConfig).where(AttendanceConfig.is_deleted == False)
    )
    config_objects = config_result.scalars().all()

    return success_response(data=AllConfigResponse(
        items=[AttendanceConfigResponse.model_validate(c) for c in config_objects]
    ))


@router.put("/config/{config_key}", summary="更新考勤配置")
async def update_config(
    config_key: str,
    body: AttendanceConfigUpdate,
    db: AsyncSession = Depends(get_db),
):
    cfg = await ConfigRepository.get_by_key(db, config_key)
    if not cfg:
        raise HTTPException(status_code=404, detail=f"配置项 '{config_key}' 不存在")
    cfg.config_value = body.config_value
    await db.commit()
    return success_response(
        data=AttendanceConfigResponse.model_validate(cfg),
        message="配置已更新",
    )


# ─── 职位级别刷新 ──────────────────────────────────────────────────

@router.post("/refresh-position-levels", summary="刷新所有员工职位级别")
async def refresh_levels(db: AsyncSession = Depends(get_db)):
    """根据员工职位名称重新判定 position_level（主管级/工程师级/普通员工）。"""
    count = await refresh_position_levels(db)
    await db.commit()
    return success_response(
        data={"updated_count": count},
        message=f"职位级别刷新完成，共更新 {count} 名员工",
    )
