"""Authentication endpoints.

- ``POST /auth/verify``    -- Verify a JWT and return user info.
- ``POST /auth/dev-token`` -- (development only) Mint a JWT for testing.
"""

from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field

from app.config import settings
from app.core.exceptions import ForbiddenException
from app.core.security import create_dev_token, get_current_user

router = APIRouter()


# ---------------------------------------------------------------------------
# Request / Response schemas
# ---------------------------------------------------------------------------

class DevTokenRequest(BaseModel):
    """Body for the dev-token endpoint."""

    user_id: str = Field(
        ...,
        min_length=1,
        max_length=255,
        description="Arbitrary user ID to embed in the token's 'sub' claim.",
        examples=["test-user-id"],
    )


class DevTokenResponse(BaseModel):
    """Response from the dev-token endpoint."""

    token: str
    user_id: str


class VerifyResponse(BaseModel):
    """Response from the verify endpoint."""

    user_id: str
    message: str


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------

@router.post("/verify", response_model=VerifyResponse)
async def verify_token(user_id: str = Depends(get_current_user)) -> VerifyResponse:
    """Verify the caller's JWT and return basic user info.

    In production this would sync with Supabase user data; for the MVP it
    simply confirms the token is valid and returns the user ID from the
    ``sub`` claim.
    """
    return VerifyResponse(
        user_id=user_id,
        message="Token is valid",
    )


@router.post("/dev-token", response_model=DevTokenResponse)
async def generate_dev_token(body: DevTokenRequest) -> DevTokenResponse:
    """Generate a signed JWT for local development and testing.

    This endpoint is **only available** when ``ENVIRONMENT=development``.
    It creates a short-lived token that the same verification pipeline can
    validate, so you can test authenticated endpoints without standing up
    Supabase.
    """
    if settings.ENVIRONMENT != "development":
        raise ForbiddenException(
            "This endpoint is only available in the development environment"
        )

    token = create_dev_token(body.user_id)
    return DevTokenResponse(token=token, user_id=body.user_id)
