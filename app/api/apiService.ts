'use client';
import { getJsonItemFromLocalStorage, notify } from '@/lib/utils';
import axios from 'axios';

export const handleError = (error: any) => {
  if (error.response.data) {
    notify({
      message: error.response.data.error.responseDescription,
      type: 'error',
    });
  } else {
    notify({
      message: 'An error occured, please try again',
      type: 'error',
    });
  }
};

const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL;

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(async (config) => {
  const userData = getJsonItemFromLocalStorage('userInformation');
  const token = userData?.token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default api;
