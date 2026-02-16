# PawLogic Deployment Guide

## Environments

| Environment | Backend | Database | Web | Mobile | Purpose |
|-------------|---------|----------|-----|--------|---------|
| Local | Docker :8000 | Docker PostgreSQL :5433 | Docker nginx :3000 | Expo Go | Development |
| Staging | TBD | TBD | TBD | Internal build | Pre-production |
| Production | TBD | TBD | TBD | App Store / Play Store | Live users |

## Local Deployment (Docker Compose)

The full stack runs locally via Docker Compose with 5 services.

### Start All Services
```bash
docker compose up -d
```

### Verify Deployment
```bash
# All containers running
docker compose ps

# API health
curl http://localhost:8000/api/v1/health/detailed

# Frontend serving
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000

# API proxy through frontend
curl http://localhost:3000/api/v1/health
```

### Rebuild After Changes
```bash
# Rebuild specific service
docker compose up -d --build api
docker compose up -d --build frontend

# Rebuild everything
docker compose up -d --build
```

### View Logs
```bash
docker compose logs -f api        # Follow API logs
docker compose logs worker --tail 20  # Last 20 worker log lines
docker compose logs frontend      # nginx access logs
```

### Database Management
```bash
# Run migrations
docker compose exec api alembic upgrade head

# Seed demo data
docker compose exec api python -m app.scripts.seed_data

# Connect to PostgreSQL directly
docker compose exec db psql -U PawLogic_DB -d PawLogic

# Database backup
docker compose exec db pg_dump -U PawLogic_DB PawLogic > backup.sql
```

### Stop Services
```bash
# Stop (preserve data)
docker compose down

# Stop and delete data volumes
docker compose down -v
```

## Production Deployment (Planned)

### Recommended Architecture

**Option A: Managed Services (Lower Ops)**
| Component | Service | Notes |
|-----------|---------|-------|
| Backend API | Railway or Render | Auto-deploy from GitHub, built-in SSL |
| Web Frontend | Vercel or Cloudflare Pages | Edge CDN, automatic builds from git |
| Database | Supabase or Railway PostgreSQL | Managed backups, connection pooling |
| Redis | Railway or Upstash | Managed Redis with persistence |
| Worker | Railway (separate service) | Same Docker image, different command |

**Option B: Single-Host Docker (Full Control)**
| Component | Service | Notes |
|-----------|---------|-------|
| All services | Single VPS (AWS EC2, DigitalOcean) | docker compose in production mode |
| Reverse proxy | nginx or Caddy | SSL termination, rate limiting |
| Monitoring | Prometheus + Grafana | Metrics and alerting |
| Backups | Cron + pg_dump + S3 | Automated database backups |

### Pre-Production Checklist
- [ ] Replace dev JWT auth with real auth provider (Supabase Auth recommended)
- [ ] Set strong, unique secrets for all environment variables
- [ ] Remove hardcoded credentials from docker-compose.yml (use env files or secrets manager)
- [ ] Configure CORS_ORIGINS for production domains only
- [ ] Set `ENVIRONMENT=production` in backend config
- [ ] Configure ANTHROPIC_API_KEY with spending limits
- [ ] Set up SSL certificates (Let's Encrypt / Cloudflare)
- [ ] Set up error monitoring (Sentry)
- [ ] Set up database backups (automated pg_dump or managed service)
- [ ] Configure rate limiting per user tier
- [ ] Set up log aggregation
- [ ] Load test critical endpoints (ABC log creation, pattern detection)
- [ ] Security audit: no exposed secrets, proper CORS, input validation

### Mobile Deployment

#### TestFlight / Internal Testing
```bash
cd mobile

# Configure EAS
npx eas-cli build:configure

# Build for internal distribution
npx eas-cli build --platform all --profile preview

# iOS: Appears in TestFlight automatically
# Android: Download from EAS dashboard
```

#### App Store / Play Store
```bash
# Production build
npx eas-cli build --platform all --profile production

# Submit
npx eas-cli submit --platform ios
npx eas-cli submit --platform android
```

#### OTA Updates (JavaScript-only changes)
```bash
npx eas-cli update --branch production --message "Fix insight card rendering"
```

## Rollback Procedures

| Component | Rollback Method | Notes |
|-----------|----------------|-------|
| Backend (managed) | Redeploy previous commit | Railway/Render have instant rollback |
| Backend (Docker) | `docker compose pull && docker compose up -d` | Pin image tags for safety |
| Frontend (Vercel) | Instant rollback in dashboard | One click |
| Database | `alembic downgrade -1` | Test in staging first |
| Mobile (OTA) | Push new update reverting changes | Instant for JS changes |
| Mobile (binary) | Cannot rollback -- push hotfix forward | Binary updates require store review |

## Monitoring

### Health Endpoints
- `GET /api/v1/health` -- Basic health (returns 200 if API is up)
- `GET /api/v1/health/detailed` -- Component status (database, Redis, Anthropic key)

### Key Metrics to Monitor
- API response time (p50, p95, p99)
- Error rate (5xx responses)
- Database connection pool utilization
- Redis memory usage
- Celery task queue depth
- ABC log creation latency (< 500ms target)
