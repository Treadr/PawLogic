# PawLogic System Architecture

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        MOBILE APP                                │
│                    React Native (Expo)                            │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────┐    │
│  │ Auth Flow│  │ABC Logger│  │Dashboard │  │Progress View │    │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └──────┬───────┘    │
│       │              │              │               │            │
│  ┌────┴──────────────┴──────────────┴───────────────┴────────┐  │
│  │                    API Client (httpx)                       │  │
│  │            + Supabase Client (auth, storage)               │  │
│  └────────────────────────┬──────────────────────────────────┘  │
└───────────────────────────┼──────────────────────────────────────┘
                            │ HTTPS
                            ▼
┌───────────────────────────────────────────────────────────────────┐
│                        BACKEND API                                 │
│                     FastAPI (Python 3.12+)                         │
│                                                                    │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │                    Middleware Layer                           │  │
│  │     JWT Auth  │  Rate Limiting  │  CORS  │  Error Handler   │  │
│  └──────────┬──────────────────────────────────────────────────┘  │
│             │                                                      │
│  ┌──────────▼──────────────────────────────────────────────────┐  │
│  │                    API Router (v1)                            │  │
│  │  /auth  /pets  /abc-logs  /insights  /progress  /households │  │
│  └──────────┬──────────────────────────────────────────────────┘  │
│             │                                                      │
│  ┌──────────▼──────────────────────────────────────────────────┐  │
│  │                    Service Layer                              │  │
│  │  ┌────────────┐  ┌────────────┐  ┌──────────────────────┐  │  │
│  │  │ABC Analyzer│  │AI Service  │  │Analytics Service     │  │  │
│  │  │            │  │(Claude API)│  │(Pandas/NumPy)        │  │  │
│  │  └────────────┘  └─────┬──────┘  └──────────────────────┘  │  │
│  └─────────────────────────┼───────────────────────────────────┘  │
│             │               │                                      │
│  ┌──────────▼───────┐      │     ┌─────────────────────────────┐  │
│  │  SQLAlchemy ORM  │      │     │  Celery Workers             │  │
│  │  (async)         │      │     │  (background AI analysis)   │  │
│  └──────────┬───────┘      │     └─────────────┬───────────────┘  │
└─────────────┼──────────────┼───────────────────┼──────────────────┘
              │              │                   │
              ▼              ▼                   ▼
┌─────────────────────┐ ┌────────────┐  ┌──────────────┐
│  PostgreSQL          │ │ Anthropic  │  │ Redis        │
│  (Supabase)          │ │ Claude API │  │ (task queue) │
│                      │ │            │  │              │
│  - Users             │ │ - Patterns │  │ - Job queue  │
│  - Pets              │ │ - Functions│  │ - Cache      │
│  - ABC Logs          │ │ - BIPs     │  │ - Rate limit │
│  - Insights          │ │ - Reports  │  │              │
│  - BIPs              │ │            │  │              │
│  - Households        │ │            │  │              │
└─────────────────────┘ └────────────┘  └──────────────┘
```

## Data Flow: ABC Log → Insight

```
User taps "Log Incident"
        │
        ▼
┌─────────────────┐
│ ABC Logging Flow│  Mobile (3-step guided flow)
│ A → B → C       │
└────────┬────────┘
         │ POST /api/v1/pets/{id}/abc-logs
         ▼
┌─────────────────┐
│ API Endpoint    │  Validates input, stores in DB
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
                             │ Celery Background    │
                             │ Job: Analyze         │
                             └────────┬────────────┘
                                      │
                          ┌───────────┴───────────┐
                          ▼                       ▼
                 ┌─────────────────┐    ┌─────────────────┐
                 │ Analytics       │    │ AI Service       │
                 │ (Pandas)        │    │ (Claude API)     │
                 │                 │    │                  │
                 │ - Pair freq     │───>│ - Pattern prompt │
                 │ - Trends        │    │ - Function ID    │
                 │ - Temporal      │    │ - Plain English  │
                 └─────────────────┘    └────────┬────────┘
                                                 │
                                                 ▼
                                        ┌─────────────────┐
                                        │ Store Insight    │
                                        │ in PostgreSQL    │
                                        └────────┬────────┘
                                                 │
                                                 ▼
                                        ┌─────────────────┐
                                        │ Push Notification│
                                        │ "New insight!"   │
                                        └────────┬────────┘
                                                 │
                                                 ▼
                                        ┌─────────────────┐
                                        │ User sees insight│
                                        │ on Dashboard     │
                                        └─────────────────┘
