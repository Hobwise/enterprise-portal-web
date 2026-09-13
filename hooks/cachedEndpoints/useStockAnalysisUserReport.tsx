'use client';
import { getReportAuditLog } from '@/app/api/controllers/dashboard/report';
import { getJsonItemFromLocalStorage } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import {
  UserReportPayload,
  UserReportResponse,
} from '@/components/ui/dashboard/report/types';

interface UseUserReportArgs {
  filterType: number;
  startDate?: string;
  endDate?: string;
  reportType?: number;
  emailAddress?: string;
}

const useStockAnalysisUserReport = (
  args: UseUserReportArgs,
  options?: { enabled?: boolean }
) => {
  const business = getJsonItemFromLocalStorage('business');

  const fetchUserReport = async ({ queryKey }: any) => {
    const [, payload] = queryKey as [string, UserReportPayload];
    const responseData = await getReportAuditLog(
      business?.[0]?.businessId,
      payload.filterType,
      payload.startDate,
      payload.endDate,
      payload.reportType,
      payload.emailAddress
    );
    return (responseData?.data?.data ?? null) as UserReportResponse | null;
  };

  const { data, isLoading, isError, refetch } = useQuery<
    UserReportResponse | null
  >({
    queryKey: ['stockAnalysisUserReport', args],
    queryFn: fetchUserReport,
    refetchOnWindowFocus: false,
    ...options,
  });

  return { data, isLoading, isError, refetch };
};

export default useStockAnalysisUserReport;
