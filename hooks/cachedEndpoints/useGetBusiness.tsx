'use client';
import { getBusinessByBusinessId } from '@/app/api/controllers/dashboard/settings';
import { getJsonItemFromLocalStorage } from '@/lib/utils';
import { useQuery } from 'react-query';
import { useState, useEffect } from 'react';

const useGetBusiness = () => {
  const [isClient, setIsClient] = useState(false);
  const [business, setBusiness] = useState<any>(null);

  useEffect(() => {
    setIsClient(true);
    const storedBusiness = getJsonItemFromLocalStorage('business');
    setBusiness(storedBusiness);
  }, []);

  const getBusiness = async () => {
    if (!business?.[0]?.businessId) return null;
    const responseData = await getBusinessByBusinessId(business[0].businessId);
    return responseData?.data?.data as any;
  };

  const { data, refetch, isLoading, isError } = useQuery<any>(
    ['getBusiness', business?.[0]?.businessId],
    getBusiness,
    {
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // Data considered fresh for 5 minutes
      cacheTime: 30 * 60 * 1000, // Cache kept for 30 minutes
      retry: 1, // Only retry once on failure
      enabled: isClient && !!business?.[0]?.businessId, // Only run query if we have a business ID and are on client
    }
  );

  return { 
    data, 
    isLoading: isLoading || !isClient, 
    isError, 
    refetch 
  };
};

export default useGetBusiness;
