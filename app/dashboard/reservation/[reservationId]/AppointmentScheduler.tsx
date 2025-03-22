import { postBookingStatus } from "@/app/api/controllers/dashboard/bookings";
import EditBooking from "@/components/ui/dashboard/bookings/editBooking";
import { notify } from "@/lib/utils";
import { User } from "@nextui-org/react";
import React, { useState, useEffect, useRef } from "react";
import { BiCalendar, BiUser } from "react-icons/bi";

// TypeScript interfaces
interface Appointment {
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
    | "Admitted";
}

// Define color types for type safety
type StatusColor =
  | "text-red-500"
  | "text-green-500"
  | "text-yellow-500"
  | "text-blue-400"
  | "text-green-400"
  | "text-purple-500"
  | "text-gray-500";
type BarColor =
  | "bg-red-200"
  | "bg-green-200"
  | "bg-yellow-200"
  | "bg-blue-200"
  | "bg-purple-200"
  | "bg-gray-200";
type DotColor =
  | "bg-red-500"
  | "bg-green-500"
  | "bg-yellow-500"
  | "bg-blue-400"
  | "bg-green-400"
  | "bg-purple-500"
  | "bg-gray-500";
type PatternColor =
  | "bg-yellow-100"
  | "bg-green-100"
  | "bg-orange-100"
  | "bg-red-100"
  | "bg-purple-100"
  | "bg-gray-100";

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
    actionType: "confirm" | "admit" | "cancel" | "close"
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
    } catch (error) {
      notify({
        title: "Error",
        text: "Operation failed",
        type: "error",
      });
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
    "00 AM",
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
    "13 PM",
    "14 PM",
    "15 PM",
    "16 PM",
    "17 PM",
    "18 PM",
    "19 PM",
    "20 PM",
    "21 PM",
    "22 PM",
    "23 PM",
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
        return "text-red-500";
      case "Completed":
        return "text-green-500";
      case "Expired":
        return "text-yellow-500";
      case "Pending":
        return "text-blue-400";
      case "Confirmed":
        return "text-green-400";
      case "Admitted":
        return "text-purple-500";
      default:
        return "text-gray-500";
    }
  };

  // Get appointment bar color
  const getAppointmentBarColor = (status: Appointment["status"]): BarColor => {
    switch (status) {
      case "Rejected":
        return "bg-red-200";
      case "Completed":
        return "bg-green-200";
      case "Expired":
        return "bg-yellow-200";
      case "Pending":
        return "bg-blue-200";
      case "Confirmed":
        return "bg-green-200";
      case "Admitted":
        return "bg-purple-200";
      default:
        return "bg-gray-200";
    }
  };

  // Get status dot color
  const getStatusDotColor = (status: Appointment["status"]): DotColor => {
    switch (status) {
      case "Rejected":
        return "bg-red-500";
      case "Completed":
        return "bg-green-500";
      case "Expired":
        return "bg-yellow-500";
      case "Pending":
        return "bg-blue-400";
      case "Confirmed":
        return "bg-green-400";
      case "Admitted":
        return "bg-purple-500";
      default:
        return "bg-gray-500";
    }
  };

  // Calculate position and width for appointment bars based on 24-hour grid
  // Calculate position and width for appointment bars based on 24-hour grid
  const calculateBarStyle = (
    startTime: string,
    endTime: string
  ): React.CSSProperties => {
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

    // Calculate the left position (start position) as a percentage
    const leftPosition = (startMinutesFromMidnight / totalMinutesInDay) * 100;

    // Calculate the width as a percentage
    const durationInMinutes = endMinutesFromMidnight - startMinutesFromMidnight;
    const width = (durationInMinutes / totalMinutesInDay) * 100;

    // Ensure width doesn't exceed 100%
    const clampedWidth = Math.min(width, 100 - leftPosition);

    return {
      left: `${leftPosition}%`,
      width: `${clampedWidth}%`,
    };
  };

  // Calculate current time marker position
  const calculateCurrentTimePosition = (): React.CSSProperties => {
    const hours = currentTime.getHours();
    const minutes = currentTime.getMinutes();

    // Calculate position as percentage of 24 hours
    const totalMinutesInDay = 24 * 60;
    const currentMinutesFromMidnight = hours * 60 + minutes;
    const position = (currentMinutesFromMidnight / totalMinutesInDay) * 100;

    return {
      left: `${position}%`,
    };
  };

  const currentTimePosition = calculateCurrentTimePosition();

  // Render action buttons based on current status
  const renderActionButtons = (appointment: any) => {
    const status = appointment.status;

    if (status === "Pending") {
      return (
        <>
          <button
            className="px-4 py-2 border rounded-md hover:bg-gray-50 flex items-center justify-center min-w-[80px]"
            onClick={() => {
              setLoadingStates((prev) => ({ ...prev, edit: true }));
              toggleEditBookingModal(appointment);
            }}
            disabled={loadingStates.edit}
          >
            {loadingStates.edit ? (
              <span className="inline-block w-4 h-4 border-2 border-gray-500 border-t-transparent rounded-full animate-spin mr-2"></span>
            ) : null}
            Edit
          </button>
          <button
            className="px-4 py-2 border rounded-md hover:bg-gray-50 flex items-center justify-center min-w-[80px]"
            onClick={() => updateBookingStatus(3, appointment.id, "cancel")}
            disabled={loadingStates.cancel}
          >
            {loadingStates.cancel ? (
              <span className="inline-block w-4 h-4 border-2 border-gray-500 border-t-transparent rounded-full animate-spin mr-2"></span>
            ) : null}
            Decline
          </button>
          <button
            className="px-4 py-2 bg-[#5F35D2] text-white rounded-md flex items-center justify-center min-w-[140px]"
            onClick={() => updateBookingStatus(1, appointment.id, "confirm")}
            disabled={loadingStates.confirm}
          >
            {loadingStates.confirm ? (
              <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
            ) : null}
            Confirm Booking
          </button>
        </>
      );
    } else if (status === "Confirmed") {
      return (
        <>
          <button
            className="px-4 py-2 border rounded-md hover:bg-gray-50 flex items-center justify-center min-w-[80px]"
            onClick={() => {
              setLoadingStates((prev) => ({ ...prev, edit: true }));
              toggleEditBookingModal(appointment);
            }}
            disabled={loadingStates.edit}
          >
            {loadingStates.edit ? (
              <span className="inline-block w-4 h-4 border-2 border-gray-500 border-t-transparent rounded-full animate-spin mr-2"></span>
            ) : null}
            Edit
          </button>
          <button
            className="px-4 py-2 border rounded-md hover:bg-gray-50 flex items-center justify-center min-w-[80px]"
            onClick={() => updateBookingStatus(3, appointment.id, "cancel")}
            disabled={loadingStates.cancel}
          >
            {loadingStates.cancel ? (
              <span className="inline-block w-4 h-4 border-2 border-gray-500 border-t-transparent rounded-full animate-spin mr-2"></span>
            ) : null}
            Decline
          </button>
          <button
            className="px-4 py-2 bg-[#5F35D2] text-white rounded-md flex items-center justify-center min-w-[80px]"
            onClick={() => updateBookingStatus(2, appointment.id, "admit")}
            disabled={loadingStates.admit}
          >
            {loadingStates.admit ? (
              <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
            ) : null}
            Admit
          </button>
        </>
      );
    } else if (status === "Admitted") {
      return (
        <>
          <button
            className="px-4 py-2 border rounded-md hover:bg-gray-50 flex items-center justify-center min-w-[80px]"
            onClick={() => {
              setLoadingStates((prev) => ({ ...prev, edit: true }));
              toggleEditBookingModal(appointment);
            }}
            disabled={loadingStates.edit}
          >
            {loadingStates.edit ? (
              <span className="inline-block w-4 h-4 border-2 border-gray-500 border-t-transparent rounded-full animate-spin mr-2"></span>
            ) : null}
            Edit
          </button>
          <button
          className="px-4 py-2 border rounded-md hover:bg-gray-50"
          onClick={handleCloseBookingDetails}
        >
          Close
        </button>
        </>
      );
    } else {
      // For other statuses, just show a close button
      return (
        <button
          className="px-4 py-2 border rounded-md hover:bg-gray-50"
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
      <div ref={scrollContainerRef} className="overflow-x-auto">
        <div
          ref={timelineRef}
          className="relative"
          style={{ minWidth: "4000px" }}
        >
          {/* Time slots header */}
          <div className="flex border-b  border-t shadow">
            {timeSlots.map((time, index) => (
              <div
                key={index}
                className="flex-1 text-center text-gray-600 font-medium py-3"
              >
                {time}
              </div>
            ))}
          </div>

          {/* Current time marker */}
          <div
            className="absolute h-full w-1 bg-purple-500 z-10"
            style={currentTimePosition}
          >
            <div className="w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-b-[10px] border-b-purple-500 rotate-180 -ml-2 -mt-0"></div>
          </div>

          {/* Appointment grid */}
          <div className="relative min-h-screen">
            {/* Vertical time guides */}
            <div className="absolute inset-0 flex pointer-events-none">
              {timeSlots.map((_, index) => (
                <div key={index} className="flex-1 border-l h-full"></div>
              ))}
            </div>

            {/* Appointments */}
            {bookings.map((appointment) => {
              const barStyle = calculateBarStyle(
                appointment.startTime,
                appointment.endTime
              );

              return (
                <div key={appointment.id} className="relative mb-6 h-40">
                  <div
                    className={`absolute rounded-lg p-5 mt-2 shadow-sm bg-[#F7F9FB]  transition-all duration-200 hover:shadow-md`}
                    style={barStyle}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-lg text-gray-800">
                          {appointment.name}
                        </h3>
                        <div className="text-sm text-gray-600 mt-2">
                          <span className="mr-4">
                            Quantity: {appointment.quantity}
                          </span>
                          <span>No of guests: {appointment.guests}</span>
                        </div>
                        <div className="text-sm text-gray-600 mt-2 font-medium">
                          {appointment.startTime} - {appointment.endTime}
                        </div>
                      </div>
                      <button
                        onClick={(e) =>
                          handleOpenBookingDetails(appointment, e)
                        }
                        className="text-gray-400 text-xl hover:text-gray-600"
                      >
                        •••
                      </button>
                    </div>

                    <div
                      className={`absolute bottom-0 left-0 right-0 ${getAppointmentBarColor(
                        appointment.status
                      )} h-2 rounded-b-lg`}
                    ></div>

                    <div className="absolute bottom-4 right-5 justify-between items-center">
                      <span
                        className={`inline-block w-2 h-2 rounded-full mr-2 ${getStatusDotColor(
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
                  <div className="relative">
                    <div className="grid grid-cols-7 h-full gap-0 relative"></div>
                  </div>
                </div>
              );
            })}

            {/* Booking details modal */}
            {selectedAppointment && (
              <div
                className="absolute bg-white shadow-lg rounded-lg z-20 p-4 w-96"
                style={{
                  left: `${modalPosition.x}px`,
                  top: `${modalPosition.y}px`,
                }}
              >
                <div className="flex justify-between items-center">
                <div className="font-medium text-lg">
                  {selectedAppointment.name}
                </div>
                  <div className="flex items-center gap-2 text-gray-700 mb-3">
                    <span
                      className={`inline-block w-2 h-2 rounded-full ${getStatusDotColor(
                        selectedAppointment.status
                      )}`}
                    ></span>
                    <span
                      className={`${getStatusColor(
                        selectedAppointment.status
                      )}`}
                    >
                      {selectedAppointment.status}
                    </span>
                </div>
                    </div>
                  <div className="text-gray-600 mb-2">
                    Reservation: Table for {selectedAppointment.quantity}
                  </div>
                <div className="flex items-center gap-2 text-gray-700 mb-1">
                  <BiCalendar size={14} />
                  <span> {selectedAppointment.dateCreated}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-700 mb-1">
                  <BiCalendar size={14} />
                  <span>
                    {selectedAppointment.startTime} -{" "}
                    {selectedAppointment.endTime}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-gray-700 mb-3">
                  <BiUser size={14} />
                  <span>{selectedAppointment.guests} guests</span>
                </div>

                <div className="flex flex-wrap gap-2 mt-2">
                  {renderActionButtons(selectedAppointment)}
                </div>
                <button
                  className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
                  onClick={handleCloseBookingDetails}
                >
                  ✕
                </button>
              </div>
            )}
            <EditBooking
              eachBooking={eachBooking}
              isEditBookingModal={isEditBookingModal}
              toggleEditBookingModal={toggleEditBookingModal}
              refetch={() => {}} // Add proper refetch function here
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppointmentScheduler;
