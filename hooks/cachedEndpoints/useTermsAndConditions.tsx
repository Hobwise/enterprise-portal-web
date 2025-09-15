'use client';
import { getTermsAndCondition } from '@/app/api/controllers/dashboard/settings';
import { getJsonItemFromLocalStorage } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';

const useTermsAndCondition = (
  isAdmin: boolean,
  cooperateId?: any,
  businessId?: any
) => {
  const business = getJsonItemFromLocalStorage('business');

  const businessIdOutsideApp = business ? business[0]?.businessId : businessId;
  const fetchTermsAndCondition = async () => {
    const responseData = await getTermsAndCondition(
      businessIdOutsideApp,
      isAdmin,
      cooperateId
    );
    return responseData?.data?.data as any;
  };

  const { data, isLoading, isError, refetch } = useQuery<any>({
    queryKey: ['termsAndCondition'],
    queryFn: fetchTermsAndCondition,
    refetchOnWindowFocus: false,
  );

  return { data, isLoading, isError, refetch };
};

export default useTermsAndCondition;
