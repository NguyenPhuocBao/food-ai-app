import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { User } from '../types';
import { login as apiLogin, register as apiRegister } from '../services/auth.service';
import api from '../services/api';
import toast from 'react-hot-toast';
import {
  clearAdminToken,
  clearUserToken,
  getAdminToken,
  getUserToken,
  setAdminToken,
  setUserToken,
} from '../services/authStorage';

interface AuthContextType {
  user: User | null;
  admin: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  logoutUser: () => void;
  logoutAdmin: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [admin, setAdmin] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const getMeWithToken = async (token: string): Promise<User> => {
    const response = await api.get('/auth/me', {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data.data;
  };

  useEffect(() => {
    const initAuth = async () => {
      const userToken = getUserToken();
      const adminToken = getAdminToken();

      try {
        const [adminResult, userResult] = await Promise.all([
          adminToken ? getMeWithToken(adminToken).catch(() => null) : Promise.resolve(null),
          userToken ? getMeWithToken(userToken).catch(() => null) : Promise.resolve(null),
        ]);

        if (adminResult?.role === 'ADMIN') {
          setAdmin(adminResult);
        } else {
          setAdmin(null);
          if (adminToken) clearAdminToken();
        }

        if (userResult && userResult.role !== 'ADMIN') {
          setUser(userResult);
        } else {
          setUser(null);
          if (userToken) clearUserToken();
        }
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    try {
      const loginData = await apiLogin(email, password);
      const token = loginData.token!;
      const freshUser = await getMeWithToken(token);

      if (freshUser.role === 'ADMIN') {
        setAdminToken(token);
        setAdmin(freshUser);
        toast.success(`Chao mung Admin, ${freshUser.name}!`);
      } else {
        setUserToken(token);
        setUser(freshUser);
        toast.success(`Chao mung, ${freshUser.name}!`);
      }

      return freshUser;
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Dang nhap that bai');
      throw error;
    }
  }, []);

  const register = useCallback(async (email: string, password: string, name: string) => {
    try {
      const registerData = await apiRegister(email, password, name);
      const token = registerData.token!;
      setUserToken(token);

      const freshUser = await getMeWithToken(token);
      setUser(freshUser);
      toast.success('Dang ky thanh cong!');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Dang ky that bai');
      throw error;
    }
  }, []);

  const logoutUser = useCallback(() => {
    clearUserToken();
    setUser(null);
    toast.success('Dang xuat tai kho?n nguoi dung thanh cong');
    if (!window.location.pathname.includes('/login')) {
      window.location.href = '/login';
    }
  }, []);

  const logoutAdmin = useCallback(() => {
    clearAdminToken();
    setAdmin(null);
    toast.success('Dang xuat quyen quan tri thanh cong');
    if (window.location.pathname.startsWith('/admin')) {
      const hasUserToken = Boolean(getUserToken());
      window.location.href = hasUserToken ? '/' : '/login';
    }
  }, []);

  const logout = useCallback(() => {
    if (window.location.pathname.startsWith('/admin')) {
      logoutAdmin();
    } else {
      logoutUser();
    }
  }, [logoutUser, logoutAdmin]);

  const refreshUser = useCallback(async () => {
    const userToken = getUserToken();
    if (userToken) {
      try {
        const u = await getMeWithToken(userToken);
        if (u.role !== 'ADMIN') {
          setUser(u);
        } else {
          clearUserToken();
          setUser(null);
        }
      } catch {
        clearUserToken();
        setUser(null);
      }
    }

    const adminToken = getAdminToken();
    if (adminToken) {
      try {
        const a = await getMeWithToken(adminToken);
        if (a.role === 'ADMIN') {
          setAdmin(a);
        } else {
          clearAdminToken();
          setAdmin(null);
        }
      } catch {
        clearAdminToken();
        setAdmin(null);
      }
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        admin,
        loading,
        login,
        register,
        logout,
        logoutUser,
        logoutAdmin,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
