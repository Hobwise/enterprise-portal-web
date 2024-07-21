'use client';
import { getTermsAndCondition } from '@/app/api/controllers/dashboard/settings';
import { getJsonItemFromLocalStorage } from '@/lib/utils';
import { useQuery } from 'react-query';

const useTermsAndCondition = (isAdmin: boolean) => {
  const business = getJsonItemFromLocalStorage('business');

  const fetchTermsAndCondition = async () => {
    const responseData = await getTermsAndCondition(
      business[0].businessId,
      isAdmin
    );
    return responseData?.data?.data as any;
  };

  const { data, isLoading, isError, refetch } = useQuery<any>(
    'termsAndCondition',
    fetchTermsAndCondition
  );

  return { data, isLoading, isError, refetch };
};

export default useTermsAndCondition;
