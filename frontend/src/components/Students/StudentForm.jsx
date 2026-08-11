import { useState, useEffect } from 'react';
import { getDepartments } from '../../api/departments';
import { createStudent, updateStudent } from '../../api/students';

const StudentForm = ({ initialData, onSubmit, onCancel }) => {
    const [formData, setFormData] = useState({ name: '', email: '', phone: '', department_id: '' });
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchDepartments = async () => {
            try {
                const data = await getDepartments();
                setDepartments(data);
            } catch (err) {
                console.error('Failed to fetch departments:', err);
            }
        };
        fetchDepartments();

        if (initialData) {
            setFormData({
                name: initialData.name || '',
                email: initialData.email || '',
                phone: initialData.phone || '',
                department_id: initialData.department_id || '',
            });
        }
    }, [initialData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        setError(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            if (initialData) {
                await updateStudent(initialData.id, formData);
            } else {
                await createStudent(formData);
            }
            onSubmit();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    <h3 className="text-2xl font-bold text-gray-800 mb-2">{initialData ? '✏️ Edit Student' : '➕ Add New Student'}</h3>
                    <p className="text-gray-500 text-sm mb-6">{initialData ? 'Update the student information below.' : 'Fill in the details to add a new student.'}</p>
                    {error && (
                        <div className="bg-red-50 border-l-4 border-red-500 p-3 mb-4 rounded">
                            <p className="text-sm text-red-700">{error}</p>
                        </div>
                    )}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                            <input type="text" name="name" value={formData.name} onChange={handleChange} required
                                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                placeholder="e.g. John Doe" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                            <input type="email" name="email" value={formData.email} onChange={handleChange} required
                                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                placeholder="e.g. john@example.com" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                            <input type="tel" name="phone" value={formData.phone} onChange={handleChange}
                                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                placeholder="e.g. 123-456-7890" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                            <select name="department_id" value={formData.department_id} onChange={handleChange}
                                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition">
                                <option value="">Select Department</option>
                                {departments.map((dept) => (
                                    <option key={dept.id} value={dept.id}>{dept.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex justify-end space-x-3 pt-4">
                            <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg transition-colors">Cancel</button>
                            <button type="submit" disabled={loading}
                                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50">
                                {loading ? (
                                    <span className="flex items-center">
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                        </svg>
                                        Saving...
                                    </span>
                                ) : (initialData ? 'Update Student' : 'Add Student')}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};
export default StudentForm;
