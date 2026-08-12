import { useState } from 'react';
import Header from './components/Layout/Header';
import Sidebar from './components/Layout/Sidebar';
import Footer from './components/Layout/Footer';
import StudentList from './components/Students/StudentList';
import StudentForm from './components/Students/StudentForm';
import DepartmentFilter from './components/Filters/DepartmentFilter';
import CourseAssignModal from './components/Courses/CourseAssignModal';

function App() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [editingStudent, setEditingStudent] = useState(null);
    const [assigningStudent, setAssigningStudent] = useState(null);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
    const closeSidebar = () => setIsSidebarOpen(false);

    const handleRefresh = () => {
        setRefreshTrigger(prev => prev + 1);
    };

    return (
        <div className="flex min-h-screen bg-gray-50 overflow-x-hidden">
            <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />
            <div className="flex-1 flex flex-col min-h-screen w-full">
                <Header onToggleSidebar={toggleSidebar} />
                <main className="flex-1 container mx-auto px-4 py-8">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                        <DepartmentFilter />
                        <button
                            onClick={() => { setEditingStudent(null); setShowForm(true); }}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors flex items-center shadow-md"
                        >
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
                <Footer />
            </div>
        </div>
    );
}
export default App;
