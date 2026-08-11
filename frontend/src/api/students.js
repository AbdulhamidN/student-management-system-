import { apiRequest } from './config';

export const getStudents = async () => {
    const response = await apiRequest('/students');
    return response.data;
};
export const getStudentById = async (id) => {
    const response = await apiRequest(`/students/${id}`);
    return response.data;
};
export const createStudent = async (studentData) => {
    const response = await apiRequest('/students', {
        method: 'POST',
        body: JSON.stringify(studentData),
    });
    return response;
};
export const updateStudent = async (id, studentData) => {
    const response = await apiRequest(`/students/${id}`, {
        method: 'PUT',
        body: JSON.stringify(studentData),
    });
    return response;
};
export const deleteStudent = async (id) => {
    const response = await apiRequest(`/students/${id}`, {
        method: 'DELETE',
    });
    return response;
};
export const getStudentCount = async () => {
    const response = await apiRequest('/students/count');
    return response.count;
};
export const getStudentsByDepartment = async (departmentId) => {
    const response = await apiRequest(`/students/department/${departmentId}`);
    return response.data;
};
export const assignCourseToStudent = async (studentId, courseId) => {
    const response = await apiRequest(`/students/${studentId}/courses`, {
        method: 'POST',
        body: JSON.stringify({ courseId }),
    });
    return response;
};
export const getStudentCourses = async (studentId) => {
    const response = await apiRequest(`/students/${studentId}/courses`);
    return response.data;
};
export const removeCourseFromStudent = async (studentId, courseId) => {
    const response = await apiRequest(`/students/${studentId}/courses/${courseId}`, {
        method: 'DELETE',
    });
    return response;
};