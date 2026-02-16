# PawLogic System Architecture

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     WEB FRONTEND (port 3000)                    │
│                  React 19 + Vite 7 + TypeScript                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────┐   │
│  │ Auth Flow│  │ABC Wizard│  │Dashboard │  │Progress Page │   │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └──────┬───────┘   │
│       └──────────────┴─────────────┴───────────────┘           │
│              API service layer (fetch + /api proxy)             │
└────────────────────────────┬────────────────────────────────────┘
                             │ nginx proxies /api → backend
┌────────────────────────────┼────────────────────────────────────┐
│                     MOBILE APP (Expo)                           │
│                  React Native + TypeScript                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────┐   │
│  │ Auth Flow│  │ABC Logger│  │Dashboard │  │Progress View │   │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └──────┬───────┘   │
│       └──────────────┴─────────────┴───────────────┘           │
│              Typed service layer (fetch)                        │
└────────────────────────────┬────────────────────────────────────┘
                             │ HTTPS
                             ▼
┌───────────────────────────────────────────────────────────────────┐
│                     BACKEND API (port 8000)                       │
│                  FastAPI + Python 3.12 + async                    │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                    Middleware Layer                           │ │
│  │     JWT Auth  │  Request Logging  │  CORS  │  Error Handler │ │
│  └──────────┬──────────────────────────────────────────────────┘ │
│             │                                                     │
│  ┌──────────▼──────────────────────────────────────────────────┐ │
│  │                    API Router (v1)                            │ │
│  │  /auth  /pets  /abc-logs  /insights  /progress  /analysis   │ │
│  │  /health  /coaching                                          │ │
│  └──────────┬──────────────────────────────────────────────────┘ │
│             │                                                     │
│  ┌──────────▼──────────────────────────────────────────────────┐ │
│  │                    Service Layer                              │ │
│  │  ┌────────────────┐  ┌────────────┐  ┌──────────────────┐  │ │
│  │  │Pattern Detector│  │AI Coaching │  │Progress Stats    │  │ │
│  │  │(rule-based)    │  │(Claude API)│  │(SQL aggregation) │  │ │
│  │  └────────────────┘  └─────┬──────┘  └──────────────────┘  │ │
│  └─────────────────────────────┼───────────────────────────────┘ │
│             │                   │                                  │
│  ┌──────────▼───────┐          │     ┌─────────────────────────┐ │
│  │  SQLAlchemy ORM  │          │     │  Celery Workers         │ │
│  │  (async 2.0)     │          │     │  (background analysis)  │ │
│  └──────────┬───────┘          │     └─────────────┬───────────┘ │
└─────────────┼──────────────────┼───────────────────┼─────────────┘
              │                  │                   │
              ▼                  ▼                   ▼
