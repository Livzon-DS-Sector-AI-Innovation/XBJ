"""merge_heads

Revision ID: c74309785108
Revises: 20250618_0003, 494e3004c6fe, f3a9e2b1c8d4, f433f7bcd8f9
Create Date: 2026-06-22 16:03:28.575298
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'c74309785108'
down_revision: Union[str, None] = ('20250618_0003', '494e3004c6fe', 'f3a9e2b1c8d4', 'f433f7bcd8f9')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
