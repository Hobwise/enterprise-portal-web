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
// import toast from "react-hot-toast";

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
//       originalConfig._retry = false;
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
//         toast.error("Session Expired, please log in again.");
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

import {
  getJsonItemFromLocalStorage,
  notify,
  removeCookie,
  resetLoginInfo,
  saveJsonItemToLocalStorage,
} from "@/lib/utils";
import axios from "axios";

import { generateRefreshToken } from "./controllers/auth";
import toast from "react-hot-toast";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 20000,
});

let refreshTokenTimeout: NodeJS.Timeout;

const scheduleTokenRefresh = async (expirationTime: number) => {
  const currentTime = Date.now();
  const timeUntilExpiration = expirationTime - currentTime;
  const refreshThreshold = 2 * 60 * 1000; // 2 minutes in milliseconds

  if (timeUntilExpiration > refreshThreshold) {
    refreshTokenTimeout = setTimeout(async () => {
      try {
        const userData = getJsonItemFromLocalStorage("userInformation");
        const businesses = getJsonItemFromLocalStorage("business");

        const { refreshToken: currentRefreshToken, email } = userData;
        const businessId = businesses[0].businessId;

        const rs = await generateRefreshToken({
          refreshToken: currentRefreshToken,
          businessId,
          email,
        });

        if (!rs) {
          throw new Error("Failed to generate new token");
        }

        const {
          token: newToken,
          refreshToken: newRefreshToken,
          tokenExpiration: newExpiration,
        } = rs.data.data;

        saveJsonItemToLocalStorage("userInformation", {
          ...userData,
          token: newToken,
          refreshToken: newRefreshToken,
          tokenExpiration: newExpiration,
        });

        api.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;

        const newExpirationTime = new Date(newExpiration).getTime();
        scheduleTokenRefresh(newExpirationTime);
      } catch (error) {
        resetLoginInfo();
        toast.error("Session Expired, please log in again.");
      }
    }, timeUntilExpiration - refreshThreshold);
  }
};

api.interceptors.request.use(async (config) => {
  const userData = getJsonItemFromLocalStorage("userInformation");
  const business = getJsonItemFromLocalStorage("business");
  const token = userData?.token;
  const cooperateID = userData?.cooperateID;
  const businessId = business?.businessId;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  if (cooperateID) {
    config.headers["cooperateId"] = cooperateID;
  }

  if (businessId) {
    config.headers["businessId"] = businessId;
  }

  const isMultipartFormData =
    config.headers["Content-Type"] === "multipart/form-data";
  if (isMultipartFormData) {
    delete config.headers["Content-Type"];
  }

  return config;
});

api.interceptors.response.use(
  (response) => {
    if (
      response.config.url?.includes("login") ||
      response.config.url?.includes("refresh-token")
    ) {
      const { token, tokenExpiration } = response.data.data;
      const expirationTime = new Date(tokenExpiration).getTime();
      scheduleTokenRefresh(expirationTime);
    }
    return response;
  },
  async (error) => {
    let originalConfig = error.config;

    if (
      error.response &&
      error.response.status === 401 &&
      !originalConfig._retry
    ) {
      originalConfig._retry = false;
      try {
        const userData = getJsonItemFromLocalStorage("userInformation");
        const businesses = getJsonItemFromLocalStorage("business");

        const { refreshToken, email } = userData;
        const businessId = businesses[0].businessId;

        const rs = await generateRefreshToken({
          refreshToken,
          businessId,
          email,
        });

        if (!rs) {
          resetLoginInfo();

          throw new Error("Failed to generate new token");
        }

        const {
          token: newToken,
          refreshToken: newRefreshToken,
          tokenExpiration: newExpiration,
        } = rs.data.data;

        saveJsonItemToLocalStorage("userInformation", {
          ...userData,
          token: newToken,
          refreshToken: newRefreshToken,
          tokenExpiration: newExpiration,
        });

        api.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;
        return api(originalConfig);
      } catch (_error) {
        resetLoginInfo();
        toast.error("Session Expired, please log in again.");
        if (error.response && error.response.data) {
          resetLoginInfo();

          return Promise.reject(error.response.data);
        }
        return Promise.reject(_error);
      }
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
        title: "Error!",
        text: error.response?.data?.error?.responseDescription || error.message,
        type: "error",
      });
    } else if (error.code === "ECONNABORTED") {
      notify({
        title: "Network Timeout",
        text: "The request took too long. Please try again later.",
        type: "error",
      });
    } else if (error.code === "ERR_NETWORK") {
      notify({
        title: "Network Error!",
        text: "Check your network and try again",
        type: "error",
      });
    } else {
      notify({
        title: "Error!",
        text: error.message || "An error occurred, please try again",
        type: "error",
      });
    }
  }
};

export default api;
