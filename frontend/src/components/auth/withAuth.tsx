'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import React from 'react';

const DEFAULT_ROUTES: Record<string, string> = {
  default: '/dashboard',
  repartidor: '/dashboard/routes',
  admin: '/dashboard/metrics',
};

const withAuth = <P extends object>(WrappedComponent: React.ComponentType<P>, allowedRoles: string[] = []) => {
  const AuthComponent = (props: P) => {
    const { isAuthenticated, isLoading, user } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (!isLoading) {
        if (!isAuthenticated) {
          router.push('/');
        } else if (allowedRoles.length > 0 && user && !allowedRoles.includes(user.rol)) {
          const redirectUrl = DEFAULT_ROUTES[user.rol] || DEFAULT_ROUTES['default'];
          router.push(redirectUrl);
        }
      }
    }, [isAuthenticated, isLoading, user, router]);

    if (isLoading) {
      return <div>Loading...</div>;
    }

    const hasRequiredRole = allowedRoles.length === 0 || (user && allowedRoles.includes(user.rol));

    if (!isAuthenticated || !hasRequiredRole) {
      return null;
    }

    return <WrappedComponent {...props} />;
  };

  return AuthComponent;
};

export default withAuth;
