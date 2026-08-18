-- =====================================================
-- Migration: Add missing columns to teachers table
-- Run this ONLY if your teachers table is missing:
--   name, department, subject, bio columns
-- (Check first with: DESCRIBE teachers;)
-- =====================================================

USE student_management;

-- Add all missing columns in one statement
ALTER TABLE teachers
    ADD COLUMN name VARCHAR(100) AFTER user_id,
    ADD COLUMN department VARCHAR(100) AFTER name,
    ADD COLUMN subject VARCHAR(100) AFTER department,
    ADD COLUMN bio TEXT AFTER phone;

-- Backfill 'name' from users table
UPDATE teachers t
JOIN users u ON u.id = t.user_id
SET t.name = u.name
WHERE t.name IS NULL OR t.name = '';

-- Backfill 'department' from departments table via department_id
UPDATE teachers t
JOIN departments d ON d.id = t.department_id
SET t.department = d.name
WHERE t.department IS NULL OR t.department = '';
