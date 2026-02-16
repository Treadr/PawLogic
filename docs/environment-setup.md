# PawLogic Environment Setup Guide

## Prerequisites

### Required Software
| Tool | Version | Purpose | Install |
|------|---------|---------|---------|
| Node.js | 20+ | Mobile app runtime | nodejs.org |
| Python | 3.12+ | Backend runtime | python.org |
| Docker Desktop | Latest | Local services (Redis) | docker.com |
| Git | Latest | Version control | git-scm.com |

### CLI Tools
```bash
# Expo CLI (mobile builds)
npm install -g expo-cli

# EAS CLI (Expo Application Services)
npm install -g eas-cli

# Supabase CLI (local database)
npm install -g supabase

# Railway CLI (backend deployment)
npm install -g @railway/cli

# GitHub CLI (PR management)
winget install GitHub.cli  # Windows
# or: brew install gh      # macOS
```

## Step-by-Step Setup

### 1. Clone the Repository
```bash
git clone <repo-url>
cd PawLogic
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
pip install -r requirements.txt
pip install -r requirements-dev.txt  # Testing + linting tools

# Create .env file
cp .env.example .env
```

Edit `.env` with your credentials:
```env
DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost:54322/postgres
SUPABASE_URL=http://localhost:54321
SUPABASE_JWT_SECRET=super-secret-jwt-token-with-at-least-32-characters-long
SUPABASE_SERVICE_KEY=your-local-service-key
ANTHROPIC_API_KEY=sk-ant-your-key-here
REDIS_URL=redis://localhost:6379/0
ENVIRONMENT=development
LOG_LEVEL=DEBUG
CORS_ORIGINS=["http://localhost:8081","http://localhost:19006"]
```

### 3. Mobile Setup
```bash
cd mobile

# Install dependencies
npm install

# Create .env file for Expo
cp .env.example .env
```

Edit mobile `.env`:
```env
EXPO_PUBLIC_SUPABASE_URL=http://localhost:54321
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-local-anon-key
EXPO_PUBLIC_API_URL=http://localhost:8000/api/v1
```

### 4. Start Local Supabase
```bash
# From project root
supabase init    # First time only
supabase start   # Starts PostgreSQL, Auth, Storage, Realtime

# Note the output -- it shows:
# API URL: http://localhost:54321
# anon key: eyJh...
# service_role key: eyJh...
# JWT secret: super-secret-jwt-token-...
# DB URL: postgresql://postgres:postgres@localhost:54322/postgres
```

### 5. Start Redis (via Docker)
```bash
docker-compose up -d redis
```

### 6. Run Database Migrations
```bash
cd backend
alembic upgrade head
```

### 7. Seed Development Data (Optional)
```bash
cd backend
python -m app.scripts.seed_data
```

### 8. Start Development Servers

**Terminal 1 -- Backend API:**
```bash
cd backend
uvicorn app.main:app --reload --port 8000
```
API available at: http://localhost:8000
API docs at: http://localhost:8000/docs (Swagger)

**Terminal 2 -- Mobile App:**
```bash
cd mobile
npx expo start
```
Then press:
- `i` for iOS simulator
- `a` for Android emulator
- Scan QR code for physical device (Expo Go app)

**Terminal 3 -- Celery Worker (for AI analysis):**
```bash
cd backend
celery -A app.workers.celery_app worker --loglevel=info
```

## Supabase Configuration

### Local Auth Setup
The local Supabase instance comes with auth pre-configured. To test:
1. Go to http://localhost:54323 (Supabase Studio)
2. Navigate to Authentication → Users
3. Create a test user manually, or use the API

### Storage Buckets
Create via Supabase Studio or SQL:
```sql
INSERT INTO storage.buckets (id, name, public) VALUES ('pet-photos', 'pet-photos', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('vet-reports', 'vet-reports', false);
```

## Anthropic API Key
1. Go to console.anthropic.com
2. Create an API key for development
3. Add to `backend/.env` as `ANTHROPIC_API_KEY`
4. Set a spending limit for safety

## Verification Checklist
After setup, verify everything works:

- [ ] `supabase status` shows all services running
- [ ] `curl http://localhost:8000/health` returns `{"status": "healthy"}`
- [ ] `curl http://localhost:8000/docs` loads Swagger UI
- [ ] Expo app loads on simulator/device
- [ ] Can create a user via Supabase Studio
- [ ] Can make authenticated API requests
- [ ] Redis is reachable (`docker exec -it pawlogic-redis redis-cli ping`)

## Troubleshooting

### Port Conflicts
| Service | Default Port | Env Var to Change |
|---------|-------------|-------------------|
| FastAPI | 8000 | `--port` flag |
| Supabase API | 54321 | `supabase/config.toml` |
| Supabase DB | 54322 | `supabase/config.toml` |
| Supabase Studio | 54323 | `supabase/config.toml` |
| Redis | 6379 | `docker-compose.yml` |
| Expo | 8081/19006 | `--port` flag |

### Common Issues
- **"Module not found"** in Python: Ensure venv is activated
- **Supabase won't start**: Check Docker Desktop is running
- **CORS errors**: Verify `CORS_ORIGINS` includes your mobile dev URL
- **Auth failures**: Ensure `SUPABASE_JWT_SECRET` matches between Supabase and backend .env
- **Expo build errors**: Try `npx expo start --clear` to clear cache

## Windows-Specific Notes
- Use PowerShell or Git Bash (not cmd.exe)
- Virtual environment activation: `venv\Scripts\activate`
- Docker Desktop must have WSL2 backend enabled
- If `supabase start` is slow, ensure Docker has sufficient memory allocated (4GB minimum)
