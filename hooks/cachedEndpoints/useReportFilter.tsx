'use client';
import {
  getReportAuditLog,
  getReportBooking,
  getReportOrder,
  getReportPayment,
} from '@/app/api/controllers/dashboard/report';
import { getJsonItemFromLocalStorage } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';

const useReportFilter = (
  filterType: number,
  startDate?: string,
  endDate?: string,
  reportType?: number,
  emailAddress?: string,
  reportFilter?: string,
  options?: { enabled: boolean }
) => {
  const getEndpoint = (
    filterType: any,
    startDate: any,
    endDate: any,
    reportType: any
  ) => {
    console.log(reportType, 'repos');
    if (reportFilter === 'orders') {
      return getReportOrder(
        business[0].businessId,
        filterType,
        startDate,
        endDate,
        reportType
      );
    } else if (reportFilter === 'payment') {
      return getReportPayment(
        business[0].businessId,
        filterType,
        startDate,
        endDate,
        reportType
      );
    } else if (reportFilter === 'booking') {
      return getReportBooking(
        business[0].businessId,
        filterType,
        startDate,
        endDate,
        reportType
      );
    } else if (reportFilter === 'audit-logs') {
      return getReportAuditLog(
        business[0].businessId,
        filterType,
        startDate,
        endDate,
        reportType
      );
    }
  };

  const business = getJsonItemFromLocalStorage('business');
  const fetchReport = async ({ queryKey }: any) => {
    const [_key, { filterType, startDate, endDate, reportType }] = queryKey;
    const responseData = await getEndpoint(
      filterType,
      startDate,
      endDate,
      reportType
    );
    return responseData?.data?.data as any;
  };

  const { data, isLoading, isError, refetch } = useQuery<any>({
    queryKey: [
      'reportFilter',
      { filterType, startDate, endDate, reportType, emailAddress },
    ],
    queryFn: fetchReport,
    
      refetchOnWindowFocus: false,

      ...options,
    
  });

  return { data, isLoading, isError, refetch };
};

export default useReportFilter;
