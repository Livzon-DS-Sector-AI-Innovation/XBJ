"""Attendance / 考勤 sub-module ORM models.

Tables in the ``hr`` schema:
- attendance_calendars     — 工作日历
- attendance_records       — 考勤原始记录（导入存储）
- overtime_records         — 加班计算记录
- leave_balances           — 假期余额
- attendance_import_batches— 导入批次
- attendance_config        — 考勤系统配置
"""

from datetime import date, datetime
from uuid import UUID

from sqlalchemy import JSON, Boolean, Date, DateTime, Float, Index, Integer, String, Text, Uuid
from sqlalchemy.orm import Mapped, mapped_column

from app.shared.base_model import BaseModel


# ─── 工作日历 ───────────────────────────────────────────────────────

class AttendanceCalendar(BaseModel):
    __tablename__ = "attendance_calendars"
    __table_args__ = (
        Index("ix_attendance_calendars_date", "date", unique=True),
        Index("ix_attendance_calendars_year_month", "year", "month"),
        {"schema": "hr"},
    )

    date: Mapped[date] = mapped_column(Date, nullable=False, comment="日期")
    year: Mapped[int] = mapped_column(Integer, nullable=False, comment="年份")
    month: Mapped[int] = mapped_column(Integer, nullable=False, comment="月份")
    day: Mapped[int] = mapped_column(Integer, nullable=False, comment="日")
    day_of_week: Mapped[int] = mapped_column(Integer, nullable=False, comment="星期几 (0=Mon, 6=Sun)")
    day_type: Mapped[str] = mapped_column(
        String(16), nullable=False, comment="日期类型: workday/weekend/holiday"
    )
    holiday_name: Mapped[str | None] = mapped_column(
        String(64), nullable=True, comment="节假日名称"
    )
    is_workday: Mapped[bool] = mapped_column(
        Boolean, nullable=False, default=True, comment="是否上班日（考虑调休后）"
    )


# ─── 考勤原始记录 ──────────────────────────────────────────────────

class AttendanceRecord(BaseModel):
    __tablename__ = "attendance_records"
    __table_args__ = (
        Index("ix_attendance_records_date", "record_date"),
        Index("ix_attendance_records_employee", "employee_id"),
        Index("ix_attendance_records_employee_number", "employee_number"),
        Index("ix_attendance_records_import_batch", "import_batch"),
        {"schema": "hr"},
    )

    record_date: Mapped[date] = mapped_column(Date, nullable=False, comment="考勤日期")
    employee_id: Mapped[UUID | None] = mapped_column(
        Uuid(as_uuid=True), nullable=True, comment="员工ID（工号未匹配时为null）"
    )
    employee_number: Mapped[str] = mapped_column(String(32), nullable=False, comment="工号")

    # ─── 打卡信息 ───
    shift: Mapped[str | None] = mapped_column(String(64), nullable=True, comment="班次")
    is_abnormal: Mapped[bool] = mapped_column(
        Boolean, nullable=False, default=False, comment="是否异常"
    )
    actual_minutes: Mapped[int | None] = mapped_column(Integer, nullable=True, comment="实际出勤分钟")
    clock_in: Mapped[datetime | None] = mapped_column(DateTime, nullable=True, comment="上班打卡时间")
    clock_out: Mapped[datetime | None] = mapped_column(DateTime, nullable=True, comment="下班打卡时间")

    # ─── 缺勤/迟到/早退 ───
    absent_minutes: Mapped[int | None] = mapped_column(Integer, nullable=True, comment="缺勤分钟")
    absent_days: Mapped[float | None] = mapped_column(Float, nullable=True, comment="旷工天数")
    late_minutes: Mapped[int | None] = mapped_column(Integer, nullable=True, comment="迟到分钟")
    late_count: Mapped[int | None] = mapped_column(Integer, nullable=True, comment="迟到次数")
    early_minutes: Mapped[int | None] = mapped_column(Integer, nullable=True, comment="早退分钟")
    early_count: Mapped[int | None] = mapped_column(Integer, nullable=True, comment="早退次数")

    # ─── 请假 / 出差 / 培训（Excel 原始列） ───
    annual_leave_days: Mapped[float | None] = mapped_column(Float, nullable=True, comment="年假（天）")
    personal_leave: Mapped[float | None] = mapped_column(Float, nullable=True, comment="事假（天/小时）")
    comp_leave: Mapped[float | None] = mapped_column(Float, nullable=True, comment="调休（天/小时）")
    sick_leave_days: Mapped[float | None] = mapped_column(Float, nullable=True, comment="病假（天）")
    marriage_leave_days: Mapped[float | None] = mapped_column(Float, nullable=True, comment="婚假（天）")
    maternity_leave_days: Mapped[float | None] = mapped_column(Float, nullable=True, comment="产假（天）")
    funeral_leave_days: Mapped[float | None] = mapped_column(Float, nullable=True, comment="丧假（天）")
    injury_leave_days: Mapped[float | None] = mapped_column(Float, nullable=True, comment="工伤假（天）")
    business_trip: Mapped[float | None] = mapped_column(Float, nullable=True, comment="出差（天/小时）")
    nursing_leave_days: Mapped[float | None] = mapped_column(Float, nullable=True, comment="看护假（天）")
    training_days: Mapped[float | None] = mapped_column(Float, nullable=True, comment="培训（天）")

    # ─── 其他 ───
    area: Mapped[str | None] = mapped_column(String(64), nullable=True, comment="区域")
    shutdown_comp_leave: Mapped[float | None] = mapped_column(Float, nullable=True, comment="停工调休")

    # ─── 导入溯源 ───
    source_file: Mapped[str | None] = mapped_column(String(256), nullable=True, comment="来源文件名")
    import_batch: Mapped[str | None] = mapped_column(String(64), nullable=True, comment="导入批次号")


