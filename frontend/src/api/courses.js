import { apiRequest } from './config';

export const getCourses = async () => {
    const response = await apiRequest('/courses');
    return response.data || response;
};
export const getCoursesByDepartment = async (departmentId) => {
    const response = await apiRequest(`/courses/department/${departmentId}`);
    return response.data || response;
};
export const createCourse = async (course) => {
    const response = await apiRequest('/courses', {
        method: 'POST',
        body: JSON.stringify(course),
    });
    return response;
};
export const updateCourse = async (id, course) => {
    const response = await apiRequest(`/courses/${id}`, {
        method: 'PUT',
        body: JSON.stringify(course),
    });
    return response;
};
export const deleteCourse = async (id) => {
    const response = await apiRequest(`/courses/${id}`, {
        method: 'DELETE',
    });
    return response;
};
