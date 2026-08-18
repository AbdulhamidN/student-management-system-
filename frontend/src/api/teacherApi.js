import { apiRequest } from './config';

export const getTeacherProfile = async () => {
  const response = await apiRequest('/teachers/me');
  return response.data;
};

export const updateTeacherProfile = async (profileData) => {
  const response = await apiRequest('/teachers/me', {
    method: 'PUT',
    body: JSON.stringify(profileData),
  });
  return response;
};

export const getStudentsForGradebook = async (scoped = false) => {
  const query = scoped ? '?scoped=true' : '';
  const response = await apiRequest(`/students${query}`);
  return response.data;
};

export const updateStudentMarks = async (studentId, marks) => {
  const response = await apiRequest(`/students/${studentId}/marks`, {
    method: 'PATCH',
    body: JSON.stringify(marks),
  });
  return response;
};
