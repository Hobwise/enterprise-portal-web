'use client';
import { getReportOrder } from '@/app/api/controllers/dashboard/report';
import { getJsonItemFromLocalStorage } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import {
  OrderReportPayload,
  OrderReportResponse,
} from '@/components/ui/dashboard/inventory/stock-analysis/types';

interface UseOrderReportArgs {
  filterType: number;
  startDate?: string;
  endDate?: string;
  reportType?: number;
  paymentMethod?: number;
  status?: number;
}

const useStockAnalysisOrderReport = (
  args: UseOrderReportArgs,
  options?: { enabled?: boolean }
) => {
  const business = getJsonItemFromLocalStorage('business');

  const fetchOrderReport = async ({ queryKey }: any) => {
    const [, payload] = queryKey as [string, OrderReportPayload];
    const responseData = await getReportOrder(
      business?.[0]?.businessId,
      payload.filterType,
      payload.startDate,
      payload.endDate,
      payload.reportType,
      undefined,
      payload.paymentMethod,
      payload.status
    );
    return responseData?.data?.data as OrderReportResponse | undefined;
  };

  const { data, isLoading, isError, refetch } = useQuery<
    OrderReportResponse | undefined
  >({
    queryKey: ['stockAnalysisOrderReport', args],
    queryFn: fetchOrderReport,
    refetchOnWindowFocus: false,
    ...options,
  });

  return { data, isLoading, isError, refetch };
};

export default useStockAnalysisOrderReport;
