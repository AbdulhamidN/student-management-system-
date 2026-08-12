# 🎓 Student Management System

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Jest](https://img.shields.io/badge/Jest-C21325?style=for-the-badge&logo=jest&logoColor=white)
![JSON Server](https://img.shields.io/badge/JSON_Server-000000?style=for-the-badge&logo=json&logoColor=white)

A modern, fully responsive Student Management Dashboard built with React, featuring full CRUD operations, advanced filtering, and a comprehensive dark mode implementation. This project includes robust Unit, Integration, and End-to-End (E2E) testing documentation as part of a Quality Assurance assessment.

---

## 📖 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Installation & Setup](#installation--setup)
- [How to Run the App](#how-to-run-the-app)
- [Running Tests (QA)](#running-tests-qa)
- [Screenshots & Demo](#screenshots--demo)
- [Challenges Faced](#challenges-faced)
- [Contributing](#contributing)
- [License](#license)

---

## ✨ Features

- **Admin Panel Layout:** Clean sidebar navigation with active state highlighting using `react-router-dom` `NavLink`.
- **CRUD Operations (via Mock API):** 
  - ➕ **Create:** Add new students using a beautiful, dark-mode ready custom modal.
  - ✏️ **Update:** Edit student details via a pre-filled modal.
  - ❌ **Soft-Delete:** Remove students with a confirmation prompt.
- **Search & Filtering:** Dynamic filtering of students by Department using a select dropdown.
- **Assign Courses:** Ability to assign a course to individual students with instant user feedback.
- **Dark Mode:** Fully integrated Tailwind CSS dark mode with a persistent toggle switch in the header.
- **Error Handling:** Gracefully handles invalid inputs (missing name) and missing API connections without crashing the application.
- **Mock Backend:** Simulated REST API using `json-server` for persistent local data.

---

## 💻 Tech Stack

- **Frontend:** React (Create React App), React Router DOM v6
- **Styling:** Tailwind CSS
- **State Management:** React Hooks (useState, useEffect)
- **Mock Backend:** json-server
- **Testing:** Jest, React Testing Library

---

## 📁 Project Structure

```text
Student Management/
├── frontend/                 <-- Main React application folder
│   ├── public/               # Static assets
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   │   ├── Layout/       # Header, Sidebar, Footer
│   │   │   └── Students/     # StudentList and StudentForm (Modal)
│   │   ├── layouts/          # AdminLayout wrapper (Sidebar & Outlet)
│   │   ├── pages/            # Dashboard, Students, Courses, Departments
│   │   ├── App.jsx           # Main Application + Routing & Dark Mode Logic
│   │   └── index.js          # Entry point
│   ├── db.json               # Mock database file (json-server)
│   ├── package.json          # Dependencies and run scripts
│   └── tailwind.config.js    # Tailwind CSS configuration
└── README.md                 # Project documentation