# Admin User Management — Final Setup

## Scope

This feature provides the Admin with full management of students and teachers:

- Add individual students.
- Import students from `.xlsx` or `.csv` (up to 5,000 rows, 5 MB file size).
- Assign a department and department-valid courses to students.
- Add, edit, and deactivate teachers.
- Assign a department and department-valid courses to teachers.
- Create login accounts for newly created/imported students and teachers.
- Protect Admin management endpoints with JWT authentication and Admin role authorization.

## Academic structure

- CS: OOP, DSA, DB
- IT: IP, Web, OS
- IS: CP, Information Organization, Emerging

## Database

For a new database, run:

```sql
SOURCE database/schema.sql;
```

For an existing project database, run:

```sql
SOURCE database/admin_user_management_migration.sql;
```

The migration does not drop existing data. It adds the `teachers` and `teacher_courses` tables and connects student profiles to `users` through `students.user_id`.

## Backend

The upload endpoint is:

```text
POST /api/students/import
```

It expects `multipart/form-data` with a file field named `file`.

The spreadsheet must contain:

```text
name,email,phone,department
```

Only `name` and `email` are required. Department values should be `CS`, `IT`, or `IS`.

The project uses a dependency-free upload middleware and XLSX/CSV parser, so no extra npm package is required for Excel import. `backend/package.json` and `backend/package-lock.json` remain synchronized.

## Admin API

### Students

```text
GET    /api/students
POST   /api/students
POST   /api/students/import
GET    /api/students/count
GET    /api/students/:id
PUT    /api/students/:id
DELETE /api/students/:id
GET    /api/students/:id/courses
PUT    /api/students/:id/courses
POST   /api/students/:id/courses
DELETE /api/students/:id/courses/:courseId
```

### Teachers

```text
GET    /api/teachers
POST   /api/teachers
GET    /api/teachers/:id/courses
PUT    /api/teachers/:id
DELETE /api/teachers/:id
```

All of the above management routes require a valid JWT and `admin` role.

## Temporary credentials

When an Admin creates a student or teacher, the backend generates a random temporary password and stores only its bcrypt hash. The temporary password is returned once to the Admin UI so it can be handed to the account owner.

For production, add a forced-password-change flow before giving the system to real users.

## Local development

Backend:

```bash
cd backend
npm install
npm run dev
```

Frontend:

```bash
cd frontend
npm install
npm start
```

The default API URL is `http://localhost:5000/api`. It can be overridden with `REACT_APP_API_URL`.

## Fresh admin login

The fresh schema seeds:

```text
Email: admin@example.com
Password: Admin@123
```

Change this account/password before production deployment.
