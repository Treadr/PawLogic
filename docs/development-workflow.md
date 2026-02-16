# PawLogic Development Workflow

## Git Branching Strategy

### Branch Structure
```
main                    # Production-ready code. Protected branch.
├── develop             # Integration branch. All features merge here first.
│   ├── feature/abc-logging-flow    # Feature branches
│   ├── feature/pet-profile-crud
│   ├── feature/ai-pattern-detection
│   ├── fix/auth-token-refresh
│   └── chore/update-dependencies
```

### Branch Naming Convention
```
feature/short-description    # New features
fix/short-description        # Bug fixes
chore/short-description      # Maintenance, deps, CI
docs/short-description       # Documentation only
refactor/short-description   # Code restructuring
```

### Merge Flow
```
feature/* → develop (via PR, requires review)
develop → main (via PR, requires tests passing + review)
```

## Development Cycle

### Starting a Feature
```bash
# 1. Create branch from develop
git checkout develop && git pull
git checkout -b feature/abc-logging-flow

# 2. Work in small, focused commits
git add specific-files.py
git commit -m "Add ABC log Pydantic schemas"

# 3. Push and create PR when ready
git push -u origin feature/abc-logging-flow
gh pr create --base develop --title "Add ABC logging flow" --body "..."
```

### PR Requirements
- All CI checks passing (lint + tests)
- At least one review (code-review-agent or human)
- No merge conflicts with develop
- PR description includes what changed and why

### Commit Message Format
```
<type>: <short description>

<optional body explaining why>

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
```

**Types:** `feat`, `fix`, `chore`, `docs`, `refactor`, `test`, `style`

**Examples:**
```
feat: add ABC log creation endpoint with validation
fix: resolve JWT expiry not triggering token refresh
chore: update FastAPI to 0.115.2
test: add integration tests for pet CRUD endpoints
```

## Multi-Agent Workflow

### Feature Development Flow
```
1. ORCHESTRATOR receives feature request
   └── Decomposes into layer-specific tasks
       ├── DATABASE-AGENT: schema + migration
       ├── BACKEND-AGENT: endpoints + services
       ├── AI-AGENT: prompts + AI service (if AI feature)
       ├── FRONTEND-AGENT: screens + components
       ├── TESTING-AGENT: tests for each layer
       └── CODE-REVIEW-AGENT: review all changes

2. Execution order (respecting dependencies):
   Step 1: database-agent (schema must exist first)
   Step 2: backend-agent + ai-agent (can parallel after schema)
   Step 3: frontend-agent (after API contract defined)
   Step 4: testing-agent (after each layer completes)
   Step 5: code-review-agent (after all code complete)
   Step 6: devops-agent (deployment after review passes)
```

### Agent Handoff Protocol
When one agent completes work that another depends on:
1. Completing agent updates the session notes with status
2. Completing agent lists files created/modified
3. Next agent reads those files before starting work
4. Any conflicts or questions go to orchestrator

## Local Development Setup

### Prerequisites
- Node.js 20+
- Python 3.12+
- Docker Desktop
- Expo CLI (`npm install -g expo-cli`)
- Supabase CLI (`npm install -g supabase`)
- Railway CLI (`npm install -g @railway/cli`)

### First-Time Setup
```bash
# Clone repo
git clone <repo-url> && cd PawLogic

# Backend setup
cd backend
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements-dev.txt
cp .env.example .env      # Edit with your credentials

# Mobile setup
cd ../mobile
npm install

# Start local services
cd ..
docker-compose up -d      # Redis
supabase start            # Local Supabase

# Start development servers
# Terminal 1: Backend
cd backend && uvicorn app.main:app --reload --port 8000

# Terminal 2: Mobile
cd mobile && npx expo start
```

### Daily Development
```bash
# Pull latest changes
git checkout develop && git pull

# Start services
docker-compose up -d
cd backend && uvicorn app.main:app --reload --port 8000  # Terminal 1
cd mobile && npx expo start                              # Terminal 2

# Run tests before committing
cd backend && pytest tests/ -v
cd mobile && npx jest
```

## Code Quality Gates

### Pre-Commit (Local)
- Linting passes (ruff for Python, ESLint for TypeScript)
- Type checking passes (mypy for Python, tsc for TypeScript)
- Formatting correct (ruff format, Prettier)

### CI Pipeline (GitHub Actions)
- All above checks
- All tests pass
- Coverage meets minimum thresholds
- No new security vulnerabilities (npm audit, pip audit)

### Pre-Deploy
- All CI checks pass
- PR reviewed and approved
- Staging environment tested (for production deploys)

## Environment Matrix

| Environment | Backend URL | Database | AI API | Purpose |
|-------------|-------------|----------|--------|---------|
| Local | localhost:8000 | Supabase local | Real API (dev key) | Development |
| CI | Ephemeral | PostgreSQL (GitHub Actions) | Mocked | Automated testing |
| Staging | Railway staging | Supabase staging | Real API (staging key) | Pre-production |
| Production | Railway prod | Supabase prod | Real API (prod key) | Live users |

## Definition of Done (per feature)
- [ ] Code complete and working locally
- [ ] Unit tests written and passing
- [ ] Integration tests written and passing (if applicable)
- [ ] Linting and type checking passing
- [ ] PR created with clear description
- [ ] Code reviewed and approved
- [ ] Merged to develop
- [ ] Verified on staging (for significant features)
- [ ] Session notes updated with status
