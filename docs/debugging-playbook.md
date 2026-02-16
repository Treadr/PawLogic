# PawLogic Debugging Playbook

## Quick Reference: Where to Look

| Symptom | First Check | Second Check | Third Check |
|---------|------------|-------------|------------|
| App crash on launch | Sentry mobile errors | Metro bundler output | app.config.ts env vars |
| API returns 500 | FastAPI console logs | Sentry backend errors | Database connectivity |
| Auth not working | Supabase dashboard logs | JWT secret mismatch | Token expiry/refresh |
| Data not appearing | API response in network tab | RLS policies | Database query direct |
| AI insights wrong | Raw Claude response logs | Prompt template | Input data quality |
| Charts blank | API response shape | Victory Native data format | Date range filter |
| Slow performance | Database query EXPLAIN | Missing indexes | N+1 query patterns |
| Push not received | OneSignal dashboard | Device token registration | Notification permissions |

## Layer-by-Layer Debugging

### Mobile App
```
1. Check Metro bundler terminal for errors
2. Check React Native Debugger / Flipper for:
   - Network requests (API calls, responses)
   - Component state (Zustand stores)
   - Console errors
3. Check Sentry for crash reports with stack traces
4. Check AsyncStorage for cached data state
5. Common fixes:
   - npx expo start --clear (clear cache)
   - rm -rf node_modules && npm install
   - Check app.config.ts for correct env vars
```

### Backend API
```
1. Check uvicorn console output for stack traces
2. Check /health/detailed for component status
3. Use Swagger UI (/docs) to test endpoints directly
4. Check database state via Supabase Studio SQL editor
5. Check Redis connection for Celery worker issues
6. Common fixes:
   - Verify .env file has correct values
   - Run alembic upgrade head (schema out of sync)
   - Restart uvicorn (reload doesn't always catch everything)
```

### Database
```
1. Check Supabase Studio for table data
2. Run queries directly in SQL editor
3. Test RLS: query as specific user vs service role
4. Check Alembic migration history: alembic history
5. Common fixes:
   - alembic upgrade head (pending migrations)
   - Check RLS policies if data seems missing
   - Verify foreign key references exist
```

### AI Integration
```
1. Log the full prompt sent to Claude
2. Log the raw response from Claude
3. Check if response matches expected Pydantic schema
4. Check Anthropic dashboard for API errors/rate limits
5. Common fixes:
   - Increase timeout for complex requests
   - Reduce input token count (limit log entries)
   - Update prompt if model behavior changed
```

## Common Bug Patterns

### "It Works Locally But Not in Staging"
- Environment variable missing or different value
- Database migration not applied to staging
- CORS not configured for staging domain
- API URL hardcoded instead of using environment config

### "Data Disappears After Refresh"
- Optimistic update not synced (check offline queue)
- RLS policy blocking read after write
- Cache invalidation timing issue

### "AI Says Something Wrong"
- Check if enough log data exists (minimum 10)
- Check if analytics pre-summary is accurate
- Check if prompt has correct pet context
- Look at raw logs -- does the data actually support a pattern?

### "Performance Suddenly Degraded"
- New query pattern without index
- Data volume grew past a threshold
- Background job consuming resources
- External API (Claude) slower than usual

## Tools for Each Layer

| Layer | Local Debug | Production Debug |
|-------|-----------|-----------------|
| Mobile | React Native Debugger, Flipper, console.log | Sentry, Expo error logs |
| Backend | uvicorn --reload, pdb/breakpoint(), /docs | Railway logs, Sentry |
| Database | Supabase Studio, psql | Supabase dashboard, pg_stat_statements |
| AI | Print prompt/response, Anthropic console | Logged prompt/response pairs, usage dashboard |
| Infrastructure | docker-compose logs | Railway metrics, health endpoints |

## Escalation Path
1. **Self-diagnose** using this playbook
2. **Check session notes** for known issues
3. **Ask debug-agent** for systematic investigation
4. **Escalate to orchestrator** if blocked > 1 session
5. **Escalate to user** if architectural decision needed

See `agents/debug-agent.md` for the full debugging agent workflow and bug report template.
