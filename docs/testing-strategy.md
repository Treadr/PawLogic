# PawLogic Testing Strategy

## Current Coverage

### Backend (pytest)
7 test files, ~30 tests covering all API endpoints:

| File | Tests | What's Covered |
|------|-------|---------------|
| `test_auth.py` | Auth verify, dev token, user provisioning |
| `test_pets.py` | Pet CRUD, ownership validation |
| `test_abc_logs.py` | ABC log create, list, delete, taxonomy validation |
| `test_progress.py` | Frequency, severity trend, category breakdown, dashboard |
| `test_coaching.py` | AI coaching request, fallback when no API key |
| `test_health.py` | Basic + detailed health checks |
| `test_insights.py` | Insight list, get, mark-read, summary |

### Frontend (not yet)
No test suite configured. Recommended: Vitest (matches Vite toolchain).

### Mobile (not yet)
No test suite configured. Recommended: Jest with React Native Testing Library.

## Running Tests

```bash
# Backend -- all tests
cd backend && pytest tests/ -v --tb=short

# Backend -- specific file
pytest tests/test_abc_logs.py -v

# Backend -- pattern match
pytest tests/ -k "test_create" -v

# Backend -- with coverage
pytest tests/ --cov=app --cov-report=term-missing
```

**Prerequisites:** PostgreSQL and Redis must be running (via Docker Compose or locally).

## Test Infrastructure

### Backend Test Setup (`conftest.py`)
- Creates a test database using the same PostgreSQL instance
- Uses `httpx.AsyncClient` for async API testing
- Provides fixtures for authenticated requests (dev JWT)
- Runs alembic migrations before test session
- Each test uses database transactions that roll back after completion

### CI Integration
Tests run automatically on every push/PR via GitHub Actions:

- **backend-ci.yml:** Spins up PostgreSQL 17 + Redis 7 as GitHub Actions services, runs `alembic upgrade head`, then `pytest tests/ -v --tb=short`
- **mobile-ci.yml:** Runs `npx tsc --noEmit` (type checking only)
- **frontend-ci.yml:** Runs `npm run lint` (ESLint) and `npm run build` (TypeScript + Vite)

## Recommended Next Steps

### Priority 1: Frontend Tests (Vitest)
```bash
cd frontend
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom
```

Focus areas:
- ABC log wizard form validation and step progression
- Auth context (login/logout state)
- API service layer (mock fetch responses)
- Component rendering (ChipSelector, SeveritySlider)

### Priority 2: Mobile Tests (Jest + RNTL)
```bash
cd mobile
npm install -D jest @testing-library/react-native react-test-renderer
```

Focus areas:
- ABC logging 4-step wizard flow
- Navigation between screens
- Service layer API calls
- Custom hooks (useApiCall, useFocusRefresh)

### Priority 3: E2E Tests
- **Web:** Playwright for full user journey testing
- **Mobile:** Detox for device-level testing
- Critical paths: login -> add pet -> log ABC entry -> view insights

## Testing Pyramid Target

| Level | Backend | Frontend | Mobile | Target |
|-------|---------|----------|--------|--------|
| Unit | pytest (60%) | Vitest (60%) | Jest (60%) | Pure logic, validators, utils |
| Integration | pytest + httpx (30%) | Vitest + RTL (30%) | Jest + RNTL (30%) | API endpoints, component rendering |
| E2E | Manual (10%) | Playwright (10%) | Detox (10%) | Critical user journeys |

## Test Data
- **Backend:** Test fixtures in conftest.py (user, pet, abc_log factories)
- **Seed script:** `python -m app.scripts.seed_data` creates demo user + 2 pets + 15 logs
- **Rule:** Never use production data in tests
