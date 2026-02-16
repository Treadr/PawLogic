# PawLogic API Specification

## Base URL
- **Local:** `http://localhost:8000/api/v1`
- **Via Frontend:** `http://localhost:3000/api/v1` (nginx proxies to backend)
- **Swagger Docs:** `http://localhost:8000/docs`

## Authentication
All endpoints except `/health` require a valid JWT in the Authorization header:
```
Authorization: Bearer <jwt_token>
```

Currently uses dev JWT tokens. The `ensure_db_user` dependency auto-provisions a user record on first authenticated request.

---

## Health Check

### `GET /api/v1/health`
No auth required. Returns basic service status.
```json
{"status": "healthy", "version": "0.1.0"}
```

### `GET /api/v1/health/detailed`
Returns component-level health.
```json
{
  "status": "healthy",
  "version": "0.1.0",
  "environment": "development",
  "checks": {
    "database": "healthy",
    "redis": "healthy",
    "anthropic": "not_configured"
  }
}
```

---

## Auth

### `POST /api/v1/auth/verify`
Verify JWT and return/create user record.

**Response 200:**
```json
{
  "user_id": "uuid-string",
  "email": "user@example.com"
}
```

---

## Pets

### `POST /api/v1/pets`
Create a new pet profile.

**Request:**
```json
{
  "name": "Luna",
  "species": "cat",
  "breed": "Domestic Shorthair",
  "age_years": 3,
  "age_months": 6,
  "weight_lbs": 10.5,
  "sex": "female",
  "is_neutered": true,
  "temperament": ["curious", "independent"],
  "medical_notes": "No known issues"
}
```

### `GET /api/v1/pets`
List all pets for the authenticated user.

### `GET /api/v1/pets/{pet_id}`
Get a single pet profile. Validates ownership.

### `PUT /api/v1/pets/{pet_id}`
Update pet profile. Partial update supported.

### `DELETE /api/v1/pets/{pet_id}`
Delete pet and all associated data.

---

## ABC Logs

### `POST /api/v1/pets/{pet_id}/abc-logs`
Create an ABC behavior log entry. Validates taxonomy categories.

**Request:**
```json
{
  "antecedent_category": "other_animal_present",
  "antecedent_description": "Duke was lying near the couch",
  "behavior_category": "destructive",
  "behavior_description": "Scratched the arm of the couch for 30 seconds",
  "behavior_severity": 3,
  "consequence_category": "verbal_reaction",
  "consequence_description": "Said no and moved her to the cat tree",
  "occurred_at": "2026-02-16T14:30:00",
  "location": "living room"
}
```

**Notes:**
- `occurred_at` must be TIMESTAMP WITHOUT TIME ZONE (strip tzinfo)
- Categories are validated against `app/core/taxonomy.py`
- `behavior_severity` is 1-5

### `GET /api/v1/pets/{pet_id}/abc-logs`
List ABC logs for a pet. Ordered by occurred_at descending.

### `GET /api/v1/pets/{pet_id}/abc-logs/summary`
Get summary statistics for a pet's ABC logs.

### `GET /api/v1/pets/{pet_id}/abc-logs/{log_id}`
Get a single ABC log entry.

### `DELETE /api/v1/pets/{pet_id}/abc-logs/{log_id}`
Delete a single ABC log entry.

---

## Analysis

### `POST /api/v1/pets/{pet_id}/analysis/detect-patterns`
Trigger pattern detection on a pet's ABC logs. Requires >= 10 logs.

Returns detected patterns and creates Insight records:
- Antecedent-Behavior pair frequencies
- Behavior-Consequence correlations
- Behavior function assessment (attention, escape, tangible, sensory)
- Severity trend analysis

### `GET /api/v1/pets/{pet_id}/analysis/summary`
Get analysis summary for a pet.

---

## Insights

### `GET /api/v1/pets/{pet_id}/insights`
List AI-generated insights for a pet. Newest first.

**Query Parameters:**
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| unread_only | bool | false | Only return unread insights |

**Response 200:**
```json
[
  {
    "id": "uuid",
    "pet_id": "uuid",
    "user_id": "uuid",
    "insight_type": "pattern",
    "title": "Pattern: other animal present triggers destructive",
    "body": "We've noticed that when there's a other animal present event...",
    "confidence": 0.65,
    "behavior_function": null,
    "is_read": false,
    "abc_log_ids": ["uuid1", "uuid2"],
    "created_at": "2026-02-16T15:00:00"
  }
]
```

### `GET /api/v1/pets/{pet_id}/insights/summary`
Get insight counts.
```json
{"total": 5, "unread": 3}
```

### `GET /api/v1/insights/{insight_id}`
Get a single insight by ID.

### `PATCH /api/v1/insights/{insight_id}`
Mark an insight as read/unread.

**Request:**
```json
{"is_read": true}
```

---

## Progress

### `GET /api/v1/pets/{pet_id}/progress/frequency`
Get behavior frequency data for charts.

**Query Parameters:**
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| days | int | 30 | Number of days to include |

### `GET /api/v1/pets/{pet_id}/progress/severity-trend`
Get severity trend over time.

### `GET /api/v1/pets/{pet_id}/progress/category-breakdown`
Get behavior category distribution.

### `GET /api/v1/pets/{pet_id}/progress/dashboard`
Compact dashboard summary combining frequency, trends, and breakdowns.

---

## Coaching

### `POST /api/v1/pets/{pet_id}/coaching`
Get AI-powered behavior coaching advice.

**Request:**
```json
{
  "question": "How can I stop my cat from scratching the couch?"
}
```

**Response 200:**
```json
{
  "response": "Based on Luna's behavior logs, the couch scratching appears to be...",
  "source": "ai"
}
```

Falls back to generic advice if `ANTHROPIC_API_KEY` is not configured (returns `"source": "fallback"`).

---

## Phase 2 Endpoints (Planned)

### BIPs
- `POST /api/v1/pets/{pet_id}/bips` -- Generate behavior intervention plan
- `GET /api/v1/pets/{pet_id}/bips` -- List BIPs
- `GET /api/v1/pets/{pet_id}/bips/{bip_id}` -- Get BIP detail

### Households
- `POST /api/v1/households` -- Create household
- `POST /api/v1/households/{id}/interactions` -- Log inter-pet interaction
- `GET /api/v1/households/{id}/harmony-score` -- Get harmony score

### Vet Reports
- `POST /api/v1/pets/{pet_id}/vet-reports/generate` -- Generate PDF report
- `GET /api/v1/pets/{pet_id}/vet-reports` -- List reports

### Notifications
- `POST /api/v1/notifications/register` -- Register push token
- `GET /api/v1/notifications/preferences` -- Get notification settings
