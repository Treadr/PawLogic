# Agent: Database (Supabase + PostgreSQL)

## Role
Design, implement, and maintain the database layer -- schema design, migrations, Row Level Security policies, indexes, Supabase configuration, and data integrity.

## Skills Referenced
- `skills/supabase-database.md` -- Schema design, RLS, indexes, migration strategy
- `skills/security.md` -- Data privacy, encryption, retention policies

## Responsibilities
- Design normalized database schema aligned with feature requirements
- Write and manage Alembic migration files
- Configure Supabase Row Level Security policies
- Design and optimize database indexes for query performance
- Configure Supabase Auth providers (email, Apple, Google)
- Set up Supabase Storage buckets for file uploads
- Monitor query performance and optimize slow queries
- Manage staging vs production database environments

## Working Context

### Directory Ownership
```
backend/
  app/
    models/           # SQLAlchemy model definitions
    db/
      session.py      # Async session factory
      base.py         # SQLAlchemy declarative base
  alembic/
    versions/         # Migration files
    env.py            # Alembic async configuration
  alembic.ini         # Alembic config
```

Plus Supabase dashboard configuration:
- Auth providers
- RLS policies
- Storage buckets
- Edge functions (if needed)

### Key Interfaces This Agent Provides
- **SQLAlchemy models**: Table definitions used by backend-agent
- **Migration files**: Schema changes applied to database
- **RLS policies**: Security rules applied at database level
- **Database connection config**: Session factory for backend-agent

### Key Interfaces This Agent Depends On
- **Feature requirements** (from orchestrator): What data needs to be stored
- **API patterns** (from backend-agent): Query patterns to optimize for

## Implementation Priorities (MVP)

### Priority 1: Supabase Project Setup
1. Create Supabase project (or local via `supabase init`)
2. Configure auth providers (email/password + Apple + Google)
3. Set password policies and email templates
4. Create storage buckets (pet-photos, vet-reports)

### Priority 2: Core Schema
1. Users table (synced from auth.users)
2. Pets table with species/breed/age fields
3. ABC logs table with full antecedent/behavior/consequence structure
4. Indexes for common query patterns

### Priority 3: AI Data Tables
1. Insights table (AI-generated patterns and assessments)
2. BIPs table (Behavior Intervention Plans with JSONB data)
3. Progress snapshots table (pre-computed analytics)

### Priority 4: Security
1. Enable RLS on all tables
2. Write RLS policies (users access only their own data)
3. Test RLS policies with different user contexts
4. Verify cascade deletes work correctly

### Priority 5: Phase 2 Tables
1. Households table
2. Household-pets junction table
3. Interactions table (inter-pet)
4. Introduction protocols table

## Migration Workflow
```
1. database-agent designs schema change
2. Write SQLAlchemy model changes in app/models/
3. Generate migration: alembic revision --autogenerate -m "description"
4. Review generated migration file for correctness
5. Test migration: alembic upgrade head (on local/staging)
6. Test rollback: alembic downgrade -1
7. Commit migration file
8. Apply to staging: alembic upgrade head
9. After staging validation: apply to production
```

## Performance Guidelines
- Add indexes for any column used in WHERE clauses
- Composite indexes for multi-column queries (pet_id + occurred_at)
- Use GIN indexes for array columns (tags)
- EXPLAIN ANALYZE queries that touch > 10K rows
- Connection pooling: max 20 connections per environment
- Use read replicas if query load exceeds single instance (Phase 3)

## Data Seeding
Provide seed data for development:
- 2 test users
- 3 pets per user (mix of cats and dogs)
- 30 ABC logs per pet with realistic patterns
- 5 insights per pet
- 1 active BIP per pet

## Coordination Notes
- Schema must be designed and migrated BEFORE backend-agent builds endpoints
- Provide SQLAlchemy model files to backend-agent
- Coordinate with security skill for RLS policy design
- Notify backend-agent when migrations are ready to apply
- Coordinate with analytics-agent on query optimization for analytics functions
