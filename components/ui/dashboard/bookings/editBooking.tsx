"use client";
import { updateBooking } from "@/app/api/controllers/dashboard/bookings";
import { CustomInput } from "@/components/CustomInput";
import { CustomButton } from "@/components/customButton";
import { CustomTextArea } from "@/components/customTextArea";
import { selectClassNames } from "@/components/selectInput";
import useReservation from "@/hooks/cachedEndpoints/useReservation";
import {
  formatDateTimeForPayload,
  formatPrice,
  getJsonItemFromLocalStorage,
  notify,
} from "@/lib/utils";
import { useQueryClient } from '@tanstack/react-query';
import { InfoCircle } from "@/public/assets/svg";
import {
  CalendarDateTime,
  getLocalTimeZone,
  now,
  today,
} from "@internationalized/date";
import { DatePicker } from "@nextui-org/date-picker";
import {
  Modal,
  ModalBody,
  ModalContent,
  ScrollShadow,
  Select,
  SelectItem,
  Spacer,
} from "@nextui-org/react";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { MdOutlineMailOutline, MdOutlinePhone } from "react-icons/md";
import { IoRemoveCircleOutline, IoAddCircleOutline } from "react-icons/io5";
import noImage from "../../../../public/assets/images/no-image.svg";
import ReserveTableImage from "../../../../public/assets/images/reserve-table.svg";

