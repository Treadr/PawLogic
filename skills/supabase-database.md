# Skill: Supabase + PostgreSQL Database

## Purpose
Design, implement, and maintain the PawLogic database layer using PostgreSQL via Supabase, including authentication, real-time subscriptions, row-level security, and file storage.

## Tech Context
- **Database:** PostgreSQL 15+ (hosted via Supabase)
- **Auth:** Supabase Auth (email/password, OAuth providers)
- **Real-time:** Supabase Realtime for live data sync
- **Storage:** Supabase Storage for pet photos and vet reports
- **Migrations:** Alembic (backend-side) + Supabase migrations (RLS policies)
- **Client:** @supabase/supabase-js v2 (mobile) + asyncpg (backend)

## Database Schema (MVP)

### Core Tables
```sql
-- Users (synced from Supabase Auth)
CREATE TABLE users (
    id UUID PRIMARY KEY REFERENCES auth.users(id),
    email TEXT NOT NULL,
    display_name TEXT,
    subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'premium', 'professional')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Pet profiles
CREATE TABLE pets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    species TEXT NOT NULL CHECK (species IN ('cat', 'dog')),
    breed TEXT,
    age_years INTEGER,
    age_months INTEGER,
    weight_lbs DECIMAL,
    sex TEXT CHECK (sex IN ('male', 'female', 'unknown')),
    is_neutered BOOLEAN DEFAULT false,
    temperament TEXT[],
    medical_notes TEXT,
    photo_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ABC behavior logs (centerpiece)
CREATE TABLE abc_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pet_id UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    -- Antecedent
    antecedent_category TEXT NOT NULL,
    antecedent_tags TEXT[] NOT NULL,
    antecedent_notes TEXT,

    -- Behavior
    behavior_category TEXT NOT NULL,
    behavior_tags TEXT[] NOT NULL,
    behavior_severity INTEGER CHECK (behavior_severity BETWEEN 1 AND 5),
    behavior_notes TEXT,

    -- Consequence
    consequence_category TEXT NOT NULL,
    consequence_tags TEXT[] NOT NULL,
    consequence_notes TEXT,

    -- Metadata
    occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    location TEXT,
    duration_seconds INTEGER,
    other_pets_present UUID[],  -- References to other pet IDs

    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI-generated insights
CREATE TABLE insights (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pet_id UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    insight_type TEXT NOT NULL CHECK (insight_type IN ('pattern', 'function', 'correlation', 'recommendation')),
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    confidence DECIMAL CHECK (confidence BETWEEN 0 AND 1),
    abc_log_ids UUID[],  -- Which logs contributed to this insight
    behavior_function TEXT CHECK (behavior_function IN ('attention', 'escape', 'tangible', 'sensory')),
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Behavior Intervention Plans
CREATE TABLE bips (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pet_id UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    target_behavior TEXT NOT NULL,
    identified_function TEXT NOT NULL,
    plan_data JSONB NOT NULL,  -- Structured plan: steps, reinforcement schedule, criteria
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed', 'archived')),
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Progress tracking snapshots
CREATE TABLE progress_snapshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pet_id UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
    bip_id UUID REFERENCES bips(id),
    period_start TIMESTAMPTZ NOT NULL,
    period_end TIMESTAMPTZ NOT NULL,
    behavior_count INTEGER NOT NULL DEFAULT 0,
    severity_avg DECIMAL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Phase 2 Tables (Multi-Pet)
```sql
-- Households
CREATE TABLE households (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL DEFAULT 'My Household',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Pet-to-household mapping
CREATE TABLE household_pets (
    household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
    pet_id UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
    PRIMARY KEY (household_id, pet_id)
);

-- Inter-pet interactions
CREATE TABLE interactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
    initiator_pet_id UUID NOT NULL REFERENCES pets(id),
    target_pet_id UUID NOT NULL REFERENCES pets(id),
    interaction_type TEXT NOT NULL CHECK (interaction_type IN ('positive', 'neutral', 'negative', 'avoidance')),
    trigger TEXT,
    escalation_level INTEGER CHECK (escalation_level BETWEEN 1 AND 5),
    resource_involved TEXT,
    notes TEXT,
    occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Row Level Security (RLS)
```sql
-- Enable RLS on all tables
ALTER TABLE pets ENABLE ROW LEVEL SECURITY;
ALTER TABLE abc_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE insights ENABLE ROW LEVEL SECURITY;

-- Users can only access their own pets
CREATE POLICY "Users can manage own pets" ON pets
    FOR ALL USING (auth.uid() = user_id);

-- Users can only access logs for their own pets
CREATE POLICY "Users can manage own abc_logs" ON abc_logs
    FOR ALL USING (auth.uid() = user_id);

-- Users can only see their own insights
CREATE POLICY "Users can read own insights" ON insights
    FOR SELECT USING (auth.uid() = user_id);
```

## Indexes
```sql
-- ABC log queries (most frequent)
CREATE INDEX idx_abc_logs_pet_id ON abc_logs(pet_id);
CREATE INDEX idx_abc_logs_occurred_at ON abc_logs(occurred_at DESC);
CREATE INDEX idx_abc_logs_pet_occurred ON abc_logs(pet_id, occurred_at DESC);
CREATE INDEX idx_abc_logs_behavior_cat ON abc_logs(behavior_category);

-- Insight lookups
CREATE INDEX idx_insights_pet_id ON insights(pet_id);
CREATE INDEX idx_insights_type ON insights(insight_type);

-- Progress queries
CREATE INDEX idx_progress_pet_period ON progress_snapshots(pet_id, period_start DESC);
```

## Supabase Auth Configuration
- **Email/password** signup (MVP)
- **Apple Sign-In** (required for iOS App Store)
- **Google Sign-In** (Android + optional iOS)
- Email confirmation enabled
- Password recovery flow via email
- JWT token expiry: 1 hour (auto-refresh via client)

## Supabase Storage Buckets
```
pet-photos/         -- Pet profile images (public read, authenticated write)
vet-reports/        -- Generated PDF reports (private, authenticated read/write)
```

## Migration Strategy
- Use Alembic from the FastAPI backend for schema migrations
- Use Supabase dashboard or CLI for RLS policy management
- Version-control all migrations in `backend/alembic/versions/`
- Never modify production schema without a migration file
- Test migrations against a staging Supabase project first

## Commands Reference
```bash
# Supabase CLI
supabase init                         # Initialize Supabase project
supabase start                        # Start local Supabase
supabase db reset                     # Reset local database
supabase db push                      # Push migrations to remote
supabase migration new "description"  # Create new migration

# Alembic (from backend/)
alembic revision --autogenerate -m "add abc_logs table"
alembic upgrade head
alembic history
```

## Backup Strategy
- Supabase Pro plan includes daily backups
- For MVP: manual pg_dump backups before major migrations
- Export critical data (ABC logs, insights) periodically
