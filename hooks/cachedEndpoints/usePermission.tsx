'use client';

import { getJsonItemFromLocalStorage } from '@/lib/utils';
import useGetRoleByBusiness from './useGetRoleBusiness';

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
  if (!permissions?.data?.data) return {};

  const rolePermissions = permissions.data.data[roleType] || {};

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
  };
};

const usePermission = () => {
  const userInformation = getJsonItemFromLocalStorage('userInformation');
  const { data: permission } = useGetRoleByBusiness();

  const userRolePermissions = extractPermissions(permission, 'userRole');
  const managerRolePermissions = extractPermissions(permission, 'managerRole');

  const role = userInformation?.role;

  return {
    userRolePermissions,
    managerRolePermissions,
    role,
  };
};

export default usePermission;
