'use client';
import { getReportQr } from '@/app/api/controllers/dashboard/report';
import { getJsonItemFromLocalStorage } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import {
  QrReportPayload,
  QrReportResponse,
} from '@/components/ui/dashboard/inventory/stock-analysis/types';

interface UseQrReportArgs {
  filterType: number;
  startDate?: string;
  endDate?: string;
  reportType?: number;
  quickResponseID?: string;
}

const useStockAnalysisQrReport = (
  args: UseQrReportArgs,
  options?: { enabled?: boolean }
) => {
  const business = getJsonItemFromLocalStorage('business');

  const fetchQrReport = async ({ queryKey }: any) => {
    const [, payload] = queryKey as [string, QrReportPayload];
    const responseData = await getReportQr(
      business?.[0]?.businessId,
      payload.filterType,
      payload.startDate,
      payload.endDate,
      payload.reportType,
      payload.quickResponseID
    );
    return (responseData?.data?.data ?? null) as QrReportResponse | null;
  };

  const { data, isLoading, isError, refetch } = useQuery<
    QrReportResponse | null
  >({
    queryKey: ['stockAnalysisQrReport', args],
    queryFn: fetchQrReport,
    refetchOnWindowFocus: false,
    ...options,
  });

  return { data, isLoading, isError, refetch };
};

export default useStockAnalysisQrReport;
