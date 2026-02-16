from fastapi import APIRouter

from app.api.v1.endpoints.auth import router as auth_router
from app.api.v1.endpoints.health import router as health_router
from app.api.v1.endpoints.pets import router as pets_router

v1_router = APIRouter()

v1_router.include_router(health_router, prefix="/health", tags=["health"])
v1_router.include_router(auth_router, prefix="/auth", tags=["auth"])
v1_router.include_router(pets_router, prefix="/pets", tags=["pets"])
