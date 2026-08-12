import { NavLink, Outlet } from 'react-router-dom';

const AdminLayout = ({ darkMode, toggleDarkMode }) => {
  return (
    <div className="flex h-screen dark:bg-gray-900 dark:text-white">
      <aside className="w-64 bg-gray-800 text-white p-4 flex flex-col">
        <div className="mb-8 text-xl font-bold px-2">Admin Panel</div>
        <nav className="space-y-2 flex-1">
          <NavLink to="/dashboard" className={({ isActive }) => `block py-2 px-4 rounded transition-colors ${isActive ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'}`}>Dashboard</NavLink>
          <NavLink to="/students" className={({ isActive }) => `block py-2 px-4 rounded transition-colors ${isActive ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'}`}>Students</NavLink>
          <NavLink to="/courses" className={({ isActive }) => `block py-2 px-4 rounded transition-colors ${isActive ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'}`}>Courses</NavLink>
          <NavLink to="/departments" className={({ isActive }) => `block py-2 px-4 rounded transition-colors ${isActive ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'}`}>Departments</NavLink>
        </nav>
      </aside>

      <main className="flex-1 p-6 overflow-y-auto bg-white dark:bg-gray-900">
        <div className="flex justify-end items-center mb-6">
          <button 
            onClick={toggleDarkMode} 
            className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors focus:outline-none"
          >
            {darkMode ? '🌙' : '☀️'}
          </button>
        </div>
        <Outlet />
      </main>
    </div>
  );
};
export default AdminLayout;
