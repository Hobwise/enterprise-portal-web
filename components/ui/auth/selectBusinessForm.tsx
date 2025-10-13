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
} from "@/lib/utils";
import { Avatar, ScrollShadow } from "@nextui-org/react";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";

const SelectBusinessForm = () => {
  const router = useRouter();
  const { loginDetails, setLoginDetails } = useGlobalContext();
  const [business, setBusiness] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { data, isLoading: loading } = useGetBusinessByCooperate();
  const lastClickTime = useRef<number>(0);
  const [currentLoginDetails, setCurrentLoginDetails] = useState(loginDetails);
  const retryCountRef = useRef<number>(0);

  // Prefetch dashboard route on component mount for faster navigation
  useEffect(() => {
    router.prefetch('/dashboard');
  }, [router]);

  // Restore loginDetails from localStorage if React state is null (page refresh/navigation)
  // Check localStorage FIRST before checking React state
  useEffect(() => {
    const storedLoginDetails = getJsonItemFromLocalStorage("loginDetails");

    console.log('[SelectBusiness] Page Load Check:', {
      hasStoredDetails: !!storedLoginDetails,
      hasLoginDetails: !!loginDetails,
      hasCurrentDetails: !!currentLoginDetails,
      timestamp: new Date().toISOString()
    });

    if (storedLoginDetails) {
      // Restore from localStorage immediately
      if (!currentLoginDetails) {
        console.log('[SelectBusiness] Restoring loginDetails from localStorage');
        setLoginDetails(storedLoginDetails);
        setCurrentLoginDetails(storedLoginDetails);
      }
    } else if (!loginDetails && !currentLoginDetails) {
      // Show error instead of redirecting
      console.error('[ERROR] Missing loginDetails', {
        reason: 'No credentials found in localStorage or React state',
        location: 'useEffect - line 55',
        timestamp: new Date().toISOString()
      });

      setError("No login credentials found. Please go back and login again.");
      notify({
        title: "Missing Credentials",
        text: "No login credentials found. Please go back and login again.",
        type: "error"
      });
    } else if (loginDetails && !currentLoginDetails) {
      // Use the existing React state
      console.log('[SelectBusiness] Using React state loginDetails');
      setCurrentLoginDetails(loginDetails);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAuthenticationError = async (error: any) => {
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

      notify({
        title: "Authentication Error",
        text: errorMessage || "Authentication failed. Please try selecting your business again or logout and login.",
        type: "error",
      });

      // Set error state instead of auto-redirecting
      setError(errorMessage || "Authentication failed");

      return true; // Indicates auth error was handled
    }

    return false; // Not an auth error
  };

  const callLogin = async (businessId: string) => {
    // Use currentLoginDetails which is restored from localStorage if needed
    const loginCreds = currentLoginDetails || getJsonItemFromLocalStorage("loginDetails");

    console.log('[callLogin] Starting business login', {
      hasCurrentDetails: !!currentLoginDetails,
      hasStoredDetails: !!getJsonItemFromLocalStorage("loginDetails"),
      businessId,
      timestamp: new Date().toISOString()
    });

    if (!loginCreds) {
      console.error('[ERROR] No login credentials available', {
        reason: 'loginCreds is null/undefined',
        location: 'callLogin',
        businessId,
        timestamp: new Date().toISOString()
      });

      const errorMsg = "Login credentials lost. Please go back and login again.";
      setError(errorMsg);
      notify({
        title: "Missing Credentials",
        text: errorMsg,
        type: "error"
      });
      throw new Error(errorMsg); // Throw so caller can handle
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
        setError(errorMsg);
        notify({
          title: "Re-authentication Required",
          text: errorMsg,
          type: "error"
        });
        throw new Error(errorMsg); // Throw so caller can handle
      }

      if (data && 'data' in data && data.data?.response) {
        const decryptedData = decryptPayload(data.data.response);

        console.log('[callLogin] Decrypted data received', {
          hasData: !!decryptedData?.data,
          hasToken: !!decryptedData?.data?.token,
          token: decryptedData?.data?.token,
          tokenType: typeof decryptedData?.data?.token,
          isSuccessful: decryptedData?.isSuccessful,
          timestamp: new Date().toISOString()
        });

        if (decryptedData?.data) {
          // Validate token before proceeding
          const receivedToken = decryptedData?.data.token;

          if (!receivedToken || receivedToken === 'null' || receivedToken.trim() === '') {
            // Backend returned null/invalid token - check if we can retry
            console.error('[ERROR] Backend returned NULL token', {
              reason: 'Token is null, "null", or empty string',
              location: 'callLogin - token validation',
              retryCount: retryCountRef.current,
              userId: decryptedData?.data.id,
              email: decryptedData?.data.email,
              businessId: businessId,
              isSuccessful: decryptedData?.isSuccessful,
              receivedToken: receivedToken,
              timestamp: new Date().toISOString(),
              fullResponse: decryptedData
            });

            // Retry once if this is the first failure
            if (retryCountRef.current === 0 && loginCreds) {
              retryCountRef.current = 1;
              console.log('[RETRY] Attempting to retry business selection once...');

              notify({
                title: "Retrying...",
                text: "Token was invalid, retrying authentication...",
                type: "warning",
              });

              // Wait 1 second and retry
              await new Promise(resolve => setTimeout(resolve, 1000));
              return await callLogin(businessId);
            }

            // Max retries reached - show error instead of redirecting
            retryCountRef.current = 0; // Reset for next attempt
            const errorMsg = "Server returned invalid token after retry. Please try selecting your business again or go back and login.";
            setError(errorMsg);
            notify({
              title: "Authentication Failed",
              text: errorMsg,
              type: "error",
            });

            throw new Error(errorMsg); // Throw so caller can handle
          }

          // Reset retry count on success
          retryCountRef.current = 0;

          console.log('[callLogin] Token is valid, setting cookie', {
            tokenLength: receivedToken.length,
            timestamp: new Date().toISOString()
          });

          // Token is valid - proceed with setting cookie
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
          router.refresh(); // Force immediate update
        } else if (decryptedData?.error) {
          const wasAuthError = await handleAuthenticationError(decryptedData.error);
          if (!wasAuthError) {
            throw new Error(decryptedData.error?.message || "Failed to process business selection");
          }
        }
      } else if (data && 'response' in data && (data as any).response?.data?.response) {
        // Handle error response format
        const decryptedData = decryptPayload((data as any).response.data.response);
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
        
        if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
          notify({
            title: "Connection Timeout",
            text: "The request took too long. Please try again.",
            type: "error",
          });
        } else if (error.message?.includes('Network')) {
          notify({
            title: "Network Error",
            text: "Unable to connect to the server. Please check your internet connection.",
            type: "error",
          });
        } else {
          notify({
            title: "Selection Failed",
            text: error.message || "Failed to select business. Please try again.",
            type: "error",
          });
        }
      }
      throw error; // Re-throw for caller to handle
    }
  };

  const handleSelectedBusiness = async (item: any) => {
    // Prevent multiple clicks with debounce (500ms minimum between clicks)
    const now = Date.now();
    if (isLoading || (now - lastClickTime.current < 500)) {
      return;
    }
    lastClickTime.current = now;

    setIsLoading(true);
    setError(null);
    setBusiness(item);

    // Remove loading notification for faster perceived performance

    try {
      const data = await getBusinessDetails(item);

      if (data?.data?.isSuccessful) {
        saveJsonItemToLocalStorage("business", [data?.data?.data]);
        await callLogin(data?.data?.data.businessId);
      } else if (data?.data?.error) {
        const wasAuthError = await handleAuthenticationError(data?.data);
        if (!wasAuthError) {
          const errorMessage = data?.data?.error || "Failed to get business details";
          setError(errorMessage);
          notify({
            title: "Business Selection Failed",
            text: errorMessage,
            type: "error",
          });
        }
      } else {
        throw new Error("Invalid response from business details API");
      }
    } catch (error: any) {
      console.error("Business selection error:", error);
      
      const wasAuthError = await handleAuthenticationError(error);
      if (!wasAuthError) {
        const errorMessage = error.message || "An unexpected error occurred";
        setError(errorMessage);
        
        if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
          notify({
            title: "Connection Timeout",
            text: "The request took too long. Please try again.",
            type: "error",
          });
        } else if (error.message?.includes('Network')) {
          notify({
            title: "Network Error",
            text: "Unable to connect to the server. Please check your internet connection.",
            type: "error",
          });
        } else {
          notify({
            title: "Selection Error",
            text: errorMessage,
            type: "error",
          });
        }
      }
    } finally {
      setIsLoading(false);
    }
  };
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

  if (error && !data?.length) {
    return (
      <div className="grid place-content-center py-8">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="text-red-500 text-lg">⚠️</div>
          <p className="text-sm text-gray-600">Failed to load businesses</p>
          <button 
            onClick={() => window.location.reload()} 
            className="text-sm text-blue-600 hover:underline"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col gap-3 w-full`}>
      {data?.map((item: any) => {
        return (
          <ScrollShadow
            key={item.id}
            size={10}
            className="w-full max-h-[350px]"
          >
            <article
              className={`bg-[#F1F2F480] rounded-xl p-3 transition-all ${
                isLoading
                  ? item.name === business?.name
                    ? "border-grey500 border opacity-70"
                    : "opacity-50 cursor-not-allowed"
                  : "cursor-pointer hover:bg-[#F1F2F4] active:scale-[0.98]"
              } ${isLoading ? "pointer-events-none" : ""}`}
              onClick={() => !isLoading && handleSelectedBusiness(item)}
              key={item.name}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar
                    showFallback={true}
                    size="lg"
                    src={`data:image/jpeg;base64,${item?.logoImage}`}
                    name={item?.name}
                  />
                  <div className="flex flex-col">
                    <span className="font-[600] text-[14px]">{item?.name}</span>

                    <span className="text-[12px] font-[400]">
                      {item?.city}
                      {item?.city && ","} {item?.state}
                    </span>
                  </div>
                </div>
                {isLoading && item.name === business?.name && <SmallLoader />}
              </div>
            </article>
          </ScrollShadow>
        );
      })}
    </div>
  );
};

export default SelectBusinessForm;
