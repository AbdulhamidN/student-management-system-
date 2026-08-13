import { useState, useEffect } from 'react';
import { getDepartments } from '../../api/departments';
import { FaFilter } from 'react-icons/fa';

const DepartmentFilter = ({ selectedDepartment, onSelect }) => {
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDepartments = async () => {
            try {
                const data = await getDepartments();
                setDepartments(data);
            } catch (err) {
                console.error('Failed to fetch departments:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchDepartments();
    }, []);

    const handleChange = (e) => {
        const value = e.target.value;
        if (onSelect) {
            onSelect(value || null);
        }
    };

    return (
        <div className="flex items-center space-x-2">
            <FaFilter className="text-gray-400 dark:text-gray-500" />
            <select
                value={selectedDepartment || ''}
                onChange={handleChange}
                className="border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-white dark:bg-gray-700 text-gray-900 dark:text-white min-w-[180px]"
                disabled={loading}
            >
                <option value="">All Departments</option>
                {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                        {dept.name}
                    </option>
                ))}
            </select>
        </div>
    );
};
export default DepartmentFilter;
