import { FaGraduationCap } from 'react-icons/fa';
import StudentCount from '../Dashboard/StudentCount';

const Header = () => {
    return (
        <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
            <div className="container mx-auto px-4 py-4">
                <div className="flex flex-col sm:flex-row justify-between items-center">
                    <div className="flex items-center space-x-2 mb-3 sm:mb-0">
                        <FaGraduationCap className="text-blue-600 text-3xl" />
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800">Student Management</h1>
                            <p className="text-xs text-gray-500">Manage students, departments, and courses</p>
                        </div>
                    </div>
                    <StudentCount />
                </div>
            </div>
        </header>
    );
};
export default Header;
