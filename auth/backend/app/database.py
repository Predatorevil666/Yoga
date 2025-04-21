from collections.abc import Generator

from config import settings
from sqlmodel import Session, SQLModel, create_engine


class Database:
    def __init__(self, database_url: str, echo: bool = False):
        self.engine = create_engine(database_url, echo=echo)

    def create_db_and_tables(self):
        SQLModel.metadata.create_all(self.engine)

    def get_session(self) -> Generator[Session, None, None]:
        with Session(self.engine) as session:
            yield session


db = Database(
    database_url=settings.AUTH_BACKEND_DB_URL, echo=settings.ECHO_SQL
)
