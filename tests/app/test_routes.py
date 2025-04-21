from __future__ import annotations

from datetime import datetime, timedelta

from sqlmodel import select

from utils.models import Booking, GroupClass, Service, TimeSlot, Trainer

# Тесты


def test_get_trainers(test_client):
    response = test_client.get("/api/trainers")
    assert response.status_code == 200
    trainers = response.json()
    assert isinstance(trainers, list)
    assert len(trainers) >= 2  # Проверяем, что есть хотя бы два тренера
    # Проверяем имя первого тренера
    assert trainers[0]["name"] == "Test Trainer 1"


def test_get_services(test_client):
    response = test_client.get("/api/services")
    assert response.status_code == 200
    services = response.json()
    assert isinstance(services, list)
    assert len(services) >= 2
    assert services[0]["name"] == "Test Service 1"


def test_get_branch_info(test_client):
    response = test_client.get("/api/branch-info")
    assert response.status_code == 200
    branch_info = response.json()
    assert isinstance(branch_info, list)
    assert len(branch_info) >= 1
    assert branch_info[0]["name"] == "Test Name"


def test_get_timeslots(test_client, test_session):
    # Создаем временной слот для теста
    trainer = test_session.execute(select(Trainer)).scalars().first()
    service = test_session.execute(select(Service)).scalars().first()

    # Проверяем, что тренер и услуга существуют
    assert trainer is not None, "Тренер не найден"
    assert service is not None, "Услуга не найдена"

    timeslot = (
        test_session.query(TimeSlot)
        .filter(
            TimeSlot.trainer_id == trainer.id,
            TimeSlot.service_id == service.id,
        )
        .first()
    )

    assert timeslot is not None, "Таймслот не найден"

    response = test_client.get(
        "/api/timeslots",
        params={
            "service_id": service.id,
            "trainerId": trainer.id,
            "date": timeslot.dates,
        },
    )

    assert response.status_code == 200
    timeslots = response.json()
    assert isinstance(timeslots, list)
    assert len(timeslots) > 0
    # Проверяем, что данные о тренере совпадают
    assert timeslots[0]["trainer_id"] == trainer.id
    # Проверяем, что данные о сервисе совпадают
    assert timeslots[0]["service_id"] == service.id


def test_group_classes(test_client):
    response = test_client.get(
        "/api/group-classes",
        params={"date": datetime.now() + timedelta(days=1)},
    )
    assert response.status_code == 200
    data = response.json()

    assert data[0]["GroupClass"]["name"] == "Test Group 1"
    assert data[0]["Trainer"]["name"] == "Test Trainer 2"
    assert data[0]["TimeSlot"]["available_spots"] == 1


def test_get_group_classes_no_available_data(test_client):
    response = test_client.get(
        "/api/group-classes",
        params={"date": datetime.now() + timedelta(days=2)},
    )
    assert response.status_code == 200
    assert response.json() == []


def test_post_booking_data_service(test_client, test_session):
    trainer = test_session.execute(select(Trainer)).scalars().first()
    service = test_session.execute(select(Service)).scalars().first()
    timeslot = (
        test_session.query(TimeSlot)
        .filter(TimeSlot.service_id == service.id)
        .first()
    )

    assert trainer is not None
    assert service is not None
    assert timeslot is not None

    booking_date = timeslot.dates.strftime("%Y-%m-%d")

    response = test_client.post(
        "/api/bookings",
        json={
            "serviceId": service.id,
            "trainerId": trainer.id,
            "timeSlotId": timeslot.id,
            "date": booking_date,
        },
    )
    assert response.status_code == 200
    assert "booking_id" in response.json()
    booking_id = response.json()["booking_id"]
    new_booking = (
        test_session.query(Booking).filter(Booking.id == booking_id).first()
    )

    assert new_booking is not None
    assert new_booking.service_id == service.id
    assert new_booking.trainer_id == trainer.id
    assert new_booking.timeslot_id == timeslot.id
    assert new_booking.dates == str(
        datetime.strptime(booking_date, "%Y-%m-%d").date()
    )

    test_session.commit()
    test_session.refresh(timeslot)
    assert timeslot.available is False


def test_post_booking_data_service_timeslot_unavailable(
    test_client, test_session
):
    trainer = test_session.execute(select(Trainer)).scalars().first()
    service = test_session.execute(select(Service)).scalars().first()
    timeslot = (
        test_session.query(TimeSlot)
        .filter(TimeSlot.service_id == service.id)
        .first()
    )

    assert trainer is not None
    assert service is not None
    assert timeslot is not None

    # Устанавливаем временной слот как недоступный
    timeslot.available = False
    test_session.commit()  # Сохраняем изменения в базе данных

    booking_date = timeslot.dates.strftime("%Y-%m-%d")

    response = test_client.post(
        "/api/bookings",
        json={
            "serviceId": service.id,
            "trainerId": trainer.id,
            "timeSlotId": timeslot.id,
            "date": booking_date,
        },
    )

    # Проверка, что статус код 400 и сообщение об ошибке соответствует ожиданиям
    assert response.status_code == 400
    assert response.json() == {"detail": "Выбранное время уже занято"}


