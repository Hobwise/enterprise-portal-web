import { logout } from "@/app/api/controllers/dashboard/settings";
import { notify, removeCookie } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useGlobalContext } from "@/hooks/globalProvider";
import api from "@/app/api/apiService";

const useLogout = () => {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const queryClient = useQueryClient();
  const { clearAuthData } = useGlobalContext();

  const logoutFn = useCallback(async () => {
    setIsLoading(true);

    // Always clear storage first for immediate logout effect
    const clearUserData = () => {
      // Abort any pending API requests
      if (typeof window !== 'undefined' && (window as any).abortController) {
        (window as any).abortController.abort();
      }

      // Clear React Query cache
      queryClient.clear();

      // Clear all storage
      localStorage.clear();
      sessionStorage.clear();

      // Clear all possible cookies systematically
      removeCookie("token");
      removeCookie("planCapabilities");
      removeCookie("username");
      removeCookie("jwt");
      removeCookie("refreshToken");
      removeCookie("userInformation");
      removeCookie("business");
      removeCookie("loginDetails");

      // Clear auth context state
      if (clearAuthData) {
        clearAuthData();
      }
    };

    try {
      // Try to call logout API but don't depend on it for clearing data
      const response = await logout();
      const isSuccessful = response?.data?.isSuccessful;

      // Clear data regardless of API response
      clearUserData();

      // Use replace to prevent back navigation to protected pages
      router.replace("/auth/login");

      // Fallback to hard navigation if router.replace fails
      setTimeout(() => {
        if (window.location.pathname !== "/auth/login") {
          window.location.href = "/auth/login";
        }
      }, 100);

      if (!isSuccessful) {
        // Still show error but user is logged out locally
        notify({
          title: "Warning!",
          text: "Logged out locally, but server logout may have failed",
          type: "warning",
        });
      }

      return true; // Always return true since we cleared locally
    } catch (error) {
      // Clear data even if API call fails
      clearUserData();

      // Use replace to prevent back navigation
      router.replace("/auth/login");

      // Fallback to hard navigation
      setTimeout(() => {
        if (window.location.pathname !== "/auth/login") {
          window.location.href = "/auth/login";
        }
      }, 100);

      notify({
        title: "Warning!",
        text: "Logged out locally, but server logout failed",
        type: "warning",
      });

      return true; // Return true since we cleared locally
    } finally {
      setIsLoading(false);
    }
  }, [router, queryClient, clearAuthData]);

  return { isLoading, logoutFn };
};

export default useLogout;
