'use client';

import Link from 'next/link';
import Image from 'next/image';
import Container from './Container';
import MobileMenu from './MobileMenu';
import { useAuth } from '@/context/AuthContext';

const Header = () => {
  const { isAuthenticated, logout } = useAuth();

  return (
    <header className="bg-white dark:bg-gray-800 shadow-md">
      <Container>
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <Image src="/wallet-icon.svg" alt="My Simple Wallet" width={32} height={32} />
              <span className="text-xl font-bold text-gray-900 dark:text-gray-100">
                My Simple Wallet
              </span>
            </Link>
          </div>
          <div className="hidden md:block">
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <Link href="/dashboard" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">
                  Dashboard
                </Link>
                <Link href="/profile" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">
                  Profile
                </Link>
                <button
                  onClick={logout}
                  className="px-4 py-2 font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link href="/login" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">
                  Login
                </Link>
                <Link href="/register" className="px-4 py-2 font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700">
                  Register
                </Link>
              </div>
            )}
          </div>
          <div className="md:hidden">
            <MobileMenu isAuthenticated={isAuthenticated} />
          </div>
        </div>
      </Container>
    </header>
  );
};

export default Header;