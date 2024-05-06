'use client';
import {
  getJsonItemFromLocalStorage,
  notify,
  saveJsonItemToLocalStorage,
} from '@/lib/utils';
import axios, { AxiosError, AxiosRequestConfig } from 'axios';
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

const TOKEN_REFRESH_WINDOW = 5 * 60 * 1000;
const TOKEN_EXPIRY_DURATION = 30 * 60 * 1000;

const isTokenExpiring = (response) => {
  return response.headers['x-token-expiring'] === 'true';
};
const refreshToken = async (): Promise<string | null> => {
  const userData = getJsonItemFromLocalStorage<any>('userInformation');
  if (!userData) return null;

  const { token, email } = userData;

  try {
    const response = await generateRefreshToken({
      token,
      email,
    });

    const newToken = response.data.jwtToken;

    const newExpiry = Date.now() + TOKEN_EXPIRY_DURATION;
    saveJsonItemToLocalStorage('userInformation', {
      ...userData,
      token: newToken,
      tokenExpiry: newExpiry,
    });

    return newToken;
  } catch (error) {
    console.error('Error refreshing token:', error);
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

api.interceptors.request.use(async (config) => {
  const userData = getJsonItemFromLocalStorage('userInformation');
  const token = userData?.token;
  const cooperateID = userData?.cooperateID;

  // const now = Date.now();
  // if (
  //   TOKEN_EXPIRY_DURATION &&
  //   now >= TOKEN_EXPIRY_DURATION - TOKEN_REFRESH_WINDOW
  // ) {
  //   const newToken = await refreshToken();

  //   if (newToken) {
  //     config.headers.Authorization = `Bearer ${newToken}`;
  //   }
  // } else {
  //   config.headers.Authorization = `Bearer ${token}`;
  // }
  if (token) {
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
    const originalRequest = error.config as AxiosRequestConfig & {
      _retry?: boolean;
    };

    // if (error.response?.status === 401 && !originalRequest._retry) {
    //   originalRequest._retry = true;

    //   const newToken = await refreshToken();

    //   if (newToken) {
    //     originalRequest.headers.Authorization = `Bearer ${newToken}`;
    //     return api(originalRequest);
    //   } else {
    //     notify({
    //       title: 'Session Expired',
    //       text: 'Please log in again.',
    //       type: 'error',
    //     });
    //     window.location.href = '/auth/login';
    //   }
    // }

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

    // if (error.response.status === 401) {
    //   notify({
    //     title: 'Error!',
    //     text: 'Session timeout',
    //     type: 'error',
    //   });
    //   window.location.href = '/auth/login';
    // }

    // if (error.response?.status === 401 && !originalRequest._retry) {
    //   originalRequest._retry = true;

    //   const newToken = await refreshToken();

    //   if (newToken) {
    //     originalRequest.headers.Authorization = `Bearer ${newToken}`;
    //     return api(originalRequest);
    //   } else {
    //     notify({
    //       title: 'Session Expired',
    //       text: 'Please log in again.',
    //       type: 'error',
    //     });
    //     window.location.href = '/auth/login';
    //     return Promise.reject(error);
    //   }
    // }
  }

  // (error) => {
  // if (error.response.status === 401) {
  //   notify({
  //     title: 'Error!',
  //     text: 'Session timeout',
  //     type: 'error',
  //   });
  //   window.location.href = '/auth/login';
  // }
  // return Promise.reject(error);
  // }
);

export default api;
