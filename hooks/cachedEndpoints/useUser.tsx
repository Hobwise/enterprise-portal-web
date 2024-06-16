'use client';
import { getUser } from '@/app/api/controllers/auth';
import { getJsonItemFromLocalStorage } from '@/lib/utils';
import { useQuery } from 'react-query';

const useUser = () => {
  const userInformation = getJsonItemFromLocalStorage('userInformation');

  const fetchUser = async () => {
    const responseData = await getUser(userInformation?.id);
    return responseData?.data?.data as any;
  };

  const { data, isLoading, isError, refetch } = useQuery<any>(
    'user',
    fetchUser,
    { staleTime: 3600000 }
  );

  return { data, isLoading, isError, refetch };
};

export default useUser;