┌─────────────────────┐ ┌────────────┐  ┌──────────────┐
│  PostgreSQL 17      │ │ Anthropic  │  │ Redis 7      │
│                     │ │ Claude API │  │              │
│  - users            │ │            │  │ - Task queue │
│  - pets             │ │ - Coaching │  │ - Celery     │
│  - abc_logs         │ │   (Haiku)  │  │   broker     │
│  - insights         │ │            │  │              │
└─────────────────────┘ └────────────┘  └──────────────┘
```

## Docker Compose Services

```
┌─────────────────────────────────────────────────────────────┐
│                    docker-compose.yml                        │
│                                                             │
│  ┌───────────┐  ┌───────────┐  ┌───────────┐              │
│  │ db        │  │ redis     │  │ api       │              │
│  │ :5433     │  │ :6379     │  │ :8000     │              │
│  │ postgres  │  │ redis 7   │  │ FastAPI   │              │
│  │ 17-alpine │  │ alpine    │  │ + uvicorn │              │
│  └─────┬─────┘  └─────┬─────┘  └─────┬─────┘              │
│        │               │              │                     │
│        │               │    ┌─────────┴─────────┐          │
│        │               │    │ worker            │          │
│        │               │    │ Celery            │          │
│        │               │    └───────────────────┘          │
│        │               │                                    │
│  ┌─────┴───────────────┴────────────────────────┐          │
│  │ frontend                                      │          │
│  │ :3000  nginx (serves built React app)         │          │
│  │ proxies /api/* → api:8000                     │          │
│  └───────────────────────────────────────────────┘          │
└─────────────────────────────────────────────────────────────┘
```

## Data Flow: ABC Log → Insight

```
User taps "Log Incident"
        │
        ▼
┌─────────────────┐
│ ABC Logging Flow│  Mobile (4-step wizard) or Web (multi-step form)
│ A → B → C → ✓  │
└────────┬────────┘
         │ POST /api/v1/pets/{id}/abc-logs
         ▼
┌─────────────────┐
│ API Endpoint    │  Validates taxonomy, stores in DB
└────────┬────────┘
         │
         ├──────────────────────────────┐
         ▼                              ▼
┌─────────────────┐          ┌─────────────────────┐
│ PostgreSQL      │          │ Check log count     │
│ (store log)     │          │ (>= 10 logs?)       │
└─────────────────┘          └────────┬────────────┘
                                      │ Yes
                                      ▼
                             ┌─────────────────────┐
                             │ Pattern Detection    │
                             │ (rule-based engine)  │
                             └────────┬────────────┘
                                      │
                          ┌───────────┴───────────┐
                          ▼                       ▼
                 ┌─────────────────┐    ┌─────────────────┐
                 │ A-B Pair Freq  │    │ Severity Trends  │
                 │ B-C Correlation│    │ Function Assess  │
                 └─────────────────┘    └────────┬────────┘
                                                 │
                                                 ▼
                                        ┌─────────────────┐
                                        │ Store Insights   │
                                        │ in PostgreSQL    │
                                        └────────┬────────┘
                                                 │
                                                 ▼
                                        ┌─────────────────┐
                                        │ User sees insight│
                                        │ on Dashboard     │
                                        └─────────────────┘
```

## Authentication Flow (Current: Dev JWT)

```
┌─────────┐                           ┌──────────────┐
│ Client  │                           │ FastAPI      │
│ (Web/   │                           │ Backend      │
│  Mobile)│                           └──────┬───────┘
└────┬────┘                                  │
     │                                       │
     │  POST /api/v1/auth/verify             │
     │  Authorization: Bearer <dev-token>    │
     │──────────────────────────────────────>│
     │                                       │
     │                      Decode JWT       │
     │                      Extract user_id  │
     │                      ensure_db_user() │
     │                      (auto-provision) │
     │                                       │
     │  {"user_id": "...", "email": "..."}  │
     │<──────────────────────────────────────│
```

## Project Directory Structure

```
PawLogic/
├── CLAUDE.md                        # Project spec & conventions
├── docker-compose.yml               # Full-stack local deployment
├── docs/                            # Documentation
│   ├── architecture.md              # This file
│   ├── api-spec.md                  # API endpoint reference
│   ├── database-schema.md           # ERD and table definitions
│   ├── progress-tracker.md          # What's built + next steps
│   ├── environment-setup.md         # Dev environment setup guide
│   ├── deployment-guide.md          # Deployment procedures
│   ├── development-workflow.md      # Git workflow + conventions
│   ├── testing-strategy.md          # Testing approach
│   └── debugging-playbook.md        # Common issue resolution
├── .github/workflows/
│   ├── backend-ci.yml               # Ruff lint + pytest (path: backend/**)
│   ├── mobile-ci.yml                # TypeScript check (path: mobile/**)
│   └── frontend-ci.yml             # ESLint + Vite build (path: frontend/**)
│
├── backend/                         # FastAPI backend
│   ├── app/
│   │   ├── api/v1/endpoints/        # auth, pets, abc_logs, insights, progress,
│   │   │                            #   analysis, coaching, health
│   │   ├── models/                  # SQLAlchemy models (user, pet, abc_log, insight)
│   │   ├── schemas/                 # Pydantic request/response schemas
│   │   ├── services/                # pattern_detection, coaching_service
│   │   ├── middleware/              # request_logging
│   │   ├── core/                    # security, taxonomy, exceptions, config
│   │   ├── db/                      # session, base
│   │   ├── workers/                 # Celery tasks (analyze_patterns)
│   │   ├── main.py                  # FastAPI app factory
│   │   └── config.py               # Pydantic Settings
│   ├── alembic/                     # Database migrations
│   ├── tests/                       # pytest test suite (~30 tests)
│   ├── scripts/                     # seed_data.py
│   ├── Dockerfile                   # API container
│   ├── Dockerfile.worker            # Celery worker container
│   ├── entrypoint.sh                # Runs migrations on startup
│   ├── requirements.txt             # Production dependencies
│   ├── requirements-dev.txt         # Dev/test dependencies
│   ├── .env                         # Local environment (gitignored)
│   └── .env.example                 # Template with documentation
│
├── frontend/                        # React web frontend
│   ├── src/
│   │   ├── pages/                   # 13 pages (Login, Dashboard, ABC*, Pet*, etc.)
│   │   ├── components/              # ChipSelector, ErrorBanner, Layout, etc.
│   │   ├── context/                 # AuthContext, PetContext
│   │   ├── services/                # API client (pets, abcLogs, insights, etc.)
│   │   ├── hooks/                   # Custom React hooks
│   │   ├── types/                   # TypeScript type definitions
│   │   ├── App.tsx                  # Router + layout
│   │   └── main.tsx                 # Entry point
│   ├── Dockerfile                   # Multi-stage: Node build → nginx serve
│   ├── nginx.conf                   # SPA routing + /api proxy
│   ├── vite.config.ts               # Port 3000, API proxy, chunk splitting
│   ├── eslint.config.js             # Flat config with TS + React plugins
│   └── tsconfig.json                # Strict TypeScript
│
├── mobile/                          # React Native (Expo) app
│   ├── src/
│   │   ├── screens/                 # 14 screens across auth, home, pets, abc, etc.
│   │   ├── components/              # ErrorBoundary, ErrorBanner, ChipSelector, etc.
│   │   ├── navigation/              # AppNavigator (stack-based)
│   │   ├── services/                # Typed API client layer
│   │   ├── hooks/                   # useApiCall, useFocusRefresh
│   │   ├── constants/               # Brand colors, typography
│   │   └── types/                   # TypeScript interfaces
│   ├── App.tsx                      # Root with ErrorBoundary
│   └── app.json                     # Expo config
│
├── skills/                          # Agent skill definitions (13 files)
└── agents/                          # Agent role definitions (10 files)
```

## Technology Stack (Implemented)

| Layer | Technology | Version | Notes |
|-------|-----------|---------|-------|
| Web Frontend | React + Vite | 19.2 / 7.3 | TypeScript, Recharts, React Router |
| Mobile App | React Native (Expo) | SDK 54 | TypeScript, React Navigation |
| Backend API | FastAPI | Latest | async SQLAlchemy 2.0 + asyncpg |
| Database | PostgreSQL | 17 (Alpine) | Docker, port 5433 |
| AI | Anthropic Claude | Haiku | Coaching; pattern detection is rule-based |
| Task Queue | Celery + Redis | 7 (Alpine) | Background analysis jobs |
| Frontend Serve | nginx | Alpine | SPA routing + API reverse proxy |
| CI | GitHub Actions | -- | 3 workflows, path-filtered |

## Key Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Pattern detection | Rule-based (not AI) | Deterministic, fast, no API cost; AI reserved for coaching |
| Auth | Dev JWT tokens | MVP simplicity; production will use Supabase Auth or similar |
| Frontend serving | nginx reverse proxy | Single entry point; /api proxied to backend transparently |
| Database | Single migration | All core tables in one migration for MVP simplicity |
| Charts (web) | Recharts | React-native web lib; good for web dashboards |
| Charts (mobile) | Custom components | Lightweight; Victory Native planned for Phase 2 |
| Docker networking | Service name overrides | .env stays localhost for local dev; docker-compose overrides for containers |
