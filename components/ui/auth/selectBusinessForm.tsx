"use client";
import {
  getBusinessDetails,
  loginUserSelectedBusiness,
} from "@/app/api/controllers/auth";
import useGetBusinessByCooperate from "@/hooks/cachedEndpoints/useGetBusinessByCooperate";
import { useGlobalContext } from "@/hooks/globalProvider";
import { setJsonCookie } from "@/lib/cookies";
import { decryptPayload } from "@/lib/encrypt-decrypt";
import {
  SmallLoader,
  notify,
  saveJsonItemToLocalStorage,
  setTokenCookie,
} from "@/lib/utils";
import { Avatar, ScrollShadow } from "@nextui-org/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import useLogout from "@/hooks/cachedEndpoints/useLogout";

const SelectBusinessForm = () => {
  const router = useRouter();
  const { loginDetails } = useGlobalContext();
  const { logoutFn } = useLogout();
  const [business, setBusiness] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { data, isLoading: loading } = useGetBusinessByCooperate();

  const handleAuthenticationError = async (error: any) => {
    // Check for authentication-related errors
    const authErrorCodes = ['AUTH001', 'AUTH002', 'TOKEN_EXPIRED', 'UNAUTHORIZED'];
    const errorCode = error?.code || error?.responseCode;
    const errorMessage = error?.message || error?.responseDescription || "";
    
    if (authErrorCodes.includes(errorCode) || 
        errorMessage.toLowerCase().includes('token') ||
        errorMessage.toLowerCase().includes('unauthorized') ||
        errorMessage.toLowerCase().includes('authentication')) {
      
      notify({
        title: "Session Expired",
        text: "Your session has expired. Please log in again.",
        type: "warning",
      });
      
      // Logout user after a short delay
      setTimeout(async () => {
        await logoutFn();
      }, 2000);
      
      return true; // Indicates auth error was handled
    }
    
    return false; // Not an auth error
  };

  const callLogin = async (businessId: string) => {
    try {
      const data = await loginUserSelectedBusiness(loginDetails, businessId);
      
      if (data?.data?.response) {
        const decryptedData = decryptPayload(data.data.response);
        
        if (decryptedData?.data) {
          // Show success notification
          // notify({
          //   title: "Business Selected",
          //   text: "Redirecting to your dashboard...",
          //   type: "success",
          // });
          
          // Save data and redirect
          saveJsonItemToLocalStorage("userInformation", decryptedData?.data);
          setTokenCookie("token", decryptedData?.data.token);
          
          // Use optimistic navigation
          router.push("/dashboard");
        } else if (decryptedData?.error) {
          const wasAuthError = await handleAuthenticationError(decryptedData.error);
          if (!wasAuthError) {
            throw new Error(decryptedData.error?.message || "Failed to process business selection");
          }
        }
      } else if (data?.response?.data?.response) {
        // Handle error response format
        const decryptedData = decryptPayload(data.response.data.response);
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
    if (isLoading) return; // Prevent multiple concurrent requests
    
    setIsLoading(true);
    setError(null);
    setBusiness(item);

    // Show loading notification
    notify({
      title: "Selecting Business",
      text: `Setting up ${item.name}...`,
      type: "info",
    });

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
              className={`bg-[#F1F2F480] rounded-xl p-3 cursor-pointer ${
                isLoading &&
                item.name === business?.name &&
                "border-grey500 border"
              }`}
              onClick={() => handleSelectedBusiness(item)}
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
