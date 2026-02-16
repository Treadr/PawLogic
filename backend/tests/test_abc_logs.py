import pytest


@pytest.mark.asyncio
async def test_create_abc_log(client, auth_headers, test_pet):
    resp = await client.post(
        "/api/v1/abc-logs",
        json={
            "pet_id": test_pet["id"],
            "antecedent_category": "environmental_change",
            "antecedent_tags": ["doorbell"],
            "behavior_category": "avoidance",
            "behavior_tags": ["hid"],
            "behavior_severity": 3,
            "consequence_category": "attention_given",
            "consequence_tags": ["went_to_pet"],
        },
        headers=auth_headers,
    )
    assert resp.status_code == 201
    data = resp.json()
    assert data["antecedent_category"] == "environmental_change"
    assert data["behavior_severity"] == 3


@pytest.mark.asyncio
async def test_create_abc_log_invalid_category(client, auth_headers, test_pet):
    resp = await client.post(
        "/api/v1/abc-logs",
        json={
            "pet_id": test_pet["id"],
            "antecedent_category": "INVALID",
            "antecedent_tags": ["doorbell"],
            "behavior_category": "avoidance",
            "behavior_tags": ["hid"],
            "behavior_severity": 3,
            "consequence_category": "attention_given",
            "consequence_tags": ["went_to_pet"],
        },
        headers=auth_headers,
    )
    assert resp.status_code == 422


@pytest.mark.asyncio
async def test_create_abc_log_invalid_severity(client, auth_headers, test_pet):
    resp = await client.post(
        "/api/v1/abc-logs",
        json={
            "pet_id": test_pet["id"],
            "antecedent_category": "environmental_change",
            "antecedent_tags": ["doorbell"],
            "behavior_category": "avoidance",
            "behavior_tags": ["hid"],
            "behavior_severity": 6,
            "consequence_category": "attention_given",
            "consequence_tags": ["went_to_pet"],
        },
        headers=auth_headers,
    )
    assert resp.status_code == 422


@pytest.mark.asyncio
async def test_list_abc_logs(client, auth_headers, test_pet):
    # Create a log first
    await client.post(
        "/api/v1/abc-logs",
        json={
            "pet_id": test_pet["id"],
            "antecedent_category": "other_animal",
            "antecedent_tags": ["dog_nearby"],
            "behavior_category": "aggression",
            "behavior_tags": ["hissed"],
            "behavior_severity": 2,
            "consequence_category": "attention_removed",
            "consequence_tags": ["walked_away"],
        },
        headers=auth_headers,
    )

    resp = await client.get(
        f"/api/v1/abc-logs?pet_id={test_pet['id']}",
        headers=auth_headers,
    )
    assert resp.status_code == 200
    assert len(resp.json()) >= 1


@pytest.mark.asyncio
async def test_abc_log_summary(client, auth_headers, test_pet):
    resp = await client.get(
        f"/api/v1/abc-logs/summary?pet_id={test_pet['id']}",
        headers=auth_headers,
    )
    assert resp.status_code == 200
    data = resp.json()
    assert "total_logs" in data
    assert "top_behaviors" in data


@pytest.mark.asyncio
async def test_get_taxonomy(client):
    resp = await client.get("/api/v1/abc-logs/taxonomy/cat")
    assert resp.status_code == 200
    data = resp.json()
    assert data["species"] == "cat"
    assert "antecedent_categories" in data
    assert "behavior_categories" in data
    assert "consequence_categories" in data

    # Dog taxonomy too
    resp = await client.get("/api/v1/abc-logs/taxonomy/dog")
    assert resp.status_code == 200
    assert resp.json()["species"] == "dog"


@pytest.mark.asyncio
async def test_taxonomy_invalid_species(client):
    resp = await client.get("/api/v1/abc-logs/taxonomy/bird")
    assert resp.status_code == 422
