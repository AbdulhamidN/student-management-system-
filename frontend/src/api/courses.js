import { apiRequest } from './config';

export const getCourses = async () => {
    const response = await apiRequest('/courses');
    return response.data || response;
};
export const getCoursesByDepartment = async (departmentId) => {
    const response = await apiRequest(`/courses/department/${departmentId}`);
    return response.data || response;
};
