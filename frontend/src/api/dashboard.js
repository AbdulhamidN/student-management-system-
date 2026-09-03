import { apiRequest } from './config';

export const getAdminDashboard = async () => {
  const response = await apiRequest('/dashboard/admin');
  return response.data || response;
};
