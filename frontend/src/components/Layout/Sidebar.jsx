import { FaHome, FaUserGraduate, FaBook, FaBuilding, FaSignOutAlt, FaTimes } from 'react-icons/fa';

const Sidebar = ({ isOpen, onClose }) => {
    const handleClick = (section) => {
        if (section === 'students') {
            window.location.href = '/';
        } else if (section === 'dashboard') {
            window.location.href = '/';
        } else {
            const capitalized = section.charAt(0).toUpperCase() + section.slice(1);
            alert(`[PIN] ${capitalized} section will be available in the next update.`);
        }
        onClose();
    };

    return (
        <>
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
                    onClick={onClose}
                ></div>
            )}
            <aside className={`
                fixed top-0 left-0 h-screen w-64 bg-white shadow-2xl z-50 transition-transform duration-300 ease-in-out
                ${isOpen ? 'translate-x-0' : '-translate-x-full'}
                lg:translate-x-0 lg:static lg:shadow-lg lg:z-40
                border-r border-gray-200
            `}>
                <div className="flex justify-between items-center p-4 border-b border-gray-200 lg:hidden">
                    <h2 className="text-xl font-bold text-blue-600">📚 Menu</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <FaTimes size={24} />
                    </button>
                </div>
                <div className="p-4 border-b border-gray-200 hidden lg:block">
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
                            onClick={() => alert('Logout functionality coming soon!')}
                            className="w-full flex items-center space-x-3 p-3 text-red-500 hover:bg-red-50 rounded-lg transition"
                        >
                            <FaSignOutAlt /> <span>Logout</span>
                        </button>
                    </div>
                </nav>
            </aside>
        </>
    );
};
export default Sidebar;