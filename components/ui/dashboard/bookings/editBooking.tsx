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
import noImage from "../../../../public/assets/images/no-image.svg";

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

  useEffect(() => {
    if (eachBooking && data?.reservations) {
      setBookings({
        reservationId: eachBooking.reservationId || "",
        firstName: eachBooking.firstName || "",
        lastName: eachBooking.lastName || "",
        email: eachBooking.emailAddress || "",
        phoneNumber: eachBooking.phoneNumber || "",
        description: eachBooking.description || "",
      });
      const reservation = findReservationById(eachBooking.reservationId);
      setSelectedReservation(reservation);
      setQuantity(eachBooking.quantity || 1);
      setNoOfGuests(eachBooking.numberOfGuest || 1);
      setId(eachBooking.id || "");
      if (eachBooking.bookingDateTime) {
        setTimeNdate(convertAPIDateToLocalDate(eachBooking.bookingDateTime));
      }
    }
  }, [eachBooking, data?.reservations]);

  const formSubmit = () => {
    return (
      bookings.firstName &&
      bookings.lastName &&
      bookings.email &&
      timeNdate &&
      id
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
    const payload = {
      reservationId: bookings.reservationId,
      firstName: bookings.firstName,
      lastName: bookings.lastName,
      emailAddress: bookings.email,
      phoneNumber: bookings.phoneNumber,
      bookingDateTime: `${formatDateTimeForPayload(timeNdate)}Z`,
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
        eachBooking.id
      );

      if (response?.data?.isSuccessful) {
        notify({
          title: "Success!",
          text: "Booking updated successfully",
          type: "success",
        });
        await queryClient.invalidateQueries('bookingCategories');
        await queryClient.invalidateQueries(['bookingDetails']);
        refetch();
        toggleEditBookingModal();
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

  const handleReservationChange = (e) => {
    const reservationId = e.target.value;
    const reservation = findReservationById(reservationId);
    setSelectedReservation(reservation);
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
      size="5xl"
      isDismissable={false}
      isOpen={isEditBookingModal}
      onOpenChange={toggleEditBookingModal}
      classNames={{
        wrapper: " z-[9999]",
      }}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalBody>
              <h2 className="text-[24px] leading-3 py-8 text-black font-semibold">
                Update this booking
              </h2>
              <ScrollShadow size={5} className="w-full h-[500px]">
                <form onSubmit={updateBookingHandler}>
                  <div className="grid grid-cols-2 gap-4">
                    <CustomInput
                      type="text"
                      value={bookings.firstName}
                      errorMessage={response?.errors?.firstName?.[0]}
                      onChange={handleInputChange}
                      name="firstName"
                      label="First name"
                      placeholder="First name"
                      disabled
                    />
                    <CustomInput
                      type="text"
                      value={bookings.lastName}
                      errorMessage={response?.errors?.lastName?.[0]}
                      onChange={handleInputChange}
                      name="lastName"
                      label="Last name"
                      placeholder="Last name"
                      disabled
                    />
                  </div>
                  <Spacer y={5} />
                  <div className="grid grid-cols-2 gap-4">
                    <CustomInput
                      type="text"
                      value={bookings.email}
                      errorMessage={response?.errors?.email?.[0]}
                      onChange={handleInputChange}
                      name="email"
                      endContent={
                        <MdOutlineMailOutline className="text-grey500" />
                      }
                      label="Email address"
                      placeholder="Enter email"
                    />
                    <CustomInput
                      type="text"
                      value={bookings.phoneNumber}
                      errorMessage={response?.errors?.phoneNumber?.[0]}
                      onChange={handleInputChange}
                      name="phoneNumber"
                      endContent={<MdOutlinePhone className="text-grey500" />}
                      label="Phone number"
                      placeholder="Enter phone number (Optional)"
                    />
                  </div>
                  <Spacer y={5} />
                  <CustomTextArea
                    value={bookings.description}
                    name="description"
                    errorMessage={response?.errors?.description?.[0]}
                    onChange={handleInputChange}
                    label="Add a description to this booking"
                    placeholder="Add a description"
                  />
                  <Spacer y={5} />

                  <Select
                    labelPlacement="outside"
                    key="outside"
                    variant={"bordered"}
                    errorMessage={response?.errors?.reservationId?.[0]}
                    items={data?.reservations || []}
                    value={selectedReservation?.id}
                    onChange={handleReservationChange}
                    size="lg"
                    className="text-black"
                    label="Choose reservation"
                    placeholder={
                      eachBooking?.reservationName || "Select reservation"
                    }
                    classNames={selectClassNames}
                    selectedKeys={
                      selectedReservation ? [selectedReservation.id] : []
                    }
                    renderValue={() => {
                      return (
                        <span className="text-black">
                          {selectedReservation?.reservationName ||
                            eachBooking?.reservationName ||
                            "Select reservation"}
                        </span>
                      );
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

                  <Spacer y={5} />

                  <div>
                    <label className="font-[500] text-black text-[14px] pb-1">
                      Time and date
                    </label>

                    <DatePicker
                      calendarWidth={270}
                      variant="bordered"
                      hideTimeZone
                      size="lg"
                      radius="sm"
                      errorMessage={response?.errors?.timeNdate?.[0]}
                      value={timeNdate}
                      onChange={setTimeNdate}
                      showMonthAndYearPickers
                      minValue={today(getLocalTimeZone())}
                    />
                  </div>
                  <Spacer y={5} />

                  <div className="text-sm flex justify-between">
                    <div className="text-[#404245] flex space-x-2 items-center">
                      <p>Quantity</p>
                      <InfoCircle />
                    </div>
                    <div className="flex space-x-4 text-[#000] items-center">
                      <button
                        className="border border-[#E4E7EC] rounded-md w-8 text-[#000000] flex items-center justify-center h-8"
                        disabled={quantity <= 1}
                        type="button"
                        onClick={() => {
                          quantity > 1 ? setQuantity((prev) => prev - 1) : null;
                        }}
                      >
                        -
                      </button>
                      <p className="font-medium w-4 flex justify-center items-center">
                        {quantity}
                      </p>
                      <button
                        className="border border-[#E4E7EC] rounded-md w-8 text-[#000000] flex items-center justify-center h-8"
                        type="button"
                        onClick={() => setQuantity((prev) => prev + 1)}
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <Spacer y={5} />

                  <div className="text-sm flex justify-between">
                    <div className="text-[#404245] flex space-x-2 items-center">
                      <p>Number of Guest(s)</p>
                      <InfoCircle />
                    </div>
                    <div className="flex space-x-4 text-[#000] items-center">
                      <button
                        className="border border-[#E4E7EC] rounded-md w-8 text-[#000000] flex items-center justify-center h-8"
                        disabled={noOfGuests <= 1}
                        type="button"
                        onClick={() => {
                          noOfGuests > 1
                            ? setNoOfGuests((prev) => prev - 1)
                            : null;
                        }}
                      >
                        -
                      </button>
                      <p className="font-medium w-4 flex justify-center items-center">
                        {noOfGuests}
                      </p>
                      <button
                        className="border border-[#E4E7EC] rounded-md w-8 text-[#000000] flex items-center justify-center h-8"
                        type="button"
                        onClick={() => setNoOfGuests((prev) => prev + 1)}
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <Spacer y={6} />
                  <CustomButton
                    loading={isLoading}
                    disabled={isLoading || !formSubmit()}
                    type="submit"
                  >
                    {isLoading ? "Updating..." : "Update Booking"}
                  </CustomButton>
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
