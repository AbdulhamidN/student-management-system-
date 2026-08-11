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
        <div className="bg-white rounded-xl shadow-md p-6 flex items-center space-x-4">
            <div className="bg-blue-100 p-3 rounded-full">
                <FaUsers className="text-blue-600 text-2xl" />
            </div>
            <div>
                <p className="text-sm text-gray-500 font-medium">Total Active Students</p>
                <p className="text-3xl font-bold text-gray-800">{loading ? '...' : count}</p>
            </div>
        </div>
    );
};
export default StudentCount;
