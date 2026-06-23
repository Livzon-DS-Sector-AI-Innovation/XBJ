"""add_select_tasks_to_training_sessions

Revision ID: 20250618_0003
Revises: 20250618_0002
Create Date: 2026-06-18 14:50:00.000000
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '20250618_0003'
down_revision: Union[str, None] = '20250618_0002'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('training_sessions', sa.Column('select_tasks', sa.JSON(), nullable=True, comment='多部门选择任务列表[{department, token, status, employee_names, employee_numbers}]'), schema='hr')


def downgrade() -> None:
    op.drop_column('training_sessions', 'select_tasks', schema='hr')
