"""add_training_sessions_table

Revision ID: 20250618_0001
Revises: f433f7bcd8f9
Create Date: 2026-06-18 10:00:00.000000
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '20250618_0001'
down_revision: Union[str, None] = 'd279abb52bcf'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'training_sessions',
        sa.Column('factory', sa.String(length=8), server_default='old', nullable=False, comment='厂区: old=旧厂, new=新厂'),
        sa.Column('department', sa.String(length=64), nullable=False, comment='主办部门'),
        sa.Column('training_date', sa.Date(), nullable=False, comment='培训日期'),
        sa.Column('subject', sa.String(length=256), nullable=False, comment='培训主题'),
        sa.Column('training_time_start', sa.String(length=32), nullable=True, comment='培训开始时间'),
        sa.Column('training_time_end', sa.String(length=32), nullable=True, comment='培训结束时间'),
        sa.Column('location', sa.String(length=128), nullable=True, comment='培训地点'),
        sa.Column('trainer', sa.String(length=128), nullable=True, comment='培训师'),
        sa.Column('training_method', sa.String(length=32), nullable=True, comment='培训方式'),
        sa.Column('content', sa.String(length=512), nullable=True, comment='培训内容'),
        sa.Column('trainee_departments', sa.JSON(), nullable=True, comment='受训部门列表'),
        sa.Column('employee_names', sa.JSON(), nullable=True, comment='应出席受训人员姓名列表'),
        sa.Column('employee_numbers', sa.JSON(), nullable=True, comment='应出席受训人员工号列表'),
        sa.Column('issuer_department', sa.String(length=64), nullable=True, comment='落款部门'),
        sa.Column('issue_date', sa.Date(), nullable=True, comment='落款日期'),
        sa.Column('remarks', sa.String(length=512), nullable=True, comment='备注'),
        sa.Column('id', sa.Uuid(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('created_by', sa.Uuid(), nullable=True),
        sa.Column('updated_by', sa.Uuid(), nullable=True),
        sa.Column('is_deleted', sa.Boolean(), server_default='false', nullable=False),
        sa.ForeignKeyConstraint(['created_by'], ['identity.users.id']),
        sa.ForeignKeyConstraint(['updated_by'], ['identity.users.id']),
        sa.PrimaryKeyConstraint('id'),
        schema='hr'
    )
    op.create_index('ix_training_sessions_department', 'training_sessions', ['department'], unique=False, schema='hr')
    op.create_index('ix_training_sessions_training_date', 'training_sessions', ['training_date'], unique=False, schema='hr')


def downgrade() -> None:
    op.drop_index('ix_training_sessions_training_date', table_name='training_sessions', schema='hr')
    op.drop_index('ix_training_sessions_department', table_name='training_sessions', schema='hr')
    op.drop_table('training_sessions', schema='hr')
