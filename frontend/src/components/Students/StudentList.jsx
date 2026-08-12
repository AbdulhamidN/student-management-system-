import { useState, useEffect } from 'react';
import { getStudents, getStudentsByDepartment } from '../../api/students';
import ErrorMessage from '../Common/ErrorMessage';
import Loader from '../Common/Loader';

const StudentList = ({ selectedDepartmentId, onEdit, onAssignCourse, refreshTrigger }) => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchStudents = async () => {
            try {
                setLoading(true);
                setError(null);
                let data;
                if (selectedDepartmentId) {
                    data = await getStudentsByDepartment(selectedDepartmentId);
                } else {
                    data = await getStudents();
                }
                setStudents(data || []);
            } catch (err) {
                setError('Failed to fetch students: ' + (err.message || 'Unknown error'));
                console.error('Error fetching students:', err);
                setStudents([]);
            } finally {
                setLoading(false);
            }
        };
        fetchStudents();
    }, [selectedDepartmentId, refreshTrigger]);

    if (loading) return <Loader />;
    if (error) return <ErrorMessage message={error} />;

    return (
        <div className="p-0">
            {/* Students Table */}
            <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
                <table className="w-full text-sm text-left whitespace-nowrap">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-100 dark:bg-gray-700 dark:text-gray-400">
                        <tr>
                            <th className="px-6 py-3 min-w-max">Student</th>
                            <th className="px-6 py-3 min-w-max">Email</th>
                            <th className="px-6 py-3 min-w-max">Phone</th>
                            <th className="px-6 py-3 min-w-max">Department</th>
                            <th className="px-6 py-3 text-center min-w-max">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {students.length > 0 ? (
                            students.map((student) => (
                                <tr key={student.id} className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700">
                                    <td className="px-6 py-4 flex items-center gap-3 font-medium text-gray-900 dark:text-white min-w-max">
                                        <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                                            {student.name.charAt(0)}
                                        </div>
                                        {student.name}
                                    </td>
                                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white min-w-max">{student.email}</td>
                                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white min-w-max">{student.phone}</td>
                                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white min-w-max">
                                        {student.department_name}
                                    </td>
                                    <td className="px-6 py-4 text-center space-x-2 min-w-max text-blue-600 dark:text-blue-400">
                                        <button 
                                            onClick={() => onEdit(student)}
                                            className="text-blue-600 dark:text-blue-400 hover:underline"
                                        >
                                            Edit
                                        </button>
                                        <button 
                                            onClick={() => onAssignCourse(student)}
                                            className="text-green-600 dark:text-green-400 hover:underline"
                                        >
                                            Assign
                                        </button>
                                        <button className="text-red-600 dark:text-red-400 hover:underline">Delete</button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5" className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                                    No students found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default StudentList;
