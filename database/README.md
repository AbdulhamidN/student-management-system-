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
