-- =====================================================
-- Student Management System — Full Schema
-- =====================================================
-- Order matters: departments first (nothing depends on it),
-- then students and courses (both depend on departments),
-- then student_courses last (depends on both).

CREATE DATABASE IF NOT EXISTS student_management;
USE student_management;

-- ---------------------------------------------------
-- 1. DEPARTMENTS  (parent table)
-- ---------------------------------------------------
CREATE TABLE IF NOT EXISTS departments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE
);

-- ---------------------------------------------------
-- 2. STUDENTS  (extends the original table)
-- ---------------------------------------------------
CREATE TABLE IF NOT EXISTS students (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(20),
    department_id INT,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (department_id) REFERENCES departments(id)
        ON DELETE SET NULL
);

-- ---------------------------------------------------
-- 3. COURSES
-- ---------------------------------------------------
CREATE TABLE IF NOT EXISTS courses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    code VARCHAR(20) NOT NULL UNIQUE,
    department_id INT,
    FOREIGN KEY (department_id) REFERENCES departments(id)
        ON DELETE SET NULL
);

-- ---------------------------------------------------
-- 4. STUDENT_COURSES  (junction table — Many-to-Many)
-- ---------------------------------------------------
CREATE TABLE IF NOT EXISTS student_courses (
    student_id INT NOT NULL,
    course_id INT NOT NULL,
    PRIMARY KEY (student_id, course_id),
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

-- ---------------------------------------------------
-- Sample seed data (useful for demoing/testing)
-- ---------------------------------------------------
INSERT IGNORE INTO departments (name) VALUES
    ('Computer Science'), ('Electrical Engineering'), ('Mathematics');

INSERT IGNORE INTO courses (name, code, department_id) VALUES
    ('Data Structures', 'CS201', 1),
    ('Database Systems', 'CS301', 1),
    ('Circuit Analysis', 'EE210', 2),
    ('Linear Algebra', 'MATH150', 3);

INSERT IGNORE INTO students (name, email, phone, department_id) VALUES
    ('Abdulhamid Nuri', 'abdy@example.com', '0911000000', 1),
    ('Sara Tesfaye', 'sara@example.com', '0911000001', 2);

-- ---------------------------------------------------
-- 5. USERS  (authentication and role-based access)
-- ---------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('admin', 'teacher', 'student') NOT NULL DEFAULT 'student',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ---------------------------------------------------
-- 6. ANNOUNCEMENTS  (public, viewable without login)
-- ---------------------------------------------------
CREATE TABLE IF NOT EXISTS announcements (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    is_published BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT IGNORE INTO users (name, email, password_hash, role) VALUES
    ('System Administrator', 'admin@example.com', '$2b$10$FZfbn9E7VJQhE8d4B8.zMO4mLJQ2t9XVJ8D9m8w/r1Lxa3ITM6OO2', 'admin');

INSERT IGNORE INTO announcements (title, content) VALUES
    ('Welcome to the Student Management System', 'The platform is now open for students, teachers, and administrators to manage academic activity securely.'),
    ('New Semester Registration Begins', 'Please complete your registration and review your academic record before the start of the semester.');
