'use client';
import { getBusinesByCooperate } from '@/app/api/controllers/dashboard/settings';
import { getJsonItemFromLocalStorage } from '@/lib/utils';
import { useQuery } from 'react-query';
import { useState, useEffect } from 'react';

const useGetBusinessByCooperate = () => {
  const [isClient, setIsClient] = useState(false);
  const [businessInformation, setBusinessInformation] = useState<any>(null);

  useEffect(() => {
    setIsClient(true);
    const storedBusiness = getJsonItemFromLocalStorage('business');
    setBusinessInformation(storedBusiness);
  }, []);

  const getAllBusinessByCooperate = async () => {
    if (!businessInformation?.[0]?.businessId) return null;
    const responseData = await getBusinesByCooperate(
      businessInformation[0].businessId
    );
    return responseData?.data?.data as any;
  };

  const { data, isLoading, isError, refetch } = useQuery<any>(
    ['businessByCooperate', businessInformation?.[0]?.businessId],
    getAllBusinessByCooperate,
    {
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // Data considered fresh for 5 minutes
      cacheTime: 30 * 60 * 1000, // Cache kept for 30 minutes
      retry: 1, // Only retry once on failure
      enabled: isClient && !!businessInformation?.[0]?.businessId, // Only run query if we have a business ID and are on client
    }
  );

  return {
    data,
    isLoading: isLoading || !isClient,
    isError,
    refetch,
  };
};

export default useGetBusinessByCooperate;
