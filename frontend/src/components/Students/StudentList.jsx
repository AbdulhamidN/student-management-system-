import { useState, useEffect } from 'react';
import { getStudents, deleteStudent } from '../../api/students';
import Loader from '../Common/Loader';
import ErrorMessage from '../Common/ErrorMessage';
import EmptyState from '../Common/EmptyState';
import { FaEdit, FaTrash, FaBook, FaUserGraduate } from 'react-icons/fa';

const StudentList = ({ refreshTrigger, onEdit, onAssignCourse }) => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchStudents = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await getStudents();
            setStudents(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStudents();
    }, [refreshTrigger]);

    const handleDelete = async (id, name) => {
        if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
            try {
                await deleteStudent(id);
                fetchStudents();
            } catch (err) {
                alert('Failed to delete student: ' + err.message);
            }
        }
    };

    if (loading) return <Loader />;
    if (error) return <ErrorMessage message={error} onRetry={fetchStudents} />;
    if (students.length === 0) {
        return (
            <EmptyState
                icon="👨‍🎓"
                message="No active students found"
                action={
                    <button onClick={() => onEdit(null)} className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg">
                        Add your first student
                    </button>
                }
            />
        );
    }

    return (
        <div className="overflow-x-auto shadow-md rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {students.map((student) => (
                        <tr key={student.id} className="hover:bg-gray-50 transition">
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                                        <FaUserGraduate className="text-blue-600" />
                                    </div>
                                    <div className="ml-4">
                                        <div className="text-sm font-medium text-gray-900">{student.name}</div>
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.email}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.phone || '-'}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                    {student.department_name || 'None'}
                                </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-3">
                                <button onClick={() => onEdit(student)} className="text-indigo-600 hover:text-indigo-900 transition-colors" title="Edit">
                                    <FaEdit className="inline mr-1" /> Edit
                                </button>
                                <button onClick={() => onAssignCourse(student)} className="text-green-600 hover:text-green-900 transition-colors" title="Assign Course">
                                    <FaBook className="inline mr-1" /> Assign
                                </button>
                                <button onClick={() => handleDelete(student.id, student.name)} className="text-red-600 hover:text-red-900 transition-colors" title="Delete">
                                    <FaTrash className="inline mr-1" /> Delete
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};
export default StudentList;