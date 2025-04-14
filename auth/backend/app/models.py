from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import datetime

class AuthUser(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    username: str = Field(index=True, unique=True)
    email: str = Field(index=True, unique=True)
    password: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    last_login: Optional[datetime] = Field(default=None)

class TelegramOTP(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    username: str = Field(index=True, unique=True)
    telegram_id: int = Field(..., description="Telegram user ID")
    is_admin: bool = Field(default=False)
    otp: str | None = Field(default=None, description="One-time password")

class Admins(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    telegram_id: int = Field(index=True, unique=True)