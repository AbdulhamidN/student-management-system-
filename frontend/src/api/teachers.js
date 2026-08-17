import { apiRequest } from './config';

export const getTeachers = async () => (await apiRequest('/teachers')).data;
export const createTeacher = async (teacherData) => apiRequest('/teachers', { method: 'POST', body: JSON.stringify(teacherData) });
export const updateTeacher = async (id, teacherData) => apiRequest(`/teachers/${id}`, { method: 'PUT', body: JSON.stringify(teacherData) });
export const deleteTeacher = async (id) => apiRequest(`/teachers/${id}`, { method: 'DELETE' });
export const getTeacherCourses = async (id) => (await apiRequest(`/teachers/${id}/courses`)).data;
