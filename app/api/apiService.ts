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
import { generateRefreshToken, logout } from "./controllers/auth";
import toast from "react-hot-toast";

let refreshTimeout: NodeJS.Timeout | null = null;

const scheduleTokenRefresh = (expirationTime: string) => {
  if (refreshTimeout) {
    clearTimeout(refreshTimeout);
  }

  const expirationDate = new Date(expirationTime).getTime();
  const currentTime = new Date().getTime();

  const timeUntilRefresh = expirationDate - currentTime - 120000; // 60000ms = 1 minute

  if (timeUntilRefresh <= 0) {
    refreshTokenIfNeeded();
  } else {
    refreshTimeout = setTimeout(refreshTokenIfNeeded, timeUntilRefresh);
  }
};

const refreshTokenIfNeeded = async () => {
  try {
    const userData = getJsonItemFromLocalStorage("userInformation");
    const businesses = getJsonItemFromLocalStorage("business");

    if (!userData || !businesses) {
      resetLoginInfo();
      return;
    }

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

    scheduleTokenRefresh(newExpiration);
  } catch (error) {
    resetLoginInfo();
    throw error;
  }
};

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 20000,
});

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
  (response) => response,
  async (error) => {
    let originalConfig = error.config;
    const userData = getJsonItemFromLocalStorage("userInformation");
    if (
      // error.response &&
      // error.response.status === 401 &&
      // !originalConfig._retry
      userData?.tokenExpiration &&
      !refreshTimeout
    ) {
      originalConfig._retry = false;
      try {
        scheduleTokenRefresh(userData?.tokenExpiration);

        // toast.error("Session timeout, please login again");
        // await refreshTokenIfNeeded();
        return api(originalConfig);
      } catch (_error) {
        resetLoginInfo();
        toast.error("Session timeout, please login again");
        if (error.response && error.response.data) {
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
