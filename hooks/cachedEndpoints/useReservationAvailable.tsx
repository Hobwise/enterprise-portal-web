"use client";

import { getReservationsByDate } from "@/app/api/controllers/dashboard/reservations";
import { useQuery, keepPreviousData } from '@tanstack/react-query';

// Hook to fetch a single reservation by ID
const useSingleReservationByDate = (reservationId: any, requestDate: string) => {

  const getSingleReservation = async () => {
    return await getReservationsByDate(reservationId, requestDate);
  };

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["singleReservation", reservationId, requestDate],
    queryFn: getSingleReservation,
    
      enabled: !!reservationId, // Fetch only if reservationId exists
      placeholderData: keepPreviousData, // Prevent flickering on re-fetch
      refetchOnWindowFocus: false, // Optimize performance
    
  });

  return {
    data,
    isLoading,
    isError,
    refetch,
  };
};

export default useSingleReservationByDate;
