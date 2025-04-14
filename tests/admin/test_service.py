from utils.models import Service

def test_get_services(test_client):
    response = test_client.get("/api/admin/services")
    assert response.status_code == 200
    services = response.json()
    assert isinstance(services, list)
    assert len(services) >= 2
    assert services[0]["name"] == "Test Service 1"

def test_add_service(test_client):
    data = {
        "name": "Test Service 3",
        "duration": 10,
        "description": "Test Service 3 description",
        "price": 999,
        "type": "individual"
    }
    response = test_client.post("/api/admin/service/add", json=data)

    json_response = response.json()
    assert json_response is not None
    assert "service_id" in json_response

def test_add_service_without_parametrs(test_client):
    data = {
        "duration": 10,
        "description": "Test Service 3 description",
        "price": 999,
    }
    response = test_client.post("/api/admin/service/add", json=data)
    assert response.status_code == 400
    assert response.json() == {"detail": "Название и тип обязательны"}

def test_add_existing_service(test_client):
    existing_service = {
        "name": "Test Service 1",
        "duration": 60,
        "description": "Description 1",
        "price": 1000,
        "type": "individual"
    }
    response = test_client.post("/api/admin/service/add", json=existing_service)
    assert response.status_code == 400
    assert response.json() == {"detail": "Сервис уже существует"}
    
def test_delete_service(test_client, test_session):
    new_service = Service(name="Test Service", type="ingividual")
    test_session.add(new_service)
    test_session.commit()

    response = test_client.get(f"/api/admin/service/{new_service.id}")
    assert response.status_code == 200

    response = test_client.delete(f"/api/admin/service/delete/{new_service.id}")
    assert response.status_code == 200

    response = test_client.get(f"/api/admin/service/{new_service.id}")
    assert response.status_code == 404
    assert response.json() == {"detail": "Сервис не найден"}

def test_delete_service_not_found(test_client):
    response = test_client.delete("/api/admin/service/delete/9999")
    assert response.status_code == 404
    assert response.json() == {"detail": "Сервис не найден"}

def test_edit_service(test_client, test_session):
    old_service = Service(name="Old Service", type="individual")
    test_session.add(old_service)
    test_session.commit()

    response = test_client.get(f"/api/admin/service/{old_service.id}")
    assert response.status_code == 200
    assert response.json()["id"] == old_service.id

    data = {
        "name": "New Service",
        "duration": 35,
        "description": "New description",
        "price": 999,
        "photo": "New photo",
        "type": "group"
    }
    
    response = test_client.put(f"/api/admin/service/edit/{old_service.id}", json=data)

    assert response.status_code == 200

    response = test_client.get(f"/api/admin/service/{old_service.id}")
    assert response.status_code == 200

    updated_service = response.json()
    assert updated_service["name"] == "New Service"
    assert updated_service["duration"] == 35
    assert updated_service["description"] == "New description"
    assert updated_service["price"] == 999
    assert updated_service["photo"] == "New photo"
    assert updated_service["type"] == "group"

def test_edit_service_not_found(test_client):
    data = {
        "name": "New Service",
        "duration": 35,
        "description": "New description",
        "price": 999,
        "photo": "New photo",
        "type": "group"
    }
    response = test_client.put("/api/admin/service/edit/999", json=data)

    assert response.status_code == 404
    assert response.json() == {"detail": "Сервис не найден"}
