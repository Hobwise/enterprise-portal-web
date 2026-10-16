import { useQuery } from "@tanstack/react-query";
import { getBusinessOrderConfiguration } from "@/app/api/controllers/dashboard/orders";
import { getJsonItemFromLocalStorage } from "@/lib/utils";

const useOrderConfiguration = (overrideBusinessId?: string) => {
  const businessInformation = getJsonItemFromLocalStorage("business");
  const businessId = overrideBusinessId || businessInformation?.[0]?.businessId;

  return useQuery({
    queryKey: ["orderConfiguration", businessId],
    // getBusinessOrderConfiguration resolves to undefined when the request
    // fails (its catch swallows the error). React Query rejects undefined as
    // query data, so fall back to null and let consumers apply their defaults.
    queryFn: async () => (await getBusinessOrderConfiguration(businessId)) ?? null,
    enabled: !!businessId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export default useOrderConfiguration;
