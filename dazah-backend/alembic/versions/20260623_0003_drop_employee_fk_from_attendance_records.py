"""drop_employee_fk_from_attendance_records

Revision ID: 20260623_0003
Revises: 20260623_0002
Create Date: 2026-06-23 10:16:00.000000
"""
from typing import Sequence, Union
from alembic import op

revision: str = '20260623_0003'
down_revision: Union[str, None] = '20260623_0002'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Drop FK from attendance_records
    op.drop_constraint('attendance_records_employee_id_fkey', 'attendance_records', schema='hr', type_='foreignkey')
    # Drop FK from overtime_records
    op.drop_constraint('overtime_records_employee_id_fkey', 'overtime_records', schema='hr', type_='foreignkey')
    op.drop_constraint('overtime_records_attendance_record_id_fkey', 'overtime_records', schema='hr', type_='foreignkey')


def downgrade() -> None:
    op.create_foreign_key('overtime_records_attendance_record_id_fkey', 'overtime_records', 'attendance_records', ['attendance_record_id'], ['id'], source_schema='hr', referent_schema='hr')
    op.create_foreign_key('overtime_records_employee_id_fkey', 'overtime_records', 'employees', ['employee_id'], ['id'], source_schema='hr', referent_schema='hr')
    op.create_foreign_key('attendance_records_employee_id_fkey', 'attendance_records', 'employees', ['employee_id'], ['id'], source_schema='hr', referent_schema='hr')
