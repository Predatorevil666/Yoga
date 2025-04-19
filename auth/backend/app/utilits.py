from datetime import datetime, timedelta

from fastapi import HTTPException
import jwt
from jwt import DecodeError, ExpiredSignatureError
from passlib.context import CryptContext


class PasswordManager:
    def __init__(self, schemes: list = ["bcrypt"]) -> None:
        self.pwd_context = CryptContext(schemes=schemes, deprecated="auto")

    def hash_password(self, password: str) -> str:
        return self.pwd_context.hash(password)

    def verify_password(self, plain_password: str, hashed_password: str) -> bool:
        return self.pwd_context.verify(plain_password, hashed_password)


class TokenService:
    def __init__(self, secret_key: str = "pass", algorithm: str = "HS256"):
        self.secret_key = secret_key
        self.algorithm = algorithm

    def create_access_token(
        self, data: dict, expires_delta: timedelta = timedelta(days=30)
    ):
        to_encode = data.copy()
        expire = datetime.utcnow() + expires_delta
        to_encode.update({"exp": expire})
        return jwt.encode(to_encode, self.secret_key, algorithm=self.algorithm)

    def verify_access_token(self, token: str) -> dict:
        try:
            payload = jwt.decode(
                token,
                self.secret_key,
                algorithms=[self.algorithm],
                options={"verify_exp": True},
            )
            return payload
        except ExpiredSignatureError:
            raise HTTPException(status_code=401, detail="Token has expired")
        except DecodeError:
            raise HTTPException(status_code=401, detail="Token is invalid")
        except Exception as e:
            raise HTTPException(
                status_code=500, detail=f"Token verification failed: {str(e)}"
            )


SECRET_KEY = "pass"

password_manager = PasswordManager()
token_service = TokenService(secret_key=SECRET_KEY)
