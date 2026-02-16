"""Shared test fixtures for PawLogic backend tests."""

import asyncio
import uuid
from collections.abc import AsyncGenerator

import pytest
import pytest_asyncio
from httpx import ASGITransport, AsyncClient
from sqlalchemy import text

from app.core.security import create_dev_token
from app.db.session import async_session_factory, engine
from app.main import app

# Consistent test user ID
TEST_USER_ID = "550e8400-e29b-41d4-a716-446655440099"


@pytest.fixture(scope="session")
def event_loop():
    """Create a session-scoped event loop."""
    loop = asyncio.new_event_loop()
    yield loop
    loop.close()


@pytest_asyncio.fixture(scope="session")
async def client() -> AsyncGenerator[AsyncClient]:
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac
    # Session cleanup
    async with async_session_factory() as session:
        await session.execute(
            text("DELETE FROM insights WHERE user_id = :uid"),
            {"uid": uuid.UUID(TEST_USER_ID)},
        )
        await session.execute(
            text("DELETE FROM abc_logs WHERE user_id = :uid"),
            {"uid": uuid.UUID(TEST_USER_ID)},
        )
        await session.execute(
            text("DELETE FROM pets WHERE user_id = :uid"),
            {"uid": uuid.UUID(TEST_USER_ID)},
        )
        await session.execute(
            text("DELETE FROM users WHERE id = :uid"),
            {"uid": uuid.UUID(TEST_USER_ID)},
        )
        await session.commit()
    await engine.dispose()


@pytest.fixture
def auth_headers() -> dict[str, str]:
    """Auth headers with a valid dev token."""
    token = create_dev_token(TEST_USER_ID)
    return {"Authorization": f"Bearer {token}"}


@pytest_asyncio.fixture
async def test_pet(client: AsyncClient, auth_headers: dict) -> dict:
    """Create a test pet and return its data."""
    resp = await client.post(
        "/api/v1/pets",
        json={
            "name": "TestCat",
            "species": "cat",
            "breed": "Domestic Shorthair",
            "age_years": 2,
        },
        headers=auth_headers,
    )
    assert resp.status_code == 201
    return resp.json()
