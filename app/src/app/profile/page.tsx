'use client';

import { useEffect, useState } from 'react';
import withAuth from '@/components/auth/withAuth';

interface UserProfile {
  name: string;
  username: string;
  email: string;
}

function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('No token found');
        return;
      }

      try {
        const response = await fetch('http://localhost:8080/api/users/me', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const responseData = await response.json();
          setProfile(responseData.data);
        } else {
          const errorData = await response.json();
          setError(errorData.message || 'Failed to fetch profile');
        }
      } catch (error) {
        setError('An error occurred while fetching profile');
      }
    };

    fetchProfile();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Profile</h1>
      {error && <p className="text-red-500">{error}</p>}
      {profile ? (
        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
          <div className="mb-4">
            <p className="text-gray-700 dark:text-gray-300 font-semibold">Name:</p>
            <p className="text-gray-900 dark:text-gray-100">{profile.name}</p>
          </div>
          <div className="mb-4">
            <p className="text-gray-700 dark:text-gray-300 font-semibold">Username:</p>
            <p className="text-gray-900 dark:text-gray-100">{profile.username}</p>
          </div>
          <div>
            <p className="text-gray-700 dark:text-gray-300 font-semibold">Email:</p>
            <p className="text-gray-900 dark:text-gray-100">{profile.email}</p>
          </div>
        </div>
      ) : (
        <p>Loading profile...</p>
      )}
    </div>
  );
}

export default withAuth(ProfilePage);