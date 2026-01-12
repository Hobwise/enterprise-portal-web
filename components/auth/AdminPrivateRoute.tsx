'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { getJsonItemFromLocalStorage } from '@/lib/utils';
import { isAdmin, isStaffUser, isPOSUser, isCategoryUser } from '@/lib/userTypeUtils';

interface AdminPrivateRouteProps {
  children: React.ReactNode;
}

/**
 * Admin Private Route Guard
 *
 * Protects /dashboard/* routes and ensures only authorized users can access them:
 * - Admin users (role === 0): Full access to all dashboard pages
 * - Staff users (role === 1): Access based on permissions (NOT POS or Category users)
 * - POS users: ONLY allowed on /dashboard/orders and personal settings
 * - Category users: BLOCKED from all dashboard pages (except settings)
 *
 * Redirects:
 * - Not authenticated → /auth/login
 * - POS user → /pos (except for allowed routes)
 * - Category user → /business-activities (except for settings)
 */
const AdminPrivateRoute: React.FC<AdminPrivateRouteProps> = ({ children }) => {
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

      // Check if this is a settings route (special case - all users can access certain settings)
      const isPersonalSettings = pathname === '/dashboard/settings/personal-information' ||
                                 pathname === '/dashboard/settings/password-management';

      // Category users can ONLY access personal settings
      if (isCategoryUser(userInfo)) {
        if (isPersonalSettings) {
          setIsAuthorized(true);
          setIsChecking(false);
          return;
        }
        // Block category users from all other dashboard pages
        router.push('/business-activities');
        return;
      }

      // POS users can ONLY access /dashboard/orders and personal settings
      if (isPOSUser(userInfo)) {
        const isOrdersPage = pathname.startsWith('/dashboard/orders');

        if (isOrdersPage || isPersonalSettings) {
          setIsAuthorized(true);
          setIsChecking(false);
          return;
        }
        // Block POS users from other dashboard pages
        router.push('/pos');
        return;
      }

      // Admin users (role === 0) have full access
      if (isAdmin(userInfo)) {
        setIsAuthorized(true);
        setIsChecking(false);
        return;
      }

      // Regular staff users (role === 1, not POS or Category) have access based on permissions
      // Permission checks are handled at the component level via usePermission hook
      if (isStaffUser(userInfo)) {
        setIsAuthorized(true);
        setIsChecking(false);
        return;
      }

      // Fallback: unauthorized
      router.push('/auth/login');
    };

    checkAccess();
  }, [pathname, router]);

  // Only render children if authorized
  return isAuthorized ? <>{children}</> : null;
};

export default AdminPrivateRoute;
