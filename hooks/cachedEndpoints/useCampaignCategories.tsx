'use client';

import {
  getCampaignCategories,
} from '@/app/api/controllers/dashboard/campaigns';
import { getJsonItemFromLocalStorage } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';

const useCampaignCategories = () => {
  const businessInformation = getJsonItemFromLocalStorage("business");
  const getAllCampaignCategories = async () => {
    try {
      const responseData = await getCampaignCategories(businessInformation?.[0]?.businessId);
      return responseData?.data?.data ;
    } catch (error) {
      return [];
    }
  };

  const businessId = businessInformation?.[0]?.businessId;

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['campaignCategories', businessId],
    queryFn: getAllCampaignCategories,
    
      enabled: !!businessId,
    
  });

   
  return {
    data,
    isLoading,
    isError,
    refetch,
  };
};

export default useCampaignCategories;
