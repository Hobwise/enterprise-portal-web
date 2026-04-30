'use client';
import { getReport } from '@/app/api/controllers/dashboard/report';
import { getJsonItemFromLocalStorage } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { ReportSummary } from '@/components/ui/dashboard/inventory/stock-analysis/types';

const useStockAnalysisSummary = (
  filterType: number,
  startDate?: string,
  endDate?: string,
  options?: { enabled?: boolean }
) => {
  const business = getJsonItemFromLocalStorage('business');

  const fetchSummary = async ({ queryKey }: any) => {
    const [, { filterType, startDate, endDate }] = queryKey;
    const responseData = await getReport(
      business?.[0]?.businessId,
      filterType,
      startDate,
      endDate
    );
    return responseData?.data?.data as ReportSummary | undefined;
  };

  const { data, isLoading, isError, refetch } = useQuery<ReportSummary | undefined>({
    queryKey: ['stockAnalysisSummary', { filterType, startDate, endDate }],
    queryFn: fetchSummary,
    refetchOnWindowFocus: false,
    ...options,
  });

  return { data, isLoading, isError, refetch };
};

export default useStockAnalysisSummary;
