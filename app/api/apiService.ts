'use client';
import {
  getJsonItemFromLocalStorage,
  notify,
  saveJsonItemToLocalStorage,
} from '@/lib/utils';
import axios from 'axios';
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

const isTokenExpiring = (response) => {
  return response.headers['x-token-expiring'] === 'true';
};
const refreshToken = async () => {
  const userData = getJsonItemFromLocalStorage('userInformation');
  const refreshToken = userData?.token;
  const email = userData?.email;

  try {
    const response = await generateRefreshToken({ refreshToken, email });
    const newToken = response.data.jwtToken;
    console.log(newToken, 'newToken');
    saveJsonItemToLocalStorage('userInformation', {
      ...userData,
      token: newToken,
    });

    return newToken;
  } catch (error) {
    console.error('Error refreshing token:', error);
  }
};
const timeout = 5000;
const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  // timeout,
});

api.interceptors.request.use(async (config) => {
  const userData = getJsonItemFromLocalStorage('userInformation');
  const token = userData?.token;
  const cooperateID = userData?.cooperateID;
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
  (error) => {
    if (error.response.status === 401) {
      notify({
        title: 'Error!',
        text: 'Session timeout',
        type: 'error',
      });
    }
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    if (isTokenExpiring(response)) {
      // Token is about to expire, refresh the token
      return refreshToken().then((newToken) => {
        // Update the token in the request config with the new token
        response.config.headers.Authorization = `Bearer ${newToken}`;
        return response;
      });
    }
    return response;
  },
  (error) => {
    if (error.response.status === 401) {
      // window.location.href = '/auth/login';
    }
    return Promise.reject(error);
  }
);

export default api;
