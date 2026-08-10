# Jira board plan

Board type: Kanban. Columns: To Do → In Progress → In Review → Done.

## Epic: Database & Schema
- Design final schema (departments, students, courses, student_courses)
- Write schema.sql with FKs and seed data
- Draw ER diagram
- Verify relationships (1→many, many→many) against sample queries

## Epic: Backend API
- Add phone + department_id to students, remove text department field
- Build departments CRUD (model, controller, routes)
- Build courses CRUD (model, controller, routes)
- Build course-assignment endpoint (student_courses)
- Implement soft delete on students
- Add GET /students/department/:dept
- Add GET /students/count
- Add 400 validation for missing name/email
- Update logger to record status code via res.on('finish')
- Manually test every endpoint with curl/Postman

## Epic: Frontend
- Build student list view with loading/success/error/empty states
- Build add/edit student form
- Build department filter dropdown
- Build department/course overview panel
- Build course-assignment UI per student
- Wire all views to real API endpoints
- Responsive layout check (mobile width)

## Epic: QA & Documentation
- Write and run unit tests
- Write and run integration tests
- Write and run E2E tests (see docs/test_plan.md)
- Collect screenshots as evidence
- Assemble final PDF report
- Final repo cleanup + README

## Suggested initial assignment (adjust to your actual 5 people)
- Person A: Database & Schema epic, then joins Backend API epic
- Person B: Backend API epic (endpoints, validation, logger)
- Person C: Frontend — student list/form/filter
- Person D: Frontend — department/course panel, course assignment UI, responsive pass
- Person E (leader): Repo/board setup, QA & Documentation epic, integration checks
