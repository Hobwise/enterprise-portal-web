import { useQuery } from "@tanstack/react-query";
import { getBusinessOrderConfiguration } from "@/app/api/controllers/dashboard/orders";
import { getJsonItemFromLocalStorage } from "@/lib/utils";

const useOrderConfiguration = (overrideBusinessId?: string) => {
  const businessInformation = getJsonItemFromLocalStorage("business");
  const businessId = overrideBusinessId || businessInformation?.[0]?.businessId;

  return useQuery({
    queryKey: ["orderConfiguration", businessId],
    queryFn: () => getBusinessOrderConfiguration(businessId),
    enabled: !!businessId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export default useOrderConfiguration;
