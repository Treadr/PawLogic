# Skill: Deployment & Infrastructure

## Purpose
Define deployment pipelines, hosting configuration, CI/CD workflows, and infrastructure management for PawLogic across MVP (Vercel + Railway) and scale (AWS) phases.

## Infrastructure Overview

### MVP Phase (Vercel + Railway)
```
┌─────────────────────────────────────────────────────────┐
│  Mobile App (Expo)                                       │
│  ├── iOS: TestFlight → App Store                        │
│  └── Android: Internal Track → Google Play              │
├─────────────────────────────────────────────────────────┤
│  Backend API (Railway)                                   │
│  ├── FastAPI container                                   │
│  ├── Celery worker container                            │
│  └── Redis (Railway add-on)                             │
├─────────────────────────────────────────────────────────┤
│  Database (Supabase)                                     │
│  ├── PostgreSQL (managed)                               │
│  ├── Auth (managed)                                      │
│  ├── Storage (managed)                                   │
│  └── Realtime (managed)                                  │
├─────────────────────────────────────────────────────────┤
│  External Services                                       │
│  ├── Anthropic Claude API                               │
│  ├── OneSignal (push notifications)                     │
│  └── Sentry (error monitoring)                          │
└─────────────────────────────────────────────────────────┘
```

### Scale Phase (AWS)
```
CloudFront → ALB → ECS Fargate (FastAPI)
                 → ECS Fargate (Celery workers)
                 → ElastiCache (Redis)
RDS PostgreSQL (or keep Supabase)
S3 (file storage)
CloudWatch (monitoring)
```

## Dockerfiles

### Backend API
```dockerfile
# backend/Dockerfile
FROM python:3.12-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY app/ app/
COPY alembic/ alembic/
COPY alembic.ini .

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Celery Worker
```dockerfile
# backend/Dockerfile.worker
FROM python:3.12-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY app/ app/

CMD ["celery", "-A", "app.workers.celery_app", "worker", "--loglevel=info"]
```

### Docker Compose (Local Development)
```yaml
# docker-compose.yml
services:
  api:
    build: ./backend
    ports:
      - "8000:8000"
    env_file: .env
    volumes:
      - ./backend/app:/app/app
    depends_on:
      - redis

  worker:
    build:
      context: ./backend
      dockerfile: Dockerfile.worker
    env_file: .env
    depends_on:
      - redis

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
```

## CI/CD Pipeline (GitHub Actions)

### Backend CI
```yaml
# .github/workflows/backend-ci.yml
name: Backend CI
on:
  push:
    paths: ['backend/**']
  pull_request:
    paths: ['backend/**']

jobs:
  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_DB: pawlogic_test
          POSTGRES_PASSWORD: test
        ports: ['5432:5432']
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: '3.12'
      - run: pip install -r backend/requirements-dev.txt
      - run: pytest backend/tests/ -v --cov=app --cov-fail-under=70

  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: '3.12'
      - run: pip install ruff mypy
      - run: ruff check backend/app/
      - run: ruff format --check backend/app/
```

### Mobile CI
```yaml
# .github/workflows/mobile-ci.yml
name: Mobile CI
on:
  push:
    paths: ['mobile/**']
  pull_request:
    paths: ['mobile/**']

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: cd mobile && npm ci
      - run: cd mobile && npx jest --ci --coverage --coverageThreshold='{"global":{"branches":60,"functions":60,"lines":60}}'

  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: cd mobile && npm ci
      - run: cd mobile && npx eslint . --ext .ts,.tsx
      - run: cd mobile && npx tsc --noEmit
```

## Railway Deployment

### Setup
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and link project
railway login
railway init

# Deploy
railway up

# Environment variables
railway variables set DATABASE_URL="..."
railway variables set ANTHROPIC_API_KEY="..."
railway variables set SUPABASE_JWT_SECRET="..."
```

### Railway Configuration
```toml
# railway.toml
[build]
builder = "DOCKERFILE"
dockerfilePath = "backend/Dockerfile"

[deploy]
healthcheckPath = "/health"
healthcheckTimeout = 30
restartPolicyType = "ON_FAILURE"
restartPolicyMaxRetries = 3
```

## Expo / EAS Build & Submit

### EAS Configuration
```json
// eas.json
{
  "cli": { "version": ">= 12.0.0" },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal",
      "ios": { "simulator": false }
    },
    "production": {
      "autoIncrement": true
    }
  },
  "submit": {
    "production": {
      "ios": { "appleId": "your@email.com", "ascAppId": "xxx" },
      "android": { "serviceAccountKeyPath": "./google-sa.json" }
    }
  }
}
```

### Build & Submit Commands
```bash
# Development build (internal testing)
eas build --platform all --profile development

# Preview build (TestFlight / Internal track)
eas build --platform all --profile preview

# Production build
eas build --platform all --profile production

# Submit to stores
eas submit --platform ios
eas submit --platform android

# OTA updates (no store review needed)
eas update --branch production --message "Bug fix description"
```

## Environment Management
| Environment | Backend | Database | Purpose |
|-------------|---------|----------|---------|
| Local | localhost:8000 | Supabase local | Development |
| Staging | Railway (staging) | Supabase staging project | Pre-production testing |
| Production | Railway (prod) | Supabase prod project | Live users |

## Health Checks
```python
# app/main.py
@app.get("/health")
async def health_check():
    return {"status": "healthy", "version": settings.APP_VERSION}

@app.get("/health/detailed")
async def detailed_health(db: AsyncSession = Depends(get_db)):
    db_ok = await check_db_connection(db)
    redis_ok = await check_redis_connection()
    return {
        "status": "healthy" if (db_ok and redis_ok) else "degraded",
        "database": "ok" if db_ok else "error",
        "redis": "ok" if redis_ok else "error",
        "version": settings.APP_VERSION
    }
```

## Monitoring & Alerting
- **Sentry** for error tracking (backend + mobile)
- **Railway metrics** for API latency, CPU, memory
- **Supabase dashboard** for database performance
- **Anthropic usage dashboard** for AI API costs
- Alert on: 5xx error rate > 1%, API latency p95 > 2s, DB connection failures

## Rollback Procedures
1. **Backend:** Railway instant rollback to previous deployment
2. **Mobile (OTA):** EAS update rollback to previous branch
3. **Mobile (binary):** Cannot rollback store builds -- push hotfix forward
4. **Database:** Alembic `downgrade -1` for schema rollbacks (test in staging first)
