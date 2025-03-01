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
import { MdOutlineMailOutline, MdOutlinePhone } from "react-icons/md";
import noImage from "../../../../public/assets/images/no-image.svg";

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

  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [timeNdate, setTimeNdate] = useState(now(getLocalTimeZone()));
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
      bookings.lastName &&
      bookings.email &&
      bookings.phoneNumber &&
      timeNdate &&
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
    console.log(timeNdate, "timeNdate");
    e.preventDefault();
    const payload = {
      reservationId: id,
      firstName: bookings.firstName,
      lastName: bookings.lastName,
      emailAddress: bookings.email,
      phoneNumber: bookings.phoneNumber,
      bookingDateTime: formatDateTime(timeNdate),
      description: bookings.description,
      quantity: quantity,
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
      setTimeNdate(now(getLocalTimeZone()));
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
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalBody>
              <h2 className="text-[24px] leading-3 py-8 text-black font-semibold">
                Complete booking
              </h2>
              <ScrollShadow size={5} className="w-full h-[500px]">
                <form onSubmit={placeBooking}>
                  <div className="flex gap-4">
                    <CustomInput
                      type="text"
                      value={bookings.firstName}
                      errorMessage={response?.errors?.firstName?.[0]}
                      onChange={handleInputChange}
                      name="firstName"
                      label="First name"
                      placeholder="First name"
                    />
                    <CustomInput
                      type="text"
                      value={bookings.lastName}
                      errorMessage={response?.errors?.lastName?.[0]}
                      onChange={handleInputChange}
                      name="lastName"
                      label="Last name"
                      placeholder="Last name"
                    />
                  </div>
                  <Spacer y={5} />
                  <div className="flex gap-4">
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
                      placeholder="Enter phone number"
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
                    items={data?.reservations}
                    value={id}
                    onChange={(e) => setId(e.target.value)}
                    size="lg"
                    className="text-black"
                    label="Choose reservation"
                    placeholder="Select reservation to book"
                    classNames={selectClassNames}
                    renderValue={(items) => {
                      return items.map((item) => (
                        <span className="text-black">{item.textValue}</span>
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
                      defaultValue={now(getLocalTimeZone())}
                    />
                  </div>
                  <Spacer y={5} />

                  <div className="text-sm flex justify-between">
                    <div className="text-[#404245] flex space-x-2 items-center">
                      <p>Quantity</p>
                      <InfoCircle />
                    </div>
                    <div className="flex space-x-4 text-[#000] items-center">
                      <span
                        className="border border-[#E4E7EC] rounded-md w-8 text-[#000000] flex items-center justify-center h-8"
                        role="button"
                        onClick={() => {
                          quantity > 1 ? setQuantity((prev) => prev - 1) : null;
                        }}
                      >
                        -
                      </span>
                      <p className="font-medium w-4 flex justify-center items-center">
                        {quantity}
                      </p>
                      <span
                        className="border border-[#E4E7EC] rounded-md w-8 text-[#000000] flex items-center justify-center h-8"
                        role="button"
                        onClick={() => setQuantity((prev) => prev + 1)}
                      >
                        +
                      </span>
                    </div>
                  </div>
                  <Spacer y={6} />
                  <CustomButton
                    loading={isLoading}
                    disabled={isLoading || !formSubmit()}
                    type="submit"
                  >
                    {" "}
                    {isLoading ? "Loading" : "Proceed to checkout"}
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

export default CreateBooking;
