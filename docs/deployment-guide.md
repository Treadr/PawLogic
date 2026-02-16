# PawLogic Deployment Guide

## Environments

| Environment | Backend | Database | Mobile | Purpose |
|-------------|---------|----------|--------|---------|
| Local | localhost:8000 | Supabase local | Expo Go | Development |
| Staging | Railway staging | Supabase staging | Internal build | Pre-production validation |
| Production | Railway prod | Supabase prod | App Store / Play Store | Live users |

## Deployment Procedures

### Backend → Staging
```bash
# 1. Ensure all tests pass
cd backend && pytest tests/ -v

# 2. Apply database migrations to staging
ENVIRONMENT=staging alembic upgrade head

# 3. Deploy to Railway staging
railway up --environment staging

# 4. Verify
curl https://staging-api.pawlogic.app/health
```

### Backend → Production
```bash
# 1. Staging has been validated
# 2. All tests pass
# 3. PR merged to main

# 4. Apply database migrations to production
ENVIRONMENT=production alembic upgrade head

# 5. Deploy to Railway production
railway up --environment production

# 6. Verify health
curl https://api.pawlogic.app/health
curl https://api.pawlogic.app/health/detailed

# 7. Monitor Sentry for 15 minutes
# If error rate spikes: railway rollback
```

### Mobile → TestFlight / Internal Testing
```bash
# 1. All mobile tests pass
cd mobile && npx jest --ci

# 2. Increment version
# Edit app.config.ts: version and buildNumber

# 3. Build
eas build --platform all --profile preview

# 4. Distribute
# iOS: Automatically appears in TestFlight
# Android: Download from EAS dashboard or internal track
```

### Mobile → App Store / Play Store
```bash
# 1. Production build
eas build --platform all --profile production

# 2. Submit
eas submit --platform ios
eas submit --platform android

# 3. Monitor review status
# App Store Connect / Google Play Console
```

### OTA Update (JavaScript-Only Changes)
```bash
eas update --branch production --message "Fix insight card rendering"
```

## Rollback Procedures
See `skills/deployment.md` for detailed rollback instructions.

**Quick reference:**
- **Backend:** `railway rollback` (instant)
- **Mobile OTA:** Push a new update reverting the change
- **Mobile binary:** Cannot rollback -- push a hotfix build forward
- **Database:** `alembic downgrade -1` (test in staging first)

## Pre-Deployment Checklist
- [ ] All tests passing in CI
- [ ] Code reviewed and approved
- [ ] Database migrations tested on staging
- [ ] Environment variables verified for target environment
- [ ] No known critical bugs in current build
- [ ] Rollback plan identified

## Monitoring After Deploy
- Check Sentry for new errors (15-minute window)
- Check Railway metrics for latency/memory anomalies
- Check Supabase dashboard for DB connection issues
- Verify health check endpoint returns 200
