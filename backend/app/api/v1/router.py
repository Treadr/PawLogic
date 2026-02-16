from fastapi import APIRouter

from app.api.v1.endpoints.abc_logs import router as abc_logs_router
from app.api.v1.endpoints.analysis import router as analysis_router
from app.api.v1.endpoints.auth import router as auth_router
from app.api.v1.endpoints.health import router as health_router
from app.api.v1.endpoints.insights import router as insights_router
from app.api.v1.endpoints.pets import router as pets_router
from app.api.v1.endpoints.progress import router as progress_router

v1_router = APIRouter()

v1_router.include_router(health_router, prefix="/health", tags=["health"])
v1_router.include_router(auth_router, prefix="/auth", tags=["auth"])
v1_router.include_router(pets_router, prefix="/pets", tags=["pets"])
v1_router.include_router(abc_logs_router, prefix="/abc-logs", tags=["abc-logs"])
v1_router.include_router(insights_router, tags=["insights"])
v1_router.include_router(analysis_router, prefix="/analysis", tags=["analysis"])
v1_router.include_router(progress_router, prefix="/progress", tags=["progress"])
