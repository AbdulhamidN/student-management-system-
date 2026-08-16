import { apiRequest } from './config';

export const getStudents = async () => (await apiRequest('/students')).data;
export const getStudentById = async (id) => (await apiRequest(`/students/${id}`)).data;
export const createStudent = async (studentData) => apiRequest('/students', { method: 'POST', body: JSON.stringify(studentData) });
export const updateStudent = async (id, studentData) => apiRequest(`/students/${id}`, { method: 'PUT', body: JSON.stringify(studentData) });
export const deleteStudent = async (id) => apiRequest(`/students/${id}`, { method: 'DELETE' });
export const getStudentCount = async () => (await apiRequest('/students/count')).count;
export const getStudentsByDepartment = async (departmentId) => (await apiRequest(`/students/department/${departmentId}`)).data;
export const assignCourseToStudent = async (studentId, courseId) => apiRequest(`/students/${studentId}/courses`, { method: 'POST', body: JSON.stringify({ courseId }) });
export const getStudentCourses = async (studentId) => (await apiRequest(`/students/${studentId}/courses`)).data;
export const setStudentCourses = async (studentId, courseIds) => apiRequest(`/students/${studentId}/courses`, { method: 'PUT', body: JSON.stringify({ courseIds }) });
export const removeCourseFromStudent = async (studentId, courseId) => apiRequest(`/students/${studentId}/courses/${courseId}`, { method: 'DELETE' });
export const importStudents = async (file) => {
    const form = new FormData();
    form.append('file', file);
    return apiRequest('/students/import', { method: 'POST', body: form });
};
