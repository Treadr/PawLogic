# PawLogic API Specification

## Base URL
- **Local:** `http://localhost:8000/api/v1`
- **Staging:** `https://staging-api.pawlogic.app/api/v1`
- **Production:** `https://api.pawlogic.app/api/v1`

## Authentication
All endpoints except `/health` require a valid Supabase JWT in the Authorization header:
```
Authorization: Bearer <supabase_jwt_token>
```

## Response Format
### Success
```json
{
  "data": { ... }
}
```

### Success (List)
```json
{
  "data": [ ... ],
  "meta": {
    "page": 1,
    "per_page": 20,
    "total": 150,
    "total_pages": 8
  }
}
```

### Error
```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable description",
    "details": {}
  }
}
```

---

## Health Check

### `GET /health`
No auth required. Returns service status.
```json
{ "status": "healthy", "version": "1.0.0" }
```

### `GET /health/detailed`
Returns component-level status.
```json
{
  "status": "healthy",
  "database": "ok",
  "redis": "ok",
  "version": "1.0.0"
}
```

---

## Auth

### `POST /api/v1/auth/verify`
Verify Supabase JWT and create/sync user record in application database.

**Request:** (JWT in header)

**Response 200:**
```json
{
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "display_name": "Ricker",
    "subscription_tier": "free",
    "created_at": "2026-02-16T00:00:00Z"
  }
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
  "temperament": ["curious", "independent", "playful"],
  "medical_notes": "No known issues"
}
```

**Response 201:**
```json
{
  "data": {
    "id": "uuid",
    "name": "Luna",
    "species": "cat",
    "breed": "Domestic Shorthair",
    "age_years": 3,
    "age_months": 6,
    "weight_lbs": 10.5,
    "sex": "female",
    "is_neutered": true,
    "temperament": ["curious", "independent", "playful"],
    "medical_notes": "No known issues",
    "photo_url": null,
    "created_at": "2026-02-16T00:00:00Z"
  }
}
```

### `GET /api/v1/pets`
List all pets for the authenticated user.

**Response 200:**
```json
{
  "data": [
    { "id": "uuid", "name": "Luna", "species": "cat", "breed": "Domestic Shorthair", ... },
    { "id": "uuid", "name": "Duke", "species": "dog", "breed": "Labrador", ... }
  ]
}
```

### `GET /api/v1/pets/{pet_id}`
Get a single pet's full profile.

### `PUT /api/v1/pets/{pet_id}`
Update pet profile. Partial update (only send changed fields).

### `DELETE /api/v1/pets/{pet_id}`
Delete pet and all associated data (logs, insights, BIPs). **Cascade delete.**

---

## ABC Logs

### `POST /api/v1/pets/{pet_id}/abc-logs`
Create an ABC behavior log entry.

**Request:**
```json
{
  "antecedent_category": "other_animal_present",
  "antecedent_tags": ["dog_nearby", "same_room"],
  "antecedent_notes": "Duke was lying near the couch",
  "behavior_category": "destructive",
  "behavior_tags": ["scratched_furniture"],
  "behavior_severity": 3,
  "behavior_notes": "Scratched the arm of the couch for about 30 seconds",
  "consequence_category": "verbal_reaction",
  "consequence_tags": ["said_no"],
  "consequence_notes": "I said no and moved her to the cat tree",
  "occurred_at": "2026-02-16T14:30:00Z",
  "location": "living room",
  "duration_seconds": 30,
  "other_pets_present": ["duke-uuid"]
}
```

**Response 201:**
```json
{
  "data": {
    "id": "uuid",
    "pet_id": "uuid",
    "antecedent_category": "other_animal_present",
    "antecedent_tags": ["dog_nearby", "same_room"],
    "antecedent_notes": "Duke was lying near the couch",
    "behavior_category": "destructive",
    "behavior_tags": ["scratched_furniture"],
    "behavior_severity": 3,
    "behavior_notes": "Scratched the arm of the couch for about 30 seconds",
    "consequence_category": "verbal_reaction",
    "consequence_tags": ["said_no"],
    "consequence_notes": "I said no and moved her to the cat tree",
    "occurred_at": "2026-02-16T14:30:00Z",
    "location": "living room",
    "duration_seconds": 30,
    "other_pets_present": ["duke-uuid"],
    "created_at": "2026-02-16T14:31:00Z"
  }
}
```

### `GET /api/v1/pets/{pet_id}/abc-logs`
List ABC logs for a pet. Paginated and filterable.

**Query Parameters:**
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| page | int | 1 | Page number |
| per_page | int | 20 | Items per page (max 100) |
| start_date | datetime | null | Filter: logs after this date |
| end_date | datetime | null | Filter: logs before this date |
| behavior_category | string | null | Filter by behavior category |
| severity_min | int | null | Filter: minimum severity |

