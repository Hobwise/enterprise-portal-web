'use client';
import { getQR } from '@/app/api/controllers/dashboard/quickResponse';
import { getJsonItemFromLocalStorage } from '@/lib/utils';
import { useQuery } from 'react-query';
import { useGlobalContext } from '../globalProvider';
import { fetchQueryConfig } from "@/lib/queryConfig";

interface Qr {
  allOrdersCount?: string;
  openOrdersCount?: string;
  dateCreated: string;
  id: string;
  name: string;
  quickResponses?: any[];
}

const useQR = () => {
  const { page, rowsPerPage } = useGlobalContext();
  const businessInformation = getJsonItemFromLocalStorage("business");

  const getAllQRcode = async () => {
    try {
      const responseData = await getQR(
        businessInformation[0]?.businessId,
        page,
        rowsPerPage
      );
      return responseData?.data?.data ?? [];
    } catch (error) {
      return [];
    }
  };

  const { data, isLoading, isError, refetch } = useQuery(
    ["qr", { page, rowsPerPage }],
    getAllQRcode,
    fetchQueryConfig()
  );

  return {
    data,
    isLoading,
    isError,
    refetch,
  };
};

export default useQR;
