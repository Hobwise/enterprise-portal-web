'use client';
import {
  getReservations,
  payloadReservationItem,
} from '@/app/api/controllers/dashboard/reservations';
import { getJsonItemFromLocalStorage } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { useGlobalContext } from '../globalProvider';
import { fetchQueryConfig } from "@/lib/queryConfig";

// TypeScript interface for reservation response structure
export interface ReservationData {
  reservations: payloadReservationItem[];
  totalCount: number;
  pageSize: number;
  currentPage: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

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
      // Return the complete data object with reservations, totalCount, etc.
      return (responseData?.data?.data as ReservationData) ?? {
        reservations: [],
        totalCount: 0,
        pageSize: rowsPerPage || 10,
        currentPage: page || 1,
        totalPages: 0,
        hasNext: false,
        hasPrevious: false
      };
    } catch (error) {
      return {
        reservations: [],
        totalCount: 0,
        pageSize: rowsPerPage || 10,
        currentPage: page || 1,
        totalPages: 0,
        hasNext: false,
        hasPrevious: false
      };
    }
  };

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["reservation", { page, rowsPerPage }],
    queryFn: getAllReservation,
    ...fetchQueryConfig()
  });

  return {
    data,
    isLoading,
    isError,
    refetch,
  };
};

export default useReservation;
