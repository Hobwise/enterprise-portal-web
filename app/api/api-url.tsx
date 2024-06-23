export const AUTH = {
  user: 'api/v1/User',
  generateToken: 'api/v1/OneTimePassword/generate',
  validateToken: 'api/v1/OneTimePassword/validate',
  registerBusiness: 'api/v1/business',
  loginUser: 'api/v1/User/login',
  refreshToken: 'api/v1/User/refresh-token',
  forgetPassword: 'api/v1/User/forget-password',
  changePassword: 'api/v1/User/change-password',
  getBusiness: 'api/v1/Business/configuration',
};
export const DASHBOARD = {
  // settings
  getRoleByBusiness: 'api/v1/User/role-by-business',
  // menu
  getMenu: 'api/v1/Menu',
  menuConfiguration: 'api/v1/Menu/configuration',
  getMenuByBusiness: 'api/v1/Menu/by-business',
  menuItem: 'api/v1/Menu/item',
  uploadFile: 'api/v1/File/upload',
  removeFile: 'api/v1/File/remove',
  uploadBulkMenuItem: 'api/v1/Menu/item-upload',
  menuVariety: 'api/v1/Menu/item-variety',
  // orders
  orderByBusiness: 'api/v1/Order/by-business',
  orderByPaged: 'api/v1/Order/paged',
  orderByReference: 'api/v1/Order/by-reference',
  order: 'api/v1/Order',
  placeOrder: 'api/v1/Order/place',
  completeOrder: 'api/v1/Order/complete',

  // Payments
  paymentByBusiness: 'api/v1/Payment/by-business',
  confirmPayment: 'api/v1/Payment/confirm',
  // Quick response
  qrByBusiness: 'api/v1/QuickResponse/detail-by-business',
  qrAllBy: 'api/v1/QuickResponse/by-business',
  qr: 'api/v1/QuickResponse',
  // Reservations
  reservationsByBusiness: 'api/v1/Reservation/by-business',
  reservation: 'api/v1/Reservation',
  singleReservation: 'api/v1/Reservation/fetch',
};
