# PawLogic Database Schema

## Entity Relationship Diagram

```
┌─────────────┐     ┌──────────────┐     ┌──────────────┐
│   users      │     │    pets       │     │  abc_logs     │
│─────────────│     │──────────────│     │──────────────│
│ id (PK)     │◄───┤ user_id (FK) │◄───┤ pet_id (FK)  │
│ email       │     │ id (PK)      │     │ user_id (FK) │
│ display_name│     │ name         │     │ id (PK)      │
│ sub_tier    │     │ species      │     │ antecedent_* │
│ created_at  │     │ breed        │     │ behavior_*   │
│ updated_at  │     │ age_years    │     │ consequence_*│
└─────────────┘     │ age_months   │     │ occurred_at  │
                    │ weight_lbs   │     │ severity     │
                    │ sex          │     │ location     │
                    │ is_neutered  │     │ created_at   │
                    │ temperament[]│     └──────────────┘
                    │ photo_url    │
                    │ created_at   │     ┌──────────────┐
                    │ updated_at   │     │  insights     │
                    └──────┬───────┘     │──────────────│
                           │             │ pet_id (FK)  │
                           ├────────────►│ user_id (FK) │
                           │             │ id (PK)      │
                           │             │ insight_type │
                           │             │ title        │
                           │             │ body         │
                           │             │ confidence   │
                           │             │ function     │
                           │             │ is_read      │
                           │             │ created_at   │
                           │             └──────────────┘
                           │
                           │             ┌──────────────┐
                           │             │    bips       │
                           ├────────────►│──────────────│
                           │             │ pet_id (FK)  │
                           │             │ user_id (FK) │
                           │             │ id (PK)      │
                           │             │ target_behav │
                           │             │ function     │
                           │             │ plan_data {} │
                           │             │ status       │
                           │             │ started_at   │
                           │             │ completed_at │
                           │             └──────────────┘
                           │
                           │             ┌──────────────────┐
                           └────────────►│progress_snapshots│
                                         │──────────────────│
                                         │ pet_id (FK)      │
                                         │ bip_id (FK, opt) │
                                         │ period_start     │
                                         │ period_end       │
                                         │ behavior_count   │
                                         │ severity_avg     │
                                         └──────────────────┘
```

## Phase 2 Additions

```
┌──────────────┐     ┌───────────────────┐     ┌──────────────────┐
│ households    │     │ household_pets    │     │ interactions      │
│──────────────│     │───────────────────│     │──────────────────│
│ id (PK)      │◄───┤ household_id (FK) │     │ household_id (FK)│
│ user_id (FK) │     │ pet_id (FK)       │     │ initiator_pet_id │
│ name         │     │ (composite PK)    │     │ target_pet_id    │
│ created_at   │     └───────────────────┘     │ interaction_type │
└──────────────┘                               │ trigger          │
                                               │ escalation_level │
                                               │ resource_involved│
                                               │ occurred_at      │
                                               └──────────────────┘
```

## Full Table Definitions

See `skills/supabase-database.md` for complete CREATE TABLE statements including:
- All column types and constraints
- CHECK constraints for enums
- Foreign key relationships with ON DELETE behavior
- Array columns for tags

## Indexes

### Performance-Critical Indexes
```sql
-- ABC log queries (most frequent operation)
CREATE INDEX idx_abc_logs_pet_id ON abc_logs(pet_id);
CREATE INDEX idx_abc_logs_occurred_at ON abc_logs(occurred_at DESC);
CREATE INDEX idx_abc_logs_pet_occurred ON abc_logs(pet_id, occurred_at DESC);
CREATE INDEX idx_abc_logs_behavior_cat ON abc_logs(behavior_category);

-- Insight lookups
CREATE INDEX idx_insights_pet_id ON insights(pet_id);
CREATE INDEX idx_insights_type ON insights(insight_type);
CREATE INDEX idx_insights_unread ON insights(pet_id, is_read) WHERE is_read = false;

-- Progress queries
CREATE INDEX idx_progress_pet_period ON progress_snapshots(pet_id, period_start DESC);

-- Household queries (Phase 2)
CREATE INDEX idx_interactions_household ON interactions(household_id, occurred_at DESC);
CREATE INDEX idx_interactions_pets ON interactions(initiator_pet_id, target_pet_id);
```

## Row Level Security Summary

| Table | Policy | Rule |
|-------|--------|------|
| users | Own data only | `auth.uid() = id` |
| pets | Own pets only | `auth.uid() = user_id` |
| abc_logs | Own logs only | `auth.uid() = user_id` |
| insights | Own insights only | `auth.uid() = user_id` |
| bips | Own BIPs only | `auth.uid() = user_id` |
| progress_snapshots | Via pet ownership | `auth.uid() = (SELECT user_id FROM pets WHERE id = pet_id)` |
| households | Own households | `auth.uid() = user_id` |
| interactions | Via household | `auth.uid() = (SELECT user_id FROM households WHERE id = household_id)` |

## Enum Values

### species
`'cat'`, `'dog'`

### sex
`'male'`, `'female'`, `'unknown'`

### subscription_tier
`'free'`, `'premium'`, `'professional'`

### insight_type
`'pattern'`, `'function'`, `'correlation'`, `'recommendation'`

### behavior_function
`'attention'`, `'escape'`, `'tangible'`, `'sensory'`

### bip_status
`'active'`, `'paused'`, `'completed'`, `'archived'`

### interaction_type (Phase 2)
`'positive'`, `'neutral'`, `'negative'`, `'avoidance'`

## Data Retention
- **User data:** Lifetime of account
- **ABC logs:** Lifetime of account (user can delete individually)
- **Insights:** 1 year (auto-archive older insights)
- **Progress snapshots:** Lifetime of account
- **Deleted accounts:** All data purged within 30 days

## Migration Naming Convention
```
YYYY_MM_DD_HHMM_description.py

Example:
2026_02_16_1400_create_users_table.py
2026_02_16_1401_create_pets_table.py
2026_02_16_1402_create_abc_logs_table.py
2026_02_16_1403_create_insights_table.py
2026_02_16_1404_create_bips_table.py
2026_02_16_1405_create_progress_snapshots_table.py
```
