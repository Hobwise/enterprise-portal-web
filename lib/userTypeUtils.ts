/**
 * Centralized utility functions for detecting and managing user types
 * across the application for consistent access control
 */

export interface UserInformation {
  id?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  role?: number;
  staffType?: number;
  primaryAssignment?: string;
  assignedCategoryId?: string;
  isOwner?: boolean;
  cooperateID?: string;
  [key: string]: any;
}

/**
 * Check if user is a POS (Point of Sales) user
 * POS users have limited access to only POS and Orders functionality
 */
export const isPOSUser = (userInfo: UserInformation | null): boolean => {
  if (!userInfo) return false;

  return (
    userInfo.primaryAssignment === "Point of Sales" ||
    userInfo.primaryAssignment === "POS Operator" ||
    (!!userInfo.assignedCategoryId && userInfo.assignedCategoryId === "POS")
  );
};

/**
 * Check if user is a Category user
 * Category users can only access specific category-related pages
 */
export const isCategoryUser = (userInfo: UserInformation | null): boolean => {
  if (!userInfo) return false;

  return (
    userInfo.role === 1 &&
    userInfo.staffType === 2 &&
    !!userInfo.assignedCategoryId &&
    userInfo.assignedCategoryId !== "" &&
    userInfo.assignedCategoryId !== "POS"
  );
};

/**
 * Check if user is an admin (owner with full access)
 */
export const isAdmin = (userInfo: UserInformation | null): boolean => {
  if (!userInfo) return false;
  return userInfo.role === 0;
};

/**
 * Check if user is a staff member (role === 1 but not POS or Category)
 */
export const isStaffUser = (userInfo: UserInformation | null): boolean => {
  if (!userInfo) return false;
  return userInfo.role === 1 && !isPOSUser(userInfo) && !isCategoryUser(userInfo);
};

/**
 * Get user type as a string for logging and debugging
 */
export const getUserType = (userInfo: UserInformation | null): string => {
  if (!userInfo) return "unknown";
  if (isAdmin(userInfo)) return "admin";
  if (isPOSUser(userInfo)) return "pos";
  if (isCategoryUser(userInfo)) return "category";
  if (isStaffUser(userInfo)) return "staff";
  return "unknown";
};

/**
 * Get allowed settings paths for a user based on their type
 */
export const getAllowedSettingsPaths = (userInfo: UserInformation | null): string[] => {
  if (!userInfo) return [];

  // POS users can only access personal information and password management
  if (isPOSUser(userInfo)) {
    return [
      "/dashboard/settings/personal-information",
      "/dashboard/settings/password-management",
    ];
  }

  // Admin users have access to all settings
  if (isAdmin(userInfo)) {
    return [
      "/dashboard/settings/personal-information",
      "/dashboard/settings/password-management",
      "/dashboard/settings/business-information",
      "/dashboard/settings/kyc-compliance",
      "/dashboard/settings/subscriptions",
      "/dashboard/settings/teams",
      "/dashboard/settings/staff-management",
      "/dashboard/settings/business-settings",
    ];
  }

  // Category users can access personal settings (but primarily use /business-activities)
  if (isCategoryUser(userInfo)) {
    return [
      "/dashboard/settings/personal-information",
      "/dashboard/settings/password-management",
    ];
  }

  // Regular staff users (role === 1) cannot access certain settings
  if (isStaffUser(userInfo)) {
    return [
      "/dashboard/settings/personal-information",
      "/dashboard/settings/password-management",
    ];
  }

  return [];
};

/**
 * Get the home route for a user based on their type
 */
export const getUserHomeRoute = (userInfo: UserInformation | null): string => {
  if (!userInfo) return "/auth/login";

  if (isPOSUser(userInfo)) return "/pos";
  if (isCategoryUser(userInfo)) return "/business-activities";
  if (isAdmin(userInfo) || isStaffUser(userInfo)) return "/dashboard";

  return "/dashboard";
};

/**
 * Check if user can access a specific settings path
 */
export const canAccessSettingsPath = (
  userInfo: UserInformation | null,
  path: string
): boolean => {
  const allowedPaths = getAllowedSettingsPaths(userInfo);
  return allowedPaths.some((allowedPath) => path.startsWith(allowedPath));
};
