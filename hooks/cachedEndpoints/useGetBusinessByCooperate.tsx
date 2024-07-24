'use client';
import { getBusinesByCooperate } from '@/app/api/controllers/dashboard/settings';
import { getJsonItemFromLocalStorage } from '@/lib/utils';
import { useQuery } from 'react-query';
import { useGlobalContext } from '../globalProvider';

const useGetBusinessByCooperate = () => {
  const { page, rowsPerPage } = useGlobalContext();
  const businessInformation = getJsonItemFromLocalStorage('business');

  const getAllBusinessByCooperate = async () => {
    const responseData = await getBusinesByCooperate(
      businessInformation[0]?.businessId,
      page,
      rowsPerPage
    );
    return responseData?.data?.data as any;
  };

  const { data, isLoading, isError, refetch } = useQuery<any>(
    ['businessByCooperate', { page, rowsPerPage }],
    getAllBusinessByCooperate,
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

export default useGetBusinessByCooperate;
