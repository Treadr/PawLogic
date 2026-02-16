from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.router import v1_router
from app.config import settings
from app.core.exceptions import register_exception_handlers
from app.core.middleware import RequestLoggingMiddleware


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None]:
    # Startup: initialize DB pool, cache connections, etc.
    yield
    # Shutdown: close DB pool, flush caches, etc.


app = FastAPI(
    title="PawLogic API",
    description=(
        "AI-augmented pet behavior analysis grounded in Applied Behavior Analysis (ABA) methodology.\n\n"
        "## Core Concepts\n\n"
        "- **ABC Logging:** Record Antecedent-Behavior-Consequence incidents for your pets\n"
        "- **Pattern Detection:** AI identifies behavioral patterns after 10+ logged incidents\n"
        "- **Insights:** Actionable findings about your pet's behavior functions\n"
        "- **Progress Tracking:** Visualize behavior frequency, severity trends, and more\n\n"
        "## Authentication\n\n"
        "All endpoints (except health and taxonomy) require a Bearer token in the Authorization header.\n"
        "In development mode, use `POST /api/v1/auth/dev-token` to generate a token."
    ),
    version=settings.APP_VERSION,
    lifespan=lifespan,
    openapi_tags=[
        {"name": "health", "description": "Service health checks"},
        {"name": "auth", "description": "Authentication and token management"},
        {"name": "pets", "description": "Pet profile CRUD operations"},
        {"name": "abc-logs", "description": "ABC (Antecedent-Behavior-Consequence) behavior logging"},
        {"name": "analysis", "description": "AI-powered behavior pattern detection"},
        {"name": "insights", "description": "AI-generated behavioral insights and recommendations"},
        {"name": "progress", "description": "Progress tracking, charts, and dashboard data"},
    ],
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Middleware (order matters: last added = first executed)
app.add_middleware(RequestLoggingMiddleware)

# Exception handlers
register_exception_handlers(app)

# Routers
app.include_router(v1_router, prefix="/api/v1")


@app.get("/health")
async def health_check() -> dict[str, str]:
    return {"status": "healthy", "version": settings.APP_VERSION}
