'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

const withAuth = <P extends object>(WrappedComponent: React.ComponentType<P>) => {
  const Wrapper = (props: P) => {
    const router = useRouter();
    const { isAuthenticated, isLoading } = useAuth();

    useEffect(() => {
      if (!isLoading && !isAuthenticated) {
        router.push('/login');
      }
    }, [isAuthenticated, isLoading, router]);

    if (isLoading) {
      return <p>Loading...</p>; // Or a loading spinner component
    }

    if (!isAuthenticated) {
      return null; // Or a message indicating redirection
    }

    return <WrappedComponent {...props} />;
  };

  return Wrapper;
};

export default withAuth;