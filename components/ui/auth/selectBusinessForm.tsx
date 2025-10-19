"use client";
import {
  getBusinessDetails,
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
  const [business, setBusiness] = useState<Business | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { data, isLoading: loading, isError } = useGetBusinessByCooperate();
  const lastClickTime = useRef<number>(0);
  const [currentLoginDetails, setCurrentLoginDetails] = useState<LoginDetails | null>(null);
  const retryCountRef = useRef<number>(0);
  const navigationTimeoutRef = useRef<NodeJS.Timeout>();
  const isMountedRef = useRef(true);

  // Prefetch dashboard route on component mount for faster navigation
  useEffect(() => {
    router.prefetch('/dashboard');
  }, [router]);

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

  // Centralized error handler for consistency
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

  // FIXED: Restore loginDetails from localStorage with proper validation
  useEffect(() => {
    const storedLoginDetails = getJsonItemFromLocalStorage("loginDetails");

    console.log('[SelectBusiness] Page Load Check:', {
      hasStoredDetails: !!storedLoginDetails,
      hasLoginDetails: !!loginDetails,
      timestamp: new Date().toISOString()
    });

    // Prioritize localStorage over context state
    if (storedLoginDetails) {
      // Validate structure before using
      if (validateLoginDetails(storedLoginDetails)) {
        setCurrentLoginDetails(storedLoginDetails);
        // Sync to context if needed
        if (!loginDetails) {
          setLoginDetails(storedLoginDetails);
        }
      } else {
        // Invalid data - clear it
        console.error('[ERROR] Invalid loginDetails structure in localStorage');
        clearItemLocalStorage("loginDetails");
        handleErrorDisplay("Invalid session data. Please go back and login again.");
      }
    } else if (loginDetails) {
      // Use context as fallback
      if (validateLoginDetails(loginDetails)) {
        setCurrentLoginDetails(loginDetails);
      } else {
        handleErrorDisplay("Invalid login credentials. Please login again.");
      }
    } else {
      // Only show error if both sources are empty
      handleErrorDisplay("No login credentials found. Please go back and login again.");
    }
  }, []); // Intentionally empty - only run once on mount

  // FIXED: Sync loginDetails changes from context (if user navigates back)
  useEffect(() => {
    if (loginDetails && !currentLoginDetails && validateLoginDetails(loginDetails)) {
      setCurrentLoginDetails(loginDetails);
    }
  }, [loginDetails, currentLoginDetails, validateLoginDetails]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;
      if (navigationTimeoutRef.current) {
        clearTimeout(navigationTimeoutRef.current);
      }
    };
  }, []);

  const handleAuthenticationError = useCallback(async (error: any): Promise<boolean> => {
    // Check for authentication-related errors
    const authErrorCodes = ['AUTH001', 'AUTH002', 'TOKEN_EXPIRED', 'UNAUTHORIZED'];
    const errorCode = error?.code || error?.responseCode;
    const errorMessage = error?.message || error?.responseDescription || "";

    if (authErrorCodes.includes(errorCode) ||
        errorMessage.toLowerCase().includes('token') ||
        errorMessage.toLowerCase().includes('unauthorized') ||
        errorMessage.toLowerCase().includes('authentication')) {

      console.error('[AUTH ERROR] Authentication Error Detected', {
        errorCode,
        errorMessage,
        location: 'handleAuthenticationError',
        timestamp: new Date().toISOString(),
        fullError: error
      });

      if (!isMountedRef.current) return true;

      handleErrorDisplay(
        errorMessage || "Authentication failed. Please try selecting your business again or logout and login."
      );

      return true; // Indicates auth error was handled
    }

    return false; // Not an auth error
  }, [handleErrorDisplay]);

  const callLogin = useCallback(async (businessId: string): Promise<void> => {
    // FIXED: Re-fetch credentials to avoid stale closure
    const loginCreds = currentLoginDetails || getJsonItemFromLocalStorage("loginDetails");

    console.log('[callLogin] Starting business login', {
      hasCurrentDetails: !!currentLoginDetails,
      hasStoredDetails: !!getJsonItemFromLocalStorage("loginDetails"),
      businessId,
      timestamp: new Date().toISOString()
    });

    // Validate credentials
    if (!loginCreds || !validateLoginDetails(loginCreds)) {
      console.error('[ERROR] No valid login credentials available', {
        reason: 'loginCreds is null/undefined or invalid',
        location: 'callLogin',
        businessId,
        timestamp: new Date().toISOString()
      });

      handleErrorDisplay("Login credentials lost or invalid. Please go back and login again.", true);
      return;
    }

    try {
      const data = await loginUserSelectedBusiness(loginCreds, businessId);

      console.log('[callLogin] API Response received', {
        hasData: !!data,
        hasDataProperty: !!(data && 'data' in data),
        requiresLogin: data && 'requiresLogin' in data ? (data as any).requiresLogin : undefined,
        timestamp: new Date().toISOString()
      });

      // Check if login requires redirect
      if (data && 'requiresLogin' in data && data.requiresLogin) {
        console.error('[ERROR] Backend requires re-login', {
          reason: 'API returned requiresLogin: true',
          location: 'callLogin',
          errors: (data as any)?.errors,
          timestamp: new Date().toISOString()
        });

        const errorMsg = (data as any)?.errors?.general?.[0] || "Server requires re-authentication. Please go back and login again.";
        handleErrorDisplay(errorMsg, true);
        return;
      }

      if (data && 'data' in data && data.data?.response) {
        const decryptedData: DecryptedData = decryptPayload(data.data.response);

        console.log('[callLogin] Decrypted data received', {
          hasData: !!decryptedData?.data,
          hasToken: !!decryptedData?.data?.token,
          tokenType: typeof decryptedData?.data?.token,
          isSuccessful: decryptedData?.isSuccessful,
          timestamp: new Date().toISOString()
        });

        if (decryptedData?.data) {
          const receivedToken = decryptedData?.data.token;

          // FIXED: Validate token FIRST before any operations
          if (!receivedToken ||
              receivedToken === 'null' ||
              receivedToken === 'undefined' ||
              receivedToken.trim() === '') {

            console.error('[ERROR] Backend returned NULL/invalid token', {
              reason: 'Token is null, "null", "undefined", or empty string',
              location: 'callLogin - token validation',
              retryCount: retryCountRef.current,
              userId: decryptedData?.data.id,
              email: decryptedData?.data.email,
              businessId: businessId,
              isSuccessful: decryptedData?.isSuccessful,
              receivedToken: receivedToken,
              timestamp: new Date().toISOString()
            });

            // FIXED: Retry once with fresh credentials
            if (retryCountRef.current === 0) {
              retryCountRef.current = 1;
              console.log('[RETRY] Attempting to retry business selection once...');

              if (isMountedRef.current) {
                notify({
                  title: "Retrying...",
                  text: "Token was invalid, retrying authentication...",
                  type: "warning",
                });
              }

              // Wait 1 second and retry
              await new Promise(resolve => setTimeout(resolve, 1000));

              // Re-fetch fresh credentials to avoid stale closure
              const freshCreds = getJsonItemFromLocalStorage("loginDetails");
              if (!freshCreds || !validateLoginDetails(freshCreds)) {
                handleErrorDisplay("Credentials lost during retry. Please login again.", true);
                return;
              }

              return await callLogin(businessId);
            }

            // Max retries reached
            retryCountRef.current = 0;
            handleErrorDisplay(
              "Server returned invalid token after retry. Please try selecting your business again or go back and login.",
              true
            );
            return;
          }

          // Token is valid - proceed
          retryCountRef.current = 0;

          console.log('[callLogin] Token is valid, setting cookie', {
            tokenLength: receivedToken.length,
            timestamp: new Date().toISOString()
          });

          // FIXED: Only set cookie after validation passes
          setTokenCookie("token", receivedToken, {
            expires: 7, // 7 days
            path: '/',
            sameSite: 'strict',
            secure: process.env.NODE_ENV === 'production',
          });
          saveJsonItemToLocalStorage("userInformation", decryptedData?.data);

          console.log('[callLogin] SUCCESS! Redirecting to dashboard', {
            userId: decryptedData?.data.id,
            email: decryptedData?.data.email,
            timestamp: new Date().toISOString()
          });

          // Navigate immediately with replace to prevent back navigation issues
          router.replace("/dashboard");

          // FIXED: Cleanup timeout properly
          if (navigationTimeoutRef.current) {
            clearTimeout(navigationTimeoutRef.current);
          }

          navigationTimeoutRef.current = setTimeout(() => {
            if (window.location.pathname === "/auth/select-business") {
              window.location.href = "/dashboard";
            }
          }, 200);
        } else if (decryptedData?.error) {
          const wasAuthError = await handleAuthenticationError(decryptedData.error);
          if (!wasAuthError) {
            throw new Error(decryptedData.error?.message || "Failed to process business selection");
          }
        }
      } else if (data && 'response' in data && (data as any).response?.data?.response) {
        // Handle error response format
        const decryptedData: DecryptedData = decryptPayload((data as any).response.data.response);
        if (decryptedData?.error) {
          const wasAuthError = await handleAuthenticationError(decryptedData.error);
          if (!wasAuthError) {
            throw new Error(decryptedData.error?.message || "Failed to select business");
          }
        }
      } else {
        throw new Error("Invalid response format from server");
      }
    } catch (error: any) {
      const wasAuthError = await handleAuthenticationError(error);
      if (!wasAuthError) {
        console.error("Business login error:", error);

        if (!isMountedRef.current) return;

        if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
          handleErrorDisplay("The request took too long. Please try again.");
        } else if (error.message?.includes('Network')) {
          handleErrorDisplay("Unable to connect to the server. Please check your internet connection.");
        } else {
          handleErrorDisplay(error.message || "Failed to select business. Please try again.");
        }
      }
      throw error; // Re-throw for caller to handle
    }
  }, [currentLoginDetails, router, validateLoginDetails, handleErrorDisplay, handleAuthenticationError]);

  const handleSelectedBusiness = async (item: Business) => {
    // Prevent multiple clicks with debounce (500ms minimum between clicks)
    const now = Date.now();
    if (isLoading || (now - lastClickTime.current < 500)) {
      return;
    }
    lastClickTime.current = now;

    setIsLoading(true);
    setError(null);
    setBusiness(item);

    try {
      const data = await getBusinessDetails(item);

      if (data?.data?.isSuccessful) {
        saveJsonItemToLocalStorage("business", [data?.data?.data]);
        await callLogin(data?.data?.data.businessId);
      } else if (data?.data?.error) {
        const wasAuthError = await handleAuthenticationError(data?.data);
        if (!wasAuthError) {
          const errorMessage = data?.data?.error || "Failed to get business details";
          handleErrorDisplay(errorMessage);
        }
      } else {
        throw new Error("Invalid response from business details API");
      }
    } catch (error: any) {
      console.error("Business selection error:", error);

      const wasAuthError = await handleAuthenticationError(error);
      if (!wasAuthError && isMountedRef.current) {
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
        setIsLoading(false);
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

  // Error state without data
  if (error && !data?.length) {
    return (
      <div className="grid place-content-center py-8">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="text-red-500 text-lg">⚠️</div>
          <p className="text-sm text-gray-600">{error}</p>
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
        const isCurrentlyLoading = isLoading && item.name === business?.name;

        return (
          <ScrollShadow
            key={item.id}
            size={10}
            className="w-full max-h-[350px]"
          >
            <article
              role="button"
              tabIndex={isLoading ? -1 : 0}
              aria-label={`Select ${item.name} business in ${item.city || ''} ${item.state || ''}`}
              aria-disabled={isLoading}
              aria-busy={isCurrentlyLoading}
              className={`bg-[#F1F2F480] rounded-xl p-3 transition-all ${
                isLoading
                  ? isCurrentlyLoading
                    ? "border-grey500 border opacity-70"
                    : "opacity-50 cursor-not-allowed"
                  : "cursor-pointer hover:bg-[#F1F2F4] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              } ${isLoading ? "pointer-events-none" : ""}`}
              onClick={() => !isLoading && handleSelectedBusiness(item)}
              onKeyDown={(e) => {
                if ((e.key === 'Enter' || e.key === ' ') && !isLoading) {
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
                {isCurrentlyLoading && (
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
