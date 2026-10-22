import React, { createContext, useContext, useState, useEffect } from 'react';
import { adminApi } from '../services/api';

const AdminAuthContext = createContext(null);

export function AdminAuthProvider({ children }) {
  const [adminUser, setAdminUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (token) {
      adminApi.getMe()
        .then((res) => {
          if (res.user.role === 'admin' || res.user.role === 'superadmin') {
            setAdminUser(res.user);
          } else {
            localStorage.removeItem('admin_token');
            setAdminUser(null);
          }
        })
        .catch(() => {
          localStorage.removeItem('admin_token');
          setAdminUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const res = await adminApi.login({ email, password });
    if (res.user.role !== 'admin' && res.user.role !== 'superadmin') {
      throw new Error('Access denied. Administrator privileges required.');
    }
    localStorage.setItem('admin_token', res.token);
    setAdminUser(res.user);
    return res.user;
  };

  const logout = () => {
    localStorage.removeItem('admin_token');
    setAdminUser(null);
  };

  return (
    <AdminAuthContext.Provider value={{ adminUser, loading, login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
}
