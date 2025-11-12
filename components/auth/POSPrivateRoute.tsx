'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { getJsonItemFromLocalStorage } from '@/lib/utils';
import { isPOSUser, isAdmin, isCategoryUser } from '@/lib/userTypeUtils';

interface POSPrivateRouteProps {
  children: React.ReactNode;
}

/**
 * POS Private Route Guard
 *
 * Protects /pos/* routes and ensures only POS users can access them:
 * - POS users: Full access to all /pos pages
 * - Admin users: BLOCKED (should use dashboard, not POS interface)
 * - Category users: BLOCKED
 * - Regular staff: BLOCKED
 *
 * Redirects:
 * - Not authenticated → /auth/login
 * - Non-POS user → /dashboard or /business-activities (based on user type)
 */
const POSPrivateRoute: React.FC<POSPrivateRouteProps> = ({ children }) => {
  const router = useRouter();
  const pathname = usePathname();
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const checkAccess = () => {
      // Get user information from localStorage
      const userInfo = getJsonItemFromLocalStorage('userInformation');
      const token = userInfo?.token;

      // Not authenticated → redirect to login
      if (!userInfo || !token) {
        router.push('/auth/login');
        return;
      }

      // Only POS users can access /pos routes
      if (isPOSUser(userInfo)) {
        setIsAuthorized(true);
        setIsChecking(false);
        return;
      }

      // Category users should go to business-activities
      if (isCategoryUser(userInfo)) {
        router.push('/business-activities');
        return;
      }

      // Admin and regular staff users should use the dashboard
      if (isAdmin(userInfo)) {
        router.push('/dashboard');
        return;
      }

      // Default: redirect to dashboard for other staff
      router.push('/dashboard');
    };

    checkAccess();
  }, [pathname, router]);

  // Only render children if authorized
  return isAuthorized ? <>{children}</> : null;
};

export default POSPrivateRoute;
