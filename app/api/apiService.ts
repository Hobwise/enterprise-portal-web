'use client';

import {
  getJsonItemFromLocalStorage,
  notify,
  removeCookie,
  saveJsonItemToLocalStorage,
} from '@/lib/utils';
import axios, { AxiosError } from 'axios';
import toast from 'react-hot-toast';
import { generateRefreshToken } from './controllers/auth';

let refreshTimer: NodeJS.Timeout | null = null;

const logout = async () => {
  toast.error('Session Expired, please log in again.');
  window.location.href = '/auth/login';
  localStorage.clear();
  removeCookie('token');
};

export const refreshToken = async () => {
  const userData = getJsonItemFromLocalStorage('userInformation');
  if (!userData) return null;

  const { token, email } = userData;

  try {
    const response = await generateRefreshToken({
      token,
      email,
    });

    const { jwtToken: newToken, tokenExpiration: newExpiration } =
      response?.data?.data;

    saveJsonItemToLocalStorage('userInformation', {
      ...userData,
      token: newToken,
      tokenExpiration: newExpiration,
    });

    scheduleTokenRefresh();
    return newToken;
  } catch (error) {
    logout();
    return null;
  }
};

export const scheduleTokenRefresh = () => {
  if (refreshTimer) {
    clearTimeout(refreshTimer);
  }

  const userData = getJsonItemFromLocalStorage('userInformation');
  if (!userData || !userData.tokenExpiration) return;

  const expirationTime = new Date(userData.tokenExpiration).getTime();
  const currentTime = Date.now();

  const timeUntilRefresh = expirationTime - currentTime - 120 * 1000;

  if (timeUntilRefresh <= 0) {
    refreshToken();
    return;
  }

  refreshTimer = setTimeout(() => {
    refreshToken();
  }, timeUntilRefresh);
};

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 20000,
});

api.interceptors.request.use(async (config) => {
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

  const isMultipartFormData =
    config.headers['Content-Type'] === 'multipart/form-data';
  if (isMultipartFormData) {
    delete config.headers['Content-Type'];
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      logout();
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
        text:
          error.response?.data?.error?.responseDescription ||
          'An error occurred',
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

scheduleTokenRefresh();

export default api;
