"""add_ledger_type_to_training_ledgers

Revision ID: a4b465a766ce
Revises: c74309785108
Create Date: 2026-06-22 16:04:28.343598
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = 'a4b465a766ce'
down_revision: Union[str, None] = 'c74309785108'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('training_ledger_pages', sa.Column('ledger_type', sa.String(length=16), server_default='event', nullable=False, comment='台账类型: event=事件台账, sop=SOP培训台账'), schema='hr')
    op.add_column('training_ledgers', sa.Column('ledger_type', sa.String(length=16), server_default='event', nullable=False, comment='台账类型: event=事件台账, sop=SOP培训台账'), schema='hr')


def downgrade() -> None:
    op.drop_column('training_ledgers', 'ledger_type', schema='hr')
    op.drop_column('training_ledger_pages', 'ledger_type', schema='hr')
