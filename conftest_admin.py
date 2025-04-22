from datetime import datetime, timedelta

import pytest

from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlmodel import SQLModel

from admin.backend.main import app
from utils.models import Branch, GroupClass, Service, TimeSlot, Trainer

# URL для тестовой базы данных - используем локальное соединение
TEST_DATABASE_URL = "postgresql://postgres:Worldof123@localhost:5432/test_db"

# Создаем движок и сессию
engine = create_engine(TEST_DATABASE_URL)
TestingSessionLocal = sessionmaker(
    autocommit=False, autoflush=False, bind=engine
)


# Фикстура для настройки базы данных
@pytest.fixture(scope="function")
def test_session():
    SQLModel.metadata.drop_all(bind=engine)
    SQLModel.metadata.create_all(bind=engine)
    session = TestingSessionLocal()

    # Добавление тестовых данных
    service1 = Service(
        name="Test Service 1",
        duration=60,
        description="Description 1",
        price=1000,
        type="individual",
    )
    service2 = Service(
        name="Test Service 2",
        duration=30,
        description="Description 2",
        price=500,
        type="group",
    )
    trainer1 = Trainer(name="Test Trainer 1", specialization="Yoga")
    trainer2 = Trainer(name="Test Trainer 2", specialization="Fitness")
    group_class1 = GroupClass(
        name="Test Group 1",
        duration=90,
        description="Description 1",
        price=1500,
    )
    group_class2 = GroupClass(
        name="Test Group 2",
        duration=45,
        description="Description 2",
        price=750,
    )

    session.add_all(
        [service1, service2, trainer1, trainer2, group_class1, group_class2]
    )
    session.commit()

    tomorrow = datetime.now() + timedelta(days=1)
    timeslot1 = TimeSlot(
        trainer_id=trainer1.id,
        service_id=service1.id,
        dates=tomorrow.date(),
        times=tomorrow.time(),
        available=True,
    )
    timeslot2 = TimeSlot(
        trainer_id=trainer2.id,
        group_class_id=group_class1.id,
        dates=tomorrow.date(),
        times=tomorrow.time(),
        available=True,
        available_spots=1,
    )

    session.add_all([timeslot1, timeslot2])
    session.commit()

    branch_data = Branch(
        name="Test Name",
        address="test_address",
        phone="1234567890",
        workingHours="9:00-21:00",
        description="test_description",
    )

    session.add(branch_data)
    session.commit()

    yield session
    session.close()


@pytest.fixture(scope="function")
def test_client(test_session):
    def override_session():
        return test_session

    app.dependency_overrides[TestingSessionLocal] = override_session
    with TestClient(app) as client:
        yield client
    app.dependency_overrides[TestingSessionLocal] = None 