import { useState } from 'react';
import Header from './components/Layout/Header';
import StudentList from './components/Students/StudentList';
import StudentForm from './components/Students/StudentForm';
import DepartmentFilter from './components/Filters/DepartmentFilter';
import CourseAssignModal from './components/Courses/CourseAssignModal';
import { getStudentsByDepartment } from './api/students';

function App() {
    const [showForm, setShowForm] = useState(false);
    const [editingStudent, setEditingStudent] = useState(null);
    const [assigningStudent, setAssigningStudent] = useState(null);
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [selectedDepartment, setSelectedDepartment] = useState(null);
    const [filteredStudents, setFilteredStudents] = useState(null);

    const handleRefresh = () => {
        setRefreshTrigger(prev => prev + 1);
    };

    const handleDepartmentFilter = async (deptId) => {
        setSelectedDepartment(deptId);
        if (deptId) {
            try {
                const students = await getStudentsByDepartment(deptId);
                setFilteredStudents(students);
            } catch (err) {
                console.error('Filter failed:', err);
            }
        } else {
            setFilteredStudents(null);
        }
        handleRefresh();
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />
            <main className="container mx-auto px-4 py-8">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                    <DepartmentFilter selectedDepartment={selectedDepartment} onSelect={handleDepartmentFilter} />
                    <button onClick={() => { setEditingStudent(null); setShowForm(true); }} 
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors flex items-center">
                        <span className="text-xl mr-2">+</span> Add Student
                    </button>
                </div>
                <StudentList
                    key={refreshTrigger}
                    refreshTrigger={refreshTrigger}
                    onEdit={(student) => { setEditingStudent(student); setShowForm(true); }}
                    onAssignCourse={(student) => { setAssigningStudent(student); }}
                />
                {showForm && (
                    <StudentForm
                        initialData={editingStudent}
                        onSubmit={() => { handleRefresh(); setShowForm(false); setEditingStudent(null); }}
                        onCancel={() => { setShowForm(false); setEditingStudent(null); }}
                    />
                )}
                {assigningStudent && (
                    <CourseAssignModal
                        student={assigningStudent}
                        onClose={() => setAssigningStudent(null)}
                        onSuccess={() => handleRefresh()}
                    />
                )}
            </main>
        </div>
    );
}
export default App;
