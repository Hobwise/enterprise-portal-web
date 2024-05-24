'use client';
import { getOrderByBusiness } from '@/app/api/controllers/dashboard/orders';
import { getJsonItemFromLocalStorage } from '@/lib/utils';
import { useQuery } from 'react-query';

type OrderItem = {
  name: string;
  orders: Array<{
    id: string;
    placedByName: string;
    placedByPhoneNumber: string;
    reference: string;
    treatedBy: string;
    totalAmount: number;
    qrReference: string;
    paymentMethod: number;
    paymentReference: string;
    status: 0 | 1 | 2 | 3;
  }>;
};

type OrderData = Array<OrderItem>;

const useOrder = () => {
  const businessInformation = getJsonItemFromLocalStorage('business');

  const getAllOrders = async () => {
    const responseData = await getOrderByBusiness(
      businessInformation[0]?.businessId
    );
    return responseData?.data?.data as OrderData[];
  };

  const { data, isLoading, isError, refetch } = useQuery<OrderData[]>(
    'orders',
    getAllOrders
  );

  return {
    data,
    isLoading,
    isError,
    refetch,
  };
};

export default useOrder;
