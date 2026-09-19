import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from './supabase/client';
import type { UserSession } from '@/types';

interface AuthContextType {
  user: UserSession | null;
  isLoading: boolean;
  login: (email: string, role?: 'ADMIN' | 'CUSTOMER', name?: string) => Promise<boolean>;
  logout: () => void;
  switchRole: (role: 'ADMIN' | 'CUSTOMER') => void;
  isConfigured: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Default Admin User: Sangem Srivijayalaxmi
export const DEFAULT_ADMIN: UserSession = {
  id: '00000000-0000-0000-0000-000000000001',
  email: 'srivijayalaxmi@srinutrition.com',
  fullName: 'Sangem Srivijayalaxmi',
  role: 'ADMIN',
  mobile: '7993367929',
};

// Default Customer User: Keerthana
export const DEFAULT_CUSTOMER: UserSession = {
  id: '00000000-0000-0000-0000-000000000002',
  email: 'customer.wellness@example.com',
  fullName: 'Keerthana Sangem',
  role: 'CUSTOMER',
  mobile: '9876543210',
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserSession | null>(() => {
    const saved = localStorage.getItem('nutri_session');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return DEFAULT_ADMIN;
      }
    }
    return DEFAULT_ADMIN;
  });

  const [isLoading, setIsLoading] = useState(false);
  const isConfigured = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && 
    !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder')
  );

  useEffect(() => {
    if (user) {
      localStorage.setItem('nutri_session', JSON.stringify(user));
    } else {
      localStorage.removeItem('nutri_session');
    }
  }, [user]);

  const login = async (email: string, role: 'ADMIN' | 'CUSTOMER' = 'CUSTOMER', name?: string) => {
    setIsLoading(true);
    try {
      if (email.includes('srivijayalaxmi') || email.includes('admin') || role === 'ADMIN') {
        setUser(DEFAULT_ADMIN);
      } else {
        setUser({
          id: '00000000-0000-0000-0000-000000000002',
          email,
          fullName: name || 'Valued Customer',
          role: 'CUSTOMER',
          mobile: '9876543210',
        });
      }
      return true;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('nutri_session');
  };

  const switchRole = (role: 'ADMIN' | 'CUSTOMER') => {
    if (role === 'ADMIN') {
      setUser(DEFAULT_ADMIN);
    } else {
      setUser(DEFAULT_CUSTOMER);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, switchRole, isConfigured }}>
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
