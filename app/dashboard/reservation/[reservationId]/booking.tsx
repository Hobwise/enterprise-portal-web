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
    if (reservationItem?.bookings?.length > 0) {
      return <BookingGrid data={reservationItem?.bookings} />;
    } else if (isError) {
      return <Error onClick={() => getSingleReservation()} />;
    } else {
      return <EmptyBooking />;
    }
  };

  return (
    <div className="flex-grow flex">
      {isLoading ? (
        <CustomLoading />
      ) : (
      <BookingGrid data={reservationItem?.bookings} />
      )}
    </div>
  );
};

export default Booking;
