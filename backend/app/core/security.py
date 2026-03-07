"""Security utilities and FastAPI dependencies for authentication.

Provides:
- ``get_jwt_payload`` -- FastAPI dependency that extracts and verifies the
  Bearer token, returning the full JWT payload.
- ``get_current_user`` -- FastAPI dependency that returns the user ID from
  the verified JWT.
- ``ensure_db_user`` -- FastAPI dependency that auto-provisions a user row
  on first request, using email from Supabase JWT claims when available.
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
from app.middleware.auth import ALGORITHM_HS256, verify_jwt

# Reusable scheme -- auto_error=False so we can provide our own message.
_bearer_scheme = HTTPBearer(auto_error=False)

# Dev tokens are valid for 24 hours by default.
_DEV_TOKEN_LIFETIME_HOURS = 24


async def get_jwt_payload(
    credentials: HTTPAuthorizationCredentials | None = Depends(_bearer_scheme),
) -> dict:
    """FastAPI dependency that returns the full verified JWT payload.

    Extracts the Bearer token from the ``Authorization`` header and verifies
    it via :func:`~app.middleware.auth.verify_jwt`.  The result is cached
    per-request by FastAPI's dependency injection so downstream dependencies
    that also depend on this won't decode the token twice.

    Raises:
        UnauthorizedException: If no token is provided or verification fails.
    """
    if credentials is None:
        raise UnauthorizedException("Authorization header is missing")
    return verify_jwt(credentials.credentials)


async def get_current_user(
    payload: dict = Depends(get_jwt_payload),
) -> str:
    """FastAPI dependency that returns the authenticated user's ID.

    Reads the ``sub`` claim from the already-verified JWT payload.

    Raises:
        UnauthorizedException: If the payload is missing the user ID.
    """
    user_id: str | None = payload.get("sub")
    if not user_id:
        raise UnauthorizedException("Token payload is missing user ID")
    return user_id


async def ensure_db_user(
    user_id: str = Depends(get_current_user),
    payload: dict = Depends(get_jwt_payload),
    db: AsyncSession = Depends(get_db),
) -> str:
    """Ensure the authenticated user has a record in the users table.

    Auto-provisions a minimal user row on first request (get-or-create).
    When the JWT comes from Supabase Auth the ``email`` claim is used;
    otherwise falls back to a placeholder address.

    Returns the user_id string for use by downstream endpoints.
    """
    from app.models.user import User

    uid = uuid.UUID(user_id)
    result = await db.execute(select(User).where(User.id == uid))
    if result.scalar_one_or_none() is None:
        email = payload.get("email") or f"{user_id}@pawlogic.dev"
        user = User(id=uid, email=email)
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

    return jwt.encode(payload, secret, algorithm=ALGORITHM_HS256)
