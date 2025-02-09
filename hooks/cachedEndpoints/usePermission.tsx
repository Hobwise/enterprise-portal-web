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

const extractPermissions = (permissions: any, roleType: string) => {
  const rolePermissions = permissions?.data?.data[roleType] || {};

  return {
    canCreateMenu: rolePermissions.canCreateMenu,
    canViewMenu: rolePermissions.canViewMenu,
    canEditMenu: rolePermissions.canEditMenu,
    canDeleteMenu: rolePermissions.canDeleteMenu,

    canViewCampaign: rolePermissions.canViewCampaign,
    canCreateCampaign: rolePermissions.canCreateCampaign,
    canEditCampaign: rolePermissions.canEditCampaign,
    canDeleteCampaign: rolePermissions.canDeleteCampaign,

    canViewReservation: rolePermissions.canViewReservation,
    canCreateReservation: rolePermissions.canCreateReservation,
    canEditReservation: rolePermissions.canEditReservation,
    canDeleteReservation: rolePermissions.canDeleteReservation,

    canViewBusiness: rolePermissions.canViewBusiness,
    canCreateBusiness: rolePermissions.canCreateBusiness,
    canEditBusiness: rolePermissions.canEditBusiness,
    canDeleteBusiness: rolePermissions.canDeleteBusiness,

    canViewOrder: rolePermissions.canViewOrder,
    canCreateOrder: rolePermissions.canCreateOrder,
    canEditOrder: rolePermissions.canEditOrder,
    canDeleteOrder: rolePermissions.canDeleteOrder,

    canViewQR: rolePermissions.canViewQR,
    canCreateQR: rolePermissions.canCreateQR,
    canEditQR: rolePermissions.canEditQR,
    canDeleteQR: rolePermissions.canDeleteQR,

    canViewUser: rolePermissions.canViewUser,
    canCreateUser: rolePermissions.canCreateUser,
    canEditUser: rolePermissions.canEditUser,
    canDeleteUser: rolePermissions.canDeleteUser,

    canViewBooking: rolePermissions.canViewBooking,
    canCreateBooking: rolePermissions.canCreateBooking,
    canEditBooking: rolePermissions.canEditBooking,

    canViewPayment: rolePermissions.canViewPayment,
    canEditPayment: rolePermissions.canEditPayment,

    canViewReport: rolePermissions.canViewReport,
    canEditReport: rolePermissions.canEditReport,

    canViewDashboard: rolePermissions.canViewDashboard,
  };
};

const usePermission = () => {
  const userInformation = getJsonItemFromLocalStorage("userInformation");
  const { data: permission } = useGetRoleByBusiness();

  const userRolePermissions = extractPermissions(permission, "userRole");
  const managerRolePermissions = extractPermissions(permission, "managerRole");

  const role = userInformation?.role;

  return {
    userRolePermissions,
    managerRolePermissions,
    role,
  };
};

export default usePermission;
