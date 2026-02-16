from fastapi import APIRouter

from app.config import settings

router = APIRouter()


@router.get("")
async def health() -> dict[str, str]:
    return {"status": "healthy", "version": settings.APP_VERSION}


@router.get("/detailed")
async def health_detailed() -> dict[str, object]:
    # TODO: add real checks for DB connectivity, Redis, Anthropic API, etc.
    return {
        "status": "healthy",
        "version": settings.APP_VERSION,
        "environment": settings.ENVIRONMENT,
        "checks": {
            "database": "not_configured",
            "redis": "not_configured",
            "anthropic": "not_configured",
        },
    }
