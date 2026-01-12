'use client';
import { getDashboardReport } from '@/app/api/controllers/dashboard/dashboard';
import { getJsonItemFromLocalStorage } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';

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
    if (responseData?.data) {
      return responseData?.data?.data as any;
    } else {
      return responseData;
    }
  };

  const { data, isLoading, isError, refetch } = useQuery<any>({
    queryKey: ['dashboardReport', { filterType, startDate, endDate }],
    queryFn: fetchDashboardReport,
    
      refetchOnWindowFocus: false,

      ...options,
    
  });

  return { data, isLoading, isError, refetch };
};

export default useDashboardReport;
