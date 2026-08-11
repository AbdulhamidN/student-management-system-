import { useState, useEffect } from 'react';
import { getCourses } from '../../api/courses';
import { getStudentCourses, assignCourseToStudent, removeCourseFromStudent } from '../../api/students';
import { FaPlus, FaTimes } from 'react-icons/fa';

const CourseAssignModal = ({ student, onClose, onSuccess }) => {
    const [courses, setCourses] = useState([]);
    const [assignedCourses, setAssignedCourses] = useState([]);
    const [availableCourses, setAvailableCourses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedCourse, setSelectedCourse] = useState('');

    const fetchData = async () => {
        setLoading(true);
        try {
            const allCourses = await getCourses();
            const studentCourses = await getStudentCourses(student.id);
            const assignedIds = studentCourses.map(c => c.id);
            setAssignedCourses(studentCourses);
            setAvailableCourses(allCourses.filter(c => !assignedIds.includes(c.id)));
        } catch (err) {
            console.error('Failed to fetch course data:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [student]);

    const handleAssign = async () => {
        if (!selectedCourse) return;
        try {
            await assignCourseToStudent(student.id, selectedCourse);
            await fetchData();
            setSelectedCourse('');
            onSuccess();
        } catch (err) {
            alert(err.message);
        }
    };

    const handleRemove = async (courseId) => {
        if (window.confirm('Remove this course from the student?')) {
            try {
                await removeCourseFromStudent(student.id, courseId);
                await fetchData();
                onSuccess();
            } catch (err) {
                alert(err.message);
            }
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-2xl font-bold text-gray-800">Assign Courses to {student.name}</h3>
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors"><FaTimes size={24} /></button>
                    </div>
                    {loading ? (
                        <p className="text-gray-500">Loading courses...</p>
                    ) : (
                        <>
                            <div className="mb-6">
                                <h4 className="text-sm font-semibold text-gray-700 mb-2">Assigned Courses</h4>
                                {assignedCourses.length === 0 ? (
                                    <p className="text-gray-400 text-sm">No courses assigned</p>
                                ) : (
                                    <div className="space-y-2">
                                        {assignedCourses.map((course) => (
                                            <div key={course.id} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                                                <div>
                                                    <p className="font-medium text-gray-800">{course.name}</p>
                                                    <p className="text-sm text-gray-500">{course.code}</p>
                                                </div>
                                                <button onClick={() => handleRemove(course.id)} className="text-red-500 hover:text-red-700 text-sm">Remove</button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                            {availableCourses.length > 0 && (
                                <div>
                                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Available Courses</h4>
                                    <div className="flex space-x-2">
                                        <select value={selectedCourse} onChange={(e) => setSelectedCourse(e.target.value)}
                                            className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500">
                                            <option value="">Select a course</option>
                                            {availableCourses.map((course) => (
                                                <option key={course.id} value={course.id}>{course.name} ({course.code})</option>
                                            ))}
                                        </select>
                                        <button onClick={handleAssign} disabled={!selectedCourse}
                                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50">
                                            <FaPlus className="inline mr-1" /> Assign
                                        </button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};
export default CourseAssignModal;
