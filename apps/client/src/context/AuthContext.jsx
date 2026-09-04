import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi, tokenStorage } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => tokenStorage.getUser());
  const [token, setToken] = useState(() => tokenStorage.getToken());
  const [loading, setLoading] = useState(true);

  // Validate session on mount
  useEffect(() => {
    let isMounted = true;

    async function initAuth() {
      const savedToken = tokenStorage.getToken();
      if (!savedToken) {
        if (isMounted) setLoading(false);
        return;
      }

      try {
        const freshUser = await authApi.getMe();
        if (isMounted && freshUser) {
          setUser(freshUser);
          setToken(savedToken);
        }
      } catch (err) {
        console.warn('Session expired or invalid, clearing authentication state:', err.message);
        if (isMounted) {
          tokenStorage.clearAuth();
          setUser(null);
          setToken(null);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    initAuth();
    return () => {
      isMounted = false;
    };
  }, []);

  const login = async (email, password) => {
    const res = await authApi.login({ email, password });
    setUser(res.user);
    setToken(res.token);
    return res;
  };

  const signup = async (data) => {
    return authApi.signup(data);
  };

  const logout = async () => {
    await authApi.logout();
    setUser(null);
    setToken(null);
  };

  const updateUser = (updatedFields) => {
    setUser((prev) => {
      const updated = { ...prev, ...updatedFields };
      tokenStorage.setUser(updated);
      return updated;
    });
  };

  const value = {
    user,
    token,
    role: user?.role || null,
    isAuthenticated: Boolean(token && user),
    loading,
    login,
    signup,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
