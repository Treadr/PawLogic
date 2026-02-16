# Skill: FastAPI Backend API

## Purpose
Build and maintain the PawLogic backend API using FastAPI (Python), providing async endpoints for the mobile app, AI integration, and data analytics pipeline.

## Tech Context
- **Framework:** FastAPI 0.115+
- **Python:** 3.12+
- **ORM:** SQLAlchemy 2.0 (async) + Alembic for migrations
- **Validation:** Pydantic v2 models
- **Auth:** Supabase JWT verification middleware
- **Task Queue:** Celery + Redis (for async AI analysis jobs)
- **API Docs:** Auto-generated OpenAPI/Swagger via FastAPI

## Project Structure
```
backend/
  app/
    __init__.py
    main.py                  # FastAPI app entry, CORS, middleware
    config.py                # Settings via pydantic-settings
    dependencies.py          # Shared dependency injection
    api/
      __init__.py
      v1/
        __init__.py
        router.py            # Aggregated v1 router
        endpoints/
          auth.py            # Auth verification endpoints
          pets.py            # Pet CRUD
          abc_logs.py        # ABC behavior log CRUD
          insights.py        # AI-generated insights
          bips.py            # Behavior Intervention Plans
          progress.py        # Progress tracking data
          vet_reports.py     # Vet report generation
          households.py      # Multi-pet household management
    models/
      __init__.py
      user.py
      pet.py
      abc_log.py
      insight.py
      bip.py
      household.py
      interaction.py
    schemas/
      __init__.py
      pet.py                 # Pydantic request/response models
      abc_log.py
      insight.py
      bip.py
      household.py
    services/
      __init__.py
      abc_analyzer.py        # ABC pattern detection logic
      ai_service.py          # Claude API integration
      function_assessor.py   # Behavior function identification
      bip_generator.py       # BIP generation service
      analytics_service.py   # Data analytics pipeline
      vet_report_service.py  # Report generation
    db/
      __init__.py
      session.py             # Async session factory
      base.py                # SQLAlchemy Base
    middleware/
      __init__.py
      auth.py                # Supabase JWT middleware
      rate_limit.py          # Rate limiting
    core/
      __init__.py
      security.py            # Auth utilities
      exceptions.py          # Custom exception handlers
    workers/
      __init__.py
      celery_app.py          # Celery configuration
      tasks.py               # Background analysis tasks
  alembic/
    versions/                # Migration files
    env.py
  tests/
    __init__.py
    conftest.py              # Fixtures (test DB, client, auth mocks)
    test_abc_logs.py
    test_insights.py
    test_pets.py
    test_auth.py
  requirements.txt
  requirements-dev.txt
  Dockerfile
  docker-compose.yml
```

## Core API Endpoints (MVP)

### Authentication
- `POST /api/v1/auth/verify` -- Verify Supabase JWT, create/sync user record

### Pets
- `POST /api/v1/pets` -- Create pet profile
- `GET /api/v1/pets` -- List user's pets
- `GET /api/v1/pets/{pet_id}` -- Get pet detail
- `PUT /api/v1/pets/{pet_id}` -- Update pet profile
- `DELETE /api/v1/pets/{pet_id}` -- Remove pet

### ABC Logs
- `POST /api/v1/pets/{pet_id}/abc-logs` -- Create ABC log entry
- `GET /api/v1/pets/{pet_id}/abc-logs` -- List logs (paginated, filterable)
- `GET /api/v1/pets/{pet_id}/abc-logs/{log_id}` -- Get log detail
- `DELETE /api/v1/pets/{pet_id}/abc-logs/{log_id}` -- Delete log

### Insights
- `GET /api/v1/pets/{pet_id}/insights` -- Get AI-generated insights
- `POST /api/v1/pets/{pet_id}/insights/generate` -- Trigger new analysis

### Progress
- `GET /api/v1/pets/{pet_id}/progress` -- Get behavior frequency data for charts
- `GET /api/v1/pets/{pet_id}/progress/summary` -- Get progress summary

## Commands Reference
```bash
# Development
uvicorn app.main:app --reload --port 8000
# or
fastapi dev app/main.py

# Database migrations
alembic revision --autogenerate -m "description"
alembic upgrade head
alembic downgrade -1

# Testing
pytest tests/ -v
pytest tests/ -v --cov=app --cov-report=html
pytest tests/test_abc_logs.py -v -k "test_create"

# Linting
ruff check app/
ruff format app/
mypy app/

# Docker
docker-compose up -d
docker-compose logs -f api
```

## Key Dependencies
```
fastapi>=0.115.0
uvicorn[standard]>=0.30.0
sqlalchemy[asyncio]>=2.0.0
asyncpg>=0.30.0
alembic>=1.14.0
pydantic>=2.10.0
pydantic-settings>=2.7.0
python-jose[cryptography]>=3.3.0
httpx>=0.28.0
anthropic>=0.43.0
celery>=5.4.0
redis>=5.2.0
pandas>=2.2.0
numpy>=2.1.0
```

## Design Patterns
- **Repository pattern** for database access (services don't touch SQLAlchemy directly)
- **Dependency injection** via FastAPI's `Depends()` for auth, DB sessions, services
- **Service layer** between endpoints and repositories for business logic
- **Pydantic schemas** separate from SQLAlchemy models (never expose ORM models to API)
- **Async everywhere** -- use `async def` for all endpoints, async DB sessions

## Environment Variables
```env
DATABASE_URL=postgresql+asyncpg://PawLogic_DB:PPaaPA55!!word@localhost:5433/PawLogic
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_JWT_SECRET=your-jwt-secret
SUPABASE_SERVICE_KEY=your-service-key
ANTHROPIC_API_KEY=sk-ant-xxx
REDIS_URL=redis://localhost:6379/0
ENVIRONMENT=development
LOG_LEVEL=INFO
CORS_ORIGINS=["http://localhost:8081"]
```

## Error Handling
- Use FastAPI exception handlers for consistent error responses
- Return RFC 7807 problem detail format for API errors
- Log all 5xx errors with full traceback
- Never expose internal error details to clients in production

## Rate Limiting
- Free tier: 100 API calls/hour
- Premium: 1000 API calls/hour
- AI insight generation: 10 per day (free), unlimited (premium)
