import { postBookingStatus } from "@/app/api/controllers/dashboard/bookings";
import EditBooking from "@/components/ui/dashboard/bookings/editBooking";
import { notify } from "@/lib/utils";
import { User } from "@nextui-org/react";
import React, { useState, useEffect, useRef, ReactNode } from "react";
import { BiCalendar, BiUser } from "react-icons/bi";
import {  MdOutlineMailOutline } from "react-icons/md";

// TypeScript interfaces
interface Appointment {
  numberOfGuest: ReactNode;
  id: number;
  name: string;
  quantity: number;
  guests: number;
  startTime: string;
  endTime: string;
  dateCreated: string;
  status:
    | "Rejected"
    | "Completed"
    | "Expired"
    | "Pending"
    | "Confirmed"
    | "Admitted"
    | "Failed"
    | "Cancelled";
}

// Define color types for type safety
type StatusColor =
  | "text-red-500"
  | "text-green-500"
  | "text-yellow-500"
  | "text-blue-400"
  | "text-[#FFB74A]"
  | "text-purple-500"
  | "text-gray-500";
type BarColor =
  | "bg-red-200"
  | "bg-green-200"
  | "bg-yellow-200"
  | "bg-blue-200"
  | "bg-[#F65428]"
  | "bg-gray-200";
type DotColor =
  | "bg-red-500"
  | "bg-green-500"
  | "bg-yellow-500"
  | "bg-blue-400"
  | "bg-[#FFB74A]"
  | "bg-purple-500"
  | "bg-gray-500";


const AppointmentScheduler: React.FC<{
  bookings: Appointment[];
  a: any;
  refetch: any;
}> = ({ bookings, refetch }) => {
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);
  const [modalPosition, setModalPosition] = useState({ x: 0, y: 0 });
  const [eachBooking, setEachBooking] = useState(null);
  const [isEditBookingModal, setIsEditBookingModal] = useState(false);
  const [loadingStates, setLoadingStates] = useState({
    edit: false,
    confirm: false,
    admit: false,
    cancel: false,
    complete: false,
    close: false,
  });

  

  const toggleEditBookingModal = (booking: any) => {
    setEachBooking(booking);
    console.log(booking);
    
    setIsEditBookingModal(!isEditBookingModal);
    // Reset loading state when modal is closed
    if (isEditBookingModal) {
      setLoadingStates((prev) => ({ ...prev, edit: false }));
    }
  };

  

  const updateBookingStatus = async (
    status: number,
    id: string,
    actionType: "confirm" | "admit" | "cancel" | "close" | "complete"
  ) => {
    try {
      // Set loading state
      setLoadingStates((prev) => ({ ...prev, [actionType]: true }));
  
      const data = await postBookingStatus(id, status);
  
      if (data?.data?.isSuccessful) {
        notify({
          title: "Success!",
          text: "Operation successful",
          type: "success",
        });
        setSelectedAppointment(null);
        refetch();
      }
      else {
        // More comprehensive error handling
        const errorMessage = 
          data?.response?.data?.error?.responseDescription || 
          data?.response?.data?.message || 
          "An unknown error occurred";
  
        notify({
          title: "Error!",
          text: errorMessage,
          type: "error",
        });
        
        console.error('Booking status update error:', {
          response: data?.response?.data,
          fullError: data
        });
      }
    } catch (error) {
      // Handle network errors or unexpected exceptions
      const errorMessage = 
        (error as any)?.response?.data?.error?.responseDescription ||
        (error as any)?.message ||
        "Operation failed";
  
      notify({
        title: "Error",
        text: errorMessage,
        type: "error",
      });
  
      console.error('Caught error in updateBookingStatus:', error);
    } finally {
      // Reset loading state
      setLoadingStates((prev) => ({ ...prev, [actionType]: false }));
    }
  };

  useEffect(() => {
    const updateTimeAndScroll = () => {
      setCurrentTime(new Date());
      centerCurrentTimeMarker();
    };

    // Initial centering
    updateTimeAndScroll();

    // const timer = setInterval(updateTimeAndScroll, 10000);
    // return () => clearInterval(timer);
  }, []);

  // Function to center the current time marker
  const centerCurrentTimeMarker = () => {
    if (!scrollContainerRef.current || !timelineRef.current) return;

    const container = scrollContainerRef.current;
    const timeline = timelineRef.current;

    // Get dimensions
    const containerWidth = container.clientWidth;
    const timelineWidth = timeline.scrollWidth;

    // Calculate position based on current time
    const hours = currentTime.getHours();
    const minutes = currentTime.getMinutes();
    const totalMinutesInDay = 24 * 60;
    const currentMinutesFromMidnight = hours * 60 + minutes;
    const position =
      (currentMinutesFromMidnight / totalMinutesInDay) * timelineWidth;

    // Calculate scroll position to center the marker
    const scrollPosition = Math.max(0, position - containerWidth / 2);

    // Apply scroll position
    container.scrollLeft = scrollPosition;
  };


  
  const timeSlots = [
    "01 AM",
    "02 AM",
    "03 AM",
    "04 AM",
    "05 AM",
    "06 AM",
    "07 AM",
    "08 AM",
    "09 AM",
    "10 AM",
    "11 AM",
    "12 PM",
    "01 PM",
    "02 PM",
    "03 PM",
    "04 PM",
    "05 PM",
    "06 PM",
    "07 PM",
    "08 PM",
    "09 PM",
    "10 PM",
    "11 PM",
  ];

  // Handle opening booking details
  const handleOpenBookingDetails = (
    appointment: Appointment,
    event: React.MouseEvent
  ) => {
    // Get position of click
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    const scrollLeft = scrollContainerRef.current?.scrollLeft || 0;

    // Set modal position relative to the clicked button
    // Add scrollLeft to account for horizontal scrolling
    setModalPosition({
      x: rect.right + scrollLeft - 550, // Position modal to the right of the button
      y: rect.top + window.scrollY - 420, // Position modal below the button
    });

    setSelectedAppointment(appointment);
  };

  // Close booking details
  const handleCloseBookingDetails = () => {
    setSelectedAppointment(null);
  };