### `GET /api/v1/pets/{pet_id}/abc-logs/{log_id}`
Get a single ABC log entry.

### `DELETE /api/v1/pets/{pet_id}/abc-logs/{log_id}`
Delete a single ABC log entry.

---

## Insights

### `POST /api/v1/pets/{pet_id}/insights/generate`
Trigger AI analysis for a pet. Requires 10+ ABC logs. Returns immediately with job ID; analysis runs in background.

**Response 202:**
```json
{
  "data": {
    "job_id": "uuid",
    "status": "processing",
    "message": "Analysis started. Results will appear in your insights."
  }
}
```

**Error 400** (insufficient data):
```json
{
  "error": {
    "code": "INSUFFICIENT_DATA",
    "message": "Luna needs at least 10 behavior logs before we can identify patterns. She currently has 7.",
    "details": { "current_count": 7, "required_count": 10 }
  }
}
```

### `GET /api/v1/pets/{pet_id}/insights`
List AI-generated insights for a pet. Newest first.

**Query Parameters:**
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| type | string | null | Filter: pattern, function, correlation, recommendation |
| unread_only | bool | false | Only return unread insights |

**Response 200:**
```json
{
  "data": [
    {
      "id": "uuid",
      "pet_id": "uuid",
      "insight_type": "pattern",
      "title": "Couch scratching correlates with Duke's presence",
      "body": "Luna has scratched the couch 8 times in the last 2 weeks. In 7 of those incidents, Duke was in the same room. This suggests the scratching may be stress-related rather than a surface preference.",
      "confidence": 0.85,
      "behavior_function": null,
      "is_read": false,
      "created_at": "2026-02-16T15:00:00Z"
    },
    {
      "id": "uuid",
      "insight_type": "function",
      "title": "Luna's scratching is likely attention-seeking",
      "body": "Based on the consequence patterns, Luna receives attention (verbal or physical) after 80% of scratching incidents. The behavior appears to be maintained by social attention rather than a need for claw maintenance.",
      "confidence": 0.72,
      "behavior_function": "attention",
      "is_read": false,
      "created_at": "2026-02-16T15:00:00Z"
    }
  ]
}
```

### `PUT /api/v1/pets/{pet_id}/insights/{insight_id}/read`
Mark an insight as read.

---

## Progress

### `GET /api/v1/pets/{pet_id}/progress`
Get behavior frequency data for charts.

**Query Parameters:**
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| period | string | "day" | Aggregation: "day", "week", "month" |
| days | int | 30 | Number of days to include |
| behavior_category | string | null | Filter specific behavior |

**Response 200:**
```json
{
  "data": {
    "chart_data": [
      { "date": "2026-02-01", "count": 3, "severity_avg": 2.5 },
      { "date": "2026-02-02", "count": 1, "severity_avg": 1.0 },
      { "date": "2026-02-03", "count": 0, "severity_avg": null }
    ],
    "summary": {
      "total_incidents": 42,
      "trend": "decreasing",
      "trend_percentage": -15.3,
      "most_common_behavior": "scratched_furniture",
      "most_common_antecedent": "dog_nearby",
      "avg_severity": 2.8
    }
  }
}
```

### `GET /api/v1/pets/{pet_id}/progress/summary`
Compact progress summary for dashboard display.

---

## Phase 2 Endpoints (Planned)

### BIPs
- `POST /api/v1/pets/{pet_id}/bips` -- Generate BIP
- `GET /api/v1/pets/{pet_id}/bips` -- List BIPs
- `GET /api/v1/pets/{pet_id}/bips/{bip_id}` -- Get BIP detail
- `PUT /api/v1/pets/{pet_id}/bips/{bip_id}` -- Update BIP status

### Households
- `POST /api/v1/households` -- Create household
- `GET /api/v1/households` -- List households
- `POST /api/v1/households/{id}/interactions` -- Log interaction
- `GET /api/v1/households/{id}/harmony-score` -- Get score
- `GET /api/v1/households/{id}/recommendations` -- AI recommendations

### Vet Reports
- `POST /api/v1/pets/{pet_id}/vet-reports/generate` -- Generate report
- `GET /api/v1/pets/{pet_id}/vet-reports` -- List reports
- `GET /api/v1/pets/{pet_id}/vet-reports/{report_id}/download` -- Download PDF

---

## Rate Limits

| Tier | General API | AI Generation | File Upload |
|------|-------------|--------------|-------------|
| Free | 100/hour | 10/day | 5/day |
| Premium | 1000/hour | Unlimited | 50/day |
| Professional | 5000/hour | Unlimited | Unlimited |

Rate limit headers included in all responses:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 87
X-RateLimit-Reset: 1708099200
```
