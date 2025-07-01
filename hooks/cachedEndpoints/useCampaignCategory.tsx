'use client';

import {
  getCampaignsByCategory,
} from '@/app/api/controllers/dashboard/campaigns';
import { getJsonItemFromLocalStorage } from '@/lib/utils';
import { useQuery } from 'react-query';
import { useState } from 'react';

interface UseCampaignCategoryOptions {
  category: string;
  page: number;
  pageSize: number;
}

const useCampaignCategory = ({ category, page, pageSize }: UseCampaignCategoryOptions) => {
  const businessInformation = getJsonItemFromLocalStorage("business");
  const businessId = businessInformation?.[0]?.businessId;

  const fetchCampaignsByCategory = async () => {
    if (!businessId || !category) return [];
    try {
      const payload = {
        category,
        businessId,
        page,
        pageSize,
      };
      const responseData = await getCampaignsByCategory(payload);
      return responseData?.data?.data || [];
    } catch (error) {
      return [];
    }
  };

  const { data, isLoading, isError, refetch } = useQuery(
    ['campaignsByCategory', businessId, category, page, pageSize],
    fetchCampaignsByCategory,
    {
      enabled: !!businessId && !!category,
    }
  );

  return {
    data,
    isLoading,
    isError,
    refetch,
  };
};

export default useCampaignCategory;
