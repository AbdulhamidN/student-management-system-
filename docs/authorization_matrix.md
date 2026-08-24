# Endpoint Authorization Matrix

| Endpoint | Function policy | Object/attribute policy |
|---|---|---|
| `POST /api/auth/register` | Public | Registration validator; admin self-registration denied |
| `POST /api/auth/login` | Public, rate-limited | Active, unlocked account |
| `POST /api/auth/refresh` | Public cookie endpoint | Valid, non-revoked refresh session |
| `GET /api/auth/me` | Authenticated user | Current authenticated identity |
| `POST /api/auth/logout` | Authenticated user | Current session only |
| `POST /api/auth/logout-all` | Authenticated user | Sessions owned by current user |
| `GET /api/auth/sessions` | Authenticated user | Sessions owned by current user |
| `DELETE /api/auth/sessions/:sessionId` | Authenticated user | Session must belong to current user |
| `GET /api/announcements` | Public | Published announcements only |
| `GET /api/protected/admin-only` | Admin permission | None |
| `GET /api/protected/teacher-only` | Teacher permission | Teacher role |
| `GET /api/protected/student-only` | Student permission | Student role |
| `GET /api/students` and `/count` | Admin | Collection is not widened without safe filtering |
| `GET /api/students/:id` | Admin, student, or teacher permission | Student owns record, or teacher department matches |
| `GET /api/students/:id/courses` | Admin, student, or teacher permission | Same student object policy |
| Student writes/import/course mutations | Admin | Admin function policy; resource existence checked by controllers/models |
| Teacher CRUD and course reads | Admin | Admin function policy |
| Course CRUD and assignment | Admin | Admin function policy |
| Department CRUD | Admin | Admin function policy |

All unmatched protected requests are denied by the permission middleware. Admin RBAC remains in place for existing management operations.