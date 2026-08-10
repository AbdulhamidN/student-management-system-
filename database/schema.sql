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
CREATE TABLE departments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE
);

-- ---------------------------------------------------
-- 2. STUDENTS  (extends the original table)
-- ---------------------------------------------------
CREATE TABLE students (
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
CREATE TABLE courses (
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
CREATE TABLE student_courses (
    student_id INT NOT NULL,
    course_id INT NOT NULL,
    PRIMARY KEY (student_id, course_id),
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

-- ---------------------------------------------------
-- Sample seed data (useful for demoing/testing)
-- ---------------------------------------------------
INSERT INTO departments (name) VALUES
    ('Computer Science'), ('Electrical Engineering'), ('Mathematics');

INSERT INTO courses (name, code, department_id) VALUES
    ('Data Structures', 'CS201', 1),
    ('Database Systems', 'CS301', 1),
    ('Circuit Analysis', 'EE210', 2),
    ('Linear Algebra', 'MATH150', 3);

INSERT INTO students (name, email, phone, department_id) VALUES
    ('Abdulhamid Nuri', 'abdy@example.com', '0911000000', 1),
    ('Sara Tesfaye', 'sara@example.com', '0911000001', 2);
