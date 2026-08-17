-- =====================================================
-- Admin User Management Migration
-- =====================================================
-- Run this ONCE against an existing student_management database.
-- It upgrades the old project without dropping existing student/course data.

CREATE DATABASE IF NOT EXISTS student_management;
USE student_management;

-- 1. Users: add active flag if the old schema does not have it.
SET @sql = IF(
  (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users' AND COLUMN_NAME = 'is_active') = 0,
  'ALTER TABLE users ADD COLUMN is_active BOOLEAN NOT NULL DEFAULT TRUE AFTER role',
  'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- 2. Students: connect a student profile to the authentication user.
SET @sql = IF(
  (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'students' AND COLUMN_NAME = 'user_id') = 0,
  'ALTER TABLE students ADD COLUMN user_id INT NULL UNIQUE AFTER id',
  'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = IF(
  (SELECT COUNT(*) FROM information_schema.TABLE_CONSTRAINTS WHERE CONSTRAINT_SCHEMA = DATABASE() AND TABLE_NAME = 'students' AND CONSTRAINT_NAME = 'fk_students_user') = 0,
  'ALTER TABLE students ADD CONSTRAINT fk_students_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL',
  'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- 3. Teacher profile and teacher/course relationship.
CREATE TABLE IF NOT EXISTS teachers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    phone VARCHAR(20),
    department_id INT NULL,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS teacher_courses (
    teacher_id INT NOT NULL,
    course_id INT NOT NULL,
    PRIMARY KEY (teacher_id, course_id),
    FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

-- 4. Required departments. Existing unrelated rows are intentionally preserved.
INSERT IGNORE INTO departments (name) VALUES ('CS'), ('IT'), ('IS');

-- 5. Required courses.
INSERT INTO courses (name, code, department_id)
SELECT 'OOP', 'OOP', id FROM departments WHERE name = 'CS'
ON DUPLICATE KEY UPDATE department_id = VALUES(department_id), name = VALUES(name);
INSERT INTO courses (name, code, department_id)
SELECT 'DSA', 'DSA', id FROM departments WHERE name = 'CS'
ON DUPLICATE KEY UPDATE department_id = VALUES(department_id), name = VALUES(name);
INSERT INTO courses (name, code, department_id)
SELECT 'DB', 'DB', id FROM departments WHERE name = 'CS'
ON DUPLICATE KEY UPDATE department_id = VALUES(department_id), name = VALUES(name);
INSERT INTO courses (name, code, department_id)
SELECT 'IP', 'IP', id FROM departments WHERE name = 'IT'
ON DUPLICATE KEY UPDATE department_id = VALUES(department_id), name = VALUES(name);
INSERT INTO courses (name, code, department_id)
SELECT 'Web', 'WEB', id FROM departments WHERE name = 'IT'
ON DUPLICATE KEY UPDATE department_id = VALUES(department_id), name = VALUES(name);
INSERT INTO courses (name, code, department_id)
SELECT 'OS', 'OS', id FROM departments WHERE name = 'IT'
ON DUPLICATE KEY UPDATE department_id = VALUES(department_id), name = VALUES(name);
INSERT INTO courses (name, code, department_id)
SELECT 'CP', 'CP', id FROM departments WHERE name = 'IS'
ON DUPLICATE KEY UPDATE department_id = VALUES(department_id), name = VALUES(name);
INSERT INTO courses (name, code, department_id)
SELECT 'Information Organization', 'INFO_ORG', id FROM departments WHERE name = 'IS'
ON DUPLICATE KEY UPDATE department_id = VALUES(department_id), name = VALUES(name);
INSERT INTO courses (name, code, department_id)
SELECT 'Emerging', 'EMERGING', id FROM departments WHERE name = 'IS'
ON DUPLICATE KEY UPDATE department_id = VALUES(department_id), name = VALUES(name);
