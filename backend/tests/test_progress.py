import pytest


@pytest.mark.asyncio
async def test_behavior_frequency(client, auth_headers, test_pet):
    resp = await client.get(
        f"/api/v1/progress/frequency?pet_id={test_pet['id']}",
        headers=auth_headers,
    )
    assert resp.status_code == 200
    data = resp.json()
    assert "data" in data
    assert data["pet_id"] == test_pet["id"]


@pytest.mark.asyncio
async def test_severity_trend(client, auth_headers, test_pet):
    resp = await client.get(
        f"/api/v1/progress/severity-trend?pet_id={test_pet['id']}",
        headers=auth_headers,
    )
    assert resp.status_code == 200
    assert "data" in resp.json()


@pytest.mark.asyncio
async def test_category_breakdown(client, auth_headers, test_pet):
    resp = await client.get(
        f"/api/v1/progress/category-breakdown?pet_id={test_pet['id']}",
        headers=auth_headers,
    )
    assert resp.status_code == 200
    data = resp.json()
    assert "behaviors" in data
    assert "antecedents" in data
    assert "consequences" in data


@pytest.mark.asyncio
async def test_dashboard(client, auth_headers, test_pet):
    resp = await client.get(
        f"/api/v1/progress/dashboard?pet_id={test_pet['id']}",
        headers=auth_headers,
    )
    assert resp.status_code == 200
    data = resp.json()
    assert "total_logs" in data
    assert "pattern_detection_ready" in data
    assert data["pet_id"] == test_pet["id"]


@pytest.mark.asyncio
async def test_pattern_detection_insufficient_logs(client, auth_headers, test_pet):
    """Pattern detection should fail with < 10 logs."""
    resp = await client.post(
        f"/api/v1/analysis/detect-patterns?pet_id={test_pet['id']}",
        headers=auth_headers,
    )
    assert resp.status_code == 422
    assert "Need at least" in resp.json()["detail"]
