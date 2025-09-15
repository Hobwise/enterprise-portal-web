import { logout } from "@/app/api/controllers/dashboard/settings";
import { notify, removeCookie } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

const useLogout = () => {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const queryClient = useQueryClient();

  const logoutFn = useCallback(async () => {
    setIsLoading(true);
    
    // Always clear storage first for immediate logout effect
    const clearUserData = () => {
      queryClient.clear();
      localStorage.clear();
      sessionStorage.clear(); // Also clear session storage
      removeCookie("token");
      removeCookie("planCapabilities");
      removeCookie("username");
      removeCookie("jwt");
    };

    try {
      // Try to call logout API but don't depend on it for clearing data
      const response = await logout();
      const isSuccessful = response?.data?.isSuccessful;

      // Clear data regardless of API response
      clearUserData();
      router.push("/auth/login");

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
      router.push("/auth/login");
      
      notify({
        title: "Warning!",
        text: "Logged out locally, but server logout failed",
        type: "warning",
      });
      
      return true; // Return true since we cleared locally
    } finally {
      setIsLoading(false);
    }
  }, [router, queryClient]);

  return { isLoading, logoutFn };
};

export default useLogout;
