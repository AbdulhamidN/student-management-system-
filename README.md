# Student Management System

Extending an Express + MySQL Student Management API with departments, courses,
a React + Tailwind frontend, and full testing/documentation.

## Current state (initial setup)

This is the original starter backend, untouched, plus project scaffolding.
Only the `students` table and basic CRUD exist right now. Everything else —
departments, courses, soft delete, frontend, tests — is added through
feature branches, reviewed via pull request, and merged into `main` once working.

## Branch workflow

1. Create a branch off `main` named for the feature, e.g. `feature/department-api`.
2. Do the work, commit with clear messages.
3. Push the branch and open a pull request into `main`.
4. At least one other teammate reviews before merging (see branch protection rules below).
5. Merge only once it runs locally without errors.

## Branch protection on `main` (set by repo owner)

- Require a pull request before merging — no direct pushes to `main`.
- Require at least 1 approval before a PR can merge.
- Require the branch to be up to date before merging.
- Do not allow force pushes or branch deletion on `main`.

## Getting started

```
cd backend
npm install
cp .env.example .env      # fill in your own local MySQL credentials
npm start
```

## Project structure

```
backend/     Express + MySQL API — student CRUD now, departments/courses coming via branches
frontend/    React + Vite + Tailwind client (added via feature branch)
database/    SQL schema (added via feature branch)
tests/       unit, integration, e2e (added via feature branches)
docs/        project report, test plan, jira board plan — already in place
```

## Team

| Name | Role |
|---|---|
| | Group Leader |
| | Backend |
| | Backend |
| | Frontend |
| | Frontend |
