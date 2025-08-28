'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { getUserProfile } from '@/lib/apiService';

interface AuthContextType {
  isAuthenticated: boolean;
  user: any; // You can define a proper User type
  login: (token: string) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await getUserProfile();
          setUser(response.data);
          setIsAuthenticated(true);
          console.log(response);
        } catch (error) {
          console.error('Failed to fetch user on load', error);
          localStorage.removeItem('token');
        }
      }
      setIsLoading(false);
    };
    checkUser();
  }, []);

  const login = (token: string) => {
    localStorage.setItem('token', token);
    // You might want to fetch user profile here as well
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout, isLoading }}>
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
