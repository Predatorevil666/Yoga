from utils.models import Trainer


def test_get_trainers(test_client):
    response = test_client.get("/api/admin/trainers")
    assert response.status_code == 200
    trainers = response.json()
    assert isinstance(trainers, list)
    assert len(trainers) >= 2
    assert trainers[0]["name"] == "Test Trainer 1"


def test_add_trainer(test_client):
    data = {
        "name": "Test Trainer 3",
        "description": "Test Trainer 3 description",
        "specialization": "Test Trainer 3 specialization",
        "photo": "Test Trainer 3 photo",
    }
    response = test_client.post("/api/admin/trainer/add", json=data)

    json_response = response.json()
    assert json_response is not None
    assert "trainer_id" in json_response


def test_add_trainer_without_parametrs(test_client):
    data = {
        "description": "Test Trainer 3 description",
        "specialization": "Test Trainer 3 specialization",
        "photo": "Test Trainer 3 photo",
    }
    response = test_client.post("/api/admin/trainer/add", json=data)
    assert response.status_code == 400
    assert response.json() == {"detail": "Имя и Специализация обязательны"}


def test_add_existing_trainer(test_client):
    existing_trainer = {"name": "Test Trainer 1", "specialization": "Yoga"}
    response = test_client.post("/api/admin/trainer/add", json=existing_trainer)
    assert response.status_code == 400
    assert response.json() == {"detail": "Тренер уже существует"}


def test_delete_trainer(test_client, test_session):
    new_trainer = Trainer(name="Test Trainer", specialization="Yoga")
    test_session.add(new_trainer)
    test_session.commit()

    response = test_client.get(f"/api/admin/trainer/{new_trainer.id}")
    assert response.status_code == 200
    # assert response.json()["id"] == new_trainer.id

    response = test_client.delete(f"/api/admin/trainer/delete/{new_trainer.id}")
    assert response.status_code == 200

    response = test_client.get(f"/api/admin/trainer/{new_trainer.id}")
    assert response.status_code == 404
    assert response.json() == {"detail": "Тренер не найден"}


def test_delete_trainer_not_found(test_client):
    response = test_client.delete("/api/admin/trainer/delete/9999")
    assert response.status_code == 404
    assert response.json() == {"detail": "Тренер не найден"}


def test_edit_trainer(test_client, test_session):
    old_trainer = Trainer(name="Old Trainer", specialization="Yoga")
    test_session.add(old_trainer)
    test_session.commit()

    response = test_client.get(f"/api/admin/trainer/{old_trainer.id}")
    assert response.status_code == 200
    assert response.json()["id"] == old_trainer.id

    data = {
        "name": "New Trainer",
        "description": "New description",
        "specialization": "New Specialization",
        "photo": "New photo",
    }

    response = test_client.put(f"/api/admin/trainer/edit/{old_trainer.id}", json=data)

    assert response.status_code == 200

    response = test_client.get(f"/api/admin/trainer/{old_trainer.id}")
    assert response.status_code == 200

    updated_trainer = response.json()
    assert updated_trainer["name"] == "New Trainer"
    assert updated_trainer["description"] == "New description"
    assert updated_trainer["specialization"] == "New Specialization"
    assert updated_trainer["photo"] == "New photo"


def test_edit_trainer_not_found(test_client):
    # Делаем PUT-запрос с несуществующим trainer_id
    response = test_client.put(
        "/api/admin/trainer/edit/999",
        json={
            "name": "New Trainer Name",
            "description": "New Description",
            "specialization": "Fitness",
            "photo": "new-photo.jpg",
        },
    )

    # Проверяем, что возвращен статус 404 и правильное сообщение об ошибке
    assert response.status_code == 404
    assert response.json() == {"detail": "Тренер не найден"}
