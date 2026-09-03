-- Student first-login password policy
-- Run this once against an existing database.

USE student_management;

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS must_change_password BOOLEAN NOT NULL DEFAULT FALSE;

-- Existing student accounts are considered already initialized.
-- Newly created/imported students are marked TRUE by the application.
