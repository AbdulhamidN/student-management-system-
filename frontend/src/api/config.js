export const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const apiRequest = async (endpoint, options = {}) => {
    const token = localStorage.getItem('sms_auth_token');
    const headers = {
        ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
        ...(options.headers || {}),
    };
    if (token) headers.Authorization = `Bearer ${token}`;

    const response = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });
    const text = await response.text();
    let data = {};
    try { data = text ? JSON.parse(text) : {}; } catch { data = { message: text }; }

    if (!response.ok) {
        if (response.status === 401) {
            localStorage.removeItem('sms_auth_token');
            localStorage.removeItem('sms_auth_user');
        }
        throw new Error(data.message || data.error || 'Something went wrong');
    }
    return data;
};
