export const permissions = {
  canAccessBookings: true,
  canAccessCampaigns: true,
  canAccessOrders: true,
  canAccessPayments: true,
  canAccessReports: true,
  canAccessReservations: true,
  canAccessSettings: true,
  canAccessMenu: true,
  canAccessNotifications: true,
  canAccessQuickResponses: true,
  canAccessMultipleLocations: true,
};

export const routePermissions: Record<string, keyof typeof permissions> = {
  "/dashboard/campaigns": "canAccessCampaigns",
  "/dashboard/bookings": "canAccessBookings",
  "/dashboard/orders": "canAccessOrders",
  "/dashboard/payments": "canAccessPayments",
  "/dashboard/reports": "canAccessReports",
  "/dashboard/reservation": "canAccessReservations",
  "/dashboard/settings": "canAccessSettings",
  "/dashboard/menu": "canAccessMenu",
  "/dashboard/notifications": "canAccessNotifications",
  "/dashboard/quick-response": "canAccessQuickResponses",
  "/dashboard/multiple-locations": "canAccessMultipleLocations",
};
