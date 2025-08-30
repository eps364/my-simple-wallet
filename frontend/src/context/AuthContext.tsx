"use client";
import { createContext, useContext, useEffect, useState, useMemo } from "react";
import { authService } from "@/lib/services/authService";

interface AuthContextType {
  isAuthenticated: boolean;
  setIsAuthenticated: (isAuthenticated: boolean) => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({ 
  isAuthenticated: false, 
  setIsAuthenticated: () => {}, 
  loading: true 
});

export function AuthProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const authenticated = await authService.isAuthenticated();
        setIsAuthenticated(authenticated);
      } catch {
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const contextValue = useMemo(() => ({
    isAuthenticated,
    setIsAuthenticated,
    loading
  }), [isAuthenticated, loading]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
