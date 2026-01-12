'use client';
import { getRoleCount } from '@/app/api/controllers/auth';
import { getJsonItemFromLocalStorage } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';

const useRoleCount = () => {
  const business = getJsonItemFromLocalStorage('business');
  const userInformation = getJsonItemFromLocalStorage('userInformation');

  const fetchRoleCount = async () => {
    const responseData = await getRoleCount(
      business[0].businessId,
      userInformation.cooperateID
    );
    return responseData?.data?.data as any;
  };

  const { data, isLoading, isError, refetch } = useQuery<any>({
    queryKey: ['roleCount'],
    queryFn: fetchRoleCount,
    refetchOnWindowFocus: false,
  });

  return { data, isLoading, isError, refetch };
};

export default useRoleCount;