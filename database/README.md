# Database Setup

There are two SQL files:

- `schema.sql` — complete schema for a fresh database.
- `admin_user_management_migration.sql` — upgrade script for an existing project database.

The final schema includes:

- `departments`
- `users`
- `students`
- `teachers`
- `courses`
- `student_courses`
- `teacher_courses`
- `announcements`

Student and teacher login identities live in `users`, while their academic profiles live in `students` and `teachers`.

## Existing database upgrade

If you already have the project database and do not want to delete your data, run:

1. `admin_user_management_migration.sql`
2. `student_first_login_password_migration.sql` (safe to run after step 1; it is retained for compatibility)

The first migration now also adds `users.must_change_password`, which is required by the authentication middleware. Without this column, authenticated API requests can fail with `Authentication failed.`.
