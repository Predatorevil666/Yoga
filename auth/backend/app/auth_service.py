import logging

from datetime import datetime

from bot.main import otp_service
from fastapi import HTTPException
from models import AuthUser, TelegramOTP
from sqlmodel import Session, select
from utilits import password_manager, token_service

logger = logging.getLogger(__name__)


class AuthService:
    def __init__(self, session: Session):
        self.session = session

    def authenticate_user(self, username: str, password: str) -> AuthUser:
        user = self.session.exec(
            select(AuthUser).where(AuthUser.username == username)
        ).first()
        if not user or not password_manager.verify_password(
            password, user.password
        ):
            raise HTTPException(
                status_code=401, detail="Incorrect username or password"
            )

        user.last_login = datetime.utcnow()
        self.session.commit()
        return user

    def register_user(
        self, username: str, email: str, password: str
    ) -> AuthUser:
        try:
            existing_user = self.session.exec(
                select(AuthUser).where(AuthUser.email == email)
            ).first()
            if existing_user:
                raise HTTPException(
                    status_code=400, detail="Email is already registered"
                )

            new_user = AuthUser(
                username=username,
                email=email,
                password=password_manager.hash_password(password),
            )
            self.session.add(new_user)
            self.session.commit()
            self.session.refresh(new_user)

            return new_user
        except Exception:
            self.session.rollback()
            raise

    async def send_otp(self, telegram_id: int, username: str) -> TelegramOTP:
        otp = await otp_service.send_otp(telegram_id)
        if not otp:
            raise HTTPException(status_code=500, detail="Failed to send OTP")

        user_otp = self.session.exec(
            select(TelegramOTP).where(TelegramOTP.telegram_id == telegram_id)
        ).first()

        if user_otp:
            user_otp.otp = otp
        else:
            user_otp = TelegramOTP(
                username=username, telegram_id=telegram_id, otp=otp
            )
            self.session.add(user_otp)

        self.session.commit()
        return user_otp

    def verify_otp(self, telegram_id: int, otp: str) -> str:
        user_otp = self.session.exec(
            select(TelegramOTP).where(TelegramOTP.telegram_id == telegram_id)
        ).first()
        if not user_otp or user_otp.otp != otp:
            raise HTTPException(status_code=400, detail="Invalid OTP")

        user_otp.otp = None
        self.session.commit()
        return token_service.create_access_token(
            data={"sub": user_otp.telegram_id}
        )
