'use client';
import { getBusinesByCooperate } from '@/app/api/controllers/dashboard/settings';
import { getJsonItemFromLocalStorage } from '@/lib/utils';
import { useQuery } from 'react-query';

const useGetBusinessByCooperate = () => {
  const businessInformation = getJsonItemFromLocalStorage('business');

  const getAllBusinessByCooperate = async () => {
    const responseData = await getBusinesByCooperate(
      businessInformation[0]?.businessId
    );
    return responseData?.data?.data as any;
  };

  const { data, isLoading, isError, refetch } = useQuery<any>(
    'businessByCooperate',
    getAllBusinessByCooperate
  );

  return {
    data,
    isLoading,
    isError,
    refetch,
  };
};

export default useGetBusinessByCooperate;
