'use client';
import { getOrderByBusiness } from '@/app/api/controllers/dashboard/orders';
import { getJsonItemFromLocalStorage } from '@/lib/utils';
import { useQuery } from 'react-query';
import { useGlobalContext } from '../globalProvider';
import { fetchQueryConfig } from "@/lib/queryConfig";

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

const useOrder = (
  filterType: number,
  startDate?: string,
  endDate?: string,
  options?: { enabled: boolean }
) => {
  const { page, rowsPerPage, tableStatus } = useGlobalContext();

  const businessInformation = getJsonItemFromLocalStorage("business");

  const getAllOrders = async ({ queryKey }: { queryKey: any }) => {
    const [_key, { page, rowsPerPage, tableStatus }] = queryKey;

    try {
      const responseData = await getOrderByBusiness(
        businessInformation[0]?.businessId,
        page,
        rowsPerPage,
        tableStatus,
        filterType,
        startDate,
        endDate
      );
      return (responseData?.data as OrderData[]) ?? [];
    } catch (error) {
      return [];
    }
  };

  const { data, isLoading, isError, refetch } = useQuery<OrderData[]>(
    [
      "orders",
      { page, rowsPerPage, tableStatus, filterType, startDate, endDate },
    ],
    getAllOrders,

    fetchQueryConfig(options)
  );

  return {
    data,
    isLoading,
    isError,
    refetch,
  };
};

export default useOrder;
