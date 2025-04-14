from datetime import datetime, timedelta
from fastapi import status
from utils.models import TimeSlot, Trainer, Service

def test_get_timeslot(test_client, test_session):
    trainer = test_session.query(Trainer).filter(Trainer.name == "Test Trainer 1").first()
    tomorrow = datetime.now() + timedelta(days=1)

    response = test_client.get(f"/api/admin/times?trainer_id={trainer.id}&date={tomorrow.date()}")
    assert response.status_code == 200

    data = response.json()
    assert len(data) == 1
    assert data[0]["trainer_name"] == "Test Trainer 1"
    assert data[0]["service_name"] == "Test Service 1"
    assert data[0]["group_name"] is None
    assert data[0]["date"] == tomorrow.date().isoformat()
    actual_time = data[0]["time"].split(".")[0]
    expected_time = tomorrow.time().strftime("%H:%M:%S")
    assert actual_time == expected_time
    assert data[0]["status"] is True
    assert data[0]["available_spots"] == 0

def test_return_timeslots_endpoint_no_data(test_client):
    response = test_client.get("/api/admin/times?trainer_id=999&date=2023-01-01")
    assert response.status_code == 200

    data = response.json()
    assert len(data) == 0

def test_get_time_not_found(test_client):
    non_existent_time_id = 999  # ID, который заведомо не существует
    response = test_client.get(f"/api/admin/time/{non_existent_time_id}")

    assert response.status_code == 404
    assert response.json() == {"detail": "Временной слот не найден"}

def test_add_time_slot_success(test_client, test_session):
    trainer = test_session.query(Trainer).filter(Trainer.name == "Test Trainer 1").first()
    service = test_session.query(Service).filter(Service.name == "Test Service 1").first()

    time_data = {
        "trainer_name": "Test Trainer 1",
        "service_name": "Test Service 1",
        "date": "2023-10-01",
        "time": "10:00",
        "status": True,
        "available_spots": 5,
    }

    response = test_client.post("/api/admin/time/add", json=time_data)
    assert response.status_code == status.HTTP_200_OK

    response_data = response.json()
    assert response_data["message"] == "Временной слот успешно добавлен"
    assert response_data["time_slot"]["trainer_id"] == trainer.id
    assert response_data["time_slot"]["service_id"] == service.id
    assert response_data["time_slot"]["dates"] == "2023-10-01"
    assert response_data["time_slot"]["times"] == "10:00:00"
    assert response_data["time_slot"]["available"] is True
    assert response_data["time_slot"]["available_spots"] == 5

def test_add_time_slot_trainer_not_found(test_client):
    time_data = {
        "trainer_name": "Nonexistent Trainer",
        "service_name": "Test Service 1",
        "date": "2025-10-01",
        "time": "10:00",
        "status": True,
        "available_spots": 0
    }

    response = test_client.post("/api/admin/time/add", json=time_data)

    assert response.status_code == 400, f"Expected 400, got {response.status_code}"
    response_data = response.json()
    expected_detail = "Тренер 'Nonexistent Trainer' не найден"
    assert response_data["detail"] == expected_detail, f"Expected '{expected_detail}', got '{response_data['detail']}'"


def test_add_time_slot_service_not_found(test_client):
    time_data = {
        "trainer_name": "Test Trainer 1",
        "service_name": "Несуществующая Услуга",
        "date": "2023-10-01",
        "time": "10:00",
        "status": True,
        "available_spots": 5,
    }

    response = test_client.post("/api/admin/time/add", json=time_data)
    
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert response.json()["detail"] == "Услуга 'Несуществующая Услуга' не найдена"

def test_add_time_slot_group_class_not_found(test_client):
    time_data = {
        "trainer_name": "Test Trainer 1",
        "group_name": "Несуществующее Занятие",
        "date": "2023-10-01",
        "time": "10:00",
        "status": True,
        "available_spots": 5,
    }

    response = test_client.post("/api/admin/time/add", json=time_data)
    
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert response.json()["detail"] == "Групповое занятие 'Несуществующее Занятие' не найдено"

def test_delete_time_slot(test_client, test_session):
    timeslot = test_session.query(TimeSlot).first()
    time_id = timeslot.id

    response = test_client.delete(f"/api/admin/time/delete/{time_id}")

    assert response.status_code == 200, f"Expected 200, got {response.status_code}"
    
    deleted_timeslot = test_session.query(TimeSlot).filter(TimeSlot.id == time_id).first()
    assert deleted_timeslot is None, "Time slot was not deleted correctly"


