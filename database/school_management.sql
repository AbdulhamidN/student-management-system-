-- =====================================================
-- School Management System — MySQL Database Schema & Seed
-- =====================================================

CREATE DATABASE IF NOT EXISTS school_management;
USE school_management;

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    role ENUM('admin', 'teacher', 'student') NOT NULL DEFAULT 'teacher',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Teachers Table
CREATE TABLE IF NOT EXISTS teachers (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    department VARCHAR(100),
    subject VARCHAR(100),
    phone VARCHAR(20),
    bio TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 3. Students Table
CREATE TABLE IF NOT EXISTS students (
    id INT PRIMARY KEY AUTO_INCREMENT,
    teacher_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    grade VARCHAR(10) NOT NULL,
    parent_name VARCHAR(100),
    parent_phone VARCHAR(20),
    email VARCHAR(255),
    address TEXT,
    date_of_birth DATE,
    enrollment_date DATE DEFAULT CURRENT_DATE,
    status ENUM('active', 'inactive', 'graduated') DEFAULT 'active',
    notes TEXT,
    mid_mark DECIMAL(5,2) DEFAULT 0.00,
    final_mark DECIMAL(5,2) DEFAULT 0.00,
    assessment_mark DECIMAL(5,2) DEFAULT 0.00,
    total_mark DECIMAL(5,2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE CASCADE,
    INDEX idx_total_mark (total_mark)
);

-- Seed Data
-- Password for all accounts is: Password123!
-- Hash generated via bcrypt (10 rounds): $2b$10$FznaVVNRlz3ucxAP3qqASOEAGSg/4dhLNJexab1qIJvhugJBEohBi

-- 1. Insert Users
INSERT INTO users (id, email, password_hash, name, role) VALUES
(1, 'admin@school.com', '$2b$10$FznaVVNRlz3ucxAP3qqASOEAGSg/4dhLNJexab1qIJvhugJBEohBi', 'System Administrator', 'admin'),
(2, 'teacher@school.com', '$2b$10$FznaVVNRlz3ucxAP3qqASOEAGSg/4dhLNJexab1qIJvhugJBEohBi', 'Sarah Jenkins', 'teacher'),
(3, 'john.doe@school.com', '$2b$10$FznaVVNRlz3ucxAP3qqASOEAGSg/4dhLNJexab1qIJvhugJBEohBi', 'John Doe', 'teacher')
ON DUPLICATE KEY UPDATE name = VALUES(name), role = VALUES(role);

-- 2. Insert Teachers
INSERT INTO teachers (id, user_id, name, department, subject, phone, bio) VALUES
(1, 2, 'Sarah Jenkins', 'Computer Science', 'Software Engineering & Web Dev', '+1-555-0192', 'Senior Computer Science Educator with 8+ years experience in Software Architecture.'),
(2, 3, 'John Doe', 'Mathematics', 'Calculus & Linear Algebra', '+1-555-0183', 'Head of Mathematics Department specializing in Applied Mathematics.')
ON DUPLICATE KEY UPDATE name = VALUES(name), department = VALUES(department), subject = VALUES(subject);

-- 3. Insert Students with Diverse Marks
INSERT INTO students (id, teacher_id, name, grade, parent_name, parent_phone, email, address, date_of_birth, enrollment_date, status, notes, mid_mark, final_mark, assessment_mark, total_mark) VALUES
(1, 1, 'Alice Smith', 'Grade 10', 'Robert Smith', '+1-555-1001', 'alice.smith@student.com', '123 Elm Street, Cityville', '2008-04-12', '2023-09-01', 'active', 'Exceptional performance in coding assignments.', 19.50, 48.00, 28.50, 96.00),
(2, 1, 'Bob Johnson', 'Grade 10', 'Mary Johnson', '+1-555-1002', 'bob.johnson@student.com', '456 Oak Avenue, Metro City', '2008-07-22', '2023-09-01', 'active', 'Consistent participation in class discussions.', 17.00, 42.50, 25.50, 85.00),
(3, 1, 'Charlie Brown', 'Grade 10', 'James Brown', '+1-555-1003', 'charlie.brown@student.com', '789 Pine Road, Townsville', '2008-01-15', '2023-09-01', 'active', 'Good effort; needs minor improvement in final review.', 15.00, 38.00, 22.00, 75.00),
(4, 1, 'Diana Prince', 'Grade 10', 'Hippolyta Prince', '+1-555-1004', 'diana.prince@student.com', '321 Amazon Way, Paradise Isle', '2008-03-30', '2023-09-01', 'active', 'Satisfactory progress.', 13.00, 33.00, 19.00, 65.00),
(5, 1, 'Ethan Hunt', 'Grade 10', 'Alexander Hunt', '+1-555-1005', 'ethan.hunt@student.com', '654 Mission Blvd, Action City', '2008-11-05', '2023-09-01', 'active', 'Requires additional tutoring support.', 10.00, 25.00, 18.00, 53.00),
(6, 1, 'Fiona Gallagher', 'Grade 10', 'Frank Gallagher', '+1-555-1006', 'fiona.gallagher@student.com', '987 South Side, Chicago', '2008-09-18', '2023-09-01', 'active', 'High potential in practical projects.', 18.00, 46.00, 27.00, 91.00),
(7, 2, 'George Clark', 'Grade 11', 'David Clark', '+1-555-2001', 'george.clark@student.com', '111 Maple Street, Springfield', '2007-05-14', '2022-09-01', 'active', 'Strong analytical skills.', 16.50, 41.00, 24.50, 82.00),
(8, 2, 'Hannah Abbott', 'Grade 11', 'Arthur Abbott', '+1-555-2002', 'hannah.abbott@student.com', '222 Birch Lane, Hogsmeade', '2007-08-09', '2022-09-01', 'active', 'Active learner in group projects.', 14.00, 36.00, 21.00, 71.00)
ON DUPLICATE KEY UPDATE mid_mark = VALUES(mid_mark), final_mark = VALUES(final_mark), assessment_mark = VALUES(assessment_mark), total_mark = VALUES(total_mark);
