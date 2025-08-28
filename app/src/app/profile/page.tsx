'use client';

import withAuth from '@/components/auth/withAuth';
import { useAuth } from '@/context/AuthContext';

function ProfilePage() {
  const { user, isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return <p>Loading profile...</p>;
  }

  if (!isAuthenticated) {
    return <p>You are not authenticated.</p>; // Should be handled by withAuth HOC
  }

  if (!user) {
    return <p>No user data available.</p>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Profile</h1>
      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
        <div className="mb-4">
          <p className="text-gray-700 dark:text-gray-300 font-semibold">Name:</p>
          <p className="text-gray-900 dark:text-gray-100">{user.name}</p>
        </div>
        <div className="mb-4">
          <p className="text-gray-700 dark:text-gray-300 font-semibold">Username:</p>
          <p className="text-gray-900 dark:text-gray-100">{user.username}</p>
        </div>
        <div>
          <p className="text-gray-700 dark:text-gray-300 font-semibold">Email:</p>
          <p className="text-gray-900 dark:text-gray-100">{user.email}</p>
        </div>
      </div>
    </div>
  );
}

export default withAuth(ProfilePage);