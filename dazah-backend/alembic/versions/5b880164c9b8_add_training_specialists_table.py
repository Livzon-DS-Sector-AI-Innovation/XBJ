"""add_training_specialists_table

Revision ID: 5b880164c9b8
Revises: 20260623_0001
Create Date: 2026-06-23
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = '5b880164c9b8'
down_revision: Union[str, None] = '20260623_0001'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table('training_specialists',
    sa.Column('department', sa.String(length=64), nullable=False, comment='部门名称'),
    sa.Column('employee_number', sa.String(length=32), nullable=False, comment='培训专员工号'),
    sa.Column('employee_name', sa.String(length=64), nullable=False, comment='培训专员姓名'),
    sa.Column('factory', sa.String(length=8), server_default='old', nullable=False, comment='厂区: old=旧厂, new=新厂'),
    sa.Column('id', sa.Uuid(), nullable=False),
    sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    sa.Column('created_by', sa.Uuid(), nullable=True),
    sa.Column('updated_by', sa.Uuid(), nullable=True),
    sa.Column('is_deleted', sa.Boolean(), server_default='false', nullable=False),
    sa.ForeignKeyConstraint(['created_by'], ['identity.users.id'], ),
    sa.ForeignKeyConstraint(['updated_by'], ['identity.users.id'], ),
    sa.PrimaryKeyConstraint('id'),
    schema='hr'
    )
    op.create_index('ix_training_specialists_department_factory', 'training_specialists', ['department', 'factory'], unique=True, schema='hr')


def downgrade() -> None:
    op.drop_index('ix_training_specialists_department_factory', table_name='training_specialists', schema='hr')
    op.drop_table('training_specialists', schema='hr')
