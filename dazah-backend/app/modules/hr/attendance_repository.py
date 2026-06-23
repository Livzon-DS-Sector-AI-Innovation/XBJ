"""Attendance / 考勤 data access layer."""

from datetime import date
from uuid import UUID

from sqlalchemy import and_, func, or_, select, text
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.hr.attendance_models import (
    AttendanceCalendar,
    AttendanceConfig,
    AttendanceImportBatch,
    AttendanceRecord,
    LeaveBalance,
    OvertimeRecord,
)
from app.modules.hr.models import Employee


# ─── 日历 Repository ────────────────────────────────────────────────

class CalendarRepository:
    @staticmethod
    async def get_by_date(db: AsyncSession, d: date) -> AttendanceCalendar | None:
        result = await db.execute(
            select(AttendanceCalendar)
            .where(AttendanceCalendar.date == d, AttendanceCalendar.is_deleted == False)
        )
        return result.scalar_one_or_none()

    @staticmethod
    async def get_year(db: AsyncSession, year: int) -> list[AttendanceCalendar]:
        result = await db.execute(
            select(AttendanceCalendar)
            .where(AttendanceCalendar.year == year, AttendanceCalendar.is_deleted == False)
            .order_by(AttendanceCalendar.date)
        )
        return list(result.scalars().all())

    @staticmethod
    async def get_month(db: AsyncSession, year: int, month: int) -> list[AttendanceCalendar]:
        result = await db.execute(
            select(AttendanceCalendar)
            .where(
                AttendanceCalendar.year == year,
                AttendanceCalendar.month == month,
                AttendanceCalendar.is_deleted == False,
            )
            .order_by(AttendanceCalendar.date)
        )
        return list(result.scalars().all())

    @staticmethod
    async def get_map(db: AsyncSession, dates: list[date]) -> dict[date, AttendanceCalendar]:
        """Batch-fetch calendar entries for a list of dates."""
        if not dates:
            return {}
        result = await db.execute(
            select(AttendanceCalendar).where(
                AttendanceCalendar.date.in_(dates),
                AttendanceCalendar.is_deleted == False,
            )
        )
        return {c.date: c for c in result.scalars().all()}

    @staticmethod
    async def get_year_range(db: AsyncSession, year: int) -> tuple[date | None, date | None]:
        """Get min/max date for a year."""
        result = await db.execute(
            select(
                func.min(AttendanceCalendar.date),
                func.max(AttendanceCalendar.date),
            ).where(AttendanceCalendar.year == year, AttendanceCalendar.is_deleted == False)
        )
        row = result.one()
        return row[0], row[1]


# ─── 考勤记录 Repository ───────────────────────────────────────────

class AttendanceRecordRepository:
    @staticmethod
    async def get_by_id(db: AsyncSession, record_id: UUID) -> AttendanceRecord | None:
        result = await db.execute(
            select(AttendanceRecord)
            .where(AttendanceRecord.id == record_id, AttendanceRecord.is_deleted == False)
        )
        return result.scalar_one_or_none()

    @staticmethod
    async def list_records(
        db: AsyncSession,
        *,
        date_from: date | None = None,
        date_to: date | None = None,
        employee_number: str | None = None,
        employee_name: str | None = None,
        department: str | None = None,
        is_abnormal: bool | None = None,
        import_batch: str | None = None,
        page: int = 1,
        page_size: int = 20,
    ) -> tuple[list[AttendanceRecord], int]:
        conditions = [AttendanceRecord.is_deleted == False]

        if date_from:
            conditions.append(AttendanceRecord.record_date >= date_from)
        if date_to:
            conditions.append(AttendanceRecord.record_date <= date_to)
        if employee_number:
            conditions.append(AttendanceRecord.employee_number == employee_number)
        if import_batch:
            conditions.append(AttendanceRecord.import_batch == import_batch)
        if is_abnormal is not None:
            conditions.append(AttendanceRecord.is_abnormal == is_abnormal)

        # Subquery for employee name/department filter
        if employee_name or department:
            emp_conditions = [Employee.is_deleted == False]
            if employee_name:
                emp_conditions.append(Employee.name.ilike(f"%{employee_name}%"))
            if department:
                emp_conditions.append(Employee.department.ilike(f"%{department}%"))
            emp_sub = select(Employee.id).where(and_(*emp_conditions)).subquery()
            conditions.append(AttendanceRecord.employee_id.in_(select(emp_sub)))

        query = (
            select(AttendanceRecord)
            .where(and_(*conditions))
        )

        # Count
        count_query = select(func.count()).select_from(query.subquery())
        total_result = await db.execute(count_query)
        total = total_result.scalar() or 0

        # Paginate
        query = query.order_by(AttendanceRecord.record_date.desc(), AttendanceRecord.employee_number)
        query = query.offset((page - 1) * page_size).limit(page_size)
        result = await db.execute(query)
        items = list(result.scalars().all())

        return items, total


