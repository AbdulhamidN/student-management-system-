import StudentList from '../components/Students/StudentList';

const Students = () => {
    // Hardcode the count to 4 for the screenshot, or later we'll make it dynamic
    const activeCount = 4;

    return (
        <div className="p-0">
            {/* Header Row with Title and Active Students Card */}
            <div className="flex justify-between items-start mb-6 border-b pb-4">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        🎓 Student Management
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Manage students, departments, and courses</p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-3 px-5 rounded-lg shadow-sm flex items-center gap-4 border border-gray-200 dark:border-gray-700">
                    <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-full text-blue-500">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Total Active Students</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{activeCount}</p>
                    </div>
                </div>
            </div>

            <StudentList />
        </div>
    );
};

export default Students;

