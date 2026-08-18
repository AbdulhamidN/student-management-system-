import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import PublicLayout from './components/Layout/PublicLayout';
import HomePage from './pages/public/HomePage';
import AnnouncementsPage from './pages/public/AnnouncementsPage';
import LoginPage from './pages/public/LoginPage';
import RegisterPage from './pages/public/RegisterPage';
import AdminLayout from './layouts/AdminLayout';
import TeacherLayout from './layouts/TeacherLayout';
import StudentLayout from './layouts/StudentLayout';

import Students from './pages/admin/Students';
import Courses from './pages/admin/Courses';
import Departments from './pages/admin/Departments';
import AdminDashboard from './pages/admin/AdminDashboard';
import Teachers from './pages/admin/Teachers';

import TeacherDashboard from './pages/teacher/TeacherDashboard';
import TeacherGradebook from './pages/teacher/TeacherGradebook';
import TeacherStudentRoster from './pages/teacher/TeacherStudentRoster';
import TeacherProfile from './pages/teacher/TeacherProfile';

import StudentDashboard from './pages/student/StudentDashboard';
import StudentResults from './pages/student/StudentResults';
import StudentSelfSchedule from './pages/student/StudentSelfSchedule';
import StudentExamSchedule from './pages/student/StudentExamSchedule';
import StudentAnnouncements from './pages/student/StudentAnnouncements';
import StudentNotifications from './pages/student/StudentNotifications';
import StudentProfile from './pages/student/StudentProfile';

function ProtectedRoute({ allowedRoles, children }) {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user?.role)) {
    if (user?.role === 'admin') return <Navigate to="/admin" replace />;
    if (user?.role === 'teacher') return <Navigate to="/teacher" replace />;
    if (user?.role === 'student') return <Navigate to="/student" replace />;
    return <Navigate to="/login" replace />;
  }

  return children;
}

function AppRoutes() {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode((prev) => !prev);

  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/announcements" element={<AnnouncementsPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminLayout darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="students" element={<Students />} />
        <Route path="courses" element={<Courses />} />
        <Route path="departments" element={<Departments />} />
        <Route path="teachers" element={<Teachers />} />
      </Route>

      <Route
        path="/teacher"
        element={
          <ProtectedRoute allowedRoles={['teacher']}>
            <TeacherLayout darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/teacher/gradebook" replace />} />
        <Route path="dashboard" element={<Navigate to="/teacher/gradebook" replace />} />
        <Route path="gradebook" element={<TeacherGradebook />} />
        <Route path="profile" element={<TeacherProfile />} />
      </Route>

      <Route
        path="/student"
        element={
          <ProtectedRoute allowedRoles={['student']}>
            <StudentLayout darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/student/results" replace />} />
        <Route path="dashboard" element={<Navigate to="/student/results" replace />} />
        <Route path="results" element={<StudentResults />} />
        <Route path="profile" element={<StudentProfile />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
