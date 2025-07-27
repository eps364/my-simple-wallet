"use client";
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { clearAuthData } from '@/lib/apiService';

function isAuthenticated() {
  if (typeof window === "undefined") return false;
  return !!localStorage.getItem("token");
}

export default function Header() {
  const [logged, setLogged] = useState(false);
  const router = useRouter();

  useEffect(() => {
    function handleStorage() {
      setLogged(isAuthenticated());
    }
    setLogged(isAuthenticated());
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  function handleLogout() {
    clearAuthData();
    setLogged(false);
    router.push("/login");
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-slate-900 shadow-sm border-b border-gray-200 dark:border-slate-700">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo e Nome */}
          <Link 
            href={logged ? "/dashboard" : "/"} 
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          >
            <Image
              src="/images/wallet-icon.svg"
              alt="Simple Wallet Logo"
              width={32}
              height={32}
              className="w-8 h-8"
            />
            <span className="text-xl font-bold text-gray-800 dark:text-white">
              Simple Wallet
            </span>
          </Link>

          {/* Menu de ações e Botão de Login/Logout */}
          <div className="flex items-center gap-3">
            {/* Navigation - apenas para usuários logados */}
            {logged && (
              <nav className="flex items-center gap-4 mr-4">
                <Link
                  href="/dashboard"
                  className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors"
                >
                  Dashboard
                </Link>
                <Link
                  href="/accounts"
                  className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors"
                >
                  Contas
                </Link>
                <Link
                  href="/categories"
                  className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors"
                >
                  Categorias
                </Link>
              </nav>
            )}
            
            {/* Botão de Login/Logout */}
            {logged ? (
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Logout
              </button>
            ) : (
              <Link
                href="/login"
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