```

## Authentication Flow

```
┌─────────┐     ┌──────────────┐     ┌──────────────┐
│ Mobile  │     │ Supabase Auth│     │ FastAPI      │
│ App     │     │              │     │ Backend      │
└────┬────┘     └──────┬───────┘     └──────┬───────┘
     │                 │                     │
     │  signUp(email)  │                     │
     │────────────────>│                     │
     │                 │                     │
     │  JWT + refresh  │                     │
     │<────────────────│                     │
     │                 │                     │
     │  Store in SecureStore                 │
     │                                       │
     │  API request + Authorization: Bearer JWT
     │──────────────────────────────────────>│
     │                                       │
     │                      Verify JWT secret│
     │                      Extract user_id  │
     │                      Check/create user│
     │                                       │
     │  Response                             │
     │<──────────────────────────────────────│
```

## Project Directory Structure (Full)
```
PawLogic/
├── CLAUDE.md                    # Project spec & conventions
├── docs/                        # Documentation
│   ├── ABA_Pet_Behavior_App_Overview.pdf
│   ├── architecture.md          # This file
│   ├── api-spec.md
│   ├── database-schema.md
│   ├── testing-strategy.md
│   ├── deployment-guide.md
│   ├── debugging-playbook.md
│   ├── development-workflow.md
│   ├── environment-setup.md
│   ├── progress-tracker.md
│   └── session-notes/
├── skills/                      # Agent skill definitions
├── agents/                      # Agent role definitions
├── mobile/                      # React Native (Expo) app
│   ├── src/
│   │   ├── components/
│   │   ├── screens/
│   │   ├── navigation/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── stores/
│   │   ├── types/
│   │   ├── constants/
│   │   └── utils/
│   ├── __tests__/
│   ├── assets/
│   ├── app.json
│   ├── eas.json
│   ├── tsconfig.json
│   └── package.json
├── backend/                     # FastAPI backend
│   ├── app/
│   │   ├── api/v1/endpoints/
│   │   ├── models/
│   │   ├── schemas/
│   │   ├── services/
│   │   ├── middleware/
│   │   ├── db/
│   │   ├── core/
│   │   ├── workers/
│   │   ├── prompts/
│   │   ├── main.py
│   │   └── config.py
│   ├── alembic/
│   ├── tests/
│   ├── Dockerfile
│   ├── Dockerfile.worker
│   ├── requirements.txt
│   └── requirements-dev.txt
├── docker-compose.yml
├── .github/workflows/
├── .env.example
└── .gitignore
```

## Technology Decisions & Rationale

| Decision | Choice | Rationale | Alternatives Considered |
|----------|--------|-----------|------------------------|
| Mobile framework | React Native (Expo) | Cross-platform, existing React skills | Flutter, native iOS/Android |
| Backend framework | FastAPI | Async, Python AI ecosystem, existing skills | Django REST, Express.js |
| Database | PostgreSQL (Supabase) | Auth + DB + storage in one, managed | Firebase, raw PostgreSQL, MongoDB |
| AI provider | Anthropic Claude | Strong reasoning, structured output | OpenAI GPT-4, local models |
| State management | Zustand | Lightweight, TypeScript-first | Redux, MobX, React Context |
| Charts | Victory Native | React Native native, good perf | Recharts (web only), D3 |
| Task queue | Celery + Redis | Proven, Python native | Dramatiq, Huey, RQ |
| Push notifications | Expo + OneSignal | Easy integration, good analytics | Firebase Cloud Messaging only |

## Scaling Considerations (Post-MVP)
- **API:** Horizontal scaling via container replicas (Railway/ECS)
- **Database:** Supabase handles connection pooling; read replicas if needed
- **AI:** Background queue absorbs load spikes; rate limiting per user tier
- **Caching:** Redis for analytics results, user session data
- **CDN:** CloudFront for static assets if needed
- **File storage:** S3 (or Supabase Storage) for pet photos and reports
