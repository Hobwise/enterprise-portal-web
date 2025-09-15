'use client';
import {
  getCampaign,
  payloadCampaignItem,
} from '@/app/api/controllers/dashboard/campaigns';
import { getJsonItemFromLocalStorage } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
const useSingleCampaign = (campaignId: any) => {
  const businessInformation = getJsonItemFromLocalStorage('business');

  const getSingleReservation = async () => {
    const responseData = await getCampaign(
      campaignId,
      businessInformation[0]?.businessId
    );
    return responseData?.data?.data as payloadCampaignItem[];
  };

  const { data, isLoading, isError, refetch } = useQuery<payloadCampaignItem[]>({
    queryKey: ['useSingleCampaign'],
    queryFn: getSingleReservation,
    refetchOnWindowFocus: false,
  });

  return {
    data,
    isLoading,
    isError,
    refetch,
  };
};

export default useSingleCampaign;
