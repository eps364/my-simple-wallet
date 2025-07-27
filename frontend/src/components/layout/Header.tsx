"use client";
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import UserMenu from './UserMenu';

function isAuthenticated() {
  if (typeof window === "undefined") return false;
  return !!localStorage.getItem("token");
}

export default function Header() {
  const [logged, setLogged] = useState(false);

  useEffect(() => {
    function handleStorage() {
      setLogged(isAuthenticated());
    }
    setLogged(isAuthenticated());
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const handleLogout = () => {
    setLogged(false);
  };

  return (
    <header 
      className="fixed top-0 left-0 right-0 z-50 shadow-sm border-b"
      style={{
        backgroundColor: 'var(--color-surface)',
        borderColor: 'var(--color-border)'
      }}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          
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
            <span 
              className="text-xl font-bold"
              style={{ color: 'var(--color-text)' }}
            >
              Simple Wallet
            </span>
          </Link>

          
          <div className="flex items-center gap-3">
            
            <div className="flex">
              {logged ? (
                <UserMenu onLogout={handleLogout} />
              ) : (
                <div className="flex items-center gap-3">
                  <Link
                    href="/register"
                    className="flex items-center gap-2 border font-medium py-2 px-4 rounded-lg transition-colors"
                    style={{
                      borderColor: 'var(--color-primary)',
                      color: 'var(--color-primary)',
                      backgroundColor: 'transparent'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--color-primary)';
                      e.currentTarget.style.color = 'white';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.color = 'var(--color-primary)';
                    }}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    </svg>
                    Registrar
                  </Link>
                  <Link
                    href="/login"
                    className="flex items-center gap-2 font-medium py-2 px-4 rounded-lg transition-colors"
                    style={{
                      backgroundColor: 'var(--color-primary)',
                      color: 'white'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--color-primary-hover)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--color-primary)';
                    }}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Login
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
