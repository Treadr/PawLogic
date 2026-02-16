"""Security utilities and FastAPI dependencies for authentication.

Provides:
- ``get_current_user`` -- FastAPI dependency that extracts and verifies the
  Bearer token from the Authorization header.
- ``create_dev_token`` -- Helper to mint JWTs for local development/testing.
"""

import uuid
from datetime import UTC, datetime, timedelta

from fastapi import Depends
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.core.exceptions import ForbiddenException, UnauthorizedException
from app.db.session import get_db
from app.middleware.auth import ALGORITHM, verify_jwt

# Reusable scheme -- auto_error=False so we can provide our own message.
_bearer_scheme = HTTPBearer(auto_error=False)

# Dev tokens are valid for 24 hours by default.
_DEV_TOKEN_LIFETIME_HOURS = 24


async def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(_bearer_scheme),
) -> str:
    """FastAPI dependency that returns the authenticated user's ID.

    Extracts the Bearer token from the ``Authorization`` header, verifies it
    via :func:`~app.middleware.auth.verify_jwt`, and returns the ``sub`` claim
    (the user ID string).

    Raises:
        UnauthorizedException: If no token is provided or verification fails.
    """
    if credentials is None:
        raise UnauthorizedException("Authorization header is missing")

    payload = verify_jwt(credentials.credentials)
    user_id: str | None = payload.get("sub")

    if not user_id:
        raise UnauthorizedException("Token payload is missing user ID")

    return user_id


async def ensure_db_user(
    user_id: str = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> str:
    """Ensure the authenticated user has a record in the users table.

    Auto-provisions a minimal user row on first request (get-or-create).
    Returns the user_id string for use by downstream endpoints.
    """
    from app.models.user import User

    uid = uuid.UUID(user_id)
    result = await db.execute(select(User).where(User.id == uid))
    if result.scalar_one_or_none() is None:
        user = User(id=uid, email=f"{user_id}@pawlogic.dev")
        db.add(user)
        await db.flush()
    return user_id


def create_dev_token(user_id: str) -> str:
    """Create a signed JWT for local development and testing.

    The token uses the same ``SUPABASE_JWT_SECRET`` so that
    :func:`~app.middleware.auth.verify_jwt` can verify it without any special
    branching.

    Args:
        user_id: The value to store in the ``sub`` claim.

    Returns:
        An encoded JWT string.

    Raises:
        ForbiddenException: If called outside of the development environment.
        UnauthorizedException: If the JWT secret is not configured.
    """
    if settings.ENVIRONMENT != "development":
        raise ForbiddenException("Dev tokens can only be created in the development environment")

    secret = settings.SUPABASE_JWT_SECRET
    if not secret:
        raise UnauthorizedException("JWT secret is not configured")

    now = datetime.now(UTC)
    payload = {
        "sub": user_id,
        "iat": now,
        "exp": now + timedelta(hours=_DEV_TOKEN_LIFETIME_HOURS),
        "iss": "pawlogic-dev",
    }

    from jose import jwt

    return jwt.encode(payload, secret, algorithm=ALGORITHM)
