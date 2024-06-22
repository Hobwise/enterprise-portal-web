'use client';
import { getOrderByBusiness } from '@/app/api/controllers/dashboard/orders';
import { getJsonItemFromLocalStorage } from '@/lib/utils';
import { useQuery } from 'react-query';
import { useGlobalContext } from '../globalProvider';

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
  const { page, rowsPerPage, tableStatus } = useGlobalContext();

  const businessInformation = getJsonItemFromLocalStorage('business');

  const getAllOrders = async ({ queryKey }) => {
    const [_key, { page, rowsPerPage, tableStatus }] = queryKey;
    const responseData = await getOrderByBusiness(
      businessInformation[0]?.businessId,
      page,
      rowsPerPage,
      tableStatus
    );

    return responseData?.data as OrderData[];
  };

  const { data, isLoading, isError, refetch } = useQuery<OrderData[]>(
    ['orders', { page, rowsPerPage, tableStatus }],
    getAllOrders,
    {
      keepPreviousData: true,
    }
  );

  return {
    data,
    isLoading,
    isError,
    refetch,
  };
};

export default useOrder;
