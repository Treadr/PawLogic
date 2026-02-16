# PawLogic

**"The science behind the paws."**

An AI-augmented pet behavior app grounded in Applied Behavior Analysis (ABA) methodology. Tracks pet behavior using the ABC (Antecedent-Behavior-Consequence) framework, detects patterns, and provides AI-powered coaching -- all in plain English, no clinical jargon.

## Features

- **ABC Behavior Logging** -- Guided flow for logging incidents in under 30 seconds
- **Pattern Detection** -- Identifies antecedent-behavior and behavior-consequence correlations
- **Behavior Function Assessment** -- Determines if behavior is driven by attention, escape, tangible, or sensory needs
- **AI Coaching** -- Claude-powered behavior advice tailored to your pet's data
- **Progress Tracking** -- Frequency charts, severity trends, and category breakdowns
- **Multi-Platform** -- React Native mobile app + React web frontend + FastAPI backend

## Quick Start

```bash
git clone https://github.com/Treadr/PawLogic.git
cd PawLogic
cp backend/.env.example backend/.env
docker compose up -d
```

| Service | URL |
|---------|-----|
| Web App | http://localhost:3000 |
| API Docs | http://localhost:8000/docs |
| API Health | http://localhost:8000/api/v1/health |

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Web Frontend | React 19 + Vite 7 + TypeScript + Recharts |
| Mobile App | React Native (Expo 54) + TypeScript |
| Backend API | FastAPI + async SQLAlchemy 2.0 + asyncpg |
| Database | PostgreSQL 17 |
| AI | Anthropic Claude (Haiku) |
| Task Queue | Celery + Redis 7 |
| CI | GitHub Actions (3 path-filtered workflows) |
| Containerization | Docker Compose (5 services) |

## Project Structure

```
PawLogic/
├── backend/          # FastAPI API + Celery workers
├── frontend/         # React web app (Vite)
├── mobile/           # React Native app (Expo)
├── docs/             # Architecture, API spec, setup guides
├── docker-compose.yml
└── CLAUDE.md         # Project spec & conventions
```

## Development

### Docker (recommended)
```bash
docker compose up -d          # Start all services
docker compose logs -f api    # Follow API logs
docker compose down           # Stop
```

### Local (hot-reload)
```bash
# Start DB + Redis
docker compose up -d db redis

# Backend
cd backend && pip install -r requirements-dev.txt && uvicorn app.main:app --reload

# Frontend
cd frontend && npm ci && npm run dev

# Mobile
cd mobile && npm install && npx expo start
```

### Tests
```bash
cd backend && pytest tests/ -v        # Backend tests (~30 tests)
cd frontend && npm run lint           # Frontend lint
cd mobile && npx tsc --noEmit         # Mobile type check
```

## Documentation

- [Architecture](docs/architecture.md) -- System design, data flows, directory structure
- [API Spec](docs/api-spec.md) -- Endpoint reference with request/response examples
- [Environment Setup](docs/environment-setup.md) -- Detailed setup guide
- [Progress Tracker](docs/progress-tracker.md) -- What's built and recommended next steps
- [Deployment Guide](docs/deployment-guide.md) -- Local and production deployment
- [Testing Strategy](docs/testing-strategy.md) -- Test coverage and CI integration

## License

Proprietary. All rights reserved.
