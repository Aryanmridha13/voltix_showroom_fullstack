import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('voltix_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => localStorage.getItem('voltix_access_token'));
  const [loading, setLoading] = useState(true);

  const clearStorage = useCallback(() => {
    localStorage.removeItem('voltix_access_token');
    localStorage.removeItem('voltix_refresh_token');
    localStorage.removeItem('voltix_user');
    setUser(null);
    setToken(null);
  }, []);

  const logout = useCallback(async () => {
    const currentToken = localStorage.getItem('voltix_access_token');
    try {
      if (currentToken) {
        await api.post('/auth/logout/');
      }
    } catch {
      // Ignore network errors on logout
    } finally {
      clearStorage();
    }
  }, [clearStorage]);

  // Synchronize profile on app boot if token exists
  useEffect(() => {
    const fetchCurrentUser = async () => {
      const accessToken = localStorage.getItem('voltix_access_token');
      if (accessToken) {
        try {
          const res = await api.get('/auth/me/');
          const userData = res.data?.data || res.data;
          setUser(userData);
          localStorage.setItem('voltix_user', JSON.stringify(userData));
        } catch (err) {
          if (err.response?.status === 401) {
            clearStorage();
          }
        }
      }
      setLoading(false);
    };

    fetchCurrentUser();

    // Listen for custom logout event emitted by API interceptor
    const handleRemoteLogout = () => {
      clearStorage();
    };
    window.addEventListener('voltix:auth_logout', handleRemoteLogout);
    return () => window.removeEventListener('voltix:auth_logout', handleRemoteLogout);
  }, [clearStorage]);

  const login = async (email, password) => {
    const res = await api.post('/auth/login/', { email, password });
    const payload = res.data?.data || res.data;

    const accessToken = payload.tokens?.access || payload.access;
    const refreshToken = payload.tokens?.refresh || payload.refresh;
    const userData = payload.user || {
      id: payload.user_id,
      email: payload.email,
      username: payload.username,
      role: payload.role,
      full_name: payload.full_name,
    };

    if (accessToken) {
      localStorage.setItem('voltix_access_token', accessToken);
      setToken(accessToken);
    }
    if (refreshToken) {
      localStorage.setItem('voltix_refresh_token', refreshToken);
    }
    if (userData) {
      localStorage.setItem('voltix_user', JSON.stringify(userData));
      setUser(userData);
    }

    return userData;
  };

  const register = async (registrationData) => {
    const res = await api.post('/auth/register/', registrationData);
    const payload = res.data?.data || res.data;

    const accessToken = payload.tokens?.access;
    const refreshToken = payload.tokens?.refresh;
    const userData = payload.user;

    if (accessToken) {
      localStorage.setItem('voltix_access_token', accessToken);
      setToken(accessToken);
    }
    if (refreshToken) {
      localStorage.setItem('voltix_refresh_token', refreshToken);
    }
    if (userData) {
      localStorage.setItem('voltix_user', JSON.stringify(userData));
      setUser(userData);
    }

    return userData;
  };

  const updateProfile = async (formData) => {
    const res = await api.patch('/auth/me/', formData);
    const updated = res.data?.data || res.data;
    setUser(updated);
    localStorage.setItem('voltix_user', JSON.stringify(updated));
    return updated;
  };

  const isAuthenticated = Boolean(token && user);
  const isAdmin = user?.role === 'ADMIN';
  const isCustomer = user?.role === 'CUSTOMER';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated,
        isAdmin,
        isCustomer,
        login,
        register,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
