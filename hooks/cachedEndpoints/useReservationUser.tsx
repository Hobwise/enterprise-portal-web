'use client';
import {
  getReservationsUser,
  payloadReservationItem,
} from '@/app/api/controllers/dashboard/reservations';
import { fetchQueryConfig } from "@/lib/queryConfig";
import { getJsonItemFromLocalStorage } from "@/lib/utils";
import { useQuery } from "react-query";

const useReservationUser = (businessIdOutsideApp?: any, cooperateID?: any) => {
  const businessInformation = getJsonItemFromLocalStorage("business");
  const businessId = businessInformation
    ? businessInformation[0]?.businessId
    : businessIdOutsideApp;
  const getAllReservation = async () => {
    try {
      const responseData = await getReservationsUser(businessId, cooperateID);
      return (responseData?.data?.data as payloadReservationItem[]) ?? [];
    } catch (error) {
      return [];
    }
  };

  const { data, isLoading, isError, refetch } = useQuery<
    payloadReservationItem[]
  >("reservationUser", getAllReservation, fetchQueryConfig());

  return {
    data,
    isLoading,
    isError,
    refetch,
  };
};

export default useReservationUser;
