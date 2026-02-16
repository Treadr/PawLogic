from fastapi import APIRouter

from app.api.v1.endpoints.health import router as health_router

v1_router = APIRouter()

v1_router.include_router(health_router, prefix="/health", tags=["health"])

# Future routers:
# v1_router.include_router(auth_router, prefix="/auth", tags=["auth"])
# v1_router.include_router(pets_router, prefix="/pets", tags=["pets"])
# v1_router.include_router(abc_logs_router, prefix="/abc-logs", tags=["abc-logs"])
# v1_router.include_router(insights_router, prefix="/insights", tags=["insights"])
# v1_router.include_router(bips_router, prefix="/bips", tags=["bips"])
