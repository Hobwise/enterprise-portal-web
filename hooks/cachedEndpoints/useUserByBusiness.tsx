'use client';
import { getUserByBusiness } from '@/app/api/controllers/auth';
import { getJsonItemFromLocalStorage } from '@/lib/utils';
import { useQuery } from 'react-query';
import { useGlobalContext } from '../globalProvider';

interface UserBusiness {
  firstName: string;
  lastName: string;
  cooperateID: string;
  email: string;
  passwordLastChanged: string;
  lastLogin: string;
  role: number;
  isActive: boolean;
  image: string;
  imageReference: string;
  id: string;
  dateCreated: string;
  dateUpdated: string;
  businesses: any | null;
}

const useUserByBusiness = () => {
  const { page, rowsPerPage } = useGlobalContext();
  const userInformation = getJsonItemFromLocalStorage('userInformation');
  const businessInformation = getJsonItemFromLocalStorage('business');

  const UserByBusiness = async ({ queryKey }) => {
    const responseData = await getUserByBusiness(
      businessInformation[0]?.businessId,
      page,
      rowsPerPage,
      userInformation?.cooperateID
    );
    return responseData?.data?.data as UserBusiness[];
  };

  const { data, isLoading, isError, refetch } = useQuery<UserBusiness[]>(
    ['userByBusiness', { page, rowsPerPage }],
    UserByBusiness,
    {
      keepPreviousData: true,
      refetchOnWindowFocus: false,
    }
  );

  return {
    data,
    isLoading,
    isError,
    refetch,
  };
};

export default useUserByBusiness;
