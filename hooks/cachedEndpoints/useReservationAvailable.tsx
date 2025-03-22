"use client";

import { getReservationsByDate } from "@/app/api/controllers/dashboard/reservations";
import { useQuery } from "react-query";

// Hook to fetch a single reservation by ID
const useSingleReservationByDate = (reservationId: any, requestDate: string) => {

  const getSingleReservation = async () => {
    return await getReservationsByDate(reservationId, requestDate);
  };

  const { data, isLoading, isError, refetch } = useQuery(
    ["singleReservation", reservationId, requestDate],
    getSingleReservation,
    {
      enabled: !!reservationId, // Fetch only if reservationId exists
      keepPreviousData: true, // Prevent flickering on re-fetch
      refetchOnWindowFocus: false, // Optimize performance
    }
  );

  return {
    data,
    isLoading,
    isError,
    refetch,
  };
};

export default useSingleReservationByDate;
