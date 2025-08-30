'use client';

import { getUserProfile } from '@/lib/apiService';
import React, { createContext, useContext, useEffect, useState } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  user: any;
  login: () => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<boolean>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const checkAuth = async (): Promise<boolean> => {
    try {

      const response = await getUserProfile();


      // Verificar se a resposta tem a estrutura esperada
      const userData = response.data || response;
      setUser(userData);

      setIsAuthenticated(true);
      return true;
    } catch {
      setUser(null);
      setIsAuthenticated(false);
      return false;
    }
  };

  const login = async (): Promise<void> => {

    setIsLoading(true);
    try {
      await checkAuth();

    } catch {
      logout();
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    window.location.href = '/login';
  };

  useEffect(() => {
    const initAuth = async () => {

      await checkAuth();
      setIsLoading(false);

    };

    initAuth();
  }, []);



  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Verificando autenticação...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout, checkAuth, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}