import { FaGraduationCap, FaBars } from 'react-icons/fa';

const Header = ({ onToggleSidebar, darkMode, onToggleDarkMode }) => {
    return (
        <header className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
            <div className="container mx-auto px-4 py-4">
                <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={onToggleSidebar}
                            className="lg:hidden text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                            aria-label="Toggle Sidebar"
                        >
                            <FaBars size={24} />
                        </button>
                        <div className="flex items-center space-x-2">
                            <FaGraduationCap className="text-blue-600 dark:text-blue-400 text-3xl" />
                            <div>
                                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Student Management</h1>
                                <p className="text-xs text-gray-500 dark:text-gray-400 hidden sm:block">Manage students, departments, and courses</p>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={onToggleDarkMode}
                            className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-2xl"
                            aria-label="Toggle Dark Mode"
                        >
                            {darkMode ? '☀️' : '🌙'}
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
};
export default Header;
