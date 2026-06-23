"""add_created_by_updated_by_to_attendance_tables

Revision ID: 20260623_0002
Revises: 5b880164c9b8
Create Date: 2026-06-23 10:05:00.000000
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = '20260623_0002'
down_revision: Union[str, None] = '5b880164c9b8'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    tables = [
        'attendance_calendars',
        'attendance_records',
        'overtime_records',
        'leave_balances',
        'attendance_import_batches',
        'attendance_config',
    ]
    for table in tables:
        op.add_column(table,
            sa.Column('created_by', postgresql.UUID(as_uuid=True),
                      sa.ForeignKey('identity.users.id'), nullable=True),
            schema='hr')
        op.add_column(table,
            sa.Column('updated_by', postgresql.UUID(as_uuid=True),
                      sa.ForeignKey('identity.users.id'), nullable=True),
            schema='hr')


def downgrade() -> None:
    tables = [
        'attendance_config',
        'attendance_import_batches',
        'leave_balances',
        'overtime_records',
        'attendance_records',
        'attendance_calendars',
    ]
    for table in tables:
        op.drop_column(table, 'updated_by', schema='hr')
        op.drop_column(table, 'created_by', schema='hr')