def test_post_booking_data_group(test_client, test_session):
    group = test_session.execute(select(GroupClass)).scalars().first()
    timeslot = (
        test_session.query(TimeSlot)
        .filter(TimeSlot.group_class_id == group.id)
        .first()
    )

    assert group is not None
    assert timeslot is not None

    booking_date = timeslot.dates.strftime("%Y-%m-%d")

    response = test_client.post(
        "/api/bookings",
        json={
            "classId": group.id,
            "date": booking_date,
            "timeSlotId": timeslot.id,
            "name": "Test Booking",
            "phone": "1234567890",
            "email": "test@example.com",
        },
    )

    assert response.status_code == 200
    assert "booking_id" in response.json()

    booking_id = response.json()["booking_id"]
    new_booking = (
        test_session.query(Booking).filter(Booking.id == booking_id).first()
    )
    spots = timeslot.available_spots

    assert new_booking is not None
    assert new_booking.class_id == group.id
    assert new_booking.dates == booking_date
    assert new_booking.timeslot_id == timeslot.id
    assert new_booking.user_name == "Test Booking"
    assert new_booking.user_phone == "1234567890"
    assert new_booking.user_email == "test@example.com"

    test_session.commit()
    test_session.refresh(timeslot)
    assert timeslot.available_spots == spots - 1
    if timeslot.available_spots == 0:
        assert timeslot.available is False


def test_post_booking_data_group_timeslot_not_found(test_client, test_session):
    # Подготовка данных для теста
    booking_data = {
        "classId": 9999,  # Используем несуществующий classId
        "date": "2023-10-01",  # Указываем дату
        "timeSlotId": 9999,  # Используем несуществующий timeSlotId
        "name": "Test Booking",
        "phone": "1234567890",
        "email": "test@example.com",
    }

    # Выполняем POST-запрос к эндпоинту
    response = test_client.post("/api/bookings", json=booking_data)

    # Проверка, что статус код 400 и сообщение об ошибке соответствует ожиданиям
    assert response.status_code == 400
    assert response.json() == {"detail": "Выбранное время уже занято"}


def test_post_booking_data_service_timeslot_already_booked(
    test_client, test_session
):
    trainer = test_session.execute(select(Trainer)).scalars().first()
    service = test_session.execute(select(Service)).scalars().first()
    timeslot = (
        test_session.query(TimeSlot)
        .filter(TimeSlot.service_id == service.id)
        .first()
    )

    assert trainer is not None
    assert service is not None
    assert timeslot is not None

    # Устанавливаем временной слот как недоступный
    timeslot.available_spots = 0  # Устанавливаем количество доступных мест в 0
    timeslot.available = False
    test_session.commit()  # Сохраняем изменения в базе данных

    booking_date = timeslot.dates.strftime("%Y-%m-%d")

    response = test_client.post(
        "/api/bookings",
        json={
            "serviceId": service.id,
            "trainerId": trainer.id,
            "timeSlotId": timeslot.id,
            "date": booking_date,
        },
    )

    # Проверка, что статус код 400 и сообщение об ошибке соответствует ожиданиям
    assert response.status_code == 400
    assert response.json() == {"detail": "Выбранное время уже занято"}


def test_get_booking_details(test_client, test_session):
    trainer = test_session.execute(select(Trainer)).scalars().first()
    service = test_session.execute(select(Service)).scalars().first()
    timeslot = (
        test_session.query(TimeSlot)
        .filter(TimeSlot.service_id == service.id)
        .first()
    )

    assert trainer is not None
    assert service is not None
    assert timeslot is not None

    booking_date = timeslot.dates.strftime("%Y-%m-%d")

    test_client.post(
        "/api/bookings",
        json={
            "serviceId": service.id,
            "trainerId": trainer.id,
            "timeSlotId": timeslot.id,
            "date": booking_date,
        },
    )

    test_session.commit()
    response = test_client.get("/api/booking-details")

    assert response.status_code == 200
    response_data = response.json()

    assert "serviceName" in response_data
    assert "trainerName" in response_data
    assert "date" in response_data
    assert "time" in response_data

    assert response_data["serviceName"] == service.name
    assert response_data["trainerName"] == trainer.name
    assert response_data["date"] == str(booking_date)
    assert response_data["time"] == str(timeslot.times)


def test_get_success_data_no_booking(test_client, test_session):
    # Убедитесь, что таблица Booking пуста
    test_session.query(Booking).delete()  # Удаляем все записи о бронировании
    test_session.commit()  # Сохраняем изменения в базе данных

    # Выполняем GET-запрос к эндпоинту
    response = test_client.get("/api/booking-details")

    # Проверка, что статус код 200 и сообщение об ошибке соответствует ожиданиям
    assert response.status_code == 200
    assert response.json() == {"error": "No booking found"}
