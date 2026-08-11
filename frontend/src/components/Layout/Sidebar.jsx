import { FaHome, FaUserGraduate, FaBook, FaBuilding, FaSignOutAlt } from 'react-icons/fa';

const Sidebar = () => {
    const handleClick = (section) => {
        if (section === 'students') {
            window.location.href = '/';
        } else if (section === 'dashboard') {
            window.location.href = '/';
        } else {
            alert(📌  section will be available in the next update.);
        }
    };

    return (
        <aside className="w-64 bg-white shadow-lg h-screen sticky top-0 border-r border-gray-200">
            <div className="p-4 border-b border-gray-200">
                <h2 className="text-xl font-bold text-blue-600">📚 Admin Panel</h2>
            </div>
            <nav className="p-4 space-y-2">
                <button
                    onClick={() => handleClick('dashboard')}
                    className="w-full flex items-center space-x-3 p-3 bg-blue-50 text-blue-600 rounded-lg transition hover:bg-blue-100"
                >
                    <FaHome /> <span>Dashboard</span>
                </button>
                <button
                    onClick={() => handleClick('students')}
                    className="w-full flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg transition"
                >
                    <FaUserGraduate /> <span>Students</span>
                </button>
                <button
                    onClick={() => handleClick('courses')}
                    className="w-full flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg transition"
                >
                    <FaBook /> <span>Courses</span>
                </button>
                <button
                    onClick={() => handleClick('departments')}
                    className="w-full flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg transition"
                >
                    <FaBuilding /> <span>Departments</span>
                </button>
                <div className="pt-4 border-t border-gray-200 mt-4">
                    <button
                        onClick={() => alert('🚪 Logout functionality coming soon!')}
                        className="w-full flex items-center space-x-3 p-3 text-red-500 hover:bg-red-50 rounded-lg transition"
                    >
                        <FaSignOutAlt /> <span>Logout</span>
                    </button>
                </div>
            </nav>
        </aside>
    );
};
export default Sidebar;
