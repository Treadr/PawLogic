# PawLogic Environment Setup Guide

## Prerequisites

| Tool | Version | Purpose | Install |
|------|---------|---------|---------|
| Docker Desktop | Latest | All services (DB, Redis, API, frontend) | docker.com |
| Node.js | 20+ | Mobile app + frontend dev | nodejs.org |
| Python | 3.12+ | Backend development (without Docker) | python.org |
| Git | Latest | Version control | git-scm.com |

## Quick Start (Docker -- Recommended)

The fastest way to run the full stack locally:

```bash
# 1. Clone the repository
git clone https://github.com/Treadr/PawLogic.git
cd PawLogic

# 2. Create backend .env
cp backend/.env.example backend/.env

# 3. Start everything
docker compose up -d

# 4. Verify
curl http://localhost:8000/api/v1/health
# → {"status":"healthy","version":"0.1.0"}

# 5. (Optional) Seed demo data
docker compose exec api python -m app.scripts.seed_data
```

### What Docker Starts

| Service | Port | URL |
|---------|------|-----|
| PostgreSQL 17 | 5433 | `localhost:5433` |
| Redis 7 | 6379 | `localhost:6379` |
| FastAPI API | 8000 | http://localhost:8000 |
| Celery Worker | -- | Background tasks |
| Web Frontend | 3000 | http://localhost:3000 |

### Useful Docker Commands

```bash
# View logs
docker compose logs api --tail 50
docker compose logs frontend --tail 50

# Restart a single service
docker compose restart api

# Rebuild after code changes
docker compose up -d --build api
docker compose up -d --build frontend

# Stop everything
docker compose down

# Stop and remove data volumes
docker compose down -v
```

## Local Development (Without Docker)

For active development with hot-reload, you may want to run services individually.

### 1. Start Infrastructure (DB + Redis)

```bash
# Start only database and Redis via Docker
docker compose up -d db redis
```

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate (Windows)
venv\Scripts\activate

# Activate (macOS/Linux)
source venv/bin/activate

# Install dependencies
pip install -r requirements-dev.txt

# Create .env file
cp .env.example .env
```

The default `.env` connects to the Docker PostgreSQL on `localhost:5433`:

```env
DATABASE_URL=postgresql+asyncpg://PawLogic_DB:PPaaPA55!!word@localhost:5433/PawLogic
SUPABASE_JWT_SECRET=pawlogic-dev-jwt-secret-key-minimum-32-chars
REDIS_URL=redis://localhost:6379/0
ENVIRONMENT=development
# ANTHROPIC_API_KEY=sk-ant-...  # Optional: enables AI coaching
```

```bash
# Run migrations
alembic upgrade head

# Start API server with hot-reload
uvicorn app.main:app --reload --port 8000

# (In a separate terminal) Start Celery worker
celery -A app.workers.celery_app worker --loglevel=info
```

### 3. Web Frontend Setup

```bash
cd frontend

# Install dependencies
npm ci

# Start dev server (hot-reload on port 3000)
npm run dev
```

The Vite dev server proxies `/api` requests to `http://localhost:8000` automatically.

### 4. Mobile App Setup

```bash
cd mobile

# Install dependencies
npm install

# Start Expo dev server
npx expo start
```

Then:
- Press `i` for iOS simulator
- Press `a` for Android emulator
- Scan QR code with Expo Go app on a physical device

## API Access

### Swagger Docs
http://localhost:8000/docs -- Interactive API documentation

### Dev Authentication
The API uses a dev JWT token for authentication. Generate one:

```bash
# Any valid JWT signed with the secret works. For quick testing:
curl -X POST http://localhost:8000/api/v1/auth/verify \
  -H "Authorization: Bearer <your-dev-jwt>"
```

### Health Checks

```bash
# Basic health
curl http://localhost:8000/api/v1/health

# Detailed health (DB, Redis, Anthropic key)
curl http://localhost:8000/api/v1/health/detailed
```

## Seed Data

Load demo data for development:

```bash
# Via Docker
docker compose exec api python -m app.scripts.seed_data

# Or locally (with venv activated)
cd backend && python -m app.scripts.seed_data
```

Creates: 1 demo user, 2 pets (cat + dog), 15 ABC log entries.

## Running Tests

```bash
# Backend tests (requires DB + Redis running)
cd backend && pytest tests/ -v --tb=short

# Backend lint
cd backend && ruff check app/ && ruff format --check app/

# Frontend lint + build
cd frontend && npm run lint && npm run build

# Mobile type check
cd mobile && npx tsc --noEmit
```

## Verification Checklist

After setup, verify:

- [ ] `docker compose ps` shows all 5 services running
- [ ] `curl http://localhost:8000/api/v1/health` returns `{"status":"healthy"}`
- [ ] `curl http://localhost:8000/api/v1/health/detailed` shows database: healthy, redis: healthy
- [ ] http://localhost:8000/docs loads Swagger UI
- [ ] http://localhost:3000 loads the web frontend
- [ ] `cd backend && pytest tests/ -v` passes all tests

## Troubleshooting

### Port Conflicts
| Service | Port | How to Change |
|---------|------|---------------|
| PostgreSQL | 5433 | `docker-compose.yml` ports section |
| Redis | 6379 | `docker-compose.yml` ports section |
| FastAPI | 8000 | `docker-compose.yml` command + ports |
| Frontend | 3000 | `docker-compose.yml` ports + `nginx.conf` |
| Expo | 8081 | `npx expo start --port <port>` |

### Common Issues

- **Docker DB connection error** (`Connect call failed 127.0.0.1:5433`): The API container must use Docker service name `db:5432`, not `localhost:5433`. This is handled by the `environment:` overrides in docker-compose.yml.
- **API container exits immediately**: Check logs with `docker compose logs api`. Usually a migration error or missing .env.
- **Port 8081 in use (Expo)**: Another process is using the port. Use `npx expo start --port 8083`.
- **`ruff` not found**: Install dev dependencies: `pip install -r requirements-dev.txt`
- **TypeScript errors in mobile**: Run `npx tsc --noEmit` to see exact errors.

### Windows-Specific Notes
- Use PowerShell or Git Bash (not cmd.exe)
- Virtual environment activation: `venv\Scripts\activate`
- Docker Desktop must have WSL2 backend enabled
- Unicode characters in logs may display incorrectly in some terminals
