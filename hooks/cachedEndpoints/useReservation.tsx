'use client';
import {
  getReservations,
  payloadReservationItem,
} from '@/app/api/controllers/dashboard/reservations';
import { getJsonItemFromLocalStorage } from '@/lib/utils';
import { useQuery } from 'react-query';
import { useGlobalContext } from '../globalProvider';
import { fetchQueryConfig } from "@/lib/queryConfig";

const useReservation = (businessIdOutsideApp?: any, cooperateID?: any) => {
  const { page, rowsPerPage } = useGlobalContext();
  const businessInformation = getJsonItemFromLocalStorage("business");
  const businessId = businessInformation
    ? businessInformation[0]?.businessId
    : businessIdOutsideApp;
  const getAllReservation = async ({ queryKey }) => {
    try {
      const responseData = await getReservations(
        businessId,
        page,
        rowsPerPage,
        cooperateID
      );
      return (responseData?.data?.data as payloadReservationItem[]) ?? [];
    } catch (error) {
      return [];
    }
  };

  const { data, isLoading, isError, refetch } = useQuery<
    payloadReservationItem[]
  >(
    ["reservation", { page, rowsPerPage }],
    getAllReservation,
    fetchQueryConfig()
  );

  return {
    data,
    isLoading,
    isError,
    refetch,
  };
};

export default useReservation;
