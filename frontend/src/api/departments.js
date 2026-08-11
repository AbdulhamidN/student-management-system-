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
