"use client";

import useSingleReservationByDate from "@/hooks/cachedEndpoints/useReservationAvailable";
import { useSearchParams } from "next/navigation";
import React, { useState, useEffect } from "react";
import { BiCalendar, BiChevronLeft, BiChevronRight } from "react-icons/bi";
import { FiMoreHorizontal } from "react-icons/fi";
import { IoIosArrowDown, IoIosArrowUp } from "react-icons/io";
import AppointmentScheduler from "./AppointmentScheduler";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Spinner } from "@nextui-org/react";

interface Booking {
  id: number;
  name: string;
  quantity: number;
  guests: number;
  timeSlot: string;
  status:
    | "Rejected"
    | "Completed"
    | "Expired"
    | "Pending"
    | "Admitted"
    | "Confirmed";
  color: "blue" | "yellow" | "green" | "purple" | "orange";

  row?: number;
}

interface TimeSlot {
  time: string;
  quantity: number;
}

interface BookingGridProps {
  data?: any;
}

const BookingGrid: React.FC<BookingGridProps> = () => {
  const [showTimeModal, setShowTimeModal] = useState<boolean>(false);
  const [bookings, setBookings] = useState<any[]>([]);
  const [availableTimeSlots, setAvailableTimeSlots] = useState<any[]>([]);
  const [timeSlots, setTimeSlots] = useState<any[]>([]);
  const searchParams = useSearchParams();
  const reservationId = searchParams.get("reservationId") || null;
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const { data, isLoading, isError, refetch } = useSingleReservationByDate(
    reservationId,
    selectedDate.toISOString() // Ensures correct format
  );

  // Check if selected date is today
  const isToday = (date: Date): boolean => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const generateTimeSlots = (startTime: string | null, endTime: string | null): string[] => {
    const slots: string[] = [];
    
    // Return empty array if startTime or endTime is null
    if (!startTime || !endTime) {
      console.warn("Missing startTime or endTime in generateTimeSlots");
      return slots;
    }
    
    try {
      let [startHour] = startTime.split(":").map(Number);
      let [endHour] = endTime.split(":").map(Number);
      
      // Validate that we have valid numbers
      if (isNaN(startHour) || isNaN(endHour)) {
        console.warn("Invalid time format in generateTimeSlots");
        return slots;
      }

      while (startHour <= endHour) {
        let period = startHour >= 12 ? "PM" : "AM";
        let displayHour = startHour % 12 || 12; // Convert 24-hour to 12-hour format

        slots.push(`${displayHour} ${period}`);

        // Increment time by 1 hour
        startHour += 1;
      }
      
      return slots;
    } catch (error) {
      console.error("Error generating time slots:", error);
      return slots;
    }
  };

  const formatDate = (date: Date): string => {
    const options: Intl.DateTimeFormatOptions = {
      month: "long",
      day: "numeric",
      year: "numeric",
    };
    return date.toLocaleDateString("en-US", options);
  };

    const formatTime = (isoTime: string | null): string => {
      if (!isoTime) return "Invalid Time";
    
      try {
        const timePart = isoTime.split("T")[1]?.split(".")[0]; // Extract time part, remove milliseconds if present
        if (!timePart) return "Invalid Time";
    
        let [hours, minutes] = timePart.split(":").map(Number);
    
        if (isNaN(hours) || isNaN(minutes)) return "Invalid Time";
    
        return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
      } catch (error) {
        console.error("Error formatting time:", error);
        return "Invalid Time";
      }
    };
    

  // Handler for date change
  const handleDateChange = (date: Date | null) => {
    if (date) {
      setSelectedDate(date);
      // Trigger refetch of data with new date
      refetch();
    }
  };

  useEffect(() => {
    if (!data || !data.data) return;

    console.log(data, "API Response");

    try {
      // Extracting time slots
      const { availableBookingTimes, startTime, endTime, bookings } = data.data;

      setAvailableTimeSlots(availableBookingTimes || []);
      setTimeSlots(generateTimeSlots(startTime, endTime));

      const getStatus = (statusCode: number): string => {
        const statusMap: { [key: number]: string } = {
          0: "Pending",
          1: "Confirmed",
          2: "Admitted",
          3: "Cancelled",
          4: "Completed",
          5: "Failed",
          6: "Expired"
        };

        return statusMap[statusCode] || "Unknown Status";
      }

      if (Array.isArray(bookings)) {
        const mappedBookings = bookings.map((item: any) => {
          return {
            id: item.id,
            name: `${item.firstName || ''} ${item.lastName || ''}`.trim(),
            quantity: item.quantity || 1,
            guests: item.numberOfSeat || 0,
            startTime: formatTime(item.bookingDateTime),
            endTime: formatTime(item.bookingEndDateTime),
            dateCreated: formatTime(item.dateCreated),
            status: getStatus(item.bookingStatus),
            ...item,
          };
        });

        setBookings(mappedBookings);
      } else {
        setBookings([]);
      }
    } catch (error) {
      console.error("Error processing reservation data:", error);
      setBookings([]);
      setAvailableTimeSlots([]);
      setTimeSlots([]);
    }
  }, [data]);

  return (
    <section className="border w-full border-primaryGrey rounded-lg">
      <div>
        <div className="flex p-4 justify-between items-center">
          <div className="relative">
            <div className="flex items-center">
              <DatePicker
                selected={selectedDate}
                onChange={handleDateChange}
                dateFormat="MMMM d, yyyy"
                className="border-none font-medium text-gray-800 cursor-pointer focus:outline-none"
                customInput={
                  <button className="flex items-center">
                    <span>{formatDate(selectedDate)}</span>
                    <span className="ml-1">
                      <IoIosArrowDown />
                    </span>
                  </button>
                }
              />
            </div>
            <div className="text-sm text-gray-600">
              You have {bookings.length} bookings.{" "}
              <span
                className="text-primaryColor underline font-semibold cursor-pointer"
                onClick={() => setShowTimeModal(true)}
              >
                View available time
              </span>
            </div>

            {showTimeModal && (
            <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white shadow-lg rounded-lg z-[60] p-6 w-96 h-80">
            <h3 className="font-medium text-xl mb-4">
              {selectedDate.toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </h3>
            <p className="text-gray-600 mb-4">
              These are the times available for customers to make a booking
            </p>
          
            <div className="max-h-28 overflow-y-auto pr-2 scrollbar"> 
              {availableTimeSlots.length > 0 ? (
                availableTimeSlots.map((slot, index) => (
                  <div key={index} className="flex items-center gap-6 mb-3">
                    <div className="flex items-center text-gray-700">
                      <BiCalendar size={14} className="mr-2" />
                      <span>
                        {formatTime(slot.startDateTime)} - {formatTime(slot.endDateTime)}
                      </span>
                    </div>
                    <div className="text-gray-700">Quantity: {slot.quantity}</div>
                  </div>
                ))
              ) : (
                <div className="text-gray-600">No available time slots for this date.</div>
              )}
            </div>
          
            <button
              className="w-full mt-4 py-2 bg-primaryColor text-white rounded-md"
              onClick={() => setShowTimeModal(false)}
            >
              Close
            </button>
          </div>
          
            )}
          </div>

          <div className="flex gap-2">
            <button
              aria-label="left"
              className="p-2 rounded-md border hover:bg-gray-50"
              onClick={() => {
                const prevDay = new Date(selectedDate);
                prevDay.setDate(prevDay.getDate() - 1);
                setSelectedDate(prevDay);
                refetch();
              }}
            >
              <BiChevronLeft size={16} />
            </button>
            {!isToday(selectedDate) ? (
              <button 
                className="px-3 py-1 rounded-md border hover:bg-gray-50"
                onClick={() => {
                  setSelectedDate(new Date());
                  refetch();
                }}
              >
                Next
              </button>
            ) : (
              <button 
                className="px-3 py-1 rounded-md border bg-primaryColor text-white"
                disabled
              >
                Today
              </button>
            )}
            <button
              aria-label="right"
              className="p-2 rounded-md border hover:bg-gray-50"
              onClick={() => {
                const nextDay = new Date(selectedDate);
                nextDay.setDate(nextDay.getDate() + 1);
                setSelectedDate(nextDay);
                refetch();
              }}
            >
              <BiChevronRight size={16} />
            </button>
          </div>
        </div>

        {isLoading ? (
            <div className="space-y-2 flex justify-center items-center flex-col">
            <Spinner size="sm" />
            <p className="italic text-gray-400">Loading...</p>
          </div>
        ) : isError ? (
          <div className="p-6 text-center text-red-600">Error loading reservation data. Please try again.</div>
        ) : (
          <>
            <AppointmentScheduler bookings={bookings} refetch={refetch} a={undefined} />
            
          </>
        )}
      </div>
    </section>
  );
};

export default BookingGrid;