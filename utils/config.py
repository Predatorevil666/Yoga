import os

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    DATABASE_URL: str
    ECHO_SQL: bool = True
    TEST_DATABASE_URL: str
    POSTGRES_DB: str
    POSTGRES_USER: str
    POSTGRES_PASSWORD: str
    NGINX_PORT: str
    AUTH_BACKEND_PORT: str
    BACKEND_PORT: str
    FRONTEND_PORT: str
    AUTH_FRONTEND_PORT: str
    ADMIN_BACKEND_PORT: str
    ADMIN_FRONTEND_PORT: str
    POSTGRES_PORT: str
    AUTH_BACKEND_DB_URL: str
    DB_URL: str
    PYTHONPATH: str

    class Config:
        env_file = os.path.join(os.path.dirname(os.path.dirname(__file__)), ".env")


settings = Settings()
