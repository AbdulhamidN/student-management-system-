export const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const apiRequest = async (endpoint, options = {}) => {
    const url = `${API_BASE}${endpoint}`;
    const response = await fetch(url, {
        headers: { 'Content-Type': 'application/json', ...options.headers },
        ...options,
    });
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.message || data.error || 'Something went wrong');
    }
    return data;
};