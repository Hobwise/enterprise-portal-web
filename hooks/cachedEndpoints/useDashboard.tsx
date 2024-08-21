'use client';
import { getDashboardReport } from '@/app/api/controllers/dashboard/dashboard';
import { getJsonItemFromLocalStorage } from '@/lib/utils';
import { useQuery } from 'react-query';

const useDashboardReport = (
  filterType: number,
  startDate?: string,
  endDate?: string,
  options?: { enabled: boolean }
) => {
  const business = getJsonItemFromLocalStorage('business');
  const fetchDashboardReport = async ({ queryKey }) => {
    const [_key, { filterType, startDate, endDate }] = queryKey;
    const responseData = await getDashboardReport(
      business[0].businessId,
      filterType,
      startDate,
      endDate
    );
    return responseData?.data?.data as any;
  };

  const { data, isLoading, isError, refetch } = useQuery<any>(
    ['dashboardReport', { filterType, startDate, endDate }],
    fetchDashboardReport,
    {
      refetchOnWindowFocus: false,
     
      ...options,
    }
  );

  return { data, isLoading, isError, refetch };
};

export default useDashboardReport;
