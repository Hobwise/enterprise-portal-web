'use client';
import { getPaymentByBusiness } from '@/app/api/controllers/dashboard/payment';
import { getJsonItemFromLocalStorage } from '@/lib/utils';
import { useQuery } from 'react-query';
import { useGlobalContext } from '../globalProvider';

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

const usePayment = () => {
  const { page, rowsPerPage, tableStatus } = useGlobalContext();
  const businessInformation = getJsonItemFromLocalStorage('business');

  const getAllPayments = async ({ queryKey }) => {
    const [_key, { page, rowsPerPage, tableStatus }] = queryKey;
    const responseData = await getPaymentByBusiness(
      businessInformation[0]?.businessId,
      page,
      rowsPerPage,
      tableStatus
    );

    return responseData?.data?.data as OrderSummary[];
  };

  const { data, isLoading, isError, refetch } = useQuery<OrderSummary[]>(
    ['payments', { page, rowsPerPage, tableStatus }],

    getAllPayments,
    {
      keepPreviousData: true,
      refetchOnWindowFocus: false,
      refetchInterval: false,
      refetchIntervalInBackground: false,
    }
  );

  return {
    data,
    isLoading,
    isError,
    refetch,
  };
};

export default usePayment;
