'use client';
import { getReportBooking } from '@/app/api/controllers/dashboard/report';
import { getJsonItemFromLocalStorage } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import {
  BookingReportPayload,
  BookingReportResponse,
} from '@/components/ui/dashboard/report/types';

interface UseBookingReportArgs {
  filterType: number;
  startDate?: string;
  endDate?: string;
  reportType?: number;
  bookingStatus?: number;
}

const useStockAnalysisBookingReport = (
  args: UseBookingReportArgs,
  options?: { enabled?: boolean }
) => {
  const business = getJsonItemFromLocalStorage('business');

  const fetchBookingReport = async ({ queryKey }: any) => {
    const [, payload] = queryKey as [string, BookingReportPayload];
    const responseData = await getReportBooking(
      business?.[0]?.businessId,
      payload.filterType,
      payload.startDate,
      payload.endDate,
      payload.reportType,
      undefined,
      payload.bookingStatus
    );
    return (responseData?.data?.data ?? null) as BookingReportResponse | null;
  };

  const { data, isLoading, isError, refetch } = useQuery<
    BookingReportResponse | null
  >({
    queryKey: ['stockAnalysisBookingReport', args],
    queryFn: fetchBookingReport,
    refetchOnWindowFocus: false,
    ...options,
  });

  return { data, isLoading, isError, refetch };
};

export default useStockAnalysisBookingReport;
