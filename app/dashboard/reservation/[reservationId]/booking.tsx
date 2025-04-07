"use client";

import React from "react";

import Error from "@/components/error";
import { CustomLoading } from "@/lib/utils";
import BookingGrid from "./bookingGrid";
import EmptyBooking from "./emptyBooking";

const Booking: React.FC = ({
  isLoading,
  reservationItem,
  getSingleReservation,
  isError,
}: any) => {
  const getScreens = () => {
    if (isError) {
      return <Error onClick={() => getSingleReservation()} />;
    } else if (reservationItem?.bookings?.length > 0) {
      return <BookingGrid data={reservationItem?.bookings} />;
    } else {
      return <EmptyBooking />;
    }
  };

  return (
    <div className="flex-grow flex">
      {isLoading ? <CustomLoading /> : getScreens()}
    </div>
  );
};

export default Booking;