# ─── 加班计算记录 ──────────────────────────────────────────────────

class OvertimeRecord(BaseModel):
    __tablename__ = "overtime_records"
    __table_args__ = (
        Index("ix_overtime_records_date", "record_date"),
        Index("ix_overtime_records_employee", "employee_id"),
        Index("ix_overtime_records_type", "overtime_type"),
        Index("ix_overtime_records_conversion", "conversion_type"),
        Index("ix_overtime_records_import_batch", "import_batch"),
        {"schema": "hr"},
    )

    employee_id: Mapped[UUID | None] = mapped_column(
        Uuid(as_uuid=True), nullable=True, comment="员工ID"
    )
    attendance_record_id: Mapped[UUID | None] = mapped_column(
        Uuid(as_uuid=True), nullable=True, comment="关联考勤记录"
    )
    record_date: Mapped[date] = mapped_column(Date, nullable=False, comment="加班日期")
    overtime_type: Mapped[str] = mapped_column(
        String(16), nullable=False, comment="weekday / weekend / holiday"
    )
    overtime_hours: Mapped[float] = mapped_column(
        Float, nullable=False, default=0.0, comment="加班时长（0.5h精度）"
    )
    conversion_type: Mapped[str] = mapped_column(
        String(16), nullable=False, comment="comp_leave(调休) / overtime_pay(加班费)"
    )
    comp_leave_hours: Mapped[float | None] = mapped_column(
        Float, nullable=True, default=0.0, comment="转调休小时数"
    )
    overtime_pay: Mapped[float | None] = mapped_column(
        Float, nullable=True, default=0.0, comment="加班费金额"
    )
    overtime_rate: Mapped[float | None] = mapped_column(
        Float, nullable=True, default=10.0, comment="加班费率（元/小时）"
    )
    calculated_at: Mapped[datetime | None] = mapped_column(
        DateTime, nullable=True, comment="计算时间"
    )
    import_batch: Mapped[str | None] = mapped_column(String(64), nullable=True, comment="关联导入批次")


# ─── 假期余额 ──────────────────────────────────────────────────────

class LeaveBalance(BaseModel):
    __tablename__ = "leave_balances"
    __table_args__ = (
        Index("ix_leave_balances_employee_year_type", "employee_id", "year", "leave_type", unique=True),
        {"schema": "hr"},
    )

    employee_id: Mapped[UUID] = mapped_column(
        Uuid(as_uuid=True), nullable=False, comment="员工ID"
    )
    year: Mapped[int] = mapped_column(Integer, nullable=False, comment="年份")
    leave_type: Mapped[str] = mapped_column(
        String(16), nullable=False, comment="假期类型: annual / comp / sick"
    )
    total_days: Mapped[float] = mapped_column(
        Float, nullable=False, default=0.0, comment="总额度"
    )
    used_days: Mapped[float] = mapped_column(
        Float, nullable=False, default=0.0, comment="已使用"
    )


# ─── 导入批次 ──────────────────────────────────────────────────────

class AttendanceImportBatch(BaseModel):
    __tablename__ = "attendance_import_batches"
    __table_args__ = (
        Index("ix_attendance_import_batches_status", "status"),
        {"schema": "hr"},
    )

    file_name: Mapped[str] = mapped_column(String(256), nullable=False, comment="文件名")
    file_size: Mapped[int | None] = mapped_column(Integer, nullable=True, comment="文件大小（字节）")
    record_count: Mapped[int] = mapped_column(
        Integer, nullable=False, default=0, comment="导入记录数"
    )
    overtime_count: Mapped[int] = mapped_column(
        Integer, nullable=False, default=0, comment="生成的加班记录数"
    )
    date_range_start: Mapped[date | None] = mapped_column(Date, nullable=True, comment="数据起始日期")
    date_range_end: Mapped[date | None] = mapped_column(Date, nullable=True, comment="数据截止日期")
    status: Mapped[str] = mapped_column(
        String(16), nullable=False, default="pending",
        server_default="pending",
        comment="pending / processing / completed / failed"
    )
    error_message: Mapped[str | None] = mapped_column(Text, nullable=True, comment="错误信息")
    warnings: Mapped[list | None] = mapped_column(JSON, nullable=True, comment="警告列表")
    imported_by: Mapped[str | None] = mapped_column(String(64), nullable=True, comment="导入人")
    imported_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True, comment="导入时间")


# ─── 系统配置 ──────────────────────────────────────────────────────

class AttendanceConfig(BaseModel):
    __tablename__ = "attendance_config"
    __table_args__ = (
        Index("ix_attendance_config_key", "config_key", unique=True),
        {"schema": "hr"},
    )

    config_key: Mapped[str] = mapped_column(
        String(64), unique=True, nullable=False, comment="配置键"
    )
    config_value: Mapped[str] = mapped_column(
        String(256), nullable=False, comment="配置值"
    )
    description: Mapped[str | None] = mapped_column(
        String(256), nullable=True, comment="配置说明"
    )
