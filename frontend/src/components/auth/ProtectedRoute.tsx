"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function ProtectedRoute({ children }: Readonly<{ children: React.ReactNode }>) {
  const router = useRouter();
  const { isAuthenticated, loading } = useAuth();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/login");
    }
  }, [router, isAuthenticated, loading]);

  // Mostra loading enquanto verifica autenticação
  if (loading) {
    return <div>Loading...</div>;
  }

  // Só renderiza children se estiver autenticado
  return isAuthenticated ? <>{children}</> : null;
}
