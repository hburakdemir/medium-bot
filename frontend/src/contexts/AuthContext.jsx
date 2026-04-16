import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../lib/api';
import { toast } from 'sonner';
import { getErrorMessage } from '../lib/utils';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        try {
          const { data } = await authAPI.me();
          setUser(data.user);
          localStorage.setItem('user', JSON.stringify(data.user));
        } catch {
          localStorage.removeItem('user');
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const login = async (credentials) => {
    const { data } = await authAPI.login(credentials);
    setUser(data.user);
    localStorage.setItem('user', JSON.stringify(data.user));
    return data;
  };

  const register = async (userData) => {
    const { data } = await authAPI.register(userData);
    return data;
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch {
    } finally {
      setUser(null);
      localStorage.removeItem('user');
    }
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