// Get status color
const getStatusColor = (status: Appointment["status"]): StatusColor => {
  switch (status) {
    case "Rejected":
      return "text-[#1ABCFE]" as StatusColor;
    case "Failed":
      return "text-red-600" as StatusColor;
    case "Cancelled":
      return "text-gray-600" as StatusColor;
    case "Completed":
      return "text-emerald-700" as StatusColor;
    case "Expired":
      return "text-amber-600" as StatusColor;
    case "Pending":
      return "text-[#F65428]" as StatusColor;
    case "Confirmed":
      return "text-[#FFB74A]" as StatusColor;
    case "Admitted":
      return "text-purple-600" as StatusColor;
    default:
      return "text-gray-600" as StatusColor;
  }
};

// Get appointment bar color
const getAppointmentBarColor = (status: Appointment["status"]): BarColor => {
  switch (status) {
    case "Rejected":
      return "bg-[#1ABCFE]/20" as BarColor;
    case "Failed":
      return "bg-red-200" as BarColor;
    case "Cancelled":
      return "bg-gray-200" as BarColor;
    case "Completed":
      return "bg-emerald-300" as BarColor;
    case "Expired":
      return "bg-amber-200" as BarColor;
    case "Pending":
      return "bg-[#F65428]/60" as BarColor;
    case "Confirmed":
      return "bg-[#FFB74A]/50" as BarColor;
    case "Admitted":
      return "bg-purple-200" as BarColor;
    default:
      return "bg-gray-200" as BarColor;
  }
};

