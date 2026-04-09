import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { User } from '../types';
import { getMe, login as apiLogin, register as apiRegister } from '../services/auth.service';
import api from '../services/api';
import toast from 'react-hot-toast';

interface AuthContextType {
  user: User | null;      // Phiên của người dùng
  admin: User | null;     // Phiên của quản trị viên
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;      // Đăng xuất phiên hiện tại (dựa trên context)
  logoutUser: () => void;  // Đăng xuất riêng cho user
  logoutAdmin: () => void; // Đăng xuất riêng cho admin
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [admin, setAdmin] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Khởi tạo: kiểm tra cả 2 loại token
  useEffect(() => {
    const initAuth = async () => {
      const userToken = localStorage.getItem('token');
      const adminToken = localStorage.getItem('admin_token');

      const loaders = [];

      if (userToken) {
        loaders.push(
          getMeWithToken(userToken)
            .then(u => setUser(u))
            .catch(() => localStorage.removeItem('token'))
        );
      }

      if (adminToken) {
        loaders.push(
          getMeWithToken(adminToken)
            .then(u => {
              if (u.role === 'ADMIN') setAdmin(u);
              else localStorage.removeItem('admin_token');
            })
            .catch(() => localStorage.removeItem('admin_token'))
        );
      }

      try {
        await Promise.all(loaders);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  // Helper để lấy info user với token cụ thể (không phụ thuộc global axios header lúc đó)
  const getMeWithToken = async (token: string) => {
    const response = await api.get('/auth/me', {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data.data;
  };

  const login = useCallback(async (email: string, password: string) => {
    try {
      const loginData = await apiLogin(email, password);
      const token = loginData.token!;
      
      // Lấy info đầy đủ
      const freshUser = await getMeWithToken(token);

      if (freshUser.role === 'ADMIN') {
        localStorage.setItem('admin_token', token);
        setAdmin(freshUser);
        toast.success(`Chào mừng Admin, ${freshUser.name}!`);
      } else {
        localStorage.setItem('token', token);
        setUser(freshUser);
        toast.success(`Chào mừng, ${freshUser.name}!`);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Đăng nhập thất bại');
      throw error;
    }
  }, []);

  const register = useCallback(async (email: string, password: string, name: string) => {
    try {
      const registerData = await apiRegister(email, password, name);
      const token = registerData.token!;
      localStorage.setItem('token', token);
      
      const freshUser = await getMeWithToken(token);
      setUser(freshUser);
      toast.success('Đăng ký thành công!');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Đăng ký thất bại');
      throw error;
    }
  }, []);

  const logoutUser = useCallback(() => {
    localStorage.removeItem('token');
    setUser(null);
    toast.success('Đã đăng xuất tài khoản người dùng');
    if (window.location.pathname === '/' || !window.location.pathname.startsWith('/admin')) {
        window.location.href = '/login';
    }
  }, []);

  const logoutAdmin = useCallback(() => {
    localStorage.removeItem('admin_token');
    setAdmin(null);
    toast.success('Đã đăng xuất quyền quản trị');
    if (window.location.pathname.startsWith('/admin')) {
        window.location.href = '/login';
    }
  }, []);

  // Logout chung (ví dụ từ trang profile)
  const logout = useCallback(() => {
      // Nếu đang ở /admin thì logout admin, ngược lại logout user
      if (window.location.pathname.startsWith('/admin')) {
          logoutAdmin();
      } else {
          logoutUser();
      }
  }, [logoutUser, logoutAdmin]);

  const refreshUser = useCallback(async () => {
    const userToken = localStorage.getItem('token');
    if (userToken) {
        const u = await getMeWithToken(userToken);
        setUser(u);
    }
    const adminToken = localStorage.getItem('admin_token');
    if (adminToken) {
        const a = await getMeWithToken(adminToken);
        if (a.role === 'ADMIN') setAdmin(a);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ 
        user, 
        admin, 
        loading, 
        login, 
        register, 
        logout, 
        logoutUser, 
        logoutAdmin, 
        refreshUser 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};