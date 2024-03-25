import { getJsonItemFromLocalStorage, notify } from '@/lib/utils';
import axios from 'axios';
import toast from 'react-toastify';

export const handleError = (error) => {
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
    config.headers['Authorization'] = `Bearer ${token}`;
  }

  return config;
});

export default api;

// export const httpAuth = (
//   contentType = 'application/json',
//   responseType = ''
// ) => {
//   const baseURL = 'https://walrus-app-lehim.ondigitalocean.app/';

//   const instance = axios.create({
//     baseURL,
//     responseType,
//     headers: {
//       accept: 'application/json',
//       'Content-Type': contentType,
//     },
//   });

//   // instance.defaults.headers.common["content-type"] = contentType;
//   // instance.defaults.headers.common["language"] = lang;
//   // instance.defaults.headers.common["version"] = version;
//   // instance.defaults.headers.common['token'] = token;
//   // const intersectedInstance = instance.interceptors.request.use(
//   //   (response) => {
//   //     return response;
//   //   },
//   //   (error) => {
//   //     console.log(error.response);
//   //     if (error.response.status === 404) {
//   //       toast.error('An error occur, please try again later', toastData);
//   //     } else if (error.response.status === 401) {
//   //       return (window.location = '/');
//   //     } else if (error.response.status === 500) {
//   //       toast.error('Server Error', toastData);
//   //     }
//   //     return Promise.reject(error);
//   //   }
//   // );

//   return instance;
// };
