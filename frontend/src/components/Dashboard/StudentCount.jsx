import { useState, useEffect } from 'react';
import { getStudentCount } from '../../api/students';
import { FaUsers } from 'react-icons/fa';

const StudentCount = () => {
    const [count, setCount] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCount = async () => {
            try {
                const data = await getStudentCount();
                setCount(data);
            } catch (err) {
                console.error('Failed to fetch student count:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchCount();
    }, []);

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 flex items-center space-x-3 border border-gray-200 dark:border-gray-700">
            <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-full">
                <FaUsers className="text-blue-600 dark:text-blue-400 text-lg" />
            </div>
            <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Total Active Students</p>
                <p className="text-2xl font-bold text-gray-800 dark:text-white">{loading ? '...' : count}</p>
            </div>
        </div>
    );
};
export default StudentCount;