# ─── 加班记录 Repository ───────────────────────────────────────────

class OvertimeRecordRepository:
    @staticmethod
    async def list_records(
        db: AsyncSession,
        *,
        date_from: date | None = None,
        date_to: date | None = None,
        employee_number: str | None = None,
        employee_name: str | None = None,
        department: str | None = None,
        overtime_type: str | None = None,
        conversion_type: str | None = None,
        import_batch: str | None = None,
        page: int = 1,
        page_size: int = 20,
    ) -> tuple[list[OvertimeRecord], int]:
        conditions = [OvertimeRecord.is_deleted == False]

        if date_from:
            conditions.append(OvertimeRecord.record_date >= date_from)
        if date_to:
            conditions.append(OvertimeRecord.record_date <= date_to)
        if overtime_type:
            conditions.append(OvertimeRecord.overtime_type == overtime_type)
        if conversion_type:
            conditions.append(OvertimeRecord.conversion_type == conversion_type)
        if import_batch:
            conditions.append(OvertimeRecord.import_batch == import_batch)

        # Employee filter
        if employee_number or employee_name or department:
            emp_conditions = [Employee.is_deleted == False]
            if employee_number:
                emp_conditions.append(Employee.employee_number == employee_number)
            if employee_name:
                emp_conditions.append(Employee.name.ilike(f"%{employee_name}%"))
            if department:
                emp_conditions.append(Employee.department.ilike(f"%{department}%"))
            emp_sub = select(Employee.id).where(and_(*emp_conditions)).subquery()
            conditions.append(OvertimeRecord.employee_id.in_(select(emp_sub)))

        query = (
            select(OvertimeRecord)
            .where(and_(*conditions))
        )

        count_query = select(func.count()).select_from(query.subquery())
        total_result = await db.execute(count_query)
        total = total_result.scalar() or 0

        query = query.order_by(OvertimeRecord.record_date.desc(), OvertimeRecord.overtime_type)
        query = query.offset((page - 1) * page_size).limit(page_size)
        result = await db.execute(query)
        items = list(result.scalars().all())

        return items, total

    @staticmethod
    async def get_summary(
        db: AsyncSession,
        *,
        year: int,
        month: int | None = None,
        group_by: str = "department",
    ) -> list[dict]:
        """Get overtime summary grouped by dimension.

        Returns list of dicts with aggregated overtime data.
        """
        conditions = [OvertimeRecord.is_deleted == False]

        # Date filter
        if month:
            conditions.append(
                and_(
                    func.extract("year", OvertimeRecord.record_date) == year,
                    func.extract("month", OvertimeRecord.record_date) == month,
                )
            )
        else:
            conditions.append(func.extract("year", OvertimeRecord.record_date) == year)

        # Join employee for name/department
        from sqlalchemy.orm import aliased
        Emp = aliased(Employee)

        # Build aggregation columns
        cols = []
        if group_by == "employee":
            cols = [
                Emp.employee_number.label("employee_number"),
                Emp.name.label("employee_name"),
                Emp.department.label("department"),
            ]
        elif group_by == "month":
            cols = [
                func.extract("month", OvertimeRecord.record_date).cast(Integer).label("month"),
            ]
        else:  # department
            cols = [Emp.department.label("department")]

        agg_cols = [
            func.coalesce(
                func.sum(
                    func.case(
                        (OvertimeRecord.overtime_type == "weekday", OvertimeRecord.overtime_hours),
                        else_=0,
                    )
                ), 0.0,
            ).label("weekday_ot_hours"),
            func.coalesce(
                func.sum(
                    func.case(
                        (OvertimeRecord.overtime_type == "weekend", OvertimeRecord.overtime_hours),
                        else_=0,
                    )
                ), 0.0,
            ).label("weekend_ot_hours"),
            func.coalesce(
                func.sum(
                    func.case(
                        (OvertimeRecord.overtime_type == "holiday", OvertimeRecord.overtime_hours),
                        else_=0,
                    )
                ), 0.0,
            ).label("holiday_ot_hours"),
            func.coalesce(func.sum(OvertimeRecord.overtime_hours), 0.0).label("total_ot_hours"),
            func.coalesce(func.sum(OvertimeRecord.comp_leave_hours), 0.0).label("comp_leave_hours"),
            func.coalesce(func.sum(OvertimeRecord.overtime_pay), 0.0).label("overtime_pay"),
        ]

        query = (
            select(*cols, *agg_cols)
            .join(Emp, OvertimeRecord.employee_id == Emp.id, isouter=True)
            .where(and_(*conditions))
            .group_by(*[c.key for c in cols if hasattr(c, 'key')])
            .order_by(text("total_ot_hours DESC"))
        )

        result = await db.execute(query)
        return [dict(row._mapping) for row in result.all()]


