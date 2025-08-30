'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { getUserProfile } from '@/lib/apiService';

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
      console.log('Checking authentication status...');
      const response = await getUserProfile();
      console.log('getUserProfile response:', response);
      
      // Verificar se a resposta tem a estrutura esperada
      const userData = response.data || response;
      setUser(userData);
      console.log('Authentication check successful, user:', userData);
      setIsAuthenticated(true);
      return true;
    } catch (error) {
      console.log('Authentication check failed:', error);
      setUser(null);
      setIsAuthenticated(false);
      return false;
    }
  };

  const login = async (): Promise<void> => {
    console.log('Login method called, re-checking auth...');
    setIsLoading(true);
    try {
      const authSuccess = await checkAuth();
      console.log('Auth recheck result:', authSuccess);
    } catch (error) {
      console.error('Error during login auth check:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    // For httpOnly cookies, we need to call a backend endpoint to clear the cookie.
    // Example: await fetch('/api/auth/logout', { method: 'POST' });
    // For now, just clear frontend state.
    // Redirect to login page after logout
    window.location.href = '/login'; // Force full page reload to clear all state
  };

  useEffect(() => {
    const initAuth = async () => {
      console.log('Initializing auth...');
      await checkAuth();
      setIsLoading(false);
      console.log('Auth initialization complete');
    };
    
    initAuth();
  }, []);

  console.log('AuthProvider render - isLoading:', isLoading, 'isAuthenticated:', isAuthenticated, 'user:', user);

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