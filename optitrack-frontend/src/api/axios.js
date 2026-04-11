import axios from 'axios';
import { cache } from '../utils/cache';

const api = axios.create({
    baseURL: (import.meta.env.VITE_API_URL || 'http://localhost:8080') + '/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor: attach JWT token to every outgoing request
api.interceptors.request.use((config) => {
    const token = sessionStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Response interceptor: auto-logout on 401 (expired token) or unexpected 403
api.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error.response?.status;
        // 401 = token expired/invalid, 403 on /auth endpoints = bad credentials
        if (status === 401) {
            // Clear auth state and stale cache, then redirect to login
            sessionStorage.removeItem('token');
            sessionStorage.removeItem('user');
            cache.invalidatePrefix('');
            if (window.location.pathname !== '/login') {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default api;
