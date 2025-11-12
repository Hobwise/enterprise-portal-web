'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { getJsonItemFromLocalStorage } from '@/lib/utils';
import { isCategoryUser, isAdmin, isPOSUser } from '@/lib/userTypeUtils';

interface CategoryPrivateRouteProps {
  children: React.ReactNode;
}

/**
 * Category Private Route Guard
 *
 * Protects /business-activities/* routes and ensures only Category users can access them:
 * - Category users (staffType === 2): Full access to all business-activities pages
 * - Admin users: BLOCKED (should use dashboard)
 * - POS users: BLOCKED
 * - Regular staff: BLOCKED
 *
 * Redirects:
 * - Not authenticated → /auth/login
 * - Non-category user → /dashboard or /pos (based on user type)
 */
const CategoryPrivateRoute: React.FC<CategoryPrivateRouteProps> = ({ children }) => {
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

      // Only Category users can access /business-activities routes
      if (isCategoryUser(userInfo)) {
        setIsAuthorized(true);
        setIsChecking(false);
        return;
      }

      // POS users should go to POS
      if (isPOSUser(userInfo)) {
        router.push('/pos');
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

export default CategoryPrivateRoute;
