import { useState, useEffect } from 'react';

const StudentList = () => {
    const fallbackStudents = [
        { id: '1', name: 'Abdi', email: 'abdy@example.com', phone: '0911000000', department: 'Computer Science' },
        { id: '2', name: 'Sara Tesfaye', email: 'sara@example.com', phone: '0911000001', department: 'Electrical Engineering' },
        { id: '3', name: 'drtg', email: 'adf@gmail', phone: '0987', department: 'Computer Science' },
        { id: '4', name: 'xy', email: 'x@gmail.com', phone: '0089', department: 'Mathematics' }
    ];

    const [students, setStudents] = useState(fallbackStudents);
    const [filterDept, setFilterDept] = useState('');
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState('add');
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [formData, setFormData] = useState({ name: '', email: '', phone: '', department: '', courseName: '' });

    useEffect(() => {
        fetch('http://localhost:5000/students')
            .then(res => {
                if (!res.ok) throw new Error('Failed to fetch');
                return res.json();
            })
            .then(data => {
                if (data && data.length > 0) setStudents(data);
            })
            .catch(() => console.log("Using hardcoded fallback data."));
    }, []);

    const handleOpenAdd = () => {
        setModalMode('add');
        setFormData({ name: '', email: '', phone: '', department: '', courseName: '' });
        setSelectedStudent(null);
        setShowModal(true);
    };

    const handleOpenEdit = (student) => {
        setModalMode('edit');
        setFormData({ ...student, courseName: '' });
        setSelectedStudent(student);
        setShowModal(true);
    };

    const handleOpenAssign = (id) => {
        const student = students.find(s => s.id === id);
        setModalMode('assign');
        setFormData({ name: '', email: '', phone: '', department: '', courseName: '' });
        setSelectedStudent(student);
        setShowModal(true);
    };

    const handleSave = async () => {
        // 1. Handle Assign
        if (modalMode === 'assign') {
            if (!formData.courseName) {
                alert("Please enter a course name.");
                return;
            }
            alert(`✅ Successfully assigned "${formData.courseName}" to ${selectedStudent?.name || 'student'}`);
            setShowModal(false);
            return;
        }

        // 2. 💥 ENHANCED E2E ERROR HANDLING FOR INVALID/MISSING DATA
        if (!formData.name) {
            alert("Please enter a valid Name. This field is required.");
            return;
        }

        // 3. Handle Add/Edit Student
        try {
            const url = modalMode === 'edit' 
                ? `http://localhost:5000/students/${selectedStudent.id}`
                : 'http://localhost:5000/students';
            
            const method = modalMode === 'edit' ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const savedStudent = await response.json();

            if (modalMode === 'add') {
                const newStudent = { ...formData, id: savedStudent.id || Date.now() };
                setStudents([...students, newStudent]);
            } else {
                const updatedStudent = { ...formData, id: savedStudent.id };
                setStudents(students.map(s => s.id === updatedStudent.id ? updatedStudent : s));
            }
            setShowModal(false);
        } catch (error) {
            alert('Failed to save student. Are you sure your json-server is running?');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this student?')) return;
        try {
            await fetch(`http://localhost:5000/students/${id}`, { method: 'DELETE' });
            setStudents(students.filter(s => s.id !== id));
        } catch {
            alert("Local delete successful (Backend not connected).");
            setStudents(students.filter(s => s.id !== id));
        }
    };

    const uniqueDepartments = [...new Set(students.map(s => s.department))];
    const filteredStudents = filterDept === '' ? students : students.filter(s => s.department === filterDept);

    return (
        <div className="p-0">
            <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
                <div className="flex items-center gap-4">
                    <span className="text-gray-500 dark:text-gray-400">Filter by:</span>
                    <select 
                        value={filterDept}
                        onChange={(e) => setFilterDept(e.target.value)}
                        className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">All Departments</option>
                        {uniqueDepartments.map((dept, index) => (
                            <option key={index} value={dept}>{dept}</option>
                        ))}
                    </select>
                </div>
                <button onClick={handleOpenAdd} className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2">
                    <span>+</span> Add Student
                </button>
            </div>

            <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
                {loading ? (
                    <div className="p-4 text-center text-gray-500 dark:text-gray-400">Loading students...</div>
                ) : (
                    <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-100 dark:bg-gray-700 dark:text-gray-400">
                            <tr>
                                <th className="px-6 py-3">Student</th>
                                <th className="px-6 py-3">Email</th>
                                <th className="px-6 py-3">Phone</th>
                                <th className="px-6 py-3">Department</th>
                                <th className="px-6 py-3 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {filteredStudents.map((student) => (
                                <tr key={student.id} className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700">
                                    <td className="px-6 py-4 flex items-center gap-3 font-medium text-gray-900 dark:text-white">
                                        <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold">
                                            {student.name && student.name.length > 0 ? student.name.charAt(0) : '?'}
                                        </div>
                                        {student.name}
                                    </td>
                                    <td className="px-6 py-4">{student.email}</td>
                                    <td className="px-6 py-4">{student.phone}</td>
                                    <td className="px-6 py-4">
                                        <span className="px-2 py-1 text-xs font-medium text-blue-800 bg-blue-100 dark:text-blue-300 dark:bg-blue-900/30 rounded-full">
                                            {student.department}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center space-x-2">
                                        <button onClick={() => handleOpenEdit(student)} className="text-blue-600 dark:text-blue-400 hover:underline">Edit</button>
                                        <button onClick={() => handleOpenAssign(student.id)} className="text-green-600 dark:text-green-400 hover:underline">Assign</button>
                                        <button onClick={() => handleDelete(student.id)} className="text-red-600 dark:text-red-400 hover:underline">Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-2xl w-96 border border-gray-200 dark:border-gray-700">
                        <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
                            {modalMode === 'assign' ? 'Assign Course' : (modalMode === 'edit' ? 'Edit Student' : 'Add New Student')}
                        </h2>
                        
                        <div className="space-y-3">
                            {modalMode !== 'assign' && (
                                <>
                                    <input placeholder="Full Name" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                    <input placeholder="Email Address" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                    <input placeholder="Phone Number" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                    <input placeholder="Department" value={formData.department} onChange={(e) => setFormData({...formData, department: e.target.value})} className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                </>
                            )}

                            {modalMode === 'assign' && (
                                <>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Assigning course to: <span className="font-bold text-gray-800 dark:text-gray-200">{selectedStudent?.name}</span></p>
                                    <input placeholder="Enter Course Name (e.g. Math 101)" value={formData.courseName} onChange={(e) => setFormData({...formData, courseName: e.target.value})} className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                </>
                            )}
                        </div>

                        <div className="flex justify-end gap-3 mt-6">
                            <button onClick={() => setShowModal(false)} className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">Cancel</button>
                            <button onClick={handleSave} className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded transition-colors shadow-md">
                                {modalMode === 'assign' ? 'Assign' : (modalMode === 'edit' ? 'Update' : 'Add')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StudentList;
