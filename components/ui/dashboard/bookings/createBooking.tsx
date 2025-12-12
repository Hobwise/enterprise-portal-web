"use client";
import { createBooking } from "@/app/api/controllers/dashboard/bookings";
import { CustomInput } from "@/components/CustomInput";
import { CustomButton } from "@/components/customButton";
import { CustomTextArea } from "@/components/customTextArea";
import { selectClassNames } from "@/components/selectInput";
import useReservation from "@/hooks/cachedEndpoints/useReservation";
import {
  formatDateTime,
  formatPrice,
  getJsonItemFromLocalStorage,
  notify,
} from "@/lib/utils";
import { InfoCircle } from "@/public/assets/svg";
import { getLocalTimeZone, now, today } from "@internationalized/date";
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
import React, { useState } from "react";
import { useQueryClient } from '@tanstack/react-query';
import { MdOutlineMailOutline, MdOutlinePhone } from "react-icons/md";
import { IoRemoveCircleOutline, IoAddCircleOutline } from "react-icons/io5";
import noImage from "../../../../public/assets/images/no-image.svg";
import ReserveTableImage from "../../../../public/assets/images/reserve-table.svg";

const CreateBooking = ({
  openCreateBookingModal,
  refetch,
  showSuccessModal,
  closeCreateBookingModal,
  setCompletedBooking,
}: any) => {
  const businessInformation = getJsonItemFromLocalStorage("business");
  const userInformation = getJsonItemFromLocalStorage("userInformation");
  const { data } = useReservation();
  const queryClient = useQueryClient();

  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [noOfGuests, setNoOfGuests] = useState<number>(1);

  const [timeNdate, setTimeNdate] = useState(now(getLocalTimeZone()));
  const [selectedTime, setSelectedTime] = useState("");
  const [bookings, setBookings] = useState<any>({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    description: "",
  });

  const [id, setId] = useState("");

  const formSubmit = () => {
    return (
      bookings.firstName &&
      bookings.email &&
      bookings.phoneNumber &&
      timeNdate &&
      selectedTime &&
      id
    );
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setResponse(null);
    const { name, value } = e.target;
    setBookings((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };

  const placeBooking = async (e) => {
    e.preventDefault();

    // Combine date and time
    let combinedDateTime = timeNdate;
    if (selectedTime) {
      const [hours, minutes] = selectedTime.split(":");
      combinedDateTime = timeNdate.set({
        hour: parseInt(hours),
        minute: parseInt(minutes),
      });
    }

    // Split the name into firstName and lastName
    const nameParts = bookings.firstName.trim().split(" ");
    const firstName = nameParts[0] || bookings.firstName;
    const lastName =
      nameParts.length > 1 ? nameParts.slice(1).join(" ") : bookings.firstName;

    const payload = {
      reservationId: id,
      firstName: firstName,
      lastName: lastName,
      emailAddress: bookings.email,
      phoneNumber: bookings.phoneNumber,
      bookingDateTime: formatDateTime(combinedDateTime),
      description: bookings.description,
      quantity: quantity,
      numberOfGuest: noOfGuests,
    };

    setIsLoading(true);
    const data = await createBooking(
      businessInformation[0]?.businessId,
      payload,
      userInformation.cooperateID
    );

    setResponse(data);

    setIsLoading(false);

    if (data?.data?.isSuccessful) {
      refetch();
      // Invalidate booking queries to refresh the booking list
      queryClient.invalidateQueries(["bookingCategories"]);
      queryClient.invalidateQueries(["bookingDetails"]);

      setTimeNdate(now(getLocalTimeZone()));
      setSelectedTime("");
      setId("");
      closeCreateBookingModal();
      showSuccessModal();
      setCompletedBooking(data?.data?.data);
      setBookings({
        firstName: "",
        lastName: "",
        email: "",
        phoneNumber: "",
        description: "",
        id: "",
      });

      setQuantity(1);
      setNoOfGuests(1);
    } else if (data?.data?.error) {
      notify({
        title: "Error!",
        text: data?.data?.error,
        type: "error",
      });
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
            <p className=" text-sm">Reservation Fee</p>
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
      size="2xl"
      isDismissable={false}
      isOpen={openCreateBookingModal}
      onOpenChange={() => closeCreateBookingModal()}
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
              <div className="text-center  mt-4  relative">
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
                    <span className="text-primaryColor">Reserve Now</span>
                  </h1>
                </div>
              </div>
              <ScrollShadow size={5} className="w-full max-h-[500px]">
                <form onSubmit={placeBooking} className="">
                  <div className="p-6 bg-gray-50 rounded-xl space-y-4">
                    {/* Name and Email row */}
                    <div className="grid grid-cols-2 gap-4">
                      <CustomInput
                        type="text"
                        value={bookings.firstName}
                        errorMessage={response?.errors?.firstName?.[0]}
                        onChange={handleInputChange}
                        name="firstName"
                        label="Name"
                        placeholder="Enter your name"
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
                        <label className="font-[500] text-black text-[14px] block  mb-2">
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
                            className="text-gray-500  p-3 flex items-center justify-center"
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
                            className="text-gray-500  p-3 flex items-center justify-center"
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
                          items={data?.reservations}
                          selectedKeys={id ? [id] : []}
                          onSelectionChange={(keys) => {
                            const selectedKey = Array.from(keys)[0];
                            setId(selectedKey ? String(selectedKey) : "");
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
                                <span className="text-gray-400 ">
                                  Date Night Table for Two
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
                            className="text-gray-500  p-3 flex items-center justify-center"
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
                          defaultValue={now(getLocalTimeZone())}
                          classNames={{
                            base: "bg-white  shadow-none",
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
                      {isLoading ? "Booking..." : "Book A Table →"}
                    </CustomButton>
                  </div>
                </form>
              </ScrollShadow>
            </ModalBody>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default CreateBooking;
