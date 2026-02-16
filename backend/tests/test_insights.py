import pytest


@pytest.mark.asyncio
async def test_list_insights_empty(client, auth_headers, test_pet):
    resp = await client.get(
        f"/api/v1/pets/{test_pet['id']}/insights",
        headers=auth_headers,
    )
    assert resp.status_code == 200
    assert resp.json() == []


@pytest.mark.asyncio
async def test_insights_summary(client, auth_headers, test_pet):
    resp = await client.get(
        f"/api/v1/pets/{test_pet['id']}/insights/summary",
        headers=auth_headers,
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["total"] == 0
    assert data["unread"] == 0


@pytest.mark.asyncio
async def test_list_insights_no_auth(client, test_pet):
    resp = await client.get(f"/api/v1/pets/{test_pet['id']}/insights")
    assert resp.status_code == 401


@pytest.mark.asyncio
async def test_get_insight_not_found(client, auth_headers):
    resp = await client.get(
        "/api/v1/insights/00000000-0000-0000-0000-000000000099",
        headers=auth_headers,
    )
    assert resp.status_code == 404
