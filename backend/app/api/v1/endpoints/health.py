import redis.asyncio as aioredis
from fastapi import APIRouter
from sqlalchemy import text

from app.config import settings
from app.db.session import async_session_factory

router = APIRouter()


@router.get("")
async def health() -> dict[str, str]:
    return {"status": "healthy", "version": settings.APP_VERSION}


@router.get("/detailed")
async def health_detailed() -> dict[str, object]:
    checks: dict[str, str] = {}

    # PostgreSQL check
    try:
        async with async_session_factory() as session:
            await session.execute(text("SELECT 1"))
        checks["database"] = "healthy"
    except Exception as exc:
        checks["database"] = f"unhealthy: {exc}"

    # Redis check
    try:
        r = aioredis.from_url(settings.REDIS_URL, decode_responses=True)
        await r.ping()
        await r.aclose()
        checks["redis"] = "healthy"
    except Exception as exc:
        checks["redis"] = f"unhealthy: {exc}"

    # Anthropic key configured check
    checks["anthropic"] = (
        "configured" if settings.ANTHROPIC_API_KEY else "not_configured"
    )

    overall = "healthy" if all(
        v in ("healthy", "configured", "not_configured")
        for v in checks.values()
    ) else "degraded"

    return {
        "status": overall,
        "version": settings.APP_VERSION,
        "environment": settings.ENVIRONMENT,
        "checks": checks,
    }
