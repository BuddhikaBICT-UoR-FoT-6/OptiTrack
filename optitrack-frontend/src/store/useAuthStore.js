import { create } from 'zustand';
import api from '../api/axios';

const useAuthStore = create((set, get) => ({
    user: JSON.parse(localStorage.getItem('user')) || null,
    token: localStorage.getItem('token') || null,
    isAuthenticated: !!localStorage.getItem('token'),
    loading: false,
    error: null,

    login: async (credentials) => {
        set({ loading: true, error: null });
        try {
            const response = await api.post('/auth/login', credentials);
            const { token, ...userData } = response.data;

            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(userData));

            set({
                token,
                user: userData,
                isAuthenticated: true,
                loading: false
            });
            return true;
        } catch (err) {
            set({
                error: err.response?.data?.message || 'Login failed',
                loading: false
            });
            return false;
        }
    },

    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        set({ user: null, token: null, isAuthenticated: false });
    },

    /**
     * Role-Based Access Control Helper
     * @param {string} roleName - e.g. 'ROLE_ADMIN' or 'ROLE_USER'
     */
    hasRole: (roleName) => {
        const user = get().user;
        if (!user || !user.roles) return false;
        // The backend roles are usually objects: { id: 1, name: "ROLE_ADMIN" }
        return user.roles.some(role => 
            (typeof role === 'string' ? role === roleName : role.name === roleName)
        );
    }
}));

export default useAuthStore;
