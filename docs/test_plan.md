# Test Plan — Student Management System

Fill in "Actual result" and "Pass/Fail" as tests are run. Attach screenshots where noted.

## Unit tests (individual functions)

| # | Test case | Steps | Expected result | Actual | Pass/Fail |
|---|---|---|---|---|---|
| U1 | `createStudent` model builds correct SQL values | Call `createStudent({name,email,phone,department_id})` with mock pool | INSERT called with 4 values in correct order | | |
| U2 | `countActiveStudents` excludes soft-deleted | Seed 2 active + 1 soft-deleted student, call function | Returns 2 | | |
| U3 | Controller returns 400 on missing name | Call `createStudent` controller with `{email:"a@a.com"}` | Response status 400, success:false | | |
| U4 | Controller returns 400 on missing email | Call `createStudent` controller with `{name:"Abel"}` | Response status 400 | | |
| U5 | Duplicate course assignment rejected | Call `assignCourseToStudent` twice with same ids | Second call returns 409 | | |

## Integration tests (API + database)

| # | Test case | Steps | Expected result | Actual | Pass/Fail |
|---|---|---|---|---|---|
| I1 | Create student persists to DB | POST /api/students with valid body, then GET /api/students/:id | New row exists with correct fields | | |
| I2 | Soft delete does not remove row | DELETE /api/students/:id, then query DB directly | Row still exists, is_deleted=1 | | |
| I3 | getAllStudents excludes deleted | Soft-delete one student, GET /api/students | Deleted student absent from response | | |
| I4 | Department filter returns correct subset | GET /api/students/department/:id | Only students with that department_id returned | | |
| I5 | Course assignment writes to junction table | POST /api/courses/assign, query student_courses table | Row exists with correct student_id/course_id | | |
| I6 | Duplicate email rejected at DB level | POST /api/students twice with same email | Second request returns 409 | | |

## End-to-end tests (full user workflow through the UI)

| # | Test case | Steps | Expected result | Actual | Pass/Fail |
|---|---|---|---|---|---|
| E1 | Create a student via UI | Fill form, click "Add student" | Success message shown, student appears in table, count increments | | |
| E2 | Update a student via UI | Click Edit, change phone, Save | Table reflects new phone, success message shown | | |
| E3 | Soft-delete a student via UI | Click Delete, confirm | Student disappears from list, count decrements | | |
| E4 | Filter by department | Select a department from dropdown | Table shows only students in that department | | |
| E5 | Assign a course to a student | Select course in row, click Add | Course pill appears next to student, assign dropdown updates | | |
| E6 | Loading state visible | Throttle network, reload page | "Loading students…" message shown before data appears | | |
| E7 | Invalid input rejected | Submit form with empty email | Inline/API error shown, no student created | | |
| E8 | Empty state | Filter by a department with no students | "No students found." message shown | | |
| E9 | API/server error handled | Stop backend server, try to load students | Error message shown, no crash/blank page | | |

## Evidence checklist
- Screenshot of the running frontend with the student table populated
- Screenshot of a validation error (400) in the UI
- Screenshot of Postman/curl output for at least 3 endpoints
- Screenshot of the student_courses table after an assignment
