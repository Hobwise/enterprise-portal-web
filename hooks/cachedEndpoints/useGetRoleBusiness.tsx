'use client';
import { getRoleByBusiness } from '@/app/api/controllers/dashboard/settings';
import { getJsonItemFromLocalStorage } from '@/lib/utils';
import { useQuery } from 'react-query';

const useGetRoleByBusiness = () => {
  const business = getJsonItemFromLocalStorage('business');

  const fetchRoleByBusiness = async () => {
    const responseData = getRoleByBusiness(business[0]?.businessId);
    return responseData?.data?.data as any;
  };

  const { data, isLoading, isError, refetch } = useQuery<any>(
    'roleByBusiness',
    fetchRoleByBusiness
  );

  return { data, isLoading, isError, refetch };
};

export default useGetRoleByBusiness;
