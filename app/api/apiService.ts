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

import {
  getJsonItemFromLocalStorage,
  notify,
  resetLoginInfo,
  saveJsonItemToLocalStorage,
} from "@/lib/utils";
import axios from "axios";
import { generateRefreshToken } from "./controllers/auth";
import toast from "react-hot-toast";

let refreshPromise: Promise<any> | null = null;
let refreshTimeout: NodeJS.Timeout | null = null;

const scheduleTokenRefresh = (expirationTime: string) => {
  if (refreshTimeout) {
    clearTimeout(refreshTimeout);
  }

  const expirationDate = new Date(expirationTime).getTime();
  const currentTime = new Date().getTime();

  // Refresh 2 minutes before expiration
  const timeUntilRefresh = expirationDate - currentTime - 120000;

  if (timeUntilRefresh > 0) {
    refreshTimeout = setTimeout(refreshTokenIfNeeded, timeUntilRefresh);
  } else {
    resetLoginInfo();
    toast.error("Session expired, please login again");
  }
};

const refreshTokenIfNeeded = async () => {
  try {
    if (refreshPromise) {
      return refreshPromise;
    }

    const userData = getJsonItemFromLocalStorage("userInformation");
    const businesses = getJsonItemFromLocalStorage("business");

    if (!userData || !businesses) {
      resetLoginInfo();
      return null;
    }

    refreshPromise = generateRefreshToken({
      refreshToken: userData.refreshToken,
      businessId: businesses[0].businessId,
      email: userData.email,
    });

    const response = await refreshPromise;

    if (!response?.data?.data) {
      throw new Error("Invalid refresh token response");
    }

    const {
      token: newToken,
      refreshToken: newRefreshToken,
      tokenExpiration: newExpiration,
    } = response.data.data;

    saveJsonItemToLocalStorage("userInformation", {
      ...userData,
      token: newToken,
      refreshToken: newRefreshToken,
      tokenExpiration: newExpiration,
    });

    api.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;
    scheduleTokenRefresh(newExpiration);

    return response;
  } catch (error) {
    resetLoginInfo();
    toast.error("Session expired, please login again");
    throw error;
  } finally {
    refreshPromise = null;
  }
};

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 20000,
});

// Initialize token refresh schedule on API creation
const userData = getJsonItemFromLocalStorage("userInformation");
if (userData?.tokenExpiration) {
  scheduleTokenRefresh(userData.tokenExpiration);
}

api.interceptors.request.use(async (config) => {
  const userData = getJsonItemFromLocalStorage("userInformation");
  const business = getJsonItemFromLocalStorage("business");

  if (userData?.token) {
    config.headers.Authorization = `Bearer ${userData.token}`;
  }

  if (userData?.cooperateID) {
    config.headers["cooperateId"] = userData.cooperateID;
  }

  if (business?.businessId) {
    config.headers["businessId"] = business.businessId;
  }

  if (config.headers["Content-Type"] === "multipart/form-data") {
    delete config.headers["Content-Type"];
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // No automatic refresh on 401, just handle the error
    handleError(error, false);
    return Promise.reject(error);
  }
);

export const handleError = (error: any, showError: boolean = true) => {
  if (showError) {
    if (!error.response?.data?.title) {
      notify({
        title: "Error!",
        text:
          error.response?.data?.error?.responseDescription ||
          "An error occurred",
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
        text: "An error occurred, please try again",
        type: "error",
      });
    }
  }
};

export default api;
