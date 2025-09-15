"use client";
import { getUserSubscription } from "@/app/api/controllers/dashboard/settings";
import { setJsonCookie } from "@/lib/cookies";
import { getJsonItemFromLocalStorage } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";

const useSubscription = () => {
  const business = getJsonItemFromLocalStorage("business");

  const getUserSubscriptionInfo = async () => {
    const responseData = await getUserSubscription(business[0].businessId);

    setJsonCookie(
      "planCapabilities",
      responseData?.data?.data?.planCapabilities
    );
    return responseData?.data?.data as any;
  };

  const { data, refetch, isLoading, isError } = useQuery<any>({
    queryKey: ["userSubscription"],
    queryFn: getUserSubscriptionInfo,
    refetchOnWindowFocus: false,
  });

  return { data, isLoading, isError, refetch };
};

export default useSubscription;
