from utils.models import GroupClass

def test_get_groups(test_client):
    response = test_client.get("/api/admin/groups")
    assert response.status_code == 200
    groups = response.json()
    assert isinstance(groups, list)
    assert len(groups) >= 2
    assert groups[0]["name"] == "Test Group 1"

def test_add_group(test_client):
    data = {
        "name": "Test Group Class 3",
        "duration": 100,
        "description": "Test Group Class 3 description",
        "price": 999
    }
    response = test_client.post("/api/admin/group/add", json=data)
    assert response.status_code == 200
    group = response.json()
    assert group is not None
    assert "group_id" in group

def test_group_without_parametrs(test_client):
    data = {
        "duration": 10,
        "description": "Test Group 3 description",
        "price": 999,
    }
    response = test_client.post("/api/admin/group/add", json=data)
    assert response.status_code == 400
    assert response.json() == {"detail": "Название является обязательным"}

def test_add_existing_group(test_client):
    existing_group = {
        "name": "Test Group 1",
        "duration": 90,
        "description": "Description 1",
        "price": 1500
    }
    response = test_client.post("/api/admin/group/add", json=existing_group)
    assert response.status_code == 400
    assert response.json() == {"detail": "Групповое занятие уже существует"}

def test_delete_group(test_client, test_session):
    new_group = GroupClass(name="Test Group 3")
    test_session.add(new_group)
    test_session.commit()

    response = test_client.get(f"/api/admin/group/{new_group.id}")
    assert response.status_code == 200

    response = test_client.delete(f"/api/admin/group/delete/{new_group.id}")
    assert response.status_code == 200

    response = test_client.get(f"/api/admin/group/{new_group.id}")
    assert response.status_code == 404
    assert response.json() == {"detail": "Групповое занятие не найдено"}

def test_delete_group_not_found(test_client):
    response = test_client.delete("/api/admin/group/delete/9999")
    assert response.status_code == 404
    assert response.json() == {"detail": "Групповое занятие не найдено"}

def test_edit_group(test_client, test_session):
    old_group = GroupClass(name="Old Group")
    test_session.add(old_group)
    test_session.commit()

    response = test_client.get(f"/api/admin/group/{old_group.id}")
    assert response.status_code == 200
    assert response.json()["id"] == old_group.id

    data = {
        "name": "New Group",
        "duration": 35,
        "description": "New description",
        "price": 999
    }
    
    response = test_client.put(f"/api/admin/group/edit/{old_group.id}", json=data)
    assert response.status_code == 200

    response = test_client.get(f"/api/admin/group/{old_group.id}")
    assert response.status_code == 200

    updated_group = response.json()
    assert updated_group["name"] == "New Group"
    assert updated_group["duration"] == 35
    assert updated_group["description"] == "New description"
    assert updated_group["price"] == 999

def test_edit_group_not_found(test_client):
    data = {
        "name": "New Group",
        "duration": 35,
        "description": "New description",
        "price": 999
    }
    response = test_client.put("/api/admin/group/edit/999", json=data)

    assert response.status_code == 404
    assert response.json() == {"detail": "Групповое занятие не найдено"}
