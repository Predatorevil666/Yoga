from typing import Annotated

from auth_service import AuthService
from database import db
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from models import AuthUser, TelegramOTP
from sqlmodel import Session, select
from utilits import token_service

SessionDep = Annotated[Session, Depends(db.get_session)]
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")
router = APIRouter()


@router.get("/api/auth/protected-route")
async def protected_route(token: str = Depends(oauth2_scheme)):
    try:
        token_service.verify_access_token(token)
        return {"message": "You have access to this protected route"}
    except HTTPException as e:
        raise e


@router.post("/api/auth/login")
async def login(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
    session: SessionDep,
):
    try:
        auth_service = AuthService(session)
        user = auth_service.authenticate_user(
            form_data.username, form_data.password
        )
        access_token = token_service.create_access_token(
            data={"sub": user.username}
        )
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "username": user.username,
        }
    except HTTPException as e:
        raise e


@router.post("/api/auth/register-email")
async def register_email(data: AuthUser, session: SessionDep):
    try:
        auth_service = AuthService(session)
        user = auth_service.register_user(
            data.username, data.email, data.password
        )
        access_token = token_service.create_access_token(
            data={"sub": user.email}
        )
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "username": user.username,
        }
    except HTTPException as e:
        session.rollback()
        raise e


@router.post("/api/auth/register")
async def register(data: TelegramOTP, session: SessionDep):
    try:
        auth_service = AuthService(session)
        otp = await auth_service.send_otp(data.telegram_id, data.username)
        return {"message": "OTP sent successfully", "otp": otp.otp}
    except HTTPException as e:
        session.rollback()
        raise e


@router.post("/api/auth/verify-otp")
async def verify_otp(data: TelegramOTP, session: SessionDep):
    try:
        auth_service = AuthService(session)
        access_token = auth_service.verify_otp(data.telegram_id, data.otp)
        return {
            "message": "OTP verified successfully",
            "access_token": access_token,
            "token_type": "bearer",
        }
    except HTTPException as e:
        raise e


@router.post("/api/auth/admin/login")
async def admin(data: TelegramOTP, session: SessionDep):
    try:
        query = select(TelegramOTP).where(
            TelegramOTP.telegram_id == data.telegram_id,
            TelegramOTP.is_admin,
        )
        result = session.exec(query).one_or_none()
        if not result:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied. User is not an administrator.",
            )

        auth_service = AuthService(session)
        otp = await auth_service.send_otp(data.telegram_id, data.username)
        return {"message": "OTP sent successfully", "otp": otp.otp}
    except HTTPException as e:
        session.rollback()
        raise e