# ─── 假期余额 Repository ───────────────────────────────────────────

class LeaveBalanceRepository:
    @staticmethod
    async def get_by_employee(
        db: AsyncSession, employee_id: UUID, year: int | None = None
    ) -> list[LeaveBalance]:
        conditions = [LeaveBalance.employee_id == employee_id, LeaveBalance.is_deleted == False]
        if year:
            conditions.append(LeaveBalance.year == year)
        result = await db.execute(select(LeaveBalance).where(and_(*conditions)))
        return list(result.scalars().all())

    @staticmethod
    async def get_or_create(
        db: AsyncSession, employee_id: UUID, year: int, leave_type: str
    ) -> LeaveBalance:
        result = await db.execute(
            select(LeaveBalance).where(
                LeaveBalance.employee_id == employee_id,
                LeaveBalance.year == year,
                LeaveBalance.leave_type == leave_type,
                LeaveBalance.is_deleted == False,
            )
        )
        balance = result.scalar_one_or_none()
        if balance is None:
            from uuid import uuid4
            balance = LeaveBalance(
                id=uuid4(),
                employee_id=employee_id,
                year=year,
                leave_type=leave_type,
                total_days=0.0,
                used_days=0.0,
            )
            db.add(balance)
            await db.flush()
        return balance

    @staticmethod
    async def get_by_id(db: AsyncSession, balance_id: UUID) -> LeaveBalance | None:
        result = await db.execute(
            select(LeaveBalance).where(
                LeaveBalance.id == balance_id, LeaveBalance.is_deleted == False
            )
        )
        return result.scalar_one_or_none()


# ─── 导入批次 Repository ───────────────────────────────────────────

class ImportBatchRepository:
    @staticmethod
    async def list_batches(
        db: AsyncSession, page: int = 1, page_size: int = 20
    ) -> tuple[list[AttendanceImportBatch], int]:
        query = select(AttendanceImportBatch).where(
            AttendanceImportBatch.is_deleted == False
        )
        count_query = select(func.count()).select_from(query.subquery())
        total_result = await db.execute(count_query)
        total = total_result.scalar() or 0

        query = query.order_by(AttendanceImportBatch.created_at.desc())
        query = query.offset((page - 1) * page_size).limit(page_size)
        result = await db.execute(query)
        items = list(result.scalars().all())
        return items, total

    @staticmethod
    async def get_by_id(db: AsyncSession, batch_id: UUID) -> AttendanceImportBatch | None:
        result = await db.execute(
            select(AttendanceImportBatch).where(
                AttendanceImportBatch.id == batch_id,
                AttendanceImportBatch.is_deleted == False,
            )
        )
        return result.scalar_one_or_none()


# ─── 配置 Repository ───────────────────────────────────────────────

class ConfigRepository:
    @staticmethod
    async def get_all(db: AsyncSession) -> dict[str, str]:
        result = await db.execute(
            select(AttendanceConfig).where(AttendanceConfig.is_deleted == False)
        )
        return {c.config_key: c.config_value for c in result.scalars().all()}

    @staticmethod
    async def get_by_key(db: AsyncSession, key: str) -> AttendanceConfig | None:
        result = await db.execute(
            select(AttendanceConfig).where(
                AttendanceConfig.config_key == key,
                AttendanceConfig.is_deleted == False,
            )
        )
        return result.scalar_one_or_none()