def test_delete_time_slot_not_found(test_client):
    time_id = 999
    response = test_client.delete(f"/api/admin/time/delete/{time_id}")
    
    assert response.status_code == 404, f"Expected 404, got {response.status_code}"
    
    response_data = response.json()
    expected_detail = "Временной слот не найден"
    assert response_data["detail"] == expected_detail, f"Expected '{expected_detail}', got '{response_data['detail']}'"

def test_edit_time_success(test_client):
    response = test_client.get("/api/admin/time/1")
    assert response.status_code == 200

    new_date = (datetime.now() + timedelta(days=2)).strftime("%Y-%m-%d")
    new_time = "14:00"
    new_trainer_name = "Test Trainer 2"
    new_service_name = "Test Service 2"
    new_status = False
    new_available_spots = 2

    update_data = {
        "date": new_date,
        "time": new_time,
        "trainer_name": new_trainer_name,
        "service_name": new_service_name,
        "group_name": None,
        "status": new_status,
        "available_spots": new_available_spots
    }

    response = test_client.put("/api/admin/time/edit/1", json=update_data)
    assert response.status_code == 200

    response = test_client.get("/api/admin/time/1")
    updated_time_slot = response.json()

    assert updated_time_slot["dates"] == new_date
    assert updated_time_slot["times"] == new_time + ":00"
    assert updated_time_slot["trainer_id"] == 2
    assert updated_time_slot["service_id"] == 2
    assert updated_time_slot["available"] == new_status
    assert updated_time_slot["available_spots"] == new_available_spots

def test_edit_nonexistent_time_slot(test_client):
    time_data = {
        "trainer_name": "Test Trainer 2",
        "service_name": "Test Service 2",
        "date": "2025-10-02",
        "time": "11:00",
        "status": False,
        "available_spots": 5
    }
    
    response = test_client.put("/api/admin/time/edit/9999", json=time_data)  # ID 9999 не существует

    assert response.status_code == 404, f"Expected 404, got {response.status_code}"
    
    response_data = response.json()
    expected_detail = "Временной слот не найден"
    assert response_data["detail"] == expected_detail, f"Expected '{expected_detail}', got '{response_data['detail']}'"

def test_edit_with_nonexistent_trainer(test_client, test_session):
    timeslot = test_session.query(TimeSlot).first()
    time_id = timeslot.id

    time_data = {
        "trainer_name": "Nonexistent Trainer",
        "service_name": "Test Service 1",
        "date": "2025-10-02",
        "time": "11:00",
        "status": True,
        "available_spots": 5
    }

    response = test_client.put(f"/api/admin/time/edit/{time_id}", json=time_data)

    assert response.status_code == 400, f"Expected 400, got {response.status_code}"

    response_data = response.json()
    expected_detail = "Тренер 'Nonexistent Trainer' не найден"
    assert response_data["detail"] == expected_detail, f"Expected '{expected_detail}', got '{response_data['detail']}'"

def test_edit_with_nonexistent_service(test_client, test_session):
    timeslot = test_session.query(TimeSlot).first()
    time_id = timeslot.id

    time_data = {
        "trainer_name": "Test Trainer 1",
        "service_name": "Nonexistent Service",
        "date": "2025-10-02",
        "time": "11:00",
        "status": True,
        "available_spots": 5
    }

    response = test_client.put(f"/api/admin/time/edit/{time_id}", json=time_data)

    assert response.status_code == 400, f"Expected 400, got {response.status_code}"

    response_data = response.json()
    expected_detail = "Услуга 'Nonexistent Service' не найдена"
    assert response_data["detail"] == expected_detail, f"Expected '{expected_detail}', got '{response_data['detail']}'"

def test_edit_with_nonexistent_group_class(test_client, test_session):
    timeslot = test_session.query(TimeSlot).first()
    time_id = timeslot.id

    time_data = {
        "trainer_name": "Test Trainer 1",
        "service_name": "Test Service 1",
        "group_name": "Nonexistent Group Class",
        "date": "2025-10-02",
        "time": "11:00",
        "status": True,
        "available_spots": 5
    }

    response = test_client.put(f"/api/admin/time/edit/{time_id}", json=time_data)

    assert response.status_code == 400, f"Expected 400, got {response.status_code}"

    response_data = response.json()
    expected_detail = "Групповое занятие 'Nonexistent Group Class' не найдено"
    assert response_data["detail"] == expected_detail, f"Expected '{expected_detail}', got '{response_data['detail']}'"
