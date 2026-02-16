# PawLogic Testing Strategy

## Overview
Comprehensive testing across all layers with a focus on the ABC logging flow (the core value proposition) and data integrity. See `skills/testing.md` for detailed framework configuration and test case lists.

## Testing Pyramid Summary

| Level | Backend | Mobile | Target Coverage |
|-------|---------|--------|----------------|
| Unit | pytest (60%) | Jest (60%) | Pure logic, utilities, validators |
| Integration | pytest + httpx (30%) | RNTL (30%) | API endpoints, DB queries, component rendering |
| E2E | Manual + scripts (10%) | Manual + Detox (10%) | Critical user journeys |

## What Gets Tested (MVP)

### Must-Test (P0)
- ABC log creation and validation
- User authentication flow
- Pet profile CRUD
- RLS enforcement (user data isolation)
- AI pattern analysis (mocked Claude responses)
- Progress data aggregation

### Should-Test (P1)
- All API error responses (400, 401, 404, 422)
- Offline log queuing and sync
- Chart data formatting
- Rate limiting enforcement
- Pagination correctness

### Nice-to-Test (P2)
- Push notification delivery
- Edge cases (empty data, max limits)
- Performance benchmarks

## CI Pipeline Integration
Tests run automatically on every PR via GitHub Actions. See `skills/deployment.md` for workflow definitions.

### Blocking Checks (Must Pass to Merge)
- Backend: `pytest tests/ --cov-fail-under=70`
- Mobile: `npx jest --ci --coverage`
- Lint: `ruff check` + `eslint`
- Types: `mypy` + `tsc --noEmit`

## Test Data
- Use Factory Boy (backend) and test fixtures (mobile) for consistent data
- Seed data script for local development
- Never use production data in tests
- See `agents/testing-agent.md` for factory definitions

## Running Tests Locally
```bash
# Backend (all)
cd backend && pytest tests/ -v

# Backend (specific file)
pytest tests/integration/test_abc_logs_api.py -v

# Backend (pattern match)
pytest tests/ -k "test_create_abc_log" -v

# Mobile (all)
cd mobile && npx jest

# Mobile (watch mode)
npx jest --watch

# Mobile (specific file)
npx jest __tests__/screens/ABCLogging.test.tsx
```
