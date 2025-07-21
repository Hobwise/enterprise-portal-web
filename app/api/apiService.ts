import { getJsonItemFromLocalStorage, notify, removeCookie, resetLoginInfo, saveJsonItemToLocalStorage } from '@/lib/utils';
import axios, { AxiosError } from 'axios';
import { generateRefreshToken, logout } from './controllers/auth';
import { decryptPayload } from '@/lib/encrypt-decrypt';

let isRefreshing = false;
let refreshSubscribers: Array<(token?: string | null, error?: any) => void> = [];

const subscribeTokenRefresh = (callback: (token?: string | null, error?: any) => void) => {
  refreshSubscribers.push(callback);
};

const onTokenRefreshed = (token: string) => {
  refreshSubscribers.forEach((callback) => callback(token));
  refreshSubscribers = [];
};

const onRefreshFailed = (error: any) => {
  refreshSubscribers.forEach((callback) => callback(null, error));
  refreshSubscribers = [];
};

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 20000,
});

const isTokenExpiringSoon = () => {
  const userData = getJsonItemFromLocalStorage('userInformation');
  if (!userData?.tokenExpiration) return false;

  const expirationTime = new Date(userData.tokenExpiration).getTime();
  const currentTime = new Date().getTime();
  const twoMinutesInMs = 2 * 60 * 1000;

  return expirationTime - currentTime <= twoMinutesInMs && expirationTime > currentTime;
};

const refreshToken = async () => {
  try {
    const userData = getJsonItemFromLocalStorage('userInformation');
    const businesses = getJsonItemFromLocalStorage('business');

    if (!userData?.refreshToken || !userData?.email || !businesses?.[0]?.businessId) {
      throw new Error('Missing required refresh data');
    }

    const { refreshToken, email } = userData;
    const businessId = businesses[0].businessId;

    const response = await generateRefreshToken({
      refreshToken,
      businessId,
      email,
    });

    if (!response?.data?.response) {
      throw new Error('Failed to generate new token');
    }

    const decryptedData = decryptPayload(response?.data?.response);

    const { token: newToken, refreshToken: newRefreshToken, tokenExpiration: newExpiration } = decryptedData?.data;

    saveJsonItemToLocalStorage('userInformation', {
      ...userData,
      token: newToken,
      refreshToken: newRefreshToken,
      tokenExpiration: newExpiration,
    });

    api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
    onTokenRefreshed(newToken);
    return newToken;
  } catch (error) {
    onRefreshFailed(error);
    resetLoginInfo();
    window.location.href = '/auth/login';
    throw error;
  } finally {
    isRefreshing = false;
  }
};

const refreshTokenIfNeeded = async () => {
  if (!isTokenExpiringSoon() || isRefreshing) return null;

  isRefreshing = true;
  try {
    return await refreshToken();
  } catch (error) {
    return null;
  }
};

api.interceptors.request.use(async (config) => {
  await refreshTokenIfNeeded();

  const userData = getJsonItemFromLocalStorage('userInformation');
  const business = getJsonItemFromLocalStorage('business');
  const token = userData?.token;
  const cooperateID = userData?.cooperateID;
  const businessId = business?.businessId;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  if (cooperateID) {
    config.headers['cooperateId'] = cooperateID;
  }
  if (businessId) {
    config.headers['businessId'] = businessId;
  }

  const isMultipartFormData = config.headers['Content-Type'] === 'multipart/form-data';
  if (isMultipartFormData) {
    delete config.headers['Content-Type'];
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalConfig = error.config;

    if (error.response && error.response.status === 401 && !originalConfig._retry) {
      originalConfig._retry = true;

      if (isRefreshing) {
        try {
          const newToken = await new Promise<string | null>((resolve, reject) => {
            subscribeTokenRefresh((token?: string | null, err?: any) => {
              if (err) {
                reject(err);
              } else {
                resolve(token || null);
              }
            });
          });

          if (newToken) {
            originalConfig.headers.Authorization = `Bearer ${newToken}`;
            return api(originalConfig);
          } else {
            throw new Error('Token refresh failed');
          }
        } catch (refreshError) {
          return Promise.reject(refreshError);
        }
      } else {
        isRefreshing = true;
        try {
          const newToken = await refreshToken();
          originalConfig.headers.Authorization = `Bearer ${newToken}`;
          return api(originalConfig);
        } catch (refreshError: any) {
          if (refreshError.response && refreshError.response.status === 400) {
            resetLoginInfo();
            window.location.href = '/auth/login';
          }
          return Promise.reject(refreshError);
        }
      }
    } else if (error.response && error.response.status === 401) {
      // If we get here without retry, it means token refresh wasn't attempted or applicable
      // Immediately logout to prevent unresponsive state
      resetLoginInfo();
      window.location.href = '/auth/login';
      return Promise.reject(error);
    } else {
      handleError(error, false);
    }

    return Promise.reject(error);
  }
);

export const handleError = (error: any, showError: boolean = true) => {
  if (showError) {
    if (!error.response?.data?.title) {
      notify({
        title: 'Error!',
        text: error.response?.data?.error?.responseDescription || 'An error occurred',
        type: 'error',
      });
    } else if (error.code === 'ECONNABORTED') {
      notify({
        title: 'Network Timeout',
        text: 'The request took too long. Please try again later.',
        type: 'error',
      });
    } else if (error.code === 'ERR_NETWORK') {
      notify({
        title: 'Network Error!',
        text: 'Check your network and try again',
        type: 'error',
      });
    } else {
      notify({
        title: 'Error!',
        text: 'An error occurred, please try again',
        type: 'error',
      });
    }
  }
};

export default api;
