import pytest


@pytest.mark.asyncio
async def test_create_pet(client, auth_headers):
    resp = await client.post(
        "/api/v1/pets",
        json={"name": "Luna", "species": "cat", "breed": "Maine Coon", "age_years": 3},
        headers=auth_headers,
    )
    assert resp.status_code == 201
    data = resp.json()
    assert data["name"] == "Luna"
    assert data["species"] == "cat"
    assert data["breed"] == "Maine Coon"
    assert "id" in data


@pytest.mark.asyncio
async def test_create_pet_validation(client, auth_headers):
    # Invalid species
    resp = await client.post(
        "/api/v1/pets",
        json={"name": "Bird", "species": "parrot"},
        headers=auth_headers,
    )
    assert resp.status_code == 422


@pytest.mark.asyncio
async def test_list_pets(client, auth_headers, test_pet):
    resp = await client.get("/api/v1/pets", headers=auth_headers)
    assert resp.status_code == 200
    pets = resp.json()
    assert len(pets) >= 1
    assert any(p["name"] == test_pet["name"] for p in pets)


@pytest.mark.asyncio
async def test_get_pet(client, auth_headers, test_pet):
    resp = await client.get(f"/api/v1/pets/{test_pet['id']}", headers=auth_headers)
    assert resp.status_code == 200
    assert resp.json()["id"] == test_pet["id"]


@pytest.mark.asyncio
async def test_update_pet(client, auth_headers, test_pet):
    resp = await client.put(
        f"/api/v1/pets/{test_pet['id']}",
        json={"name": "UpdatedName", "weight_lbs": 10.5},
        headers=auth_headers,
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["name"] == "UpdatedName"
    assert data["weight_lbs"] == 10.5


@pytest.mark.asyncio
async def test_delete_pet(client, auth_headers):
    # Create a pet to delete
    create_resp = await client.post(
        "/api/v1/pets",
        json={"name": "ToDelete", "species": "dog"},
        headers=auth_headers,
    )
    pet_id = create_resp.json()["id"]

    # Delete it
    resp = await client.delete(f"/api/v1/pets/{pet_id}", headers=auth_headers)
    assert resp.status_code == 204

    # Verify it's gone
    resp = await client.get(f"/api/v1/pets/{pet_id}", headers=auth_headers)
    assert resp.status_code == 404


@pytest.mark.asyncio
async def test_pet_not_found(client, auth_headers):
    resp = await client.get(
        "/api/v1/pets/00000000-0000-0000-0000-000000000000",
        headers=auth_headers,
    )
    assert resp.status_code == 404
