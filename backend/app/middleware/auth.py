"""JWT verification middleware for Supabase and development tokens.

Supports dual auth:
- Supabase (ES256): Verifies using the project JWKS public key.
- Development (HS256): Verifies locally-created JWTs using SUPABASE_JWT_SECRET.
"""

import logging

import httpx
from jose import ExpiredSignatureError, JWTError, jwt

from app.config import settings
from app.core.exceptions import UnauthorizedException

logger = logging.getLogger(__name__)

ALGORITHM_HS256 = "HS256"
ALGORITHM_ES256 = "ES256"

# Cached JWKS key for ES256 verification.
_jwks_cache: dict | None = None


def _get_jwks_key() -> dict:
    """Fetch and cache the first signing key from the Supabase JWKS endpoint."""
    global _jwks_cache  # noqa: PLW0603
    if _jwks_cache is not None:
        return _jwks_cache

    jwks_url = f"{settings.SUPABASE_URL}/auth/v1/.well-known/jwks.json"
    try:
        resp = httpx.get(jwks_url, timeout=10)
        resp.raise_for_status()
        keys = resp.json().get("keys", [])
        if not keys:
            raise UnauthorizedException("No keys found in Supabase JWKS")
        _jwks_cache = keys[0]
        return _jwks_cache
    except httpx.HTTPError as exc:
        logger.error("Failed to fetch JWKS from %s: %s", jwks_url, exc)
        raise UnauthorizedException("Unable to fetch signing keys") from exc


def verify_jwt(token: str) -> dict:
    """Decode and verify a JWT token.

    Peeks at the token header to determine the algorithm:
    - ES256: Verifies with the Supabase JWKS public key.
    - HS256: Verifies with the configured JWT secret (dev tokens).

    Args:
        token: The raw JWT string (without the "Bearer " prefix).

    Returns:
        The decoded payload dictionary. Guaranteed to contain "sub" (user ID).

    Raises:
        UnauthorizedException: If the token is expired, malformed, or missing
            required claims.
    """
    try:
        header = jwt.get_unverified_header(token)
    except JWTError as exc:
        raise UnauthorizedException("Invalid or malformed token") from exc

    alg = header.get("alg")

    try:
        if alg == ALGORITHM_ES256:
            key = _get_jwks_key()
            payload: dict = jwt.decode(
                token,
                key,
                algorithms=[ALGORITHM_ES256],
                audience="authenticated",
                options={"require_sub": True},
            )
        elif alg == ALGORITHM_HS256:
            secret = settings.SUPABASE_JWT_SECRET
            if not secret:
                raise UnauthorizedException("JWT secret is not configured")
            payload = jwt.decode(
                token,
                secret,
                algorithms=[ALGORITHM_HS256],
                options={"require_sub": True},
            )
        else:
            raise UnauthorizedException(f"Unsupported token algorithm: {alg}")
    except ExpiredSignatureError as exc:
        raise UnauthorizedException("Token has expired") from exc
    except JWTError as exc:
        logger.error("JWT verification failed (alg=%s): %s", alg, exc)
        raise UnauthorizedException("Invalid or malformed token") from exc

    if not payload.get("sub"):
        raise UnauthorizedException("Token is missing required 'sub' claim")

    return payload
