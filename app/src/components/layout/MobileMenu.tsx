'use client';

import { useState } from 'react';
import Link from 'next/link';

interface MobileMenuProps {
  isAuthenticated: boolean;
}

const MobileMenu = ({ isAuthenticated }: MobileMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  return (
    <div>
      <button onClick={() => setIsOpen(!isOpen)} className="text-gray-700 dark:text-gray-300 focus:outline-none">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          {isOpen ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
          )}
        </svg>
      </button>
      {isOpen && (
        <div className="absolute top-16 right-0 w-48 py-2 mt-2 bg-white rounded-lg shadow-xl dark:bg-gray-800">
          {isAuthenticated ? (
            <>
              <Link href="/dashboard" className="block px-4 py-2 text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">
                Dashboard
              </Link>
              <button onClick={handleLogout} className="w-full text-left block px-4 py-2 text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="block px-4 py-2 text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">
                Login
              </Link>
              <Link href="/register" className="block px-4 py-2 text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">
                Register
              </Link>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default MobileMenu;
