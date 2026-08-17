import { apiRequest } from './config';

export const getDepartments = async () => {
    const response = await apiRequest('/departments');
    return response.data || response;
};
export const createDepartment = async (name) => {
    const response = await apiRequest('/departments', {
        method: 'POST',
        body: JSON.stringify({ name }),
    });
    return response;
};
export const updateDepartment = async (id, name) => {
    const response = await apiRequest(`/departments/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ name }),
    });
    return response;
};
export const deleteDepartment = async (id) => {
    const response = await apiRequest(`/departments/${id}`, {
        method: 'DELETE',
    });
    return response;
};
