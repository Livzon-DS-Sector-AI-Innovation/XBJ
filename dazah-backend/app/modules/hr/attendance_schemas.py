"""Attendance / 考勤 sub-module Pydantic schemas."""

from datetime import date, datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


# ─── 工作日历 ───────────────────────────────────────────────────────

class CalendarDayResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    date: date
    year: int
    month: int
    day: int
    day_of_week: int
    day_type: str
    holiday_name: str | None = None
    is_workday: bool


class CalendarMonthResponse(BaseModel):
    year: int
    month: int
    workdays: int = Field(..., description="应出勤天数")
    holidays: int = Field(..., description="法定节假日天数")
    rest_days: int = Field(..., description="周末休息天数")
    days: list[CalendarDayResponse]


class CalendarYearResponse(BaseModel):
    year: int
    total_workdays: int
    months: list[CalendarMonthResponse]


# ─── 考勤记录 ───────────────────────────────────────────────────────

class AttendanceRecordResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    record_date: date
    employee_id: UUID | None = None
    employee_number: str
    employee_name: str | None = Field(None, description="员工姓名（关联查询）")
    department_name: str | None = Field(None, description="部门名称（关联查询）")
    shift: str | None = None
    is_abnormal: bool = False
    actual_minutes: int | None = None
    clock_in: datetime | None = None
    clock_out: datetime | None = None
    absent_minutes: int | None = None
    absent_days: float | None = None
    late_minutes: int | None = None
    late_count: int | None = None
    early_minutes: int | None = None
    early_count: int | None = None
    annual_leave_days: float | None = None
    personal_leave: float | None = None
    comp_leave: float | None = None
    sick_leave_days: float | None = None
    marriage_leave_days: float | None = None
    maternity_leave_days: float | None = None
    funeral_leave_days: float | None = None
    injury_leave_days: float | None = None
    business_trip: float | None = None
    nursing_leave_days: float | None = None
    training_days: float | None = None
    area: str | None = None
    shutdown_comp_leave: float | None = None
    source_file: str | None = None
    import_batch: str | None = None
    created_at: datetime | None = None


class AttendanceRecordListParams(BaseModel):
    """查询筛选参数"""
    date_from: date | None = None
    date_to: date | None = None
    employee_number: str | None = None
    employee_name: str | None = None
    department: str | None = None
    is_abnormal: bool | None = None
    import_batch: str | None = None
    page: int = Field(1, ge=1)
    page_size: int = Field(20, ge=1, le=100)


class AttendanceRecordListResponse(BaseModel):
    items: list[AttendanceRecordResponse]
    total: int
    page: int
    page_size: int


# ─── 加班记录 ───────────────────────────────────────────────────────

class OvertimeRecordResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    employee_id: UUID | None = None
    employee_number: str | None = Field(None, description="工号（关联查询）")
    employee_name: str | None = Field(None, description="姓名（关联查询）")
    department_name: str | None = Field(None, description="部门（关联查询）")
    attendance_record_id: UUID | None = None
    record_date: date
    overtime_type: str
    overtime_hours: float
    conversion_type: str
    comp_leave_hours: float | None = 0.0
    overtime_pay: float | None = 0.0
    overtime_rate: float | None = 10.0
    calculated_at: datetime | None = None
    import_batch: str | None = None
    created_at: datetime | None = None


class OvertimeListParams(BaseModel):
    date_from: date | None = None
    date_to: date | None = None
    employee_number: str | None = None
    employee_name: str | None = None
    department: str | None = None
    overtime_type: str | None = None
    conversion_type: str | None = None
    import_batch: str | None = None
    page: int = Field(1, ge=1)
    page_size: int = Field(20, ge=1, le=100)


class OvertimeListResponse(BaseModel):
    items: list[OvertimeRecordResponse]
    total: int
    page: int
    page_size: int


class OvertimeSummaryItem(BaseModel):
    """加班汇总行"""
    department: str | None = None
    employee_number: str | None = None
    employee_name: str | None = None
    month: int | None = None
    weekday_ot_hours: float = 0.0
    weekend_ot_hours: float = 0.0
    holiday_ot_hours: float = 0.0
    total_ot_hours: float = 0.0
    comp_leave_hours: float = 0.0
    overtime_pay: float = 0.0


class OvertimeSummaryParams(BaseModel):
    year: int = Field(..., description="年份")
    month: int | None = Field(None, description="月份（不传则全年）")
    group_by: str = Field("department", description="汇总维度: department / employee / month")


class OvertimeSummaryResponse(BaseModel):
    items: list[OvertimeSummaryItem]
    total_overtime_hours: float = 0.0
    total_comp_leave_hours: float = 0.0
    total_overtime_pay: float = 0.0


# ─── 假期余额 ───────────────────────────────────────────────────────

class LeaveBalanceResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    employee_id: UUID
    employee_number: str | None = Field(None, description="工号")
    employee_name: str | None = Field(None, description="姓名")
    year: int
    leave_type: str
    total_days: float = 0.0
    used_days: float = 0.0
    remaining_days: float = Field(0.0, description="剩余（计算字段）")
    created_at: datetime | None = None


class LeaveBalanceUpdate(BaseModel):
    total_days: float | None = Field(None, ge=0, description="总额度")
    used_days: float | None = Field(None, ge=0, description="已使用")


# ─── 导入批次 ───────────────────────────────────────────────────────

class ImportBatchResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    file_name: str
    file_size: int | None = None
    record_count: int = 0
    overtime_count: int = 0
    date_range_start: date | None = None
    date_range_end: date | None = None
    status: str
    error_message: str | None = None
    warnings: list | None = None
    imported_by: str | None = None
    imported_at: datetime | None = None
    created_at: datetime | None = None


class ImportBatchListResponse(BaseModel):
    items: list[ImportBatchResponse]
    total: int
    page: int
    page_size: int


class ImportResult(BaseModel):
    """导入结果"""
    batch_id: UUID
    file_name: str
    record_count: int
    overtime_count: int
    skipped_count: int = Field(0, description="跳过的行数（工号未匹配等）")
    warnings: list[str] = Field(default_factory=list)


# ─── 系统配置 ───────────────────────────────────────────────────────

class AttendanceConfigResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    config_key: str
    config_value: str
    description: str | None = None


class AttendanceConfigUpdate(BaseModel):
    config_value: str = Field(..., description="配置值")


class AllConfigResponse(BaseModel):
    items: list[AttendanceConfigResponse]


# ─── 部门生产设置 ───────────────────────────────────────────────────

class DepartmentProductionSettings(BaseModel):
    is_production: bool = Field(False, description="是否生产部门")
    production_start_time: str | None = Field(None, max_length=8, description="生产班次开始时间(HH:MM)")
    production_end_time: str | None = Field(None, max_length=8, description="生产班次结束时间(HH:MM)")
