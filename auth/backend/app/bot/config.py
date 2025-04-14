from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    BOT_TOKEN: str = "7844671961:AAHhE0Uuz4u7Ge00as21A4AqG-TFotrRWcQ"

    class Config:
        env_file = ".env"


settings = Settings()