'use client';
import { getQR } from '@/app/api/controllers/dashboard/quickResponse';
import { getJsonItemFromLocalStorage } from '@/lib/utils';
import { useQuery } from 'react-query';
import { useGlobalContext } from '../globalProvider';

interface Qr {
  allOrdersCount?: string;
  openOrdersCount?: string;
  dateCreated: string;
  id: string;
  name: string;
}

const useQR = () => {
  const { page, rowsPerPage } = useGlobalContext();
  const businessInformation = getJsonItemFromLocalStorage('business');

  const getAllQRcode = async () => {
    const responseData = await getQR(
      businessInformation[0]?.businessId,
      page,
      rowsPerPage
    );
    return responseData?.data?.data as Qr[];
  };

  const { data, isLoading, isError, refetch } = useQuery<Qr[]>(
    ['qr', { page, rowsPerPage }],
    getAllQRcode,
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

export default useQR;
