import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('wa_user');
    const storedToken = localStorage.getItem('wa_token');

    if (storedUser && storedToken) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setToken(storedToken);
        api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
      } catch (err) {
        console.error('Error parsing stored user:', err);
        localStorage.removeItem('wa_user');
        localStorage.removeItem('wa_token');
      }
    }

    setLoading(false);
  }, []);

  const login = useCallback(async (email, password) => {
    try {
      const { data } = await api.post('/auth/login', { email, password });

      setUser(data);
      setToken(data.token);
      localStorage.setItem('wa_user', JSON.stringify(data));
      localStorage.setItem('wa_token', data.token);
      api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;

      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed. Please try again.';
      return { success: false, message };
    }
  }, []);

  const register = useCallback(async (username, email, password) => {
    try {
      const { data } = await api.post('/auth/register', { username, email, password });

      setUser(data);
      setToken(data.token);
      localStorage.setItem('wa_user', JSON.stringify(data));
      localStorage.setItem('wa_token', data.token);
      api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;

      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed. Please try again.';
      return { success: false, message };
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('wa_user');
    localStorage.removeItem('wa_token');
    delete api.defaults.headers.common['Authorization'];
  }, []);

  const updateUser = useCallback((updatedUser) => {
    const merged = { ...user, ...updatedUser };
    setUser(merged);
    localStorage.setItem('wa_user', JSON.stringify(merged));
  }, [user]);

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!user && !!token,
    login,
    register,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
