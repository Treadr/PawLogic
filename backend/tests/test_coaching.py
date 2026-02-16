import pytest


@pytest.mark.asyncio
async def test_coaching_response(client, auth_headers, test_pet):
    resp = await client.post(
        "/api/v1/analysis/coaching",
        json={
            "pet_id": test_pet["id"],
            "question": "Why does my cat hide when visitors come over?",
        },
        headers=auth_headers,
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["pet_id"] == test_pet["id"]
    assert "response" in data
    assert len(data["response"]) > 20
    assert "model" in data


@pytest.mark.asyncio
async def test_coaching_question_too_short(client, auth_headers, test_pet):
    resp = await client.post(
        "/api/v1/analysis/coaching",
        json={
            "pet_id": test_pet["id"],
            "question": "why",
        },
        headers=auth_headers,
    )
    assert resp.status_code == 422


@pytest.mark.asyncio
async def test_coaching_no_auth(client, test_pet):
    resp = await client.post(
        "/api/v1/analysis/coaching",
        json={
            "pet_id": test_pet["id"],
            "question": "Why does my cat hide?",
        },
    )
    assert resp.status_code == 401
