'use client';
import {
  clearItemLocalStorage,
  getJsonItemFromLocalStorage,
  notify,
  removeCookie,
  saveJsonItemToLocalStorage,
} from '@/lib/utils';
import axios, { AxiosError } from 'axios';
import { generateRefreshToken } from './controllers/auth';

export const handleError = (error: any) => {
  if (!error.response.data.title) {
    notify({
      title: 'Error!',
      text: error.response.data.error.responseDescription,
      type: 'error',
    });
  } else {
    notify({
      title: 'Error!',
      text: 'An error occured, please try again',
      type: 'error',
    });
  }
};

const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL;
const now = Date.now();
const TOKEN_REFRESH_WINDOW = 5 * 60 * 1000;
const TOKEN_EXPIRY_DURATION = 30 * 60 * 1000;

const isTokenExpiring = (response) => {
  return response.headers['x-token-expiring'] === 'true';
};
const refreshToken = async () => {
  const userData = getJsonItemFromLocalStorage('userInformation');
  if (!userData) return null;

  const { token, email } = userData;

  try {
    const response = await generateRefreshToken({
      token,
      email,
    });

    const newToken = response?.data?.data?.jwtToken;

    const newExpiry = Date.now() + TOKEN_EXPIRY_DURATION;
    saveJsonItemToLocalStorage('userInformation', {
      ...userData,
      token: newToken,
      tokenExpiry: newExpiry,
    });

    return newToken;
  } catch (error) {
    return null;
  }
};

const timeout = 15000;
const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout,
});
let refreshInProgress = false;
api.interceptors.request.use(async (config) => {
  const userData = getJsonItemFromLocalStorage('userInformation');
  const token = userData?.token;
  const cooperateID = userData?.cooperateID;

  if (
    userData?.tokenExpiry &&
    now >= userData?.tokenExpiry - TOKEN_REFRESH_WINDOW &&
    !refreshInProgress
  ) {
    refreshInProgress = true;
    const newToken = await refreshToken();
    refreshInProgress = false;

    if (newToken) {
      config.headers.Authorization = `Bearer ${newToken}`;
    }
  } else {
    config.headers.Authorization = `Bearer ${token}`;
  }

  if (cooperateID) {
    config.headers['cooperateId'] = cooperateID;
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
      notify({
        title: 'Session Expired',
        text: 'Please log in again.',
        type: 'error',
      });
      clearItemLocalStorage('userInformation');
      removeCookie('token');
      window.location.href = '/auth/login';
    }

    if (error.code === 'ECONNABORTED') {
      notify({
        title: 'Network Timeout',
        text: 'The request took too long. Please try again later.',
        type: 'error',
      });
      return error;
    }
    if (error.code === 'ERR_BAD_REQUEST') {
      notify({
        title: 'Error',
        text: error.response.data.error.responseDescription,
        type: 'error',
      });
      return error;
    }
    if (error.code === 'ERR_NETWORK') {
      notify({
        title: 'Network Timeout!',
        text: 'Check your network and try again',
        type: 'error',
      });
      return error;
    }
  }
);

export default api;
