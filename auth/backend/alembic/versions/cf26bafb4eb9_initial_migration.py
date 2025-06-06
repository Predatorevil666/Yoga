"""Initial migration

Revision ID: cf26bafb4eb9
Revises:
Create Date: 2024-11-13 18:40:26.879335

"""

from collections.abc import Sequence
from typing import Union

import sqlalchemy as sa
import sqlmodel

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "cf26bafb4eb9"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table(
        "authuser",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column(
            "username", sqlmodel.sql.sqltypes.AutoString(), nullable=False
        ),
        sa.Column("email", sqlmodel.sql.sqltypes.AutoString(), nullable=False),
        sa.Column(
            "password", sqlmodel.sql.sqltypes.AutoString(), nullable=False
        ),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("last_login", sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        op.f("ix_authuser_email"), "authuser", ["email"], unique=True
    )
    op.create_index(
        op.f("ix_authuser_username"), "authuser", ["username"], unique=True
    )
    op.create_table(
        "telegramotp",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column(
            "username", sqlmodel.sql.sqltypes.AutoString(), nullable=False
        ),
        sa.Column("telegram_id", sa.Integer(), nullable=False),
        sa.Column("otp", sqlmodel.sql.sqltypes.AutoString(), nullable=True),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        op.f("ix_telegramotp_username"),
        "telegramotp",
        ["username"],
        unique=True,
    )
    # ### end Alembic commands ###


def downgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_index(op.f("ix_telegramotp_username"), table_name="telegramotp")
    op.drop_table("telegramotp")
    op.drop_index(op.f("ix_authuser_username"), table_name="authuser")
    op.drop_index(op.f("ix_authuser_email"), table_name="authuser")
    op.drop_table("authuser")
    # ### end Alembic commands ###
