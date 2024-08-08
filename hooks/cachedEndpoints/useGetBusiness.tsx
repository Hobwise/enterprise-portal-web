'use client';
import { getBusinessByBusinessId } from '@/app/api/controllers/dashboard/settings';
import { getJsonItemFromLocalStorage } from '@/lib/utils';
import { useQuery } from 'react-query';

const useGetBusiness = () => {
  const business = getJsonItemFromLocalStorage('business');

  const getBusiness = async () => {
    const responseData = await getBusinessByBusinessId(business[0].businessId);
    return responseData?.data?.data as any;
  };

  const { data, refetch, isLoading, isError } = useQuery<any>(
    'getBusiness',
    getBusiness,
    {
      refetchOnWindowFocus: false,
      refetchInterval: false,
      refetchIntervalInBackground: false,
    }
  );

  return { data, isLoading, isError, refetch };
};

export default useGetBusiness;
