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
    user_id INT UNIQUE,
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
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE CASCADE,
    INDEX idx_total_mark (total_mark)
);

-- 4. Student Self-Schedules Table
CREATE TABLE IF NOT EXISTS student_schedules (
    id INT PRIMARY KEY AUTO_INCREMENT,
    student_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    day_of_week ENUM('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday') NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);

-- 5. Exam Schedules Table (Posted by Teachers)
CREATE TABLE IF NOT EXISTS exam_schedules (
    id INT PRIMARY KEY AUTO_INCREMENT,
    teacher_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    subject VARCHAR(100) NOT NULL,
    grade VARCHAR(10) NOT NULL,
    exam_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    location VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE CASCADE
);

-- 6. Notifications Table (Teacher to Student)
CREATE TABLE IF NOT EXISTS notifications (
    id INT PRIMARY KEY AUTO_INCREMENT,
    sender_teacher_id INT,
    recipient_student_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sender_teacher_id) REFERENCES teachers(id) ON DELETE SET NULL,
    FOREIGN KEY (recipient_student_id) REFERENCES students(id) ON DELETE CASCADE
);

-- 7. Announcements Table (Posted by Admin)
CREATE TABLE IF NOT EXISTS announcements (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    is_published BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed Data
-- Password for all accounts is: Password123!
-- Hash generated via bcrypt (10 rounds): $2b$10$FznaVVNRlz3ucxAP3qqASOEAGSg/4dhLNJexab1qIJvhugJBEohBi

-- 1. Insert Users
INSERT INTO users (id, email, password_hash, name, role) VALUES
(1, 'admin@school.com', '$2b$10$FznaVVNRlz3ucxAP3qqASOEAGSg/4dhLNJexab1qIJvhugJBEohBi', 'System Administrator', 'admin'),
(2, 'teacher@school.com', '$2b$10$FznaVVNRlz3ucxAP3qqASOEAGSg/4dhLNJexab1qIJvhugJBEohBi', 'Sarah Jenkins', 'teacher'),
(3, 'john.doe@school.com', '$2b$10$FznaVVNRlz3ucxAP3qqASOEAGSg/4dhLNJexab1qIJvhugJBEohBi', 'John Doe', 'teacher'),
(4, 'alice.smith@student.com', '$2b$10$FznaVVNRlz3ucxAP3qqASOEAGSg/4dhLNJexab1qIJvhugJBEohBi', 'Alice Smith', 'student'),
(5, 'bob.johnson@student.com', '$2b$10$FznaVVNRlz3ucxAP3qqASOEAGSg/4dhLNJexab1qIJvhugJBEohBi', 'Bob Johnson', 'student'),
(6, 'michael.jordan@student.com', '$2b$10$FznaVVNRlz3ucxAP3qqASOEAGSg/4dhLNJexab1qIJvhugJBEohBi', 'Michael Jordan', 'student')
ON DUPLICATE KEY UPDATE name = VALUES(name), role = VALUES(role);

-- 2. Insert Teachers
INSERT INTO teachers (id, user_id, name, department, subject, phone, bio) VALUES
(1, 2, 'Sarah Jenkins', 'Computer Science', 'Software Engineering & Web Dev', '+1-555-0192', 'Senior Computer Science Educator with 8+ years experience in Software Architecture.'),
(2, 3, 'John Doe', 'Mathematics', 'Calculus & Linear Algebra', '+1-555-0183', 'Head of Mathematics Department specializing in Applied Mathematics.')
ON DUPLICATE KEY UPDATE name = VALUES(name), department = VALUES(department), subject = VALUES(subject);

-- 3. Insert Students
INSERT INTO students (id, user_id, teacher_id, name, grade, parent_name, parent_phone, email, address, date_of_birth, enrollment_date, status, notes, mid_mark, final_mark, assessment_mark, total_mark) VALUES
(1, 4, 1, 'Alice Smith', 'Grade 10', 'Robert Smith', '+1-555-1001', 'alice.smith@student.com', '123 Elm Street, Cityville', '2008-04-12', '2023-09-01', 'active', 'Exceptional performance in coding assignments.', 19.50, 48.00, 28.50, 96.00),
(2, 5, 1, 'Bob Johnson', 'Grade 10', 'Mary Johnson', '+1-555-1002', 'bob.johnson@student.com', '456 Oak Avenue, Metro City', '2008-07-22', '2023-09-01', 'active', 'Consistent participation in class discussions.', 17.00, 42.50, 25.50, 85.00),
(3, NULL, 1, 'Charlie Brown', 'Grade 10', 'James Brown', '+1-555-1003', 'charlie.brown@student.com', '789 Pine Road, Townsville', '2008-01-15', '2023-09-01', 'active', 'Good effort; needs minor improvement in final review.', 15.00, 38.00, 22.00, 75.00),
(4, NULL, 1, 'Diana Prince', 'Grade 10', 'Hippolyta Prince', '+1-555-1004', 'diana.prince@student.com', '321 Amazon Way, Paradise Isle', '2008-03-30', '2023-09-01', 'active', 'Satisfactory progress.', 13.00, 33.00, 19.00, 65.00),
(5, NULL, 1, 'Ethan Hunt', 'Grade 10', 'Alexander Hunt', '+1-555-1005', 'ethan.hunt@student.com', '654 Mission Blvd, Action City', '2008-11-05', '2023-09-01', 'active', 'Requires additional tutoring support.', 10.00, 25.00, 18.00, 53.00),
(6, NULL, 1, 'Fiona Gallagher', 'Grade 10', 'Frank Gallagher', '+1-555-1006', 'fiona.gallagher@student.com', '987 South Side, Chicago', '2008-09-18', '2023-09-01', 'active', 'High potential in practical projects.', 18.00, 46.00, 27.00, 91.00),
(7, NULL, 2, 'George Clark', 'Grade 11', 'David Clark', '+1-555-2001', 'george.clark@student.com', '111 Maple Street, Springfield', '2007-05-14', '2022-09-01', 'active', 'Strong analytical skills.', 16.50, 41.00, 24.50, 82.00),
(8, NULL, 2, 'Hannah Abbott', 'Grade 11', 'Arthur Abbott', '+1-555-2002', 'hannah.abbott@student.com', '222 Birch Lane, Hogsmeade', '2007-08-09', '2022-09-01', 'active', 'Active learner in group projects.', 14.00, 36.00, 21.00, 71.00),
(9, 6, 1, 'Michael Jordan', 'Grade 10', 'James Jordan', '+1-555-9988', 'michael.jordan@student.com', '23 Bull Lane, Chicago', '2008-02-17', '2023-09-01', 'active', 'Outstanding leadership and project presentation.', 19.00, 47.50, 27.50, 94.00)
ON DUPLICATE KEY UPDATE mid_mark = VALUES(mid_mark), final_mark = VALUES(final_mark), assessment_mark = VALUES(assessment_mark), total_mark = VALUES(total_mark);

-- 4. Insert Sample Self-Schedules for Student 1 (Alice Smith)
INSERT INTO student_schedules (id, student_id, title, day_of_week, start_time, end_time, description) VALUES
(1, 1, 'Web Development Practice', 'Monday', '08:30:00', '10:00:00', 'Practice React component architecture and state management.'),
(2, 1, 'Algorithms & Data Structures Study', 'Wednesday', '14:00:00', '16:00:00', 'Review binary tree traversals and sorting algorithms.'),
(3, 1, 'Physics & Chemistry Lab Review', 'Friday', '10:30:00', '12:00:00', 'Complete lab reports and practice quiz questions.')
ON DUPLICATE KEY UPDATE title = VALUES(title);

-- 5. Insert Sample Exam Schedules (Posted by Teacher 1 Sarah Jenkins)
INSERT INTO exam_schedules (id, teacher_id, title, subject, grade, exam_date, start_time, end_time, location, notes) VALUES
(1, 1, 'Midterm Software Engineering Exam', 'Software Engineering', 'Grade 10', '2026-09-15', '09:00:00', '11:00:00', 'Lab 204', 'Bring your student ID card and lab notebook.'),
(2, 1, 'Web Architecture Practical Assessment', 'Web Development', 'Grade 10', '2026-09-22', '13:00:00', '15:00:00', 'Computer Lab A', 'Open-book practical coding assessment.')
ON DUPLICATE KEY UPDATE title = VALUES(title);

-- 6. Insert Sample Notifications (Sent by Teacher 1 to Student 1)
INSERT INTO notifications (id, sender_teacher_id, recipient_student_id, title, message, is_read) VALUES
(1, 1, 1, 'Great Job on Recent Assessment!', 'Congratulations Alice! You achieved top score on the Web Dev coursework assignment.', FALSE),
(2, 1, 1, 'Midterm Exam Preparation Guide Available', 'Please check the course portal for the software engineering midterm review material.', FALSE)
ON DUPLICATE KEY UPDATE title = VALUES(title);

-- 7. Insert Sample Admin Announcements
INSERT INTO announcements (id, title, content, is_published) VALUES
(1, 'Welcome to the New Academic Semester!', 'We are excited to welcome all students and teaching staff to the new school term. Make sure to review your schedules.', TRUE),
(2, 'Annual Science & Technology Fair Registration', 'Registration for the annual Science & Technology Fair is now open. Submit your project proposals to your department head by the end of the month.', TRUE)
ON DUPLICATE KEY UPDATE title = VALUES(title);