// Get status dot color
const getStatusDotColor = (status: Appointment["status"]): DotColor => {
  switch (status) {
    case "Rejected":
      return "bg-[#1ABCFE]" as DotColor;
    case "Failed":
      return "bg-red-600" as DotColor;
    case "Cancelled":
      return "bg-gray-400" as DotColor;
    case "Completed":
      return "bg-emerald-700" as DotColor;
    case "Expired":
      return "bg-amber-600" as DotColor;
    case "Pending":
      return "bg-[#F65428]" as DotColor;
    case "Confirmed":
      return "bg-[#FFB74A]" as DotColor;
    case "Admitted":
      return "bg-purple-600" as DotColor;
    default:
      return "bg-gray-600" as DotColor;
  }
};

  const formatDate = (date: any): string => {
    if (!(date instanceof Date)) {
      date = new Date(date); // Convert if it's a string or timestamp
    }
  
    if (isNaN(date.getTime())) {
      return "Invalid Date"; // Handle cases where conversion fails
    }
  
    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTimeWithAMPM = (time: string | null | undefined): string => {
    // Return a placeholder if time is null or undefined
    if (!time) return "N/A";

    const [hours, minutes] = time.split(":").map(Number);
    const period = hours >= 12 ? "PM" : "AM";
    const formattedHours = hours % 12 || 12; // Convert 0 to 12 for 12-hour format
    return `${formattedHours}:${minutes.toString().padStart(2, "0")} ${period}`;
  };
  
  // Helper function to convert time string to minutes
  const timeToMinutes = (timeStr: string): number => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  };

  // Calculate position and width for appointment bars based on 24-hour grid
  const calculateBarStyle = (startTime: string, endTime: string) => {
    // Parse time strings to extract hours and minutes
    const startParts = startTime.split(":");
    const endParts = endTime.split(":");
  
    const startHour = parseInt(startParts[0], 10);
    const startMinute = parseInt(startParts[1], 10);
  
    const endHour = parseInt(endParts[0], 10);
    const endMinute = parseInt(endParts[1], 10);
  
    // Calculate position as percentage of 24 hours
    const totalMinutesInDay = 24 * 60;
    const startMinutesFromMidnight = startHour * 60 + startMinute;
    
    // Handle case where end time might be on the next day
    let endMinutesFromMidnight = endHour * 60 + endMinute;
    if (endMinutesFromMidnight < startMinutesFromMidnight) {
      // If end time is earlier than start time, assume it's the next day
      endMinutesFromMidnight += totalMinutesInDay;
    }
    
    // Cap end time at midnight (00:00)
    const midnightMinutes = 24 * 60; // 24 hours in minutes
    if (endMinutesFromMidnight > midnightMinutes) {
      endMinutesFromMidnight = midnightMinutes;
    }
  
    // Calculate the left position (start position) as a percentage
    // The timeline starts at 1 AM, so subtract 60 minutes (1 hour) from calculations
    const adjustedStartMinutes = startMinutesFromMidnight - 60;
    const timelineMinutes = 23 * 60; // 23 hours (1 AM to midnight)
    
    const leftPosition = (adjustedStartMinutes / timelineMinutes) * 100;
    
    const durationInMinutes = endMinutesFromMidnight - startMinutesFromMidnight;
    const width = (durationInMinutes / timelineMinutes) * 100;

    if (durationInMinutes < 30) {
      return {
        left: `${Math.max(0, leftPosition)}%`,
        width: `${width + 2}%`,
      };
    }
    else if (durationInMinutes < 59) {
      return {
        left: `${Math.max(0, leftPosition)}%`,
        width: `${width + .5}%`,
      };
    }
  
    return {
      left: `${Math.max(0, leftPosition)}%`,
      width: `${width}%`,
    };
  };

  const calculateCurrentTimePosition = () => {
    const hours = currentTime.getHours();
    const minutes = currentTime.getMinutes();
  
    // Calculate position as percentage of 23 hours (1 AM to midnight)
    const timelineMinutes = 23 * 60;
    // Adjust for timeline starting at 1 AM
    const adjustedMinutesFromMidnight = (hours * 60 + minutes) - 60;
    const position = (adjustedMinutesFromMidnight / timelineMinutes) * 100;
  
    return {
      left: `${Math.max(0, position)}%`,
    };
  };
  // Check if two appointments overlap in time
  const doAppointmentsOverlap = (a: Appointment, b: Appointment): boolean => {
    const aStart = timeToMinutes(a.startTime);
    const aEnd = timeToMinutes(a.endTime);
    const bStart = timeToMinutes(b.startTime);
    const bEnd = timeToMinutes(b.endTime);
    
    // Add a small buffer (15 min) to ensure visual separation
    const buffer = 15;
    
    return !(aEnd + buffer <= bStart || bEnd + buffer <= aStart);
  };

  // Group appointments into rows where no appointments in the same row overlap
  const groupAppointmentsIntoRows = (appointments: Appointment[]): Appointment[][] => {
    if (appointments.length === 0) return [];
    
    // Sort appointments by start time
    const sortedAppointments = [...appointments].sort((a, b) => 
      timeToMinutes(a.startTime) - timeToMinutes(b.startTime)
    );
    
    const rows: Appointment[][] = [];
    
    // For each appointment, find the first row where it doesn't overlap with any existing appointment
    sortedAppointments.forEach(appointment => {
      let placed = false;
      
      for (let row of rows) {
        // Check if this appointment overlaps with any in the current row
        const hasOverlap = row.some(existingAppointment => 
          doAppointmentsOverlap(appointment, existingAppointment)
        );
        
        if (!hasOverlap) {
          // If no overlap, add to this row
          row.push(appointment);
          placed = true;
          break;
        }
      }
      
      // If we couldn't place it in any existing row, create a new row
      if (!placed) {
        rows.push([appointment]);
      }
    });
    
    return rows;
  };


  const currentTimePosition = calculateCurrentTimePosition();

  // Group appointments into rows
  const appointmentRows = groupAppointmentsIntoRows(bookings);

  

  // Render action buttons based on current status
  const renderActionButtons = (appointment: any) => {
    const status = appointment.status;

    if (status === "Pending") {
      return (
        <>
         <button
          className="px-4 py-2 border text-sm  rounded-md hover:bg-gray-50"
          onClick={handleCloseBookingDetails}
        >
          Close
        </button>
          <button
            className="px-4 py-2 border text-sm  rounded-md hover:bg-gray-50 flex items-center justify-center min-w-[80px]"
            onClick={() => {
              setLoadingStates((prev) => ({ ...prev, edit: true }));
              toggleEditBookingModal(appointment);
              handleCloseBookingDetails()

            }}
            disabled={loadingStates.edit}
          >
            {loadingStates.edit ? (
              <span className="inline-block text-sm  w-4 h-4 border-2 border-gray-500 border-t-transparent rounded-full animate-spin mr-2"></span>
            ) : null}
            Edit
          </button>
          <button
            className="px-4 py-2 border rounded-md text-sm  hover:bg-gray-50 flex items-center justify-center min-w-[80px]"
            onClick={() => updateBookingStatus(3, appointment.id, "cancel")}
            disabled={loadingStates.cancel}
          >
            {loadingStates.cancel ? (
              <span className="inline-block text-sm  w-4 h-4 border-2 border-gray-500 border-t-transparent rounded-full animate-spin mr-2"></span>
            ) : null}
            Decline
          </button>
          <button
            className="px-4 py-2 bg-[#5F35D2] text-sm  text-white rounded-md flex items-center justify-center min-w-[140px]"
            onClick={() => updateBookingStatus(1, appointment.id, "confirm")}
            disabled={loadingStates.confirm}
          >
            {loadingStates.confirm ? (
              <span className="inline-block text-sm  w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
            ) : null}
            Confirm Booking
          </button>
         
        </>
      );
    } else if (status === "Confirmed") {
      return (
        <>
          <button
          className="px-4 py-2 border text-sm  rounded-md hover:bg-gray-50"
          onClick={handleCloseBookingDetails}
        >
          Close
        </button>
          <button
            className="px-4 py-2 border rounded-md text-sm  hover:bg-gray-50 flex items-center justify-center min-w-[80px]"
            onClick={() => {
              setLoadingStates((prev) => ({ ...prev, edit: true }));
              toggleEditBookingModal(appointment);
              handleCloseBookingDetails()

            }}
            disabled={loadingStates.edit}
          >
            {loadingStates.edit ? (
              <span className="inline-block w-4 h-4 text-sm  border-2 border-gray-500 border-t-transparent rounded-full animate-spin mr-2"></span>
            ) : null}
            Edit
          </button>
          <button
            className="px-4 py-2 border rounded-md text-sm  hover:bg-gray-50 flex items-center justify-center min-w-[80px]"
            onClick={() => updateBookingStatus(3, appointment.id, "cancel")}
            disabled={loadingStates.cancel}
          >
            {loadingStates.cancel ? (
              <span className="inline-block text-sm  w-4 h-4 border-2 border-gray-500 border-t-transparent rounded-full animate-spin mr-2"></span>
            ) : null}
            Decline
          </button>
          <button
            className="px-4 py-2 bg-[#5F35D2] text-white rounded-md flex items-center justify-center min-w-[80px]"
            onClick={() => updateBookingStatus(0, appointment.id, "admit")}
            disabled={loadingStates.admit}
          >
            {loadingStates.admit ? (
              <span className="inline-block w-4 text-sm  h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
            ) : null}
            Admit
          </button>
        
        </>
      );
    } else if (status === "Admitted") {
      return (
        <>
         <button
          className="px-4 py-2 border text-sm  rounded-md hover:bg-gray-50"
          onClick={handleCloseBookingDetails}
        >
          Close
        </button>
          <button
            className="px-4 py-2 border text-sm  rounded-md hover:bg-gray-50 flex items-center justify-center min-w-[80px]"
            onClick={() => {
              setLoadingStates((prev) => ({ ...prev, edit: true }));
              toggleEditBookingModal(appointment);
              handleCloseBookingDetails()
            }}
            disabled={loadingStates.edit}
          >
            {loadingStates.edit ? (
              <span className="inline-block text-sm  w-4 h-4 border-2 border-gray-500 border-t-transparent rounded-full animate-spin mr-2"></span>
            ) : null}
            Edit
          </button>
         
        <button
            className="px-4 py-2 bg-[#5F35D2] text-white rounded-md  flex items-center justify-center min-w-[80px]"
            onClick={() => {
              setLoadingStates((prev) => ({ ...prev, complete: true }));
              updateBookingStatus(2, appointment.id, "complete")}}
            disabled={loadingStates.complete}
          >
            {loadingStates.complete ? (
              <span className="inline-block text-sm  w-4 h-4 border-2  border-gray-500 border-t-transparent rounded-full animate-spin mr-2"></span>
            ) : null}
            Complete
          </button>
        </>
      );
    } else {
      // For other statuses, just show a close button
      return (
        <button
          className="px-4 py-2 border text-sm rounded-md hover:bg-gray-50"
          onClick={handleCloseBookingDetails}
        >
          Close
        </button>
      );
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg max-w-6xl mx-auto">
      {/* Main scrollable container */}
      <div ref={scrollContainerRef} className="overflow-x-auto ">
        <div
          ref={timelineRef}
          className="relative "
          style={{ minWidth: "3950px" }}
        >
          {/* Time slots header */}
          <div className="flex border-b text-sm border-t mb-2 shadow">
            {timeSlots.map((time, index) => (
              <div
                key={index}
                className="flex-1 text-center text-[#727b8b] font-medium py-3"
              >
                {time}
              </div>
            ))}
          </div>

          {/* Current time marker */}
          <div
            className="absolute h-full w-1 bg-purple-500 top-[3rem] z-10"
            style={currentTimePosition}
          >
            <div className="w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-b-[10px] border-b-purple-500 rotate-180 -ml-2 -mt-0"></div>
          </div>

          {/* Appointment grid */}
          <div className="relative min-h-screen">
            {/* Vertical time guides */}
            <div className="absolute inset-0 flex pointer-events-none">
              {timeSlots.map((_, index) => (
                <div key={index} className="flex-1 border-l border-gray-300 h-full"></div>
              ))}
            </div>

            {/* Appointments grouped by rows */}
            {appointmentRows.map((row, rowIndex) => (
              <div key={rowIndex} className="relative z-50 h-28 mb-2">
                {row.map((appointment) => {
                  const barStyle = calculateBarStyle(
                    appointment.startTime,
                    appointment.endTime
                  );

                  return (
                    <div key={appointment.id} className="absolute h-full" style={{width: '100%'}}>
                      <div
                        className={`absolute rounded-lg p-3 shadow-sm bg-[#F7F9FB] transition-all duration-200 hover:shadow-md h-24`}
                        style={barStyle}
                      >
                        <div className="flex justify-between relative items-start">
                          <div>
                            <h3 className="font-medium text-sm text-gray-800 truncate max-w-xs">
                              {appointment.name}
                            </h3>
                            <div className="text-xs text-gray-600 mt-1">
                              <span className="mr-4">
                                Qty: {appointment.quantity}
                              </span>
                              <span>Guests: {appointment.numberOfGuest}</span>
                            </div>
                            <div className="text-xs text-gray-600 mt-1 font-medium">
                              {formatTimeWithAMPM(appointment.startTime)} - {formatTimeWithAMPM(appointment.endTime)}
                            </div>
                          </div>
                          <button
                            onClick={(e) =>
                              handleOpenBookingDetails(appointment, e)
                            }
                            className="text-gray-400 relative z-50 text-lg hover:text-gray-600"
                          >
                            •••
                          </button>
                        </div>

                        <div
                          className={`absolute bottom-0 left-0 right-0 ${getAppointmentBarColor(
                            appointment.status
                          )} h-2 rounded-b-lg`}
                        ></div>

                        <div className="absolute bottom-2 right-3 mb-1 flex items-center">
                          <span
                            className={`inline-block w-2 h-2 rounded-full mr-1 ${getStatusDotColor(
                              appointment.status
                            )}`}
                          ></span>
                          <span
                            className={`text-xs font-medium ${getStatusColor(
                              appointment.status
                            )}`}
                          >
                            {appointment.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}

            {/* Booking details modal */}
            {selectedAppointment && (
              <div
                className="absolute bg-white border shadow-lg rounded-lg z-50 p-4 w-[28rem]"
                style={{
                  left: `${modalPosition.x + 15}px`,
                  top: `${modalPosition.y}px`,
                }}
              >
                <div className="flex justify-between items-center">
                <div className="font-medium text-lg">
                  {selectedAppointment.name}
                </div>
                  <div className="flex items-center border py-[2px] text-sm gap-2 bg-[#E2E8F0] px-2 rounded-md mt-2 text-[#64748B] mb-3">
                    <span
                      className={`inline-block w-2 h-2 rounded-full ${getStatusDotColor(
                        selectedAppointment.status
                      )}`}
                    ></span>
                    <span
                      className={` ${getStatusColor(
                        selectedAppointment.status
                      )}`}
                    >
                      {selectedAppointment.status}
                    </span>
                </div>
                    </div>
                  <div className="text-gray-600 mb-2">
                    Reservation: Table for ({selectedAppointment.quantity})
                  </div>
                    <div className="flex items-center gap-2 text-gray-700 mb-1">
                  <MdOutlineMailOutline size={14} />
                  <span>{selectedAppointment.emailAddress} </span>
                </div>
                <div className="flex items-center gap-2 text-gray-700 mb-1">
                  <BiCalendar size={14} />
                  <span> {formatDate(selectedAppointment.dateCreated)}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-700 mb-1">
                  <BiCalendar size={14} />
                  <span>
                    {formatTimeWithAMPM(selectedAppointment.startTime)} -{" "}
                    {formatTimeWithAMPM(selectedAppointment.endTime)}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-gray-700 mb-3">
                  <BiUser size={14} />
                  <span>{selectedAppointment.numberOfGuest} guests</span>
                </div>
              

                <div className="flex flex-wrap gap-2 mt-3">
                  {renderActionButtons(selectedAppointment)}
                </div>
              </div>
            )}
            <EditBooking
              eachBooking={eachBooking}
              isEditBookingModal={isEditBookingModal}
              toggleEditBookingModal={toggleEditBookingModal}
              refetch={refetch} 
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppointmentScheduler;