import pytest


@pytest.mark.asyncio
async def test_health_check(client):
    resp = await client.get("/health")
    assert resp.status_code == 200
    assert resp.json()["status"] == "healthy"


@pytest.mark.asyncio
async def test_dev_token_creation(client):
    resp = await client.post(
        "/api/v1/auth/dev-token",
        json={"user_id": "test-user-for-auth"},
    )
    assert resp.status_code == 200
    data = resp.json()
    assert "token" in data
    assert data["user_id"] == "test-user-for-auth"


@pytest.mark.asyncio
async def test_verify_token(client):
    # Get a token first
    token_resp = await client.post(
        "/api/v1/auth/dev-token",
        json={"user_id": "verify-test-user"},
    )
    token = token_resp.json()["token"]

    # Verify it
    resp = await client.post(
        "/api/v1/auth/verify",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 200
    assert resp.json()["user_id"] == "verify-test-user"


@pytest.mark.asyncio
async def test_no_auth_returns_401(client):
    resp = await client.get("/api/v1/pets")
    assert resp.status_code == 401


@pytest.mark.asyncio
async def test_invalid_token_returns_401(client):
    resp = await client.get(
        "/api/v1/pets",
        headers={"Authorization": "Bearer invalid.token.here"},
    )
    assert resp.status_code == 401
