"use client";
import {
  loginUserSelectedBusiness,
} from "@/app/api/controllers/auth";
import useGetBusinessByCooperate from "@/hooks/cachedEndpoints/useGetBusinessByCooperate";
import { useGlobalContext } from "@/hooks/globalProvider";
import { decryptPayload } from "@/lib/encrypt-decrypt";
import {
  SmallLoader,
  notify,
  saveJsonItemToLocalStorage,
  setTokenCookie,
  getJsonItemFromLocalStorage,
  clearItemLocalStorage,
} from "@/lib/utils";
import { Avatar, ScrollShadow } from "@nextui-org/react";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef, useCallback } from "react";

// TypeScript interfaces for better type safety
interface Business {
  id: string;
  name: string;
  city?: string;
  state?: string;
  logoImage?: string;
  cooperateID: string;
}

interface LoginDetails {
  email: string;
  password: string;
}

interface DecryptedData {
  isSuccessful?: boolean;
  data?: {
    token: string;
    id: string;
    email: string;
    [key: string]: any;
  };
  error?: {
    code?: string;
    message?: string;
    responseCode?: string;
    responseDescription?: string;
  };
}

const SelectBusinessForm = () => {
  const router = useRouter();
  const { loginDetails, setLoginDetails } = useGlobalContext();
  const [loadingBusinessId, setLoadingBusinessId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { data, isLoading: loading, isError } = useGetBusinessByCooperate();
  const lastClickTime = useRef<number>(0);
  const [currentLoginDetails, setCurrentLoginDetails] = useState<LoginDetails | null>(null);
  const isMountedRef = useRef(true);

  // Validate loginDetails structure
  const validateLoginDetails = useCallback((details: any): details is LoginDetails => {
    return (
      details &&
      typeof details === 'object' &&
      typeof details.email === 'string' &&
      details.email.length > 0 &&
      typeof details.password === 'string' &&
      details.password.length > 0
    );
  }, []);

  // Centralized error handler
  const handleErrorDisplay = useCallback((message: string, shouldThrow = false) => {
    if (!isMountedRef.current) return;

    setError(message);
    notify({
      title: "Error",
      text: message,
      type: "error",
    });

    if (shouldThrow) {
      throw new Error(message);
    }
  }, []);

  // Initialize: prefetch route, restore credentials, and handle cleanup
  useEffect(() => {
    isMountedRef.current = true;
    router.prefetch('/dashboard');

    const storedLoginDetails = getJsonItemFromLocalStorage("loginDetails");

    // Prioritize localStorage over context state
    if (storedLoginDetails && validateLoginDetails(storedLoginDetails)) {
      setCurrentLoginDetails(storedLoginDetails);
      if (!loginDetails) {
        setLoginDetails(storedLoginDetails);
      }
    } else if (loginDetails && validateLoginDetails(loginDetails)) {
      setCurrentLoginDetails(loginDetails);
    } else if (storedLoginDetails) {
      clearItemLocalStorage("loginDetails");
      setError("Invalid session data. Please login again.");
    } else {
      setError("No login credentials found. Please login to continue.");
    }

    return () => {
      isMountedRef.current = false;
    };
  }, [router, loginDetails, setLoginDetails, validateLoginDetails]);

  const handleAuthenticationError = useCallback((error: any): boolean => {
    const authErrorCodes = ['AUTH001', 'AUTH002', 'TOKEN_EXPIRED', 'UNAUTHORIZED'];
    const errorCode = error?.code || error?.responseCode;
    const errorMessage = error?.message || error?.responseDescription || "";

    const isAuthError = authErrorCodes.includes(errorCode) ||
        errorMessage.toLowerCase().includes('token') ||
        errorMessage.toLowerCase().includes('unauthorized') ||
        errorMessage.toLowerCase().includes('authentication');

    if (isAuthError && isMountedRef.current) {
      handleErrorDisplay(
        errorMessage || "Authentication failed. Please try again or login."
      );
    }

    return isAuthError;
  }, [handleErrorDisplay]);

  const callLogin = useCallback(async (businessId: string): Promise<void> => {
    const loginCreds = currentLoginDetails || getJsonItemFromLocalStorage("loginDetails");

    // Validate credentials
    if (!loginCreds || !validateLoginDetails(loginCreds)) {
      handleErrorDisplay("Login credentials lost or invalid. Please login again.", true);
      return;
    }

    try {
      const data = await loginUserSelectedBusiness(loginCreds, businessId);

      // Check if login requires redirect
      if (data && 'requiresLogin' in data && data.requiresLogin) {
        const errorMsg = (data as any)?.errors?.general?.[0] || "Server requires re-authentication. Please login again.";
        handleErrorDisplay(errorMsg, true);
        return;
      }

      if (data && 'data' in data && data.data?.response) {
        const decryptedData: DecryptedData = decryptPayload(data.data.response);

        if (decryptedData?.data) {
          const receivedToken = decryptedData?.data.token;

          // Validate token
          if (!receivedToken?.trim()) {
            handleErrorDisplay(
              "Server returned invalid token. Please try again or login.",
              true
            );
            return;
          }

          // Set cookie and save user data
          setTokenCookie("token", receivedToken, {
            expires: 7,
            path: '/',
            sameSite: 'strict',
            secure: process.env.NODE_ENV === 'production',
          });
          saveJsonItemToLocalStorage("userInformation", decryptedData?.data);

          // Navigate to dashboard
          router.replace("/dashboard");
        } else if (decryptedData?.error) {
          if (!handleAuthenticationError(decryptedData.error)) {
            throw new Error(decryptedData.error?.message || "Failed to process business selection");
          }
        }
      } else if (data && 'response' in data && (data as any).response?.data?.response) {
        const decryptedData: DecryptedData = decryptPayload((data as any).response.data.response);
        if (decryptedData?.error) {
          if (!handleAuthenticationError(decryptedData.error)) {
            throw new Error(decryptedData.error?.message || "Failed to select business");
          }
        }
      } else {
        throw new Error("Invalid response format from server");
      }
    } catch (error: any) {
      if (!handleAuthenticationError(error) && isMountedRef.current) {
        if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
          handleErrorDisplay("The request took too long. Please try again.");
        } else if (error.message?.includes('Network')) {
          handleErrorDisplay("Unable to connect to the server. Please check your internet connection.");
        } else {
          handleErrorDisplay(error.message || "Failed to select business. Please try again.");
        }
      }
      throw error;
    }
  }, [currentLoginDetails, router, validateLoginDetails, handleErrorDisplay, handleAuthenticationError]);

  const handleSelectedBusiness = async (item: Business) => {
    // Prevent multiple clicks with debounce
    const now = Date.now();
    if (loadingBusinessId || (now - lastClickTime.current < 500)) {
      return;
    }
    lastClickTime.current = now;

    setLoadingBusinessId(item.id);
    setError(null);

    try {
      // Use the clicked item directly - it already has all the data we need
      // This ensures we always use the correct business ID that was clicked
      const businessData = {
        businessId: item.id,
        businessName: item.name,
        cooperateID: item.cooperateID,
        city: item.city,
        state: item.state,
        logoImage: item.logoImage
      };

      // Save the selected business to localStorage
      saveJsonItemToLocalStorage("business", [businessData]);

      // Login with the selected business ID (from the clicked item, not from API response)
      await callLogin(item.id);
    } catch (error: any) {
      if (!handleAuthenticationError(error) && isMountedRef.current) {
        if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
          handleErrorDisplay("The request took too long. Please try again.");
        } else if (error.message?.includes('Network')) {
          handleErrorDisplay("Unable to connect to the server. Please check your internet connection.");
        } else {
          handleErrorDisplay(error.message || "An unexpected error occurred");
        }
      }
    } finally {
      if (isMountedRef.current) {
        setLoadingBusinessId(null);
      }
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="grid place-content-center py-8">
        <div className="flex flex-col items-center gap-3">
          <SmallLoader />
          <p className="text-sm text-gray-600">Loading your businesses...</p>
        </div>
      </div>
    );
  }

  // FIXED: Better error handling for hook errors
  if (isError) {
    return (
      <div className="grid place-content-center py-8">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="text-red-500 text-lg">⚠️</div>
          <p className="text-sm text-gray-600">
            Failed to load businesses
          </p>
          <p className="text-xs text-gray-500">
            An error occurred while fetching your businesses
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  // Error state for missing credentials
  if (error && !data?.length) {
    return (
      <div className="grid place-content-center py-8">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="text-amber-500 text-lg">⚠️</div>
          <p className="text-sm text-gray-600">{error}</p>
          <div className="flex gap-2 mt-2">
            <button
              onClick={() => router.push('/auth/login')}
              className="px-4 py-2 bg-primaryColor text-white rounded hover:bg-secondaryColor transition-colors"
            >
              Go to Login
            </button>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  // No businesses found
  if (!data || data.length === 0) {
    return (
      <div className="grid place-content-center py-8">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="text-gray-400 text-lg">📋</div>
          <p className="text-sm text-gray-600">No businesses found</p>
          <p className="text-xs text-gray-500">
            Please contact support if you believe this is an error
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 w-full">
      {data.map((item: Business) => {
        const isThisCardLoading = loadingBusinessId === item.id;

        return (
          <ScrollShadow
            key={item.id}
            size={10}
            className="w-full max-h-[350px]"
          >
            <article
              role="button"
              tabIndex={isThisCardLoading ? -1 : 0}
              aria-label={`Select ${item.name} business in ${item.city || ''} ${item.state || ''}`}
              aria-disabled={isThisCardLoading}
              className={`bg-[#F1F2F480] rounded-xl p-3 transition-all ${
                isThisCardLoading
                  ? "opacity-50 cursor-not-allowed pointer-events-none"
                  : "cursor-pointer hover:bg-[#F1F2F4] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              }`}
              onClick={() => !loadingBusinessId && handleSelectedBusiness(item)}
              onKeyDown={(e) => {
                if ((e.key === 'Enter' || e.key === ' ') && !loadingBusinessId) {
                  e.preventDefault();
                  handleSelectedBusiness(item);
                }
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar
                    showFallback={true}
                    size="lg"
                    src={item?.logoImage ? `data:image/jpeg;base64,${item.logoImage}` : undefined}
                    name={item?.name}
                    alt={`${item?.name} logo`}
                  />
                  <div className="flex flex-col">
                    <span className="font-[600] text-[14px]">{item?.name}</span>
                    {(item?.city || item?.state) && (
                      <span className="text-[12px] font-[400] text-gray-600">
                        {item?.city}
                        {item?.city && item?.state && ", "}
                        {item?.state}
                      </span>
                    )}
                  </div>
                </div>
                {isThisCardLoading && (
                  <div aria-label="Loading">
                    <SmallLoader />
                  </div>
                )}
              </div>
            </article>
          </ScrollShadow>
        );
      })}
    </div>
  );
};

export default SelectBusinessForm;
