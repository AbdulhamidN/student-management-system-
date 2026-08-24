# Assignment 6 Security and Architecture

## Implemented controls

- Helmet security headers, CSP reporting, strict production CORS, and production HSTS.
- JWT access tokens with session IDs, rotated hashed refresh tokens, revocation, logout, logout-all, and session listing/revocation.
- TOTP MFA with encrypted secret storage and verification rate limiting.
- RBAC plus reusable permission policies and student object ownership/department checks.
- Optional Redis cache with TTL and invalidation for active students.
- Optional Redis-backed role rate limits: admin 1000/min, teacher 500/min, student 100/min.
- Request ID gateway middleware and health endpoints: `/health`, `/live`, `/ready`.
- BullMQ notification and batch queue definitions with exponential retry configuration.
- Retry helper limited to transient errors and an Opossum circuit-breaker factory.
- Graceful shutdown closes HTTP, Redis, queue, and MySQL resources.
- Multi-stage Docker images, non-root backend container, image health checks, and CI scanning configuration.

## Architecture

The current application is a single Express service. The gateway middleware provides request correlation and in-process routing policy; Nginx is the container edge gateway. Redis is optional locally and required for distributed rate limiting and queue processing.

The active application database is MySQL because the existing driver, schema, and models use `mysql2`. Compose includes PostgreSQL only under the `postgres-migration` profile. The application must be migrated to PostgreSQL and a compatible driver before that profile can replace MySQL.

## Attack surface and trust boundaries

| Entry point | Trust boundary | Control |
|---|---|---|
| React browser | Untrusted client to API | CORS, JWT/session checks, validation |
| `/api/auth/*` | Public to identity service | Rate limits, lockout, MFA, secure cookies |
| Admin resource APIs | Authenticated client to data layer | RBAC, permission checks, object policies |
| Student import upload | Untrusted file to parser/database | Size/type checks, bounded parser |
| Nginx/container edge | Network to application | Proxy headers, isolated app port |
| MySQL/Redis/queue | Application to infrastructure | Environment credentials, health checks |

## Risks and limitations

| Risk | Severity | Status | Mitigation |
|---|---|---|---|
| MySQL remains the active database while PostgreSQL is only a profile | High | Open | Complete a deliberate driver and migration project before switching |
| Redis is optional in local mode | Medium | Accepted | Production rate limiting fails safely when Redis is unavailable |
| CI deployment is not configured for a specific hosting provider | Medium | Open | Add staging credentials and deployment target as GitHub Secrets |
| Frontend retains legacy local access-token storage for compatibility | Medium | Open | Complete migration to cookie-backed access state |
| CSP still permits inline styles for current frontend compatibility | Medium | Accepted | Remove inline-style dependencies in a future UI hardening pass |

## Required environment variables

`DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `JWT_SECRET`, `MFA_ENCRYPTION_KEY`, `REDIS_URL`, `FRONTEND_URL`, `ACCESS_TOKEN_EXPIRES_IN`, and `REFRESH_TOKEN_EXPIRES_DAYS`.

Compose additionally requires `DB_ROOT_PASSWORD`. The PostgreSQL migration profile requires `POSTGRES_USER` and `POSTGRES_PASSWORD`.

## GitHub Secrets

Configure `SONAR_TOKEN`, `SONAR_HOST_URL`, and deployment-specific staging credentials only in repository or environment secrets. Never place credentials in workflow files or images.

## Verification commands

```bash
cd backend
npm test
cd ../frontend
npm run build
cd ..
docker compose config
```

Run locally:

```bash
cd backend
npm install
npm run dev
```

```bash
cd frontend
npm install
npm start
```

Run containers:

```bash
copy .env.example .env
# Fill required values in .env
 docker compose up --build
```

## Test evidence

The backend suite covers authentication, MFA, refresh rotation, sessions, RBAC/ABAC/IDOR, headers/CORS, health/gateway behavior, queue no-Redis behavior, retry, and circuit-breaker states. Redis-backed cache/rate-limit and BullMQ processing require a running Redis service for integration verification.
