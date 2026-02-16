# Skill: Security & Privacy

## Purpose
Define security practices, authentication flows, data privacy controls, and compliance requirements for PawLogic.

## Authentication Architecture

### Supabase Auth Flow
```
Mobile App                    Supabase Auth              FastAPI Backend
    │                              │                          │
    ├─── Sign up (email/pw) ──────>│                          │
    │<── JWT + refresh token ──────│                          │
    │                              │                          │
    ├─── API request + JWT ────────────────────────────────>  │
    │                              │  ◄── Verify JWT secret ──│
    │                              │  ──► User ID extracted ──│
    │<── Response ─────────────────────────────────────────── │
```

### JWT Verification (Backend)
```python
# app/middleware/auth.py
from jose import jwt, JWTError

async def verify_supabase_jwt(token: str) -> dict:
    """Verify Supabase JWT and extract user claims."""
    try:
        payload = jwt.decode(
            token,
            settings.SUPABASE_JWT_SECRET,
            algorithms=["HS256"],
            audience="authenticated"
        )
        return payload
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
```

### Auth Providers (MVP)
- Email/password (required)
- Apple Sign-In (required for iOS App Store)
- Google Sign-In (Android + optional iOS)

## API Security

### Request Validation
- All endpoints require valid JWT (except /health)
- Rate limiting per user tier (free: 100/hr, premium: 1000/hr)
- Request body size limit: 1MB
- File upload size limit: 10MB (pet photos)

### CORS Configuration
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,  # Explicit origins only
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["Authorization", "Content-Type"],
)
```

### Input Sanitization
- All user text input sanitized before storage (strip HTML/scripts)
- ABC log tags validated against allowed taxonomy
- SQL injection prevented by SQLAlchemy parameterized queries
- No raw string interpolation in database queries

## Data Privacy

### User Data Classification
| Data Type | Sensitivity | Encryption | Retention |
|-----------|------------|------------|-----------|
| Email/password | High | Supabase managed (bcrypt) | Account lifetime |
| Pet profiles | Medium | At rest (Supabase) | Account lifetime |
| ABC logs | Medium | At rest (Supabase) | Account lifetime |
| AI insights | Low | At rest (Supabase) | 1 year |
| Push tokens | Medium | At rest | Until deregistered |
| Usage analytics | Low | At rest | 2 years |

### Data Deletion
- Account deletion removes all user data within 30 days
- Individual pet deletion cascades to ABC logs, insights, BIPs
- Implement GDPR Article 17 "right to erasure" endpoint
- Data export endpoint (GDPR Article 20 "right to portability")

### Privacy by Design
- Collect minimum necessary data
- No location tracking (location field in ABC logs is optional free-text)
- No camera access beyond pet photo upload
- No contacts access
- No advertising SDKs in MVP
- AI prompts never contain identifying information beyond pet name/species

## Secrets Management

### Environment Variables (Never Committed)
```
SUPABASE_JWT_SECRET      # Supabase auth verification
SUPABASE_SERVICE_KEY     # Backend admin access to Supabase
ANTHROPIC_API_KEY        # Claude API access
ONESIGNAL_API_KEY        # Push notification service
DATABASE_URL             # PostgreSQL connection string
REDIS_URL                # Redis connection string
SENTRY_DSN               # Error monitoring
```

### Secret Storage
- **Local dev:** `.env` file (in `.gitignore`)
- **CI/CD:** GitHub Actions secrets
- **Railway:** Railway environment variables (encrypted)
- **AWS (scale):** AWS Secrets Manager

## Mobile Security
- Store JWT in expo-secure-store (iOS Keychain / Android Keystore)
- Certificate pinning for API communication (production builds)
- Disable debug logging in production builds
- ProGuard/R8 obfuscation for Android release builds
- No sensitive data in AsyncStorage (use SecureStore)

## Dependency Security
- Run `npm audit` and `pip audit` in CI pipeline
- Dependabot enabled for GitHub repository
- Pin major versions in requirements.txt and package.json
- Review dependency licenses for compatibility

## Incident Response
1. Rotate compromised secrets immediately
2. Notify affected users within 72 hours (GDPR requirement)
3. Document incident timeline and root cause
4. Implement preventive measures
5. Post-mortem review
