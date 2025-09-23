"use client";

import { getJsonItemFromLocalStorage } from "@/lib/utils";
import useGetRoleByBusiness from "./useGetRoleBusiness";

interface Permission {
  // Menu permissions
  canViewMenu?: boolean;
  canCreateMenu?: boolean;
  canEditMenu?: boolean;
  canDeleteMenu?: boolean;

  // Campaign permissions
  canViewCampaign?: boolean;
  canCreateCampaign?: boolean;
  canEditCampaign?: boolean;
  canDeleteCampaign?: boolean;

  // Reservation permissions
  canViewReservation?: boolean;
  canCreateReservation?: boolean;
  canEditReservation?: boolean;
  canDeleteReservation?: boolean;

  // User management permissions
  canViewUser?: boolean;
  canCreateUser?: boolean;
  canEditUser?: boolean;
  canDeleteUser?: boolean;

  // Business permissions
  canViewBusiness?: boolean;
  canCreateBusiness?: boolean;
  canEditBusiness?: boolean;
  canDeleteBusiness?: boolean;

  // Messages and Dashboard permissions
  canViewMessages?: boolean;
  canViewDashboard?: boolean;

  // Payment permissions
  canViewPayment?: boolean;
  canEditPayment?: boolean;

  // Report permissions
  canViewReport?: boolean;
  canEditReport?: boolean;

  // Booking permissions
  canViewBooking?: boolean;
  canEditBooking?: boolean;
  canCreateBooking?: boolean;
  canDeleteBooking?: boolean;

  // Order permissions
  canViewOrder?: boolean;
  canCreateOrder?: boolean;
  canEditOrder?: boolean;
  canDeleteOrder?: boolean;

  // QR Code permissions
  canViewQR?: boolean;
  canCreateQR?: boolean;
  canEditQR?: boolean;
  canDeleteQR?: boolean;
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
