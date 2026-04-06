import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User } from '../types';
import { getMe, login as apiLogin, register as apiRegister } from '../services/auth.service';
import toast from 'react-hot-toast';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      getMe()
        .then(setUser)
        .catch(() => {
          localStorage.removeItem('token');
          setUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const userData = await apiLogin(email, password);
      localStorage.setItem('token', userData.token!);
      setUser(userData);
      toast.success('Đăng nhập thành công');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Đăng nhập thất bại');
      throw error;
    }
  };

  const register = async (email: string, password: string, name: string) => {
    try {
      const userData = await apiRegister(email, password, name);
      localStorage.setItem('token', userData.token!);
      setUser(userData);
      toast.success('Đăng ký thành công');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Đăng ký thất bại');
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    toast.success('Đã đăng xuất');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};