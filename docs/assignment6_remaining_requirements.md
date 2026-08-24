# Assignment 6 Remaining Requirements

## Status

| Requirement | Status | Evidence or limitation |
|---|---|---|
| CSP reporting and advanced headers | Implemented and tested | `backend/src/app.js`, `backend/test/security.test.js` |
| Strict CORS and production HSTS | Implemented and tested | Production origins are environment-configured; HSTS is production-only |
| API gateway layer | Implemented and tested | Request ID and gateway middleware in `backend/src/middleware/apiGatewayMiddleware.js` |
| Redis cache and invalidation | Implemented, local fallback tested | Live Redis hit/miss and failure behavior require Redis |
| Distributed role rate limits | Implemented, live Redis unverified | Admin 1000/min, teacher 500/min, student 100/min |
| BullMQ notification/batch queues | Configured, processing unverified | Requires live Redis and application handlers |
| Retry and circuit breaker | Implemented and tested | `backend/src/utils/reliability.js` |
| Health/readiness/liveness | Implemented and tested | `/health`, `/ready`, `/live` |
| Graceful shutdown | Implemented, process-level verification pending | Requires running server and signal test |
| Docker multi-stage builds | Configured | Docker engine validation depends on local Docker installation |
| Compose app/DB/Redis/Nginx | Configured | MySQL is active; PostgreSQL is migration profile only |
| GitHub Actions | Configured | Staging deployment target still requires provider-specific setup |
| Trivy | Configured | Runs in GitHub Actions |
| SonarQube | Configured conditionally | Requires `SONAR_TOKEN` and `SONAR_HOST_URL` secrets |
| Comprehensive testing | Partially implemented | 32 local backend tests; live Redis, queue, container, and CI tests remain |
| Documentation | Implemented | See architecture/security documentation and this status file |

## External setup required

- Set `REDIS_URL` to a reachable Redis instance to verify distributed cache, rate limits, and BullMQ workers.
- Configure Docker and run `docker compose --env-file .env.example config` before deployment.
- Add `SONAR_TOKEN` and `SONAR_HOST_URL` as GitHub Secrets for Sonar analysis.
- Add provider-specific staging deployment credentials and workflow steps after choosing a hosting provider.
- Migrate the application from MySQL to PostgreSQL before enabling the Compose PostgreSQL profile.
