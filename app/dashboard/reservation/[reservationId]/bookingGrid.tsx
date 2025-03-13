"use client";

import React, { useState, useEffect } from "react";
import { BiCalendar, BiChevronLeft, BiChevronRight } from "react-icons/bi";
import { FiMoreHorizontal } from "react-icons/fi";
import { IoIosArrowDown, IoIosArrowUp } from "react-icons/io";

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

const BookingGrid: React.FC<BookingGridProps> = ({ data }) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date(2025, 1, 16));
  const [showTimeModal, setShowTimeModal] = useState<boolean>(false);
  const [showCalendarModal, setShowCalendarModal] = useState<boolean>(false);
  const [showBookingDetails, setShowBookingDetails] = useState<boolean>(false);
  const [bookings, setBookings] = useState<Booking[]>([
    {
      id: 1,
      name: "Olamide Akintan",
      quantity: 2,
      guests: 10,
      timeSlot: "7:00 AM - 10:00 AM",
      status: "Rejected",
      color: "blue",
    },
    {
      id: 2,
      name: "Sheriff Toluspe",
      quantity: 2,
      guests: 8,
      timeSlot: "7:00 AM - 09:00 AM",
      status: "Completed",
      color: "yellow",
    },
    {
      id: 3,
      name: "Kotawale Akinyemi",
      quantity: 2,
      guests: 3,
      timeSlot: "8:00 AM - 9:00 AM",
      status: "Expired",
      color: "green",
    },
    {
      id: 4,
      name: "Iretiola Ilesanmi",
      quantity: 2,
      guests: 5,
      timeSlot: "9:00 AM - 10:00 AM",
      status: "Pending",
      color: "purple",
    },
    {
      id: 5,
      name: "Iretiola Ilesanmi",
      quantity: 2,
      guests: 10,
      timeSlot: "12:00 PM - 01:00 PM",
      status: "Admitted",
      color: "orange",
    },
    {
      id: 6,
      name: "Sheriff Toluspe",
      quantity: 2,
      guests: 8,
      timeSlot: "11:00 AM - 01:00 PM",
      status: "Confirmed",
      color: "yellow",
    },
  ]);

  const [positionedBookings, setPositionedBookings] = useState<Booking[]>([]);

  const [maxRows, setMaxRows] = useState<number>(1);

  const availableTimeSlots: TimeSlot[] = [
    { time: "9:00 AM - 10:00 AM", quantity: 2 },
    { time: "11:00 AM - 1:00 PM", quantity: 5 },
  ];

  const timeSlots: string[] = [
    "7 AM",
    "8 AM",
    "9 AM",
    "10 AM",
    "11 AM",
    "12 PM",
    "1 PM",
  ];

  const daysInMonth: (number | null)[][] = [
    [null, null, null, null, null, null, 1],
    [2, 3, 4, 5, 6, 7, 8],
    [9, 10, 11, 12, 13, 14, 15],
    [16, 17, 18, 19, 20, 21, 22],
    [23, 24, 25, 26, 27, 28, null],
  ];

  const formatDate = (date: Date): string => {
    const options: Intl.DateTimeFormatOptions = {
      month: "long",
      day: "numeric",
      year: "numeric",
    };
    return date.toLocaleDateString("en-US", options);
  };

  const getStatusColor = (status: Booking["status"]): string => {
    switch (status) {
      case "Rejected":
        return "bg-red-100  text-red-500";
      case "Completed":
        return "bg-green-100  text-green-500";
      case "Expired":
        return "bg-yellow-100  text-yellow-500";
      case "Pending":
        return "bg-blue-100  text-blue-500";
      case "Admitted":
        return "bg-pink-100  text-pink-500";
      case "Confirmed":
        return "bg-green-100  text-green-500";
      default:
        return "bg-gray-100  text-gray-500";
    }
  };

  const getBookingColor = (color: Booking["color"]): string => {
    switch (color) {
      case "blue":
        return "bg-[#F7F9FB] border-b-4 border-blue-500";
      case "yellow":
        return "bg-[#F7F9FB] border-b-4 border-yellow-500";
      case "green":
        return "bg-[#F7F9FB] border-b-4 border-green-500";
      case "purple":
        return "bg-[#F7F9FB] border-b-4 border-purple-500";
      case "orange":
        return "bg-[#F7F9FB] border-b-4 border-orange-500";
      default:
        return "bg-[#F7F9FB] border-b-4 border-gray-500";
    }
  };

  const getBookingTimeInfo = (
    timeSlot: string
  ): { start: number; end: number; span: number } => {
    const [startTime, endTime] = timeSlot.split(" - ");

    const startHourStr = startTime.split(":")[0];
    const startMinStr = startTime.split(":")[1]?.split(" ")[0] || "00";
    const endHourStr = endTime.split(":")[0];
    const endMinStr = endTime.split(":")[1]?.split(" ")[0] || "00";

    const startHour = parseInt(startHourStr);
    const startMin = parseInt(startMinStr);
    const endHour = parseInt(endHourStr);
    const endMin = parseInt(endMinStr);

    const startIsPM = startTime.includes("PM");
    const endIsPM = endTime.includes("PM");

    const start24h = startHour + (startIsPM && startHour !== 12 ? 12 : 0);
    const end24h = endHour + (endIsPM && endHour !== 12 ? 12 : 0);

    const startDecimal = start24h + startMin / 60;
    const endDecimal = end24h + endMin / 60;

    const startCol = startDecimal - 7;
    const endCol = endDecimal - 7;
    const span = endCol - startCol;

    return {
      start: startCol,
      end: endCol,
      span: span,
    };
  };

  useEffect(() => {
    const sortedBookings = [...bookings].sort((a, b) => {
      const aInfo = getBookingTimeInfo(a.timeSlot);
      const bInfo = getBookingTimeInfo(b.timeSlot);

      if (aInfo.start !== bInfo.start) {
        return aInfo.start - bInfo.start;
      }
      return aInfo.span - bInfo.span;
    });

    const processedBookings = sortedBookings.map((booking) => {
      return { ...booking, row: 0 };
    });

    let highestRow = 0;

    for (let i = 0; i < processedBookings.length; i++) {
      const current = processedBookings[i];
      const currentTimeInfo = getBookingTimeInfo(current.timeSlot);
      let rowAssigned = false;
      let row = 0;

      while (!rowAssigned) {
        let canUseThisRow = true;

        for (let j = 0; j < i; j++) {
          const previous = processedBookings[j];
          if (previous.row === row) {
            const previousTimeInfo = getBookingTimeInfo(previous.timeSlot);

            if (
              currentTimeInfo.start < previousTimeInfo.end &&
              currentTimeInfo.end > previousTimeInfo.start
            ) {
              canUseThisRow = false;
              break;
            }
          }
        }

        if (canUseThisRow) {
          processedBookings[i].row = row;
          if (row > highestRow) highestRow = row;
          rowAssigned = true;
        } else {
          row++;
        }
      }
    }

    setPositionedBookings(processedBookings);
    setMaxRows(highestRow + 1);
  }, [bookings]);

  const rowHeight = 100;
  const containerHeight = Math.max(maxRows * rowHeight, 200);

  return (
    <section className="border w-full border-primaryGrey rounded-lg">
      <div>
        <div className="flex p-4 justify-between items-center">
          <div className="relative">
            <button
              className="flex items-center font-medium text-gray-800"
              onClick={() => setShowCalendarModal(!showCalendarModal)}
            >
              <span>February 16, 2025</span>
              <span className="ml-1">
                {showCalendarModal ? <IoIosArrowUp /> : <IoIosArrowDown />}
              </span>
            </button>
            <div className="text-sm text-gray-600">
              You have {bookings.length} bookings.{" "}
              <span
                className="text-primaryColor underline font-semibold cursor-pointer"
                onClick={() => setShowTimeModal(true)}
              >
                View available time
              </span>
            </div>

            {showCalendarModal && (
              <div className="absolute z-50 top-full left-0 mt-2 bg-white shadow-lg rounded-lg z-10 p-4 w-64">
                <div className="flex justify-between items-center mb-4">
                  <button
                    aria-label="left"
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    <BiChevronLeft size={16} />
                  </button>
                  <div className="font-medium">Feb 2025</div>
                  <button
                    aria-label="right"
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    <BiChevronRight size={16} />
                  </button>
                </div>
                <div className="grid grid-cols-7 gap-1 text-center">
                  <div className="text-xs text-gray-500">S</div>
                  <div className="text-xs text-gray-500">M</div>
                  <div className="text-xs text-gray-500">T</div>
                  <div className="text-xs text-gray-500">W</div>
                  <div className="text-xs text-gray-500">T</div>
                  <div className="text-xs text-gray-500">F</div>
                  <div className="text-xs text-gray-500">S</div>

                  {daysInMonth.flat().map((day, index) => (
                    <div
                      key={index}
                      className={`
                    h-6 w-6 flex items-center justify-center text-xs rounded-full
                    ${
                      day === 16
                        ? "bg-primaryColor text-white"
                        : "hover:bg-gray-100 cursor-pointer"
                    }
                    ${day === null ? "invisible" : ""}
                  `}
                    >
                      {day}
                    </div>
                  ))}
                </div>
                <div className="mt-2 border-t pt-2">
                  <div className="font-medium">Mar</div>
                  <div className="grid grid-cols-7 gap-1 text-center mt-1">
                    {[1, 2, 3, 4, 5, 6, 7].map((day) => (
                      <div
                        key={day}
                        className="h-6 w-6 flex items-center justify-center text-xs hover:bg-gray-100 cursor-pointer"
                      >
                        {day}
                      </div>
                    ))}
                  </div>
                </div>
                <button
                  className="w-full mt-4 py-2 bg-primaryColor text-white rounded-md"
                  onClick={() => setShowCalendarModal(false)}
                >
                  Close
                </button>
              </div>
            )}

            {showTimeModal && (
              <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white shadow-lg rounded-lg z-20 p-6 w-80">
                <h3 className="font-medium text-xl mb-4">February 16, 2025</h3>
                <p className="text-gray-600 mb-4">
                  These are the times available for customers to make a booking
                </p>

                {availableTimeSlots.map((slot, index) => (
                  <div key={index} className="flex items-center gap-3 mb-3">
                    <div className="flex items-center text-gray-700">
                      <BiCalendar size={14} className="mr-2" />
                      <span>{slot.time}</span>
                    </div>
                    <div className="text-gray-700">
                      Quantity: {slot.quantity}
                    </div>
                  </div>
                ))}

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
            >
              <BiChevronLeft size={16} />
            </button>
            <button className="px-3 py-1 rounded-md border hover:bg-gray-50">
              Today
            </button>
            <button
              aria-label="right"
              className="p-2 rounded-md border hover:bg-gray-50"
            >
              <BiChevronRight size={16} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-0 border shadow-lg p-3">
          {timeSlots.map((time, index) => (
            <div key={index} className="text-center text-sm text-gray-600">
              {time}
            </div>
          ))}
        </div>

        <div className="relative" style={{ height: `${containerHeight}px` }}>
          <div
            className="absolute left-0 right-0 top-0 bottom-0 flex items-center"
            style={{ zIndex: 5 }}
          >
            <div
              className="absolute h-full border-l-2 border-secondaryColor"
              style={{ left: "calc(3 * (100% / 7) + (100% / 14))" }}
            ></div>

            <div
              className="w-0 h-0 absolute"
              style={{
                left: "calc(3 * (100% / 7) + (100% / 14))",
                top: 0,
                transform: "translateX(-50%)",
                borderLeft: "8px solid transparent",
                borderRight: "8px solid transparent",
                borderTop: "12px solid #7c69d8",
              }}
            ></div>
          </div>

          <div className="grid grid-cols-7 h-full gap-0 relative">
            {timeSlots.map((_, colIndex) => (
              <div key={colIndex} className="border-r h-full relative"></div>
            ))}

            {positionedBookings.map((booking) => {
              const { start, span } = getBookingTimeInfo(booking.timeSlot);

              const leftPercent = (start / timeSlots.length) * 100;
              const widthPercent = (span / timeSlots.length) * 100;

              const topPosition =
                booking.row !== undefined ? booking.row * rowHeight : 0;

              return (
                <div
                  key={booking.id}
                  className={`${getBookingColor(
                    booking.color
                  )} absolute rounded-md p-2 m-1 text-xs`}
                  style={{
                    left: `${leftPercent}%`,
                    top: `${topPosition}px`,
                    width: `${widthPercent}%`,
                    maxWidth: `calc(${widthPercent}% - 8px)`,
                    zIndex: 10,
                    height: `${rowHeight - 8}px`,
                    overflow: "hidden",
                  }}
                  onClick={() => {
                    if (
                      booking.name === "Iretiola Ilesanmi" &&
                      booking.timeSlot === "9:00 AM - 10:00 AM"
                    ) {
                      setShowBookingDetails(!showBookingDetails);
                    }
                  }}
                >
                  <div className="flex justify-between mb-1">
                    <div className="font-medium text-[14px] truncate">
                      {booking.name}
                    </div>
                    <FiMoreHorizontal
                      size={14}
                      className="text-gray-600 flex-shrink-0 ml-1"
                    />
                  </div>
                  <div className="text-gray-600 whitespace-nowrap overflow-hidden text-ellipsis">
                    Quantity: {booking.quantity} · No of guest: {booking.guests}
                  </div>

                  <div className="flex justify-between mt-4">
                    <div className="text-gray-600 whitespace-nowrap overflow-hidden text-ellipsis">
                      {booking.timeSlot}
                    </div>
                    <span
                      className={`px-2 py-0.5 whitespace-nowrap rounded-sm shadow-md text-xs ${getStatusColor(
                        booking.status
                      )}`}
                    >
                      &#x2022; {booking.status}
                    </span>
                  </div>
                </div>
              );
            })}

            {showBookingDetails && (
              <div
                className="absolute bg-white shadow-lg rounded-lg z-20 p-4 w-64"
                style={{
                  left: `${(3 / timeSlots.length) * 100}%`,
                  top: "10px",
                }}
              >
                <div className="font-medium text-lg">Iretiola Ilesanmi</div>
                <div className="text-gray-600 mb-2">
                  Reservation: Table for two (2)
                </div>
                <div className="flex items-center gap-2 text-gray-700 mb-1">
                  <BiCalendar size={14} />
                  <span>February 16, 2025</span>
                </div>
                <div className="flex items-center gap-2 text-gray-700 mb-1">
                  <BiCalendar size={14} />
                  <span>9:00 AM - 10:00 AM</span>
                </div>
                <div className="flex items-center gap-2 text-gray-700 mb-3">
                  <BiCalendar size={14} />
                  <span>5 guests</span>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  <button className="px-4 py-2 border rounded-md hover:bg-gray-50">
                    Edit
                  </button>
                  <button className="px-4 py-2 border rounded-md hover:bg-gray-50">
                    Decline
                  </button>
                  <button className="px-4 py-2 bg-purple-600 text-white rounded-md">
                    Confirm
                  </button>
                </div>
                <button
                  className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
                  onClick={() => setShowBookingDetails(false)}
                >
                  ✕
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default BookingGrid;
