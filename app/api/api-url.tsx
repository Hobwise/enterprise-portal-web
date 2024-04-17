export const AUTH = {
  registerUser: 'api/v1/User',
  updateUser: 'api/v1/User',
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
  getRoleByBusiness: 'api/v1/User/role-by-business',
  getMenu: 'api/v1/Menu',
  menuConfiguration: 'api/v1/Menu/configuration',
  getMenuByBusiness: 'api/v1/Menu/by-business',
  menuItem: 'api/v1/Menu/item',
  uploadFile: 'api/v1/File/upload',
  uploadBulkMenuItem: 'api/v1/Menu/item-upload',
  menuVariety: 'api/v1/Menu/item-variety',
};
