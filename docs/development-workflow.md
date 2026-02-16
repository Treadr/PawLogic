# PawLogic Development Workflow

## Git Strategy

### Current Approach (MVP)
All work is committed directly to `main` during rapid MVP development. Once the team grows or the app is in production, switch to the branching model below.

### Branch Structure (Post-MVP)
```
main                    # Production-ready code. Protected branch.
├── feature/abc-logging-flow    # Feature branches
├── feature/multi-pet-support
├── fix/auth-token-refresh
└── chore/update-dependencies
```

### Commit Message Format
```
<type>: <short description>

<optional body explaining why>

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
```

**Types:** `feat`, `fix`, `chore`, `docs`, `refactor`, `test`, `style`

## CI/CD Pipeline

Three GitHub Actions workflows, each path-filtered to only run when relevant files change:

| Workflow | Trigger | Jobs |
|----------|---------|------|
| `backend-ci.yml` | `backend/**` changes | Ruff lint + format, pytest with DB/Redis |
| `mobile-ci.yml` | `mobile/**` changes | TypeScript check (`tsc --noEmit`) |
| `frontend-ci.yml` | `frontend/**` changes | ESLint, TypeScript + Vite build |

### Running CI Checks Locally

```bash
# Backend
cd backend
ruff check app/              # Lint
ruff format --check app/     # Format check
pytest tests/ -v --tb=short  # Tests (requires DB + Redis)

# Frontend
cd frontend
npm run lint                 # ESLint
npm run build               # TypeScript + Vite build

# Mobile
cd mobile
npx tsc --noEmit            # TypeScript check
```

## Development Setup

### Quick Start (Docker)
```bash
docker compose up -d
# API: http://localhost:8000  |  Web: http://localhost:3000
```

### Local Development (Hot-Reload)
```bash
# Infrastructure
docker compose up -d db redis

# Backend (Terminal 1)
cd backend && source venv/bin/activate && uvicorn app.main:app --reload --port 8000

# Frontend (Terminal 2)
cd frontend && npm run dev

# Mobile (Terminal 3)
cd mobile && npx expo start
```

## Project Conventions

### Backend (Python)
- **Linter:** Ruff (B008 excluded for FastAPI Depends pattern)
- **ORM:** SQLAlchemy 2.0 async with asyncpg
- **Schemas:** Pydantic v2 for request/response validation
- **Tests:** pytest + pytest-asyncio + httpx (async test client)
- **Migrations:** Alembic (auto-run on Docker startup via entrypoint.sh)
- **Excluded from lint:** `alembic/` directory

### Frontend (React/TypeScript)
- **Build:** Vite 7 with React plugin
- **Lint:** ESLint 9 (flat config) with TypeScript + React Hooks plugins
- **Charts:** Recharts
- **Routing:** React Router v7
- **State:** React Context (AuthContext, PetContext)
- **API:** Service layer with typed fetch wrappers

### Mobile (React Native/Expo)
- **SDK:** Expo 54
- **Navigation:** React Navigation (stack-based)
- **State:** React Context + custom hooks
- **API:** Typed service layer matching frontend pattern
- **Brand:** Teal (#0D9E85) primary, coral (#FF7759) accent

### Database
- **TIMESTAMP WITHOUT TIME ZONE** -- always strip tzinfo before insert
- **UUID primary keys** on all tables
- **Ownership validation** via user_id FK on all user-facing tables
- **ensure_db_user** dependency auto-provisions users on first API call

### API Design
- All endpoints under `/api/v1/`
- JWT auth required on all endpoints except `/health`
- Pet ownership verified before any pet-scoped operation
- ABC taxonomy validated against `core/taxonomy.py` categories
- Responses return model objects directly (FastAPI serialization)
