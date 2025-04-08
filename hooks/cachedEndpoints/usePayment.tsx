'use client';
import { getPaymentByBusiness } from '@/app/api/controllers/dashboard/payment';
import { getJsonItemFromLocalStorage } from '@/lib/utils';
import { useQuery } from 'react-query';
import { useGlobalContext } from '../globalProvider';
import { fetchQueryConfig } from "@/lib/queryConfig";

interface Payment {
  id: string;
  customer: string;
  reference: string;
  treatedBy: string;
  totalAmount: number;
  orderID: string;
  qrName: string;
  paymentMethod: number;
  paymentReference: string;
  status: number;
  dateCreated: string;
  cooperateID: string;
  businessID: string;
}

interface OrderSummary {
  name: string;
  totalAmount: number;
  payments: Payment[];
}

const usePayment = (
  filterType: number,
  startDate?: string,
  endDate?: string,
  options?: { enabled: boolean }
) => {
  const { page, rowsPerPage, tableStatus } = useGlobalContext();
  const businessInformation = getJsonItemFromLocalStorage("business");

  const getAllPayments = async ({ queryKey }: { queryKey: any }) => {
    const [
      _key,
      { page, rowsPerPage, tableStatus, filterType, startDate, endDate },
    ] = queryKey;

    try {
      const responseData = await getPaymentByBusiness(
        businessInformation[0]?.businessId,
        page,
        rowsPerPage,
        tableStatus,
        filterType,
        startDate,
        endDate
      );
      return (responseData?.data?.data as OrderSummary[]) ?? [];
    } catch (error) {
      return [];
    }
  };

  const { data, isLoading, isError, refetch } = useQuery<OrderSummary[]>(
    [
      "payments",
      { page, rowsPerPage, tableStatus, filterType, startDate, endDate },
    ],

    getAllPayments,
    fetchQueryConfig(options)
  );

  return {
    data,
    isLoading,
    isError,
    refetch,
  };
};

export default usePayment;
