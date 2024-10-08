'use client';
import {
  getReportAuditLog,
  getReportBooking,
  getReportOrder,
  getReportPayment,
} from '@/app/api/controllers/dashboard/report';
import { getJsonItemFromLocalStorage } from '@/lib/utils';
import { useQuery } from 'react-query';

const useReportFilter = (
  filterType: number,
  startDate?: string,
  endDate?: string,
  reportType?: number,
  emailAddress?: string,
  reportFilter?: string,
  options?: { enabled: boolean }
) => {
  const getEndpoint = (filterType: any, startDate: any, endDate: any) => {
    if (reportFilter === 'orders') {
      return getReportOrder(
        business[0].businessId,
        filterType,
        startDate,
        endDate,
        reportType,
        emailAddress
      );
    } else if (reportFilter === 'payment') {
      return getReportPayment(
        business[0].businessId,
        filterType,
        startDate,
        endDate,
        reportType,
        emailAddress
      );
    } else if (reportFilter === 'booking') {
      return getReportBooking(
        business[0].businessId,
        filterType,
        startDate,
        endDate,
        reportType,
        emailAddress
      );
    } else if (reportFilter === 'audit-logs') {
      return getReportAuditLog(
        business[0].businessId,
        filterType,
        startDate,
        endDate,
        reportType,
        emailAddress
      );
    }
  };

  const business = getJsonItemFromLocalStorage('business');
  const fetchReport = async ({ queryKey }: any) => {
    const [_key, { filterType, startDate, endDate }] = queryKey;
    const responseData = await getEndpoint(filterType, startDate, endDate);
    return responseData?.data?.data as any;
  };

  const { data, isLoading, isError, refetch } = useQuery<any>(
    [
      'reportFilter',
      { filterType, startDate, endDate, reportType, emailAddress },
    ],
    fetchReport,
    {
      refetchOnWindowFocus: false,

      ...options,
    }
  );

  return { data, isLoading, isError, refetch };
};

export default useReportFilter;
