"""merge_heads

Revision ID: b6fb1570e159
Revises: 9c665890fc5d, c4069ec53471
Create Date: 2026-06-06 16:16:57.332728

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'b6fb1570e159'
down_revision: Union[str, Sequence[str], None] = ('9c665890fc5d', 'c4069ec53471')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
