'use client';
import { getPaymentByBusiness } from '@/app/api/controllers/dashboard/payment';
import { getJsonItemFromLocalStorage } from '@/lib/utils';
import { useQuery } from 'react-query';

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
  const businessInformation = getJsonItemFromLocalStorage('business');

  const getAllPayments = async () => {
    const responseData = await getPaymentByBusiness(
      businessInformation[0]?.businessId
    );
    return responseData?.data?.data as OrderSummary[];
  };

  const { data, isLoading, isError, refetch } = useQuery<OrderSummary[]>(
    'payments',
    getAllPayments
  );

  return {
    data,
    isLoading,
    isError,
    refetch,
  };
};

export default usePayment;
