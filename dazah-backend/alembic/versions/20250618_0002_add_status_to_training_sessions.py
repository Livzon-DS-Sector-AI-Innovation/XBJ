"""add_status_to_training_sessions

Revision ID: 20250618_0002
Revises: 20250618_0001
Create Date: 2026-06-18 11:30:00.000000
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '20250618_0002'
down_revision: Union[str, None] = '20250618_0001'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('training_sessions', sa.Column('status', sa.String(length=16), server_default='draft', nullable=False, comment='状态: draft草稿, notified已通知, selecting选择中, confirmed已确认, evaluated已评估, archived已归档'), schema='hr')
    op.add_column('training_sessions', sa.Column('select_task_token', sa.String(length=64), nullable=True, comment='飞书选择任务token'), schema='hr')
    op.create_index('ix_training_sessions_status', 'training_sessions', ['status'], unique=False, schema='hr')


def downgrade() -> None:
    op.drop_index('ix_training_sessions_status', table_name='training_sessions', schema='hr')
    op.drop_column('training_sessions', 'select_task_token', schema='hr')
    op.drop_column('training_sessions', 'status', schema='hr')
