import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { FaMoon, FaSun } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

const AdminLayout = ({ darkMode, toggleDarkMode }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen dark:bg-gray-900 dark:text-white">
      <aside className="w-64 bg-gray-800 text-white p-4 flex flex-col">
        <div className="mb-8 text-xl font-bold px-2">Admin Panel</div>
        <nav className="space-y-2 flex-1">
          <NavLink to="/admin/dashboard" className={({ isActive }) => `block py-2 px-4 rounded transition-colors ${isActive ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'}`}>Dashboard</NavLink>
          <NavLink to="/admin/students" className={({ isActive }) => `block py-2 px-4 rounded transition-colors ${isActive ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'}`}>Students</NavLink>
          <NavLink to="/admin/teachers" className={({ isActive }) => `block py-2 px-4 rounded transition-colors ${isActive ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'}`}>Teachers</NavLink>
          <NavLink to="/admin/courses" className={({ isActive }) => `block py-2 px-4 rounded transition-colors ${isActive ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'}`}>Courses</NavLink>
          <NavLink to="/admin/departments" className={({ isActive }) => `block py-2 px-4 rounded transition-colors ${isActive ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'}`}>Departments</NavLink>
        </nav>

        <button
          onClick={handleLogout}
          className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-500"
        >
          Logout
        </button>
      </aside>

      <main className="flex-1 p-6 overflow-y-auto bg-white dark:bg-gray-900">
        <div className="flex justify-end items-center mb-6">
          <button 
            onClick={toggleDarkMode} 
            className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200 text-gray-700 transition-colors hover:bg-gray-300 focus:outline-none dark:bg-gray-700 dark:text-yellow-300 dark:hover:bg-gray-600"
            title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {darkMode ? <FaSun /> : <FaMoon />}
          </button>
        </div>
        <Outlet />
      </main>
    </div>
  );
};
export default AdminLayout;
