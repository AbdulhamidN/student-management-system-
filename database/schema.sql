-- =====================================================
-- Student Management System — Complete Database Schema
-- =====================================================
-- Fresh-install schema for the Admin Student/Teacher feature.
-- Departments and courses follow the project requirements:
-- CS: OOP, DSA, DB
-- IT: IP, Web, OS
-- IS: CP, Information Organization, Emerging

CREATE DATABASE IF NOT EXISTS student_management;
USE student_management;

CREATE TABLE IF NOT EXISTS departments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('admin', 'teacher', 'student') NOT NULL DEFAULT 'student',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    failed_login_attempts TINYINT UNSIGNED NOT NULL DEFAULT 0,
    locked_until DATETIME NULL,
    password_changed_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    mfa_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    mfa_secret_encrypted VARBINARY(512) NULL,
    mfa_enrolled_at DATETIME NULL,
    mfa_last_verified_at DATETIME NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_sessions (
    session_id CHAR(36) PRIMARY KEY,
    user_id INT NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_used_at DATETIME NULL,
    expires_at DATETIME NOT NULL,
    revoked_at DATETIME NULL,
    revocation_reason VARCHAR(100) NULL,
    user_agent VARCHAR(512) NULL,
    ip_address VARBINARY(16) NULL,
    CONSTRAINT fk_user_sessions_user
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_sessions_user_id (user_id),
    INDEX idx_user_sessions_expires_at (expires_at),
    INDEX idx_user_sessions_revoked_at (revoked_at)
);

CREATE TABLE IF NOT EXISTS refresh_tokens (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    session_id CHAR(36) NOT NULL,
    token_hash CHAR(64) NOT NULL UNIQUE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_used_at DATETIME NULL,
    expires_at DATETIME NOT NULL,
    revoked_at DATETIME NULL,
    revocation_reason VARCHAR(100) NULL,
    replaced_by_token_id BIGINT UNSIGNED NULL,
    CONSTRAINT fk_refresh_tokens_session
        FOREIGN KEY (session_id) REFERENCES user_sessions(session_id) ON DELETE CASCADE,
    CONSTRAINT fk_refresh_tokens_replacement
        FOREIGN KEY (replaced_by_token_id) REFERENCES refresh_tokens(id) ON DELETE SET NULL,
    INDEX idx_refresh_tokens_session_id (session_id),
    INDEX idx_refresh_tokens_expires_at (expires_at),
    INDEX idx_refresh_tokens_revoked_at (revoked_at)
);

CREATE TABLE IF NOT EXISTS courses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    code VARCHAR(30) NOT NULL UNIQUE,
    department_id INT NOT NULL,
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE RESTRICT,
    UNIQUE KEY uq_course_department_name (department_id, name)
);

CREATE TABLE IF NOT EXISTS students (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(20),
    department_id INT NULL,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL
);

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

CREATE TABLE IF NOT EXISTS student_courses (
    student_id INT NOT NULL,
    course_id INT NOT NULL,
    PRIMARY KEY (student_id, course_id),
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS teacher_courses (
    teacher_id INT NOT NULL,
    course_id INT NOT NULL,
    PRIMARY KEY (teacher_id, course_id),
    FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS announcements (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    is_published BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Required departments.
INSERT INTO departments (name) VALUES ('CS'), ('IT'), ('IS')
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- Required courses. IDs are looked up by department name, so this remains safe
-- if auto-increment values differ between environments.
INSERT INTO courses (name, code, department_id)
SELECT 'OOP', 'OOP', id FROM departments WHERE name = 'CS'
ON DUPLICATE KEY UPDATE name = VALUES(name), department_id = VALUES(department_id);
INSERT INTO courses (name, code, department_id)
SELECT 'DSA', 'DSA', id FROM departments WHERE name = 'CS'
ON DUPLICATE KEY UPDATE name = VALUES(name), department_id = VALUES(department_id);
INSERT INTO courses (name, code, department_id)
SELECT 'DB', 'DB', id FROM departments WHERE name = 'CS'
ON DUPLICATE KEY UPDATE name = VALUES(name), department_id = VALUES(department_id);

INSERT INTO courses (name, code, department_id)
SELECT 'IP', 'IP', id FROM departments WHERE name = 'IT'
ON DUPLICATE KEY UPDATE name = VALUES(name), department_id = VALUES(department_id);
INSERT INTO courses (name, code, department_id)
SELECT 'Web', 'WEB', id FROM departments WHERE name = 'IT'
ON DUPLICATE KEY UPDATE name = VALUES(name), department_id = VALUES(department_id);
INSERT INTO courses (name, code, department_id)
SELECT 'OS', 'OS', id FROM departments WHERE name = 'IT'
ON DUPLICATE KEY UPDATE name = VALUES(name), department_id = VALUES(department_id);

INSERT INTO courses (name, code, department_id)
SELECT 'CP', 'CP', id FROM departments WHERE name = 'IS'
ON DUPLICATE KEY UPDATE name = VALUES(name), department_id = VALUES(department_id);
INSERT INTO courses (name, code, department_id)
SELECT 'Information Organization', 'INFO_ORG', id FROM departments WHERE name = 'IS'
ON DUPLICATE KEY UPDATE name = VALUES(name), department_id = VALUES(department_id);
INSERT INTO courses (name, code, department_id)
SELECT 'Emerging', 'EMERGING', id FROM departments WHERE name = 'IS'
ON DUPLICATE KEY UPDATE name = VALUES(name), department_id = VALUES(department_id);

-- Existing project admin account. Replace this password in production.
-- Password: Admin@123
INSERT INTO users (name, email, password_hash, role, is_active)
VALUES ('System Administrator', 'admin@example.com', '$2b$10$FznaVVNRlz3ucxAP3qqASOEAGSg/4dhLNJexab1qIJvhugJBEohBi', 'admin', TRUE)
ON DUPLICATE KEY UPDATE role = 'admin', is_active = TRUE, password_hash = VALUES(password_hash);
