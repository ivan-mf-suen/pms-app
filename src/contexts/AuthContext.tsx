'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, mockUsers } from '@/lib/mockData';

interface AuthContextType {
  user: User | null;
  isLoggedIn: boolean;
  isHydrated: boolean;
  login: (email: string, password: string) => boolean;
  logout: () => void;
  rememberEmail: (email: string) => void;
  getRememberedEmail: () => string | null;
  clearRememberedEmail: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  // Load user from localStorage after hydration
  useEffect(() => {
    const storedUser = localStorage.getItem('pms_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        setUser(null);
      }
    }
    setIsHydrated(true);
  }, []);

  const login = (email: string, password: string): boolean => {
    const foundUser = mockUsers.find(
      (u) => u.email === email && u.password === password
    );

    if (foundUser) {
      // Create a user object without the password for storage
      const userToStore = { ...foundUser };
      setUser(userToStore);
      localStorage.setItem('pms_user', JSON.stringify(userToStore));
      return true;
    }

    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('pms_user');
  };

  const rememberEmail = (email: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('pms_remembered_email', email);
    }
  };

  const getRememberedEmail = (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('pms_remembered_email');
  };

  const clearRememberedEmail = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('pms_remembered_email');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user: isHydrated ? user : null,
        isLoggedIn: isHydrated ? !!user : false,
        isHydrated,
        login,
        logout,
        rememberEmail,
        getRememberedEmail,
        clearRememberedEmail,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
