'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const isAuthenticated = !!localStorage.getItem('token');
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <main className="flex flex-col items-center justify-center flex-1 px-4 text-center">
        <h1 className="text-4xl font-bold sm:text-6xl">
          Welcome to My Simple Wallet
        </h1>

        <p className="mt-3 text-lg sm:text-xl">
          Your personal finance manager.
        </p>

        <div className="flex flex-col items-center mt-8 space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
          <Link href="/login" className="px-8 py-3 font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700">
            Login
          </Link>
          <Link href="/dashboard" className="px-8 py-3 font-semibold text-blue-600 bg-transparent border border-blue-600 rounded-md hover:bg-blue-50 dark:hover:bg-gray-800">
            Go to Dashboard
          </Link>
        </div>
      </main>
    </div>
  );
}
