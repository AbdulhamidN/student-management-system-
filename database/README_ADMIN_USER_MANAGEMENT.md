# Admin User Management Database Setup

If this project database was created before the new Admin Student/Teacher feature, run:

`admin_user_management_migration.sql`

For a new database, run `schema.sql` instead.

## Excel import columns

The first worksheet should contain these headers:

- `name` (required)
- `email` (required)
- `phone` (optional)
- `department` (optional: CS, IT, IS or full department name)

Courses are intentionally assigned from the Admin Students page after import. This prevents an invalid course/department combination.
