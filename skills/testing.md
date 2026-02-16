# Skill: Testing Strategy

## Purpose
Define and execute the testing approach across all PawLogic layers -- mobile app, backend API, database, AI integration, and end-to-end flows.

## Testing Pyramid

```
        /  E2E  \          ~10% -- Critical user journeys
       /  Integ  \         ~30% -- API endpoints, DB queries, AI service
      /   Unit    \        ~60% -- Pure logic, utilities, components
```

## Backend Testing (FastAPI + Python)

### Framework & Tools
- **pytest** -- Test runner
- **pytest-asyncio** -- Async test support
- **httpx** -- Async test client for FastAPI
- **factory-boy** -- Test data factories
- **pytest-cov** -- Coverage reporting
- **respx** -- Mock HTTP requests (for Claude API mocking)

### Test Structure
```
backend/tests/
  conftest.py                 # Shared fixtures
  factories.py                # Factory Boy factories
  unit/
    test_abc_analyzer.py      # Pattern detection logic
    test_function_assessor.py # Behavior function mapping
    test_analytics.py         # Data analytics functions
    test_schemas.py           # Pydantic validation
  integration/
    test_abc_logs_api.py      # ABC log endpoints
    test_pets_api.py          # Pet CRUD endpoints
    test_insights_api.py      # Insight generation endpoints
    test_auth.py              # Auth middleware
    test_db_queries.py        # Complex database queries
  ai/
    test_ai_service.py        # AI service with mocked Claude responses
    test_prompt_templates.py  # Prompt formatting
    test_response_parsing.py  # AI response validation
```

### Key Fixtures
```python
# conftest.py

@pytest.fixture
async def db_session():
    """Async test database session with rollback after each test."""

@pytest.fixture
async def test_client(db_session):
    """FastAPI test client with injected test DB session."""

@pytest.fixture
def auth_headers():
    """Valid Supabase JWT headers for authenticated requests."""

@pytest.fixture
def sample_pet(db_session):
    """A pet profile (cat, domestic shorthair, 3 years)."""

@pytest.fixture
def sample_abc_logs(db_session, sample_pet):
    """20 ABC log entries with realistic patterns for pattern detection testing."""

@pytest.fixture
def mock_claude_response():
    """Mocked Anthropic Claude API response for AI tests."""
```

### Critical Test Cases -- Backend

#### ABC Log CRUD
- Create log with all fields populated
- Create log with minimum required fields
- List logs with pagination (page, per_page)
- Filter logs by date range
- Filter logs by behavior category
- Reject log creation for another user's pet (RLS)
- Validate antecedent/behavior/consequence tags against allowed values

#### Pattern Detection
- No patterns detected with < 10 logs
- Detect antecedent-behavior pair when present in > 30% of logs
- Detect reinforcement pattern (behavior increases after specific consequence)
- Detect temporal pattern (time-of-day correlation)
- Handle edge case: all logs have same antecedent
- Handle edge case: single behavior category

#### AI Integration
- Mock Claude response and verify parsing
- Handle malformed AI response gracefully
- Verify prompt contains required context (pet name, species, logs)
- Verify token limits are respected
- Handle Claude API timeout
- Handle Claude API rate limit (429)

## Mobile Testing (React Native)

### Framework & Tools
- **Jest** -- Unit test runner (bundled with Expo)
- **React Native Testing Library** -- Component testing
- **MSW (Mock Service Worker)** -- API mocking
- **Detox** (optional) -- E2E testing on device/simulator

### Test Structure
```
mobile/
  __tests__/
    components/
      ABCChipSelector.test.tsx
      InsightCard.test.tsx
      ProgressChart.test.tsx
    screens/
      ABCLogging.test.tsx
      Dashboard.test.tsx
    hooks/
      useABCLogger.test.ts
      useInsights.test.ts
    services/
      apiClient.test.ts
      supabaseClient.test.ts
    utils/
      formatters.test.ts
      validators.test.ts
```

### Critical Test Cases -- Mobile

#### ABC Logging Flow
- Renders antecedent selection screen
- Selecting antecedent chips updates state
- Navigate forward from antecedent to behavior
- Navigate forward from behavior to consequence
- Summary screen shows all selections
- Submit saves log and navigates to confirmation
- Back navigation preserves selections
- Custom text entry works alongside chip selection

#### Dashboard
- Shows pet name and recent behavior count
- Shows "log new incident" CTA prominently
- Insight cards render when available
- Empty state shows when < 10 logs

#### Offline Support
- Queues log locally when offline
- Syncs queued logs when connection restores
- Shows offline indicator in UI

## Database Testing

### Approach
- Use a dedicated test database (not production)
- Run migrations before test suite
- Each test runs in a transaction that rolls back
- Test RLS policies with different user contexts

### Critical Tests
- RLS: User A cannot read User B's pets
- RLS: User A cannot read User B's ABC logs
- Cascade: Deleting a pet deletes its ABC logs
- Indexes: Verify query plans use expected indexes
- Constraints: species check constraint rejects invalid values
- Constraints: severity range check (1-5) works

## End-to-End Test Scenarios

### Happy Path: First-Time User
1. Sign up with email/password
2. Create pet profile (cat, domestic shorthair, "Luna", 3 years)
3. Log first ABC incident
4. Log 9 more incidents over simulated time
5. Trigger pattern analysis
6. View insights on dashboard
7. View progress chart

### Happy Path: Quick Log
1. Open app (already authenticated)
2. Tap "Log Incident" from dashboard
3. Select antecedent (2 taps)
4. Select behavior (2 taps)
5. Select consequence (2 taps)
6. Confirm and save (1 tap)
7. Verify total time < 30 seconds

## Coverage Targets
| Layer | Target | Minimum |
|-------|--------|---------|
| Backend unit tests | 80% | 70% |
| Backend integration | 60% | 50% |
| Mobile components | 70% | 60% |
| Mobile hooks/services | 80% | 70% |

## Commands
```bash
# Backend
pytest tests/ -v --cov=app --cov-report=html
pytest tests/unit/ -v                       # Unit only
pytest tests/integration/ -v                # Integration only
pytest tests/ -v -k "test_abc"              # Pattern match

# Mobile
npx jest                                     # All tests
npx jest --coverage                          # With coverage
npx jest --watch                             # Watch mode
npx jest __tests__/screens/ABCLogging.test.tsx  # Single file

# CI (both)
pytest tests/ -v --tb=short --junitxml=results.xml
npx jest --ci --coverage --reporters=default --reporters=jest-junit
```

## CI Integration
- Run all tests on every PR
- Block merge if coverage drops below minimum thresholds
- Run E2E tests on staging before production deploy
- Cache test dependencies for faster CI runs
