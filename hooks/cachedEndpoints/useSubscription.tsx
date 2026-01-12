"use client";
import { getUserSubscription } from "@/app/api/controllers/dashboard/settings";
import { setJsonCookie } from "@/lib/cookies";
import { getJsonItemFromLocalStorage } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";

const useSubscription = () => {
  const business = getJsonItemFromLocalStorage("business");

  const getUserSubscriptionInfo = async () => {
    try {
      const responseData = await getUserSubscription(business[0].businessId);

      // Ensure we set the cookie even if planCapabilities is undefined/null
      const planCapabilities = responseData?.data?.data?.planCapabilities;

      if (planCapabilities) {
        setJsonCookie("planCapabilities", planCapabilities);
      } else {
        // If no plan capabilities, set an empty object to prevent middleware redirect loop
        console.warn("No plan capabilities found in subscription response");
        setJsonCookie("planCapabilities", {});
      }

      return responseData?.data?.data as any;
    } catch (error) {
      console.error("Error fetching subscription:", error);
      // Set empty capabilities on error to prevent middleware redirect loop
      setJsonCookie("planCapabilities", {});
      throw error;
    }
  };

  const { data, refetch, isLoading, isError } = useQuery<any>({
    queryKey: ["userSubscription"],
    queryFn: getUserSubscriptionInfo,
    refetchOnWindowFocus: false,
    retry: 3, // Retry 3 times on failure
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000), // Exponential backoff
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return { data, isLoading, isError, refetch };
};

export default useSubscription;
