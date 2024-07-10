'use client';

import {
  getCampaigns,
  payloadCampaignItem,
} from '@/app/api/controllers/dashboard/campaigns';
import { getJsonItemFromLocalStorage } from '@/lib/utils';
import { useQuery } from 'react-query';
import { useGlobalContext } from '../globalProvider';

const useCampaign = () => {
  const { page, rowsPerPage, tableStatus } = useGlobalContext();
  const businessInformation = getJsonItemFromLocalStorage('business');

  const getAllCampaign = async ({ queryKey }) => {
    const [_key, { page, rowsPerPage, tableStatus }] = queryKey;
    const responseData = await getCampaigns(
      businessInformation[0]?.businessId,
      page,
      rowsPerPage,
      tableStatus
    );

    return responseData?.data?.data as payloadCampaignItem[];
  };

  const { data, isLoading, isError, refetch } = useQuery<payloadCampaignItem[]>(
    ['campaign', { page, rowsPerPage, tableStatus }],

    getAllCampaign,
    {
      keepPreviousData: true,
    }
  );

  return {
    data,
    isLoading,
    isError,
    refetch,
  };
};

export default useCampaign;
