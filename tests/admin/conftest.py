import os
import sys

# Добавляем корневой каталог проекта в путь поиска модулей Python
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))

from datetime import datetime, timedelta

import pytest

from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlmodel import Session, SQLModel, select

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
    # Создаем все таблицы, но не удаляем существующие данные
    SQLModel.metadata.create_all(bind=engine)
    session = TestingSessionLocal()

    # Проверяем наличие необходимых данных в базе и создаем только отсутствующие
    
    # Проверяем наличие сервисов
    existing_service = session.execute(select(Service).limit(1)).scalars().first()
    if not existing_service:
        service1 = Service(
            name="Хатха йога",
            duration=60,
            description="Описание хатха йоги",
            price=1000,
            type="individual",
        )
        service2 = Service(
            name="Аштанга виньяса йога",
            duration=30,
            description="Описание аштанга виньяса йоги",
            price=500,
            type="group",
        )
        session.add_all([service1, service2])
        session.commit()
    
    # Проверяем наличие тренеров
    existing_trainer = session.execute(select(Trainer).limit(1)).scalars().first()
    if not existing_trainer:
        trainer1 = Trainer(name="Мастер-тренер", specialization="Йога")
        trainer2 = Trainer(name="Тренер", specialization="Фитнес")
        session.add_all([trainer1, trainer2])
        session.commit()
    
    # Проверяем наличие групповых занятий
    existing_group = session.execute(select(GroupClass).limit(1)).scalars().first()
    if not existing_group:
        group_class1 = GroupClass(
            name="Йога критического выравнивания",
            duration=90,
            description="Описание йоги критического выравнивания",
            price=1500,
        )
        group_class2 = GroupClass(
            name="Парная йога",
            duration=45,
            description="Описание парной йоги",
            price=750,
        )
        session.add_all([group_class1, group_class2])
        session.commit()
    
    # Проверяем наличие временных слотов
    existing_timeslot = session.execute(select(TimeSlot).limit(1)).scalars().first()
    if not existing_timeslot:
        trainer = session.execute(select(Trainer).limit(1)).scalars().first()
        service = session.execute(select(Service).limit(1)).scalars().first()
        group = session.execute(select(GroupClass).limit(1)).scalars().first()
        
        tomorrow = datetime.now() + timedelta(days=1)
        timeslot1 = TimeSlot(
            trainer_id=trainer.id,
            service_id=service.id,
            dates=tomorrow.date(),
            times=tomorrow.time(),
            available=True,
        )
        timeslot2 = TimeSlot(
            trainer_id=trainer.id,
            group_class_id=group.id,
            dates=tomorrow.date(),
            times=tomorrow.time(),
            available=True,
            available_spots=5,
        )
        session.add_all([timeslot1, timeslot2])
        session.commit()
    
    # Проверяем наличие данных о филиале
    existing_branch = session.execute(select(Branch).limit(1)).scalars().first()
    if not existing_branch:
        branch_data = Branch(
            name="Йога Хом",
            address="ул. Йоги, 123",
            phone="1234567890",
            workingHours="9:00-21:00",
            description="Описание филиала",
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