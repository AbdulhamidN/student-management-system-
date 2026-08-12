import { FaGraduationCap, FaBars } from 'react-icons/fa';
import StudentCount from '../Dashboard/StudentCount';

const Header = ({ onToggleSidebar }) => {
    return (
        <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
            <div className="container mx-auto px-4 py-4">
                <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={onToggleSidebar}
                            className="lg:hidden text-gray-600 hover:text-blue-600 transition-colors p-2 hover:bg-gray-100 rounded-lg"
                            aria-label="Toggle Sidebar"
                        >
                            <FaBars size={24} />
                        </button>
                        <div className="flex items-center space-x-2">
                            <FaGraduationCap className="text-blue-600 text-3xl" />
                            <div>
                                <h1 className="text-2xl font-bold text-gray-800">Student Management</h1>
                                <p className="text-xs text-gray-500 hidden sm:block">Manage students, departments, and courses</p>
                            </div>
                        </div>
                    </div>
                    <StudentCount />
                </div>
            </div>
        </header>
    );
};
export default Header;
