import { Link, Outlet } from 'react-router-dom';

const AdminLayout = ({ darkMode, toggleDarkMode }) => {
  return (
    <div className="flex h-screen dark:bg-gray-900 dark:text-white">
      <aside className="w-64 bg-gray-800 text-white p-4">
        <nav className="space-y-4">
          <Link to="/dashboard" className="block py-2 hover:bg-gray-700 px-2 rounded">Dashboard</Link>
          <Link to="/students" className="block py-2 hover:bg-gray-700 px-2 rounded">Students</Link>
          <Link to="/courses" className="block py-2 hover:bg-gray-700 px-2 rounded">Courses</Link>
          <Link to="/departments" className="block py-2 hover:bg-gray-700 px-2 rounded">Departments</Link>
        </nav>
      </aside>
      <main className="flex-1 p-6 overflow-y-auto">
        <div className="flex justify-between items-center mb-6 border-b pb-4">
          <h1 className="text-2xl font-bold">Admin Panel</h1>
          <button 
            onClick={toggleDarkMode} 
            className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            {darkMode ? '??' : '??'}
          </button>
        </div>
        <Outlet />
      </main>
    </div>
  );
};
export default AdminLayout;
