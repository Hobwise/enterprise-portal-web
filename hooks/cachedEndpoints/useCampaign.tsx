'use client';

import {
  getCampaigns,
  payloadCampaignItem,
} from '@/app/api/controllers/dashboard/campaigns';
import { getJsonItemFromLocalStorage } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { useGlobalContext } from '../globalProvider';
import { fetchQueryConfig } from "@/lib/queryConfig";

const useCampaign = () => {
  const { page, rowsPerPage, tableStatus } = useGlobalContext();
  const businessInformation = getJsonItemFromLocalStorage("business");

  const getAllCampaign = async ({ queryKey }) => {
    const [_key, { page, rowsPerPage, tableStatus }] = queryKey;
    try {
      const responseData = await getCampaigns(
        businessInformation[0]?.businessId,
        page,
        rowsPerPage,
        tableStatus
      );
      return (responseData?.data?.data as payloadCampaignItem[]) ?? [];
    } catch (error) {
      return [];
    }
  };

  const { data, isLoading, isError, refetch } = useQuery<payloadCampaignItem[]>({
    queryKey: ["campaign", { page, rowsPerPage, tableStatus }],
    queryFn: getAllCampaign,
    ...fetchQueryConfig()
  });

  return {
    data,
    isLoading,
    isError,
    refetch,
  };
};

export default useCampaign;
