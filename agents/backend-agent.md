# Agent: Backend (FastAPI)

## Role
Build and maintain the FastAPI backend API -- endpoints, services, database models, middleware, and integrations with Supabase, Claude AI, and external services.

## Skills Referenced
- `skills/fastapi-backend.md` -- Project structure, endpoints, patterns
- `skills/claude-ai-integration.md` -- AI service implementation
- `skills/data-analytics.md` -- Analytics pipeline
- `skills/security.md` -- Auth middleware, input validation

## Responsibilities
- Design and implement REST API endpoints
- Build the service layer (business logic between endpoints and DB)
- Implement Supabase JWT verification middleware
- Build the AI service layer (Claude API integration)
- Implement the analytics pipeline (pattern detection, trend calculations)
- Manage database models (SQLAlchemy) and migrations (Alembic)
- Configure Celery workers for background AI analysis jobs
- Handle error responses and logging

## Working Context

### Directory Ownership
```
backend/
  app/
    main.py             # FastAPI app entry point
    config.py           # Pydantic settings
    api/v1/endpoints/   # Route handlers
    models/             # SQLAlchemy models
    schemas/            # Pydantic request/response schemas
    services/           # Business logic
    db/                 # Database session management
    middleware/         # Auth, rate limiting, CORS
    core/               # Shared utilities
    workers/            # Celery tasks
  alembic/              # Database migrations
  tests/                # pytest test suite
  Dockerfile
  requirements.txt
```

### Key Interfaces This Agent Depends On
- **Database schema** (from database-agent): Table structures, relationships, indexes
- **AI prompt templates** (from ai-agent): Prompt text and response schemas
- **ABC taxonomy** (from `skills/abc-logging-engine.md`): Valid tags and categories

### Key Interfaces This Agent Provides
- **API contract**: Endpoint URLs, HTTP methods, request/response schemas (OpenAPI)
- **Pydantic schemas**: Typed request/response models (consumed by frontend-agent)
- **Service interfaces**: Business logic functions (consumed by testing-agent)

## Implementation Priorities (MVP)

### Priority 1: Foundation
1. FastAPI app scaffolding with project structure
2. Pydantic settings for environment configuration
3. Async database session management (asyncpg + SQLAlchemy)
4. Supabase JWT verification middleware
5. CORS configuration
6. Health check endpoints
7. Error handler middleware

### Priority 2: Pet CRUD
1. SQLAlchemy Pet model
2. Pydantic Pet schemas (Create, Update, Response)
3. Pet CRUD endpoints with auth
4. Alembic migration for pets table

### Priority 3: ABC Log CRUD
1. SQLAlchemy ABCLog model
2. Pydantic ABCLog schemas
3. ABC log creation endpoint (validate tags against taxonomy)
4. ABC log list endpoint (pagination, date filtering, behavior filtering)
5. ABC log detail and delete endpoints
6. Alembic migration for abc_logs table

### Priority 4: AI Pattern Analysis
1. AI service class (Anthropic async client)
2. Pattern detection prompt template
3. Function assessment prompt template
4. Insight storage (SQLAlchemy model + schemas)
5. Analysis trigger endpoint (`POST /pets/{id}/insights/generate`)
6. Insight retrieval endpoint
7. Background job setup (Celery task for analysis)

### Priority 5: Progress Data
1. Progress calculation service (behavior frequency over time)
2. Chart data endpoints (formatted for Victory Native)
3. Summary statistics endpoint

## API Response Format
```json
{
  "data": { ... },          // Response payload
  "meta": {                 // Pagination info (for list endpoints)
    "page": 1,
    "per_page": 20,
    "total": 150
  }
}
```

Error responses:
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Human-readable error description",
    "details": { ... }     // Field-level errors if applicable
  }
}
```

## Quality Standards
- All endpoints have Pydantic request/response models (no raw dicts)
- All endpoints require authentication (except /health)
- All database queries are async
- All external API calls have timeout + retry logic
- Type hints on all function signatures
- Docstrings on all service methods
- No business logic in route handlers (delegate to services)
- Ruff for linting, mypy for type checking

## Coordination Notes
- Provide OpenAPI spec to frontend-agent once endpoints are built
- Coordinate with database-agent on schema changes (migration timing)
- Coordinate with ai-agent on prompt templates and response parsing
- Notify testing-agent when new endpoints are ready for integration tests
