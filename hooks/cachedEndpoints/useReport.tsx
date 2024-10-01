'use client';
import { getReport } from '@/app/api/controllers/dashboard/report';
import { getJsonItemFromLocalStorage } from '@/lib/utils';
import { useQuery } from 'react-query';

const useReport = (
  filterType: number,
  startDate?: string,
  endDate?: string,
  options?: { enabled: boolean }
) => {
  const business = getJsonItemFromLocalStorage('business');
  const fetchReport = async ({ queryKey }) => {
    const [_key, { filterType, startDate, endDate }] = queryKey;
    const responseData = await getReport(
      business[0].businessId,
      filterType,
      startDate,
      endDate
    );
    return responseData?.data?.data as any;
  };

  const { data, isLoading, isError, refetch } = useQuery<any>(
    ['report', { filterType, startDate, endDate }],
    fetchReport,
    {
      refetchOnWindowFocus: false,

      ...options,
    }
  );

  return { data, isLoading, isError, refetch };
};

export default useReport;
