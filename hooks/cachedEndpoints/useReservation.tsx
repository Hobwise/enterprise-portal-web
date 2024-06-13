'use client';
import {
  getReservations,
  payloadReservationItem,
} from '@/app/api/controllers/dashboard/reservations';
import { getJsonItemFromLocalStorage } from '@/lib/utils';
import { useQuery } from 'react-query';

const useReservation = () => {
  const businessInformation = getJsonItemFromLocalStorage('business');

  const getAllReservation = async () => {
    const responseData = await getReservations(
      businessInformation[0]?.businessId
    );
    return responseData?.data?.data as payloadReservationItem[];
  };

  const { data, isLoading, isError, refetch } = useQuery<
    payloadReservationItem[]
  >('reservation', getAllReservation);

  return {
    data,
    isLoading,
    isError,
    refetch,
  };
};

export default useReservation;
