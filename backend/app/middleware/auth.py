"""JWT verification middleware for Supabase and development tokens.

Supports dual auth:
- Production: Verifies Supabase-issued JWTs using SUPABASE_JWT_SECRET.
- Development: Verifies locally-created JWTs (same secret, same flow).
"""

from jose import ExpiredSignatureError, JWTError, jwt

from app.config import settings
from app.core.exceptions import UnauthorizedException

ALGORITHM = "HS256"


def verify_jwt(token: str) -> dict:
    """Decode and verify a JWT token.

    Args:
        token: The raw JWT string (without the "Bearer " prefix).

    Returns:
        The decoded payload dictionary. Guaranteed to contain "sub" (user ID).

    Raises:
        UnauthorizedException: If the token is expired, malformed, or missing
            required claims.
    """
    secret = settings.SUPABASE_JWT_SECRET
    if not secret:
        raise UnauthorizedException("JWT secret is not configured")

    try:
        payload: dict = jwt.decode(
            token,
            secret,
            algorithms=[ALGORITHM],
            options={"require_sub": True},
        )
    except ExpiredSignatureError:
        raise UnauthorizedException("Token has expired")
    except JWTError:
        raise UnauthorizedException("Invalid or malformed token")

    if not payload.get("sub"):
        raise UnauthorizedException("Token is missing required 'sub' claim")

    return payload
