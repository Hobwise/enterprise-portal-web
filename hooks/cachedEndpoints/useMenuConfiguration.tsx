"use client";
import { getMenuConfiguration } from "@/app/api/controllers/dashboard/menu";
import { getJsonItemFromLocalStorage } from "@/lib/utils";
import { useQuery } from '@tanstack/react-query';

interface DesignOptions {
  layout: number;
  backgroudStyle: number;
  useBackground: boolean;
  backgroundColour: string;
  imageRef: string;
  image: string;
  textColour: string;
  chipPosition: string;
}
const useMenuConfig = (businessIdOutsideApp?: any, cooperateID?: any) => {
  const businessInformation = getJsonItemFromLocalStorage("business");
  const businessId = businessInformation
    ? businessInformation[0]?.businessId
    : businessIdOutsideApp;
  const getMenuConfig = async () => {
    const responseData = await getMenuConfiguration(
      businessId,

      cooperateID
    );

    return responseData?.data?.data as DesignOptions;
  };

  const { data, isLoading, isError, refetch } = useQuery<DesignOptions>({
    queryKey: ["menuConfig"],
    queryFn: getMenuConfig,
    
      refetchOnWindowFocus: false,
    
  });

  return {
    data,
    isLoading,
    isError,
    refetch,
  };
};

export default useMenuConfig;