const EditBooking = ({
  isEditBookingModal,
  toggleEditBookingModal,
  eachBooking,
  refetch,
}: any) => {
  const businessInformation = getJsonItemFromLocalStorage("business");
  const userInformation = getJsonItemFromLocalStorage("userInformation");
  const { data } = useReservation();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [quantity, setQuantity] = useState<number>(eachBooking?.quantity || 1);
  const [noOfGuests, setNoOfGuests] = useState<number>(
    eachBooking?.noOfGuests || 1
  ); // Add state for noOfGuests

  const convertAPIDateToLocalDate = (dateString: string) => {
    if (!dateString) return now(getLocalTimeZone());

    try {
      const date = new Date(dateString);
      return new CalendarDateTime(
        date.getFullYear(),
        date.getMonth() + 1,
        date.getDate(),
        date.getHours(),
        date.getMinutes(),
        date.getSeconds()
      );
    } catch (error) {
      return now(getLocalTimeZone());
    }
  };
  const findReservationById = (reservationId: string) => {
    return (
      data?.reservations?.find(
        (reservation: any) => reservation.id === reservationId
      ) || null
    );
  };

  const [timeNdate, setTimeNdate] = useState(
    convertAPIDateToLocalDate(eachBooking?.bookingDateTime)
  );
  const [selectedTime, setSelectedTime] = useState("");

  const [bookings, setBookings] = useState<any>({
    firstName: eachBooking?.firstName || "",
    lastName: eachBooking?.lastName || "",
    email: eachBooking?.emailAddress || "",
    phoneNumber: eachBooking?.phoneNumber || "",
    description: eachBooking?.description || "",
  });
  const [selectedReservation, setSelectedReservation] = useState(
    findReservationById(eachBooking?.reservationId)
  );

  const [id, setId] = useState(eachBooking?.id || "");

  // Track initial values to detect changes
  const [initialValues, setInitialValues] = useState<any>(null);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (eachBooking && data?.reservations) {
      // Get reservationId from either direct field or nested reservation object
      const resId = eachBooking.reservationId || eachBooking.reservation?.id || "";

      setBookings({
        reservationId: resId,
        firstName: eachBooking.firstName || "",
        lastName: eachBooking.lastName || "",
        email: eachBooking.emailAddress || "",
        phoneNumber: eachBooking.phoneNumber || "",
        description: eachBooking.description || "",
      });
      const reservation = findReservationById(resId);
      setSelectedReservation(reservation);
      setQuantity(eachBooking.quantity || 1);
      setNoOfGuests(eachBooking.numberOfGuest || eachBooking.numberOfGuests || 1);
      setId(eachBooking.id || "");

      let extractedTime = "";
      if (eachBooking.bookingDateTime) {
        const dateTime = convertAPIDateToLocalDate(eachBooking.bookingDateTime);
        setTimeNdate(dateTime);
        // Extract time in HH:mm format
        const hours = String(dateTime.hour).padStart(2, "0");
        const minutes = String(dateTime.minute).padStart(2, "0");
        extractedTime = `${hours}:${minutes}`;
        setSelectedTime(extractedTime);
      }

      // Store initial values for comparison
      setInitialValues({
        reservationId: resId,
        email: eachBooking.emailAddress || "",
        phoneNumber: eachBooking.phoneNumber || "",
        description: eachBooking.description || "",
        quantity: eachBooking.quantity || 1,
        numberOfGuest: eachBooking.numberOfGuest || eachBooking.numberOfGuests || 1,
        bookingDateTime: eachBooking.bookingDateTime || "",
        selectedTime: extractedTime,
      });

      // Reset hasChanges when booking data loads
      setHasChanges(false);
    }
  }, [eachBooking, data?.reservations]);

  // Check for changes whenever relevant values update
  useEffect(() => {
    if (!initialValues) return;

    try {
      const changed =
        bookings.reservationId !== initialValues.reservationId ||
        bookings.email !== initialValues.email ||
        bookings.phoneNumber !== initialValues.phoneNumber ||
        bookings.description !== initialValues.description ||
        quantity !== initialValues.quantity ||
        noOfGuests !== initialValues.numberOfGuest ||
        selectedTime !== initialValues.selectedTime;

      setHasChanges(changed);
    } catch (error) {
      console.error("Error checking for changes:", error);
    }
  }, [bookings, quantity, noOfGuests, timeNdate, selectedTime, initialValues]);

  const formSubmit = () => {
    return (
      bookings.firstName &&
      bookings.lastName &&
      bookings.email &&
      timeNdate &&
      selectedTime &&
      id &&
      hasChanges
    );
  };
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setResponse(null);
    const { name, value } = e.target;
    setBookings((prevFormData: any) => ({
      ...prevFormData,
      [name]: value,
    }));
  };

  const updateBookingHandler = async (e) => {
    e.preventDefault();

    // Validate required fields before submitting
    if (!bookings.reservationId) {
      notify({
        title: "Error!",
        text: "Reservation type is required",
        type: "error",
      });
      return;
    }

    if (!id) {
      notify({
        title: "Error!",
        text: "Booking ID is missing",
        type: "error",
      });
      return;
    }

    let combinedDateTime = timeNdate;
    if (selectedTime) {
      const [hours, minutes] = selectedTime.split(":");
      combinedDateTime = timeNdate.set({
        hour: parseInt(hours),
        minute: parseInt(minutes),
      });
    }

    const payload = {
      reservationId: bookings.reservationId,
      firstName: bookings.firstName,
      lastName: bookings.lastName,
      emailAddress: bookings.email,
      phoneNumber: bookings.phoneNumber,
      bookingDateTime: `${formatDateTimeForPayload(combinedDateTime)}Z`,
      description: bookings.description,
      quantity: quantity,
      numberOfGuest: noOfGuests,
    };

    setIsLoading(true);
    try {
      const response = await updateBooking(
        businessInformation[0]?.businessId,
        payload,
        userInformation.cooperateID,
        userInformation.id,
        id
      );

      if (response?.data?.isSuccessful) {
        notify({
          title: "Success!",
          text: "Booking updated successfully",
          type: "success",
        });
        await queryClient.invalidateQueries("bookingCategories");
        await queryClient.invalidateQueries(["bookingDetails"]);
        refetch();
        toggleEditBookingModal(null);
      } else if (response?.data?.error) {
        notify({
          title: "Error!",
          text: response?.data?.error,
          type: "error",
        });
      }
    } catch (error) {
      notify({
        title: "Error!",
        text: "Failed to update booking",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const Reservations = ({ reservation }: any) => {
    return (
      <div className="flex">
        <Image
          className="h-[60px] w-[60px] bg-cover rounded-lg"
          width={60}
          height={60}
          alt="reservation"
          aria-label="reservation"
          src={
            reservation.image
              ? `data:image/jpeg;base64,${reservation.image}`
              : noImage
          }
        />

        <div className="ml-5 gap-1 grid place-content-center">
          <p className="font-bold text-sm mb-1">
            {reservation.reservationName}
          </p>

          <div>
            <p className="text-sm">Reservation Fee</p>
            <p className="font-bold text-sm">
              {formatPrice(reservation.reservationFee)}
            </p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Modal
      size="3xl"
      isDismissable={false}
      isOpen={isEditBookingModal}
      onOpenChange={() => toggleEditBookingModal(null)}
      classNames={{
        base: "bg-white",
        closeButton: "hover:bg-white/5 active:bg-white/10 text-black",
      }}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalBody className="p-6">
              {/* Header with decorative elements */}
              <div className="text-center mt-4 relative">
                <div className="flex justify-center items-center mb-3">
                  <Image
                    className="w-[220px] h-[50px] bg-cover rounded-lg"
                    width={220}
                    height={50}
                    alt="reserve table"
                    aria-label="reserve table"
                    src={ReserveTableImage}
                  />
                </div>
                <div className="flex items-center justify-center gap-2 mb-2">
                  <h1 className="text-2xl font-bold">
                    <span className="text-gray-800">Dine with Us - </span>
                    <span className="text-primaryColor">Edit Booking</span>
                  </h1>
                </div>
              </div>
              <ScrollShadow size={5} className="w-full max-h-[500px]">
                <form onSubmit={updateBookingHandler} className="">
                  <div className="p-6 bg-gray-50 rounded-xl space-y-4">
                    {/* Name and Email row */}
                    <div className="grid grid-cols-2 gap-4">
                      <CustomInput
                        type="text"
                        value={`${bookings.firstName} ${bookings.lastName}`}
                        errorMessage={response?.errors?.firstName?.[0]}
                        onChange={handleInputChange}
                        name="firstName"
                        label="Name"
                        placeholder="Enter your name"
                        disabled
                      />
                      <CustomInput
                        type="email"
                        value={bookings.email}
                        errorMessage={response?.errors?.email?.[0]}
                        onChange={handleInputChange}
                        name="email"
                        label="Email"
                        placeholder="Enter your email"
                      />
                    </div>

                    {/* Phone number and Number of Guests row */}
                    <div className="grid grid-cols-2 gap-4">
                      <CustomInput
                        type="tel"
                        value={bookings.phoneNumber}
                        errorMessage={response?.errors?.phoneNumber?.[0]}
                        onChange={handleInputChange}
                        name="phoneNumber"
                        label="Phone number"
                        placeholder="Enter your phone number"
                      />

                      {/* Number of Guests with inline controls */}
                      <div className="-mt-0.5">
                        <label className="font-[500] text-black text-[14px] block mb-2">
                          Number of Guests
                        </label>
                        <div className="relative flex items-center h-[48px] border-1 border-gray-250 bg-white rounded-md">
                          <button
                            type="button"
                            onClick={() => {
                              noOfGuests > 1
                                ? setNoOfGuests((prev) => prev - 1)
                                : null;
                            }}
                            className="text-gray-500 p-3 flex items-center justify-center"
                            aria-label="Decrease number of guests"
                          >
                            <IoRemoveCircleOutline size={24} />
                          </button>
                          <div className="flex-1 text-center text-black font-medium">
                            {noOfGuests}
                          </div>
                          <button
                            type="button"
                            onClick={() => setNoOfGuests((prev) => prev + 1)}
                            className="text-gray-500 p-3 flex items-center justify-center"
                            aria-label="Increase number of guests"
                          >
                            <IoAddCircleOutline size={24} />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Select Type of Reservation and Number of Reservation row */}
                    <div className="grid grid-cols-2 gap-4">
                      {/* Select Type of Reservation */}
                      <div>
                        <Select
                          labelPlacement="outside"
                          key="outside"
                          variant={"bordered"}
                          errorMessage={response?.errors?.reservationId?.[0]}
                          items={data?.reservations || []}
                          selectedKeys={
                            selectedReservation ? [selectedReservation.id] : []
                          }
                          onSelectionChange={(keys) => {
                            const selectedKey = Array.from(keys)[0];
                            if (selectedKey) {
                              const reservation = findReservationById(
                                String(selectedKey)
                              );
                              setSelectedReservation(reservation);
                              setBookings((prevFormData: any) => ({
                                ...prevFormData,
                                reservationId: String(selectedKey),
                              }));
                            }
                          }}
                          size="lg"
                          label="Select Type of Reservation"
                          placeholder="Date Night Table for Two"
                          disallowEmptySelection={false}
                          classNames={{
                            ...selectClassNames,
                            value: "text-gray-500 text-sm",
                            trigger: "data-[hover=true]:border-gray-300",
                          }}
                          renderValue={(items) => {
                            if (!items || items.length === 0) {
                              return (
                                <span className="text-gray-400">
                                  {eachBooking?.reservationName ||
                                    "Date Night Table for Two"}
                                </span>
                              );
                            }
                            return items.map((item) => (
                              <span key={item.key} className="text-black">
                                {item.textValue}
                              </span>
                            ));
                          }}
                        >
                          {(reservation) => (
                            <SelectItem
                              className="text-black"
                              key={reservation.id}
                              textValue={reservation.reservationName}
                            >
                              <Reservations reservation={reservation} />
                            </SelectItem>
                          )}
                        </Select>
                      </div>

                      {/* Number of Reservation with inline controls */}
                      <div className="-mt-0.5">
                        <label className="font-[500] text-black text-[14px] block mb-2">
                          Number of Reservation
                        </label>
                        <div className="relative flex items-center h-[48px] border-1 border-gray-200 rounded-md bg-white">
                          <button
                            type="button"
                            onClick={() => {
                              quantity > 1
                                ? setQuantity((prev) => prev - 1)
                                : null;
                            }}
                            className="text-gray-500 p-3 flex items-center justify-center"
                            aria-label="Decrease number of reservations"
                          >
                            <IoRemoveCircleOutline size={24} />
                          </button>
                          <div className="flex-1 text-center text-black font-medium">
                            {quantity}
                          </div>
                          <button
                            type="button"
                            onClick={() => setQuantity((prev) => prev + 1)}
                            className="text-gray-500 p-3 flex items-center justify-center"
                            aria-label="Increase number of reservations"
                          >
                            <IoAddCircleOutline size={24} />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Date and Time row */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="font-[500] text-black text-[14px] block mb-2">
                          Date
                        </label>
                        <DatePicker
                          calendarWidth={270}
                          variant="bordered"
                          hideTimeZone
                          size="lg"
                          radius="sm"
                          granularity="day"
                          errorMessage={response?.errors?.timeNdate?.[0]}
                          value={timeNdate}
                          onChange={setTimeNdate}
                          showMonthAndYearPickers
                          minValue={today(getLocalTimeZone())}
                          classNames={{
                            base: "bg-white shadow-none",
                            input: "text-black bg-white",
                            inputWrapper: "border-2 rounded-sm border-gray-200",
                          }}
                        />
                      </div>

                      <div className="mt-0.5">
                        <CustomInput
                          type="time"
                          value={selectedTime}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            setSelectedTime(e.target.value)
                          }
                          label="Time"
                          placeholder="00 : 00"
                        />
                      </div>
                    </div>

                    {/* Special Request */}
                    <CustomTextArea
                      value={bookings.description}
                      name="description"
                      errorMessage={response?.errors?.description?.[0]}
                      onChange={handleInputChange}
                      label="Special Request"
                      placeholder="Add a special request to wow your guest"
                    />
                  </div>
                  {/* Submit Button */}
                  <div className="my-6 flex justify-center items-center">
                    <CustomButton
                      loading={isLoading}
                      disabled={isLoading || !formSubmit()}
                      type="submit"
                      className="font-semibold text-white"
                    >
                      {isLoading ? "Updating..." : "Update Booking →"}
                    </CustomButton>
                  </div>
                </form>
              </ScrollShadow>
              <Spacer y={4} />
            </ModalBody>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default EditBooking;
