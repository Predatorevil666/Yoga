import os

from pydantic_settings import BaseSettings


class Settings(BaseSettings):

    DATABASE_URL: str
    TEST_DATABASE_URL: str
    AUTH_BACKEND_DB_URL: str
    DB_URL: str
    POSTGRES_PASSWORD: str

    POSTGRES_DB: str = os.getenv("POSTGRES_DB", "yoga_db")
    POSTGRES_USER: str = os.getenv("POSTGRES_USER", "postgres")
    POSTGRES_PORT: str = os.getenv("POSTGRES_PORT", "5432")
    NGINX_PORT: str = os.getenv("NGINX_PORT", "80")
    AUTH_BACKEND_PORT: str = os.getenv("AUTH_BACKEND_PORT", "8005")
    BACKEND_PORT: str = os.getenv("BACKEND_PORT", "8002")
    FRONTEND_PORT: str = os.getenv("FRONTEND_PORT", "3001")
    AUTH_FRONTEND_PORT: str = os.getenv("AUTH_FRONTEND_PORT", "3002")
    ADMIN_BACKEND_PORT: str = os.getenv("ADMIN_BACKEND_PORT", "5001")
    ADMIN_FRONTEND_PORT: str = os.getenv("ADMIN_FRONTEND_PORT", "3003")
    PYTHONPATH: str = os.getenv("PYTHONPATH", "/home/runner/work/Yoga/Yoga")
    ECHO_SQL: bool = os.getenv("ECHO_SQL", "True").lower() == "true"

    class Config:
        env_file = os.path.join(
            os.path.dirname(os.path.dirname(__file__)), 
            ".env"
        )


settings = Settings()
