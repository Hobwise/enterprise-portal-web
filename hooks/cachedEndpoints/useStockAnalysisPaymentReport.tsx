'use client';
import { getReportPayment } from '@/app/api/controllers/dashboard/report';
import { getJsonItemFromLocalStorage } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import {
  PaymentReportPayload,
  PaymentReportResponse,
} from '@/components/ui/dashboard/inventory/stock-analysis/types';

interface UsePaymentReportArgs {
  filterType: number;
  startDate?: string;
  endDate?: string;
  reportType?: number;
  paymentMethod?: number;
  status?: number;
}

const useStockAnalysisPaymentReport = (
  args: UsePaymentReportArgs,
  options?: { enabled?: boolean }
) => {
  const business = getJsonItemFromLocalStorage('business');

  const fetchPaymentReport = async ({ queryKey }: any) => {
    const [, payload] = queryKey as [string, PaymentReportPayload];
    const responseData = await getReportPayment(
      business?.[0]?.businessId,
      payload.filterType,
      payload.startDate,
      payload.endDate,
      payload.reportType,
      undefined,
      payload.paymentMethod,
      payload.status
    );
    return (responseData?.data?.data ?? null) as PaymentReportResponse | null;
  };

  const { data, isLoading, isError, refetch } = useQuery<
    PaymentReportResponse | null
  >({
    queryKey: ['stockAnalysisPaymentReport', args],
    queryFn: fetchPaymentReport,
    refetchOnWindowFocus: false,
    ...options,
  });

  return { data, isLoading, isError, refetch };
};

export default useStockAnalysisPaymentReport;
