"use client";

import { getJsonItemFromLocalStorage } from "@/lib/utils";
import useGetRoleByBusiness from "./useGetRoleBusiness";

interface Permission {
  canViewMenu?: boolean;
  canCreateMenu?: boolean;
  canEditMenu?: boolean;
  canDeleteMenu?: boolean;
  canViewCampaign?: boolean;
  canCreateCampaign?: boolean;
  canEditCampaign?: boolean;
  canDeleteCampaign?: boolean;
  canViewReservation?: boolean;
  canCreateReservation?: boolean;
  canEditReservation?: boolean;
  canDeleteReservation?: boolean;
}

const extractPermissions = (permission: any, role: string) => {
  if (!permission) return {};
  return permission[role] || {};
};

const usePermission = () => {
  const userInformation = getJsonItemFromLocalStorage("userInformation");
  const { data: permission, isLoading } = useGetRoleByBusiness();

  const userRolePermissions = extractPermissions(permission, "userRole");
  const managerRolePermissions = extractPermissions(permission, "managerRole");

  const role = userInformation?.role;

  return {
    userRolePermissions,
    managerRolePermissions,
    role,
    isLoading,
  };
};

export default usePermission;
