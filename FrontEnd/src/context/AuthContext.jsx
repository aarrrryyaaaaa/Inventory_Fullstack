import { createContext, useContext, useState, useEffect } from 'react';
import api, { setAuthToken } from '../api/api';

import Loading from '../components/Loading';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        const savedUser = localStorage.getItem('user_data');
        return savedUser ? JSON.parse(savedUser) : null;
    });
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [loading, setLoading] = useState(() => {
        const savedToken = localStorage.getItem('token');
        const savedUser = localStorage.getItem('user_data');
        return !(savedToken && savedUser);
    });

    useEffect(() => {
        if (token) {
            setAuthToken(token);
            fetchProfile();

            // Auto-logout logic based on JWT expiry
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                const expiryTime = payload.exp * 1000;
                const timeout = expiryTime - Date.now();

                if (timeout <= 0) {
                    logout();
                } else {
                    const timer = setTimeout(() => {
                        logout();
                        window.location.href = '/'; // Redirect to login
                    }, timeout);
                    return () => clearTimeout(timer);
                }
            } catch (e) {
                console.error("Token parse error", e);
            }
        } else {
            setAuthToken(null);
            setLoading(false);
        }
    }, [token]);

    const fetchProfile = async () => {
        try {
            const res = await api.get('/auth/profile');
            setUser(res.data);
        } catch (err) {
            console.error(err);
            logout();
        } finally {
            setLoading(false);
        }
    };

    const login = (newToken, userData) => {
        setToken(newToken);
        setUser(userData);
        localStorage.setItem('token', newToken);
        localStorage.setItem('user_data', JSON.stringify(userData));
    };

    const logout = () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user_data');
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout, loading }}>
            {loading ? <Loading /> : children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
