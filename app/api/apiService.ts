'use client';
import {
  getJsonItemFromLocalStorage,
  notify,
  saveJsonItemToLocalStorage,
} from '@/lib/utils';
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
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

// interface UserInformation {
//   token: string;
//   refreshToken: string;
//   email: string;
//   tokenExpiry?: number;
//   cooperateID?: string;
// }

// const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL;

// const REFRESH_WINDOW = 60 * 1000;
// const TOKEN_EXPIRY_TIME = 30 * 60 * 1000;

// const api = axios.create({
//   baseURL,
//   headers: {
//     'Content-Type': 'application/json',
//   },
// });

// const refreshToken = async (): Promise<string | null> => {
//   const userData =
//     getJsonItemFromLocalStorage<UserInformation>('userInformation');
//   if (!userData) return null;

//   const { token, email } = userData;

//   try {
//     const response = await generateRefreshToken({ token, email });
//     const newToken = response.data.jwtToken;
//     console.log(response, 'refresh token response');

//     const newExpiry = Date.now() + TOKEN_EXPIRY_TIME;
//     saveJsonItemToLocalStorage('userInformation', {
//       ...userData,
//       token: newToken,
//       tokenExpiry: newExpiry,
//     });

//     return newToken;
//   } catch (error) {
//     console.error('Error refreshing token:', error);
//     return null;
//   }
// };

// api.interceptors.request.use(async (config: AxiosRequestConfig) => {
//   const userData =
//     getJsonItemFromLocalStorage<UserInformation>('userInformation');
//   if (userData) {
//     const { token, tokenExpiry, cooperateID } = userData;

//     const now = Date.now();

//     if (tokenExpiry && now >= tokenExpiry - REFRESH_WINDOW) {
//       const newToken = await refreshToken();
//       if (newToken) {
//         config.headers.Authorization = `Bearer ${newToken}`;
//       }
//     } else {
//       if (token) {
//         config.headers.Authorization = `Bearer ${token}`;
//       }
//     }

//     if (cooperateID) {
//       config.headers.cooperateId = cooperateID;
//     }
//   }

//   if (config.headers['Content-Type'] === 'multipart/form-data') {
//     delete config.headers['Content-Type'];
//   }

//   return config;
// });

// api.interceptors.response.use(
//   (response: AxiosResponse) => response,
//   async (error) => {
//     const originalRequest = error.config as AxiosRequestConfig & {
//       _retry?: boolean;
//     };

//     if (error.response.status === 401 && !originalRequest._retry) {
//       originalRequest._retry = true;

//       const newToken = await refreshToken();
//       if (newToken) {
//         originalRequest.headers.Authorization = `Bearer ${newToken}`;
//         return api(originalRequest);
//       } else {
//         notify({
//           title: 'Session expired',
//           text: 'Please log in again',
//           type: 'error',
//         });

//         return Promise.reject(error);
//       }
//     }

//     return Promise.reject(error);
//   }
// );

// export default api;

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
