from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    AUTH_BACKEND_DB_URL: str
    ECHO_SQL: bool = True

    class Config:
        env_file = ".env"

settings = Settings()