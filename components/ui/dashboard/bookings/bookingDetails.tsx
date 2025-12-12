'use client';
import {
  statusColorMap,
  statusDataMap,
} from '@/app/dashboard/reservation/[reservationId]/data';
import { CustomButton } from '@/components/customButton';
import { submitBookingStatus } from '@/lib/utils';
import {
  Chip,
  Modal,
  ModalBody,
  ModalContent,
  Spacer,
} from '@nextui-org/react';
import { MdClose, MdEdit } from "react-icons/md";
import ReserveTableImage from "../../../../public/assets/images/reserve-table.svg";
import Image from "next/image";
import { FiEdit } from "react-icons/fi";
import usePermission from "@/hooks/cachedEndpoints/usePermission";

const BookingDetails = ({
  openBookingModal,
  updateBookingStatus,
  closeBookingModal,
  setBookingId,
  isLoading,
  bookingDetails,
  openEditModal,
}: any) => {
  const { userRolePermissions, role } = usePermission();

  const getButtonText = () => {
    switch (bookingDetails?.bookingStatus) {
      case 0:
        return "Accept this booking";
      case 1:
        return "Admit customer";
      case 2:
        return "Close this booking";
      default:
        return "Admit";
    }
  };

  const shouldShowButton = ![3, 5, 6, 4].includes(
    bookingDetails?.bookingStatus
  );

  return (
    <Modal
      isDismissable={false}
      isOpen={openBookingModal}
      onOpenChange={() => {
        setBookingId("");
        closeBookingModal();
      }}
      classNames={{
        base: "max-w-md",
        closeButton: "hidden",
      }}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalBody className="p-6">
              {/* Header with icons */}
              <div className="flex justify-end gap-2 ">
                {(role === 0 || userRolePermissions?.canEditOrder === true) &&
                  bookingDetails?.bookingStatus !== 6 &&
                  bookingDetails?.bookingStatus !== 4 &&
                  bookingDetails?.bookingStatus !== 5 && (
                    <button
                      type="button"
                      onClick={openEditModal}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      aria-label="Edit booking"
                    >
                      <FiEdit size={20} className="text-gray-600" />
                    </button>
                  )}
                <button
                  type="button"
                  onClick={() => {
                    setBookingId("");
                    closeBookingModal();
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  aria-label="Close modal"
                >
                  <MdClose size={20} className="text-gray-600" />
                </button>
              </div>

              <div className="text-center mb-6">
                <div className="flex justify-center items-center mb-3">
                  <Image
                    className="w-[220px] h-[40px] bg-cover rounded-lg"
                    width={220}
                    height={40}
                    alt="reserve table"
                    aria-label="reserve table"
                    src={ReserveTableImage}
                  />
                </div>
                <h2 className="text-2xl font-bold text-gray-800">
                  {bookingDetails.firstName} {bookingDetails.lastName}
                </h2>
              </div>

              {/* Booking details in single column format */}
              <div className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <p className="text-xs text-gray-500">Reservation ID</p>
                    <p className="font-semibold text-gray-800 text-sm">
                      {bookingDetails?.reference || "N/A"}
                    </p>
                  </div>

                  <div className="flex justify-between items-start">
                    <p className="text-xs text-gray-500">Reservation Type</p>
                    <p className="font-medium text-gray-800 text-sm text-right">
                      {bookingDetails.reservationName ||
                        bookingDetails.reservation?.reservationName}
                    </p>
                  </div>

                  <div className="flex justify-between items-start">
                    <p className="text-xs text-gray-500">
                      Number of Reservation:
                    </p>
                    <p className="font-medium text-gray-800 text-sm">
                      {bookingDetails.quantity}
                    </p>
                  </div>

                  <div className="flex justify-between items-start">
                    <p className="text-xs text-gray-500">Phone Number:</p>
                    <p className="font-medium text-gray-800 text-sm">
                      {bookingDetails.phoneNumber}
                    </p>
                  </div>

                  <div className="flex justify-between items-start">
                    <p className="text-xs text-gray-500">Email Address:</p>
                    <p className="font-medium text-gray-800 text-sm text-right break-all">
                      {bookingDetails.emailAddress}
                    </p>
                  </div>

                  <div className="flex justify-between items-start">
                    <p className="text-xs text-gray-500">Reserved Time:</p>
                    <p className="font-medium text-gray-800 text-sm">
                      {new Date(
                        bookingDetails.bookingDateTime
                      ).toLocaleTimeString("en-US", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>

                  <div className="flex justify-between items-start">
                    <p className="text-xs text-gray-500">Reserved Date:</p>
                    <p className="font-medium text-gray-800 text-sm">
                      {new Date(
                        bookingDetails.bookingDateTime
                      ).toLocaleDateString("en-US", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>

                {/* Special Request */}
                {bookingDetails.description && (
                  <div>
                    <p className="text-xs text-gray-500 mb-2">
                      Special Request
                    </p>
                    <div className="bg-purple-50 min-h-[100px] rounded-lg p-4">
                      <p className="text-sm text-gray-700">
                        {bookingDetails.description}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Action buttons */}
              {shouldShowButton && (
                <div className="mt-6 flex gap-3">
                  <CustomButton
                    className="flex-1 h-[48px] text-white "
                    loading={isLoading}
                    onClick={() =>
                      updateBookingStatus(
                        submitBookingStatus(bookingDetails?.bookingStatus)
                      )
                    }
                    disabled={isLoading}
                    type="submit"
                  >
                    {isLoading ? "Processing..." : getButtonText() + " →"}
                  </CustomButton>
                  {bookingDetails?.bookingStatus === 0 && (
                    <CustomButton
                      backgroundColor="bg-gray-200"
                      className="flex-1 h-[48px] text-gray-700 hover:bg-gray-300"
                      onClick={() => updateBookingStatus(3, false)}
                      disabled={isLoading}
                      type="submit"
                    >
                      Cancel Booking ✕
                    </CustomButton>
                  )}
                </div>
              )}
            </ModalBody>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default BookingDetails;
