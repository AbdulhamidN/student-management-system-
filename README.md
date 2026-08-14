# 🎓 Student Management System

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Jest](https://img.shields.io/badge/Jest-C21325?style=for-the-badge&logo=jest&logoColor=white)
![JSON Server](https://img.shields.io/badge/JSON_Server-000000?style=for-the-badge&logo=json&logoColor=white)

<p align="center">
  <strong>A Full-Stack Student Management System</strong>
</p>

<p align="center">
  Built with React, Node.js, Express.js, and MySQL
</p>

## 📑 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
  - [Student Management](#-student-management)
  - [Department Management](#-department-management)
  - [Course Management](#-course-management)
  - [Student–Course Relationship](#-studentcourse-relationship)
  - [Soft Delete](#-soft-delete)
  - [Department Filtering](#-department-filtering)
  - [Validation & Error Handling](#️-validation--error-handling)
- [Technology Stack](#️-technology-stack)
- [System Architecture](#️-system-architecture)
- [Database Design](#️-database-design)
- [Project Structure](#-project-structure)
- [REST API](#-rest-api)
  - [Student Endpoints](#-student-endpoints)
  - [Department Endpoints](#-department-endpoints)
  - [Course Endpoints](#-course-endpoints)
- [Frontend](#-frontend)
- [Installation & Setup](#-installation--setup)
- [Testing](#-testing)
- [Documentation](#-documentation)
- [Git & GitHub Workflow](#-git--github-workflow)
- [Team Members & Responsibilities](#-team-members--responsibilities)
- [Configuration & Security](#-configuration--security)
- [Future Improvements](#-future-improvements)
- [Project Status](#-project-status)
- [License](#-license)

---

## 🔎 Overview

The **Student Management System** is a full-stack web application developed to manage students, departments, and courses.

The project consists of a **React frontend**, an **Express.js REST API**, and a **MySQL relational database**.

The system started from a basic single-table student database and was improved into a relational database structure that supports departments, courses, student-course enrollment, validation, and soft deletion.

---

## ✨ Features

### 🧑‍🎓 Student Management

- Create a student
- View active students
- View a single student
- Update student information
- Soft-delete students
- Count active students
- Filter students by department
- View a student's courses
- Assign courses to a student
- Remove courses from a student

Student information includes:

- Name
- Email
- Phone
- Department

### 🏢 Department Management

The system supports:

- Create department
- View all departments
- View a department by ID
- Update department
- Delete department

Departments are stored separately from students instead of using a free-text department field.

### 📚 Course Management

The system supports:

- Create courses
- View courses
- View a course by ID
- Update courses
- Delete courses
- Associate courses with departments
- Assign courses to students

### 🔗 Student–Course Relationship

Students and courses have a **many-to-many relationship**.

A student can enroll in multiple courses, while a course can have multiple students.

This relationship is implemented using the:

```text
student_courses
```

junction table.

The system also prevents duplicate student-course assignments.

### 🗑️ Soft Delete

Students are soft-deleted instead of being permanently removed from the database.

The students table contains an:

```text
is_deleted
```

field.

When a student is deleted, the record remains in the database while being excluded from active student queries.

### 🧮 Department Filtering

The frontend provides a department filter that allows users to display students belonging to a selected department.

### ✅ Validation & Error Handling

The application includes:

- Required-field validation
- Loading states
- Empty states
- Error messages
- Request logging
- 404 handling
- Centralized error handling

## 🛠️ Technology Stack

| Layer              | Technology     |
| ------------------ | -------------- |
| Frontend           | React          |
| Backend            | Node.js        |
| Web Framework      | Express.js     |
| Database           | MySQL          |
| API                | REST API       |
| Styling            | Tailwind CSS   |
| HTTP Communication | Fetch API      |
| API Testing        | Thunder Client |
| Version Control    | Git & GitHub   |

## 🏗️ System Architecture

```
                    ┌──────────────────────┐
                    │    React Frontend    │
                    │                      │
                    │  Students            │
                    │  Departments         │
                    │  Courses             │
                    │  Course Assignment   │
                    └──────────┬───────────┘
                               │
                               │ HTTP / REST API
                               ▼
                    ┌──────────────────────┐
                    │    Express.js API    │
                    │                      │
                    │ Routes               │
                    │ Controllers          │
                    │ Models               │
                    │ Middleware           │
                    └──────────┬───────────┘
                               │
                               │ SQL
                               ▼
                    ┌──────────────────────┐
                    │       MySQL          │
                    │                      │
                    │ departments          │
                    │ students             │
                    │ courses              │
                    │ student_courses      │
                    └──────────────────────┘
```

### 🔄 Request Flow

```
React Frontend
      ↓
API Request
      ↓
Express Route
      ↓
Controller
      ↓
Model
      ↓
MySQL Database
      ↓
JSON Response
      ↓
React Frontend
```

## 🗄️ Database Design

The database is named:

```text
student_management
```

The improved database contains four main tables.

### 1️⃣ Departments

```
departments
├── id
└── name
```

A department can have multiple students and multiple courses.

### 2️⃣ Students

```
students
├── id
├── name
├── email
├── phone
├── department_id
├── is_deleted
└── created_at
```

`department_id` references the `departments` table.

### 3️⃣ Courses

```
courses
├── id
├── name
├── code
└── department_id
```

`department_id` references the `departments` table.

### 4️⃣ Student Courses

```
student_courses
├── student_id
└── course_id
```

This junction table implements the many-to-many relationship between students and courses.

The combination of `student_id` and `course_id` forms the composite primary key.

### 🔀 Database Relationships

```
Department
    │
    ├──────────< Students
    │
    └──────────< Courses

Students
    │
    └──────────< Student_Courses >────────── Courses
```

**Relationships**

- One department can have many students. 🏢➡️🧑‍🎓
- One department can offer many courses. 🏢➡️📚
- One student can enroll in many courses. 🧑‍🎓➡️📚
- One course can have many students. 📚➡️🧑‍🎓
- `student_courses` manages the many-to-many student-course relationship. 🔗
- Foreign keys maintain referential integrity. 🔑

## 📁 Project Structure

```
student-management-system/
│
├── backend/
│   ├── .env.example
│   ├── package.json
│   ├── package-lock.json
│   └── src/
│       ├── app.js
│       ├── server.js
│       │
│       ├── config/
│       │   └── db.js
│       │
│       ├── controllers/
│       │   ├── courseController.js
│       │   ├── departmentController.js
│       │   └── studentController.js
│       │
│       ├── middleware/
│       │   ├── errorMiddleware.js
│       │   ├── loggerMiddleware.js
│       │   └── notFoundMiddleware.js
│       │
│       ├── models/
│       │   ├── courseModel.js
│       │   ├── departmentModel.js
│       │   └── studentModel.js
│       │
│       └── routes/
│           ├── courseRoutes.js
│           ├── departmentRoutes.js
│           └── studentRoutes.js
│
├── database/
│   └── schema.sql
│
├── frontend/
│   ├── public/
│   ├── package.json
│   └── src/
│       ├── api/
│       │   ├── config.js
│       │   ├── courses.js
│       │   ├── departments.js
│       │   └── students.js
│       │
│       ├── components/
│       │   ├── Common/
│       │   ├── Courses/
│       │   ├── Dashboard/
│       │   ├── Filters/
│       │   ├── Layout/
│       │   └── Students/
│       │
│       ├── App.js
│       ├── App.css
│       ├── index.css
│       └── index.js
│
├── docs/
│   ├── project_report.docx
│   ├── test_plan.md
│   └── screenshots/
│
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
│
├── .gitignore
└── README.md
```

## 🔌 REST API

The backend runs on port 5000 during development.

Base API path:

```text
/api
```

### 🧑‍🎓 Student Endpoints

| Method | Endpoint                              | Description                    |
| ------ | ------------------------------------- | ------------------------------ |
| POST   | `/api/students`                       | Create a student               |
| GET    | `/api/students`                       | Get active students            |
| GET    | `/api/students/count`                 | Get active student count       |
| GET    | `/api/students/department/:deptId`    | Get students by department     |
| GET    | `/api/students/:id`                   | Get a student by ID            |
| PUT    | `/api/students/:id`                   | Update a student               |
| DELETE | `/api/students/:id`                   | Soft-delete a student          |
| POST   | `/api/students/:id/courses`           | Assign a course to a student   |
| GET    | `/api/students/:id/courses`           | Get courses for a student      |
| DELETE | `/api/students/:id/courses/:courseId` | Remove a course from a student |

### 🏢 Department Endpoints

| Method | Endpoint               | Description            |
| ------ | ---------------------- | ---------------------- |
| POST   | `/api/departments`     | Create a department    |
| GET    | `/api/departments`     | Get all departments    |
| GET    | `/api/departments/:id` | Get a department by ID |
| PUT    | `/api/departments/:id` | Update a department    |
| DELETE | `/api/departments/:id` | Delete a department    |

### 📚 Course Endpoints

| Method | Endpoint           | Description        |
| ------ | ------------------ | ------------------ |
| POST   | `/api/courses`     | Create a course    |
| GET    | `/api/courses`     | Get all courses    |
| GET    | `/api/courses/:id` | Get a course by ID |
| PUT    | `/api/courses/:id` | Update a course    |
| DELETE | `/api/courses/:id` | Delete a course    |

## 💻 Frontend

The frontend is built with React and communicates with the backend through REST API requests.

The frontend API configuration is located in:

```text
frontend/src/api/config.js
```

During local development:

```
Frontend → http://localhost:3000
Backend  → http://localhost:5000
```

The frontend uses the Fetch API to communicate with the backend.

### 🧩 Frontend Components

**Students**

- StudentList
- StudentForm

Used for displaying and managing student records.

**Courses**

- CourseAssignModal

Used to assign courses to students.

**Filters**

- DepartmentFilter

Used to filter students by department.

**Dashboard**

- StudentCount

Displays the number of active students.

**Common Components**

- Loader
- EmptyState
- ErrorMessage

Provide reusable loading, empty, and error states.

**Layout**

- Header

Provides the main application header.

## ⚙️ Installation & Setup

### ✅ Prerequisites

Make sure the following are installed:

- Node.js
- npm
- MySQL
- Git

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/AbdulhamidN/student-management-system.git
```

Navigate into the project:

```bash
cd student-management-system
```

### 2️⃣ Set Up the Database

Start MySQL and execute:

```text
database/schema.sql
```

The schema creates the:

```text
student_management
```

database and its required tables.

The schema also contains sample data for demonstration and testing.

### 3️⃣ Configure the Backend

Navigate to the backend:

```bash
cd backend
```

Install dependencies:

```bash
npm install
```

Create a `.env` file based on:

```text
.env.example
```

Configure your local MySQL credentials.

Example:

```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=student_management
```

⚠️ **Important:** Never commit your `.env` file to GitHub because it may contain sensitive database credentials.

### 4️⃣ Start the Backend

For development:

```bash
npm run dev
```

The backend will run on:

```text
http://localhost:5000
```

### 5️⃣ Start the Frontend

Open another terminal:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start the React application:

```bash
npm start
```

The frontend will normally be available at:

```text
http://localhost:3000
```

🔗 Make sure the backend and MySQL database are running before using the frontend.

## 🧪 Testing

Testing was performed at multiple levels during development.

### 🔬 API Testing

Backend endpoints were tested using Thunder Client.

Tested functionality includes:

- Creating students
- Student validation
- Updating students
- Soft-deleting students
- Counting active students
- Listing departments
- Listing courses
- Getting a course by ID
- Creating courses
- Updating courses
- Deleting courses
- Assigning courses to students

### 🔁 Integration Testing

The complete request-to-database flow was tested to verify that:

```
Frontend / API Request
        ↓
Express Backend
        ↓
MySQL Database
        ↓
Backend Response
```

worked correctly.

### 🌐 End-to-End Testing

The frontend was tested against the live backend and MySQL database to verify that real database data was rendered correctly.

The tested frontend behavior included:

- Loading data
- Displaying students
- Displaying departments
- Student count
- Department filtering
- Empty states
- Error states

The project report documents the test cases, actual results, and PASS status for the completed tests.

## 📖 Documentation

Additional project documentation is available in:

```text
docs/
```

Important documentation includes:

- `docs/project_report.docx`
- `docs/test_plan.md`

The project report documents:

- Original database structure
- Improved database design
- Entity relationships
- Backend development
- Frontend development
- API integration
- Testing
- Git and GitHub workflow
- Development challenges
- Final group reflection

## 🌳 Git & GitHub Workflow

The project was developed using Git and GitHub.

The development workflow included:

- Feature branches
- Meaningful incremental commits
- Pull requests
- Merging completed work into the main branch

Repository:

```text
https://github.com/AbdulhamidN/student-management-system
```

## 👥 Team Members & Responsibilities

| Member          | Role                                              |
| --------------- | ------------------------------------------------- |
| Abdulhamid Nuri | 🛡️ Backend development and project administration |
| Hayidar         | 🎨 Frontend Developer                             |
| Adnan           | 🎨 Frontend Developer                             |
| Chala Wodajo    | 📝 Report / Documentation                         |

## 🔐 Configuration & Security

Database credentials and other environment-specific values should be stored in:

```text
backend/.env
```

A configuration template is provided as:

```text
backend/.env.example
```

🚫 The `.env` file should not be committed to GitHub.

## 🚀 Future Improvements

Future improvements include:

- 🔑 User authentication
- 🛡️ Authorization and user roles
- 🧪 Expanded automated test coverage
- 🔍 Advanced search and filtering
- 📄 Pagination (adding the pages)
- 📊 Improved dashboard functionality
- ✅ More frontend testing and at the end
- ☁️ Production deployment

## 📌 Project Status

The Student Management System provides a working full-stack implementation connecting:

```
React
   ↓
Express.js REST API
   ↓
MySQL
```

The core student, department, course, and student-course management functionality has been implemented and tested as documented in the project report.

## 📄 License

This project is developed by INSA summer camp students as a group project.

<p align="center">
  <strong>🎓 Student Management System</strong>
  <br>
  Built with React, Node.js, Express.js and MySQL
</p>
