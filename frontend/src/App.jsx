import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AdminLayout from './layouts/AdminLayout';
import Dashboard from './pages/Dashboard';
import Students from './pages/Students';
import Courses from './pages/Courses';
import Departments from './pages/Departments';

function App() {
  const [darkMode, setDarkMode] = useState(false);

  // Debug log - open your browser's F12 console to see this
  console.log('Current Dark Mode State:', darkMode);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode(prev => !prev);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AdminLayout darkMode={darkMode} toggleDarkMode={toggleDarkMode} />}>
          <Route index element={<Dashboard />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="students" element={<Students />} />
          <Route path="courses" element={<Courses />} />
          <Route path="departments" element={<Departments />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
export default App;
