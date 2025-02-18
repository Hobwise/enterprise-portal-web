// import { refreshToken } from "./apiService";
// import {
//   getJsonItemFromLocalStorage,
//   notify,
//   removeCookie,
//   resetLoginInfo,
//   saveJsonItemToLocalStorage,
// } from "@/lib/utils";
// import axios, { AxiosError } from "axios";

// import { generateRefreshToken, logout } from "./controllers/auth";

// const api = axios.create({
//   baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
//   headers: {
//     "Content-Type": "application/json",
//   },
//   timeout: 20000,
// });

// api.interceptors.request.use(async (config) => {
//   const userData = getJsonItemFromLocalStorage("userInformation");
//   const business = getJsonItemFromLocalStorage("business");
//   const token = userData?.token;
//   const cooperateID = userData?.cooperateID;
//   const businessId = business?.businessId;

//   if (token) {
//     config.headers.Authorization = `Bearer ${token}`;
//   }

//   if (cooperateID) {
//     config.headers["cooperateId"] = cooperateID;
//   }

//   if (businessId) {
//     config.headers["businessId"] = businessId;
//   }

//   const isMultipartFormData =
//     config.headers["Content-Type"] === "multipart/form-data";
//   if (isMultipartFormData) {
//     delete config.headers["Content-Type"];
//   }

//   return config;
// });

// api.interceptors.response.use(
//   (response) => response,
//   async (error) => {
//     let originalConfig = error.config;

//     if (
//       error.response &&
//       error.response.status === 401 &&
//       !originalConfig._retry
//     ) {
//       originalConfig._retry = true;
//       try {
//         const userData = getJsonItemFromLocalStorage("userInformation");
//         const businesses = getJsonItemFromLocalStorage("business");

//         const { refreshToken, email } = userData;
//         const businessId = businesses[0].businessId;

//         const rs = await generateRefreshToken({
//           refreshToken,
//           businessId,
//           email,
//         });

//         if (!rs) {
//           resetLoginInfo();
//           throw new Error("Failed to generate new token");
//         }
//         console.log(rs, "!rs");
//         const {
//           token: newToken,
//           refreshToken: newRefreshToken,
//           tokenExpiration: newExpiration,
//         } = rs.data.data;

//         saveJsonItemToLocalStorage("userInformation", {
//           ...userData,
//           token: newToken,
//           refreshToken: newRefreshToken,
//           tokenExpiration: newExpiration,
//         });

//         api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
//         return api(originalConfig);
//       } catch (_error) {
//         resetLoginInfo();
//         if (error.response && error.response.data) {
//           resetLoginInfo();
//           return Promise.reject(error.response.data);
//         }
//         return Promise.reject(_error);
//       }
//     } else {
//       handleError(error, false);
//     }
//     return Promise.reject(error);
//   }
// );

// export const handleError = (error: any, showError: boolean = true) => {
//   if (showError) {
//     if (!error.response?.data?.title) {
//       notify({
//         title: "Error!",
//         text:
//           error.response?.data?.error?.responseDescription ||
//           "An error occurred",
//         type: "error",
//       });
//     } else if (error.code === "ECONNABORTED") {
//       notify({
//         title: "Network Timeout",
//         text: "The request took too long. Please try again later.",
//         type: "error",
//       });
//     } else if (error.code === "ERR_NETWORK") {
//       notify({
//         title: "Network Error!",
//         text: "Check your network and try again",
//         type: "error",
//       });
//     } else {
//       notify({
//         title: "Error!",
//         text: "An error occurred, please try again",
//         type: "error",
//       });
//     }
//   }
// };

// export default api;

"use client";
import {
  getJsonItemFromLocalStorage,
  notify,
  saveJsonItemToLocalStorage,
} from "@/lib/utils";
import axios, { AxiosRequestConfig, AxiosResponse } from "axios";
import { generateRefreshToken } from "./controllers/auth";
interface UserInformation {
  token: string;
  refreshToken: string;
  email: string;
  tokenExpiration?: string;
  cooperateID?: string;
}

const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL;

const REFRESH_WINDOW = 60 * 1000;
const TOKEN_EXPIRY_TIME = 30 * 60 * 1000;

const api = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

const refreshToken = async (): Promise<string | null> => {
  const userData = getJsonItemFromLocalStorage("userInformation");
  if (!userData) return null;

  const { token, email } = userData;

  try {
    const response = await generateRefreshToken({ token, email });
    const newToken = response.data.jwtToken;
    console.log(response, "refresh token response");

    const newExpiry = Date.now() + TOKEN_EXPIRY_TIME;
    saveJsonItemToLocalStorage("userInformation", {
      ...userData,
      token: newToken,
      tokenExpiration: newExpiry,
    });

    return newToken;
  } catch (error) {
    console.error("Error refreshing token:", error);
    return null;
  }
};

api.interceptors.request.use(async (config: AxiosRequestConfig) => {
  const userData =
    getJsonItemFromLocalStorage<UserInformation>("userInformation");
  if (userData) {
    const { token, tokenExpiration, cooperateID } = userData;

    const now = Date.now();

    if (tokenExpiration && now >= tokenExpiration - REFRESH_WINDOW) {
      const newToken = await refreshToken();
      if (newToken) {
        config.headers.Authorization = `Bearer ${newToken}`;
      }
    } else {
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    if (cooperateID) {
      config.headers.cooperateId = cooperateID;
    }
  }

  if (config.headers["Content-Type"] === "multipart/form-data") {
    delete config.headers["Content-Type"];
  }

  return config;
});

api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error) => {
    const originalRequest = error.config as AxiosRequestConfig & {
      _retry?: boolean;
    };

    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const newToken = await refreshToken();
      if (newToken) {
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } else {
        notify({
          title: "Session expired",
          text: "Please log in again",
          type: "error",
        });

        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
