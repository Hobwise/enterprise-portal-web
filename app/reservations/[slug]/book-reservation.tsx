'use client';
import { CustomInput } from '@/components/CustomInput';
import { CustomButton } from '@/components/customButton';
import { CustomTextArea } from '@/components/customTextArea';
import { InfoCircle, LocationIcon } from '@/public/assets/svg';
import Image from 'next/image';
import React, { useEffect, useState } from 'react';
import { Modal, ModalBody, ModalContent, Select, SelectItem, Selection } from '@nextui-org/react';
import CheckImage from '@/public/assets/images/success-image.png';
import { useRouter } from 'next/navigation';
import { RESERVATIONS_URL } from '@/utilities/routes';
import { Tooltip } from '@heroui/tooltip';
import { cn, convertToISO, formatNumber, formatTime, formatTimeSlot, generateTimeSlots, getInitials2, notify, validateEmail } from '@/lib/utils';
import { BookReservationApi, fetchAvailability } from '@/app/api/controllers/landingPage';
import { IoCall } from 'react-icons/io5';
import { MdEmail, MdTimer } from 'react-icons/md';
import { useQuery } from 'react-query';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';

interface IDetails {
  firstName: string;
  lastName: string;
  emailAddress: string;
  bookingDateTime: string;
  description: string;
  time: string;
}
const defaultValues = { firstName: '', lastName: '', emailAddress: '', bookingDateTime: '', description: '', time: '' };

interface IBookReservationPage {
  reservation: {
    id: string;
    cooperateID: string;
    businessID: string;
    endTime: any;
    startTime: any;
    image: string;
    businessName: string;
    businessAddress: string;
    businessPhoneNumber: string;
    businessEmailAddress: string;
    reservationName: string;
    reservationDescription: string;
    minimumSpend: number;
    reservationFee: number;
  };
  className?: string;
}

export default function BookReservationPage({ reservation, className }: IBookReservationPage) {
  const [quantity, setQuantity] = useState<number>(1);
  const [noOfGuests, setNoOfGuests] = useState<number>(1);
  const [selectedTime, setSelectedTime] = useState<Selection>(new Set([]));
  const [selectedPeriod, setSelectedPeriod] = useState<{ timeSlot: string; quantity: number }>({ quantity: 0, timeSlot: '' });
  const [details, setDetails] = useState<IDetails>(defaultValues);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<IDetails>(defaultValues);
  const router = useRouter();
  const [open, setOpen] = useState<boolean>(false);
  const btnClassName =
    'before:ease relative h-[40px] w-full overflow-hidden border border-[#FFFFFF26] px-8 shadow-[inset_0_7.4px_18.5px_0px_rgba(255,255,255,0.11)] border-white bg-primaryColor text-white shadow-2xl transition-all before:absolute before:right-0 before:top-0 before:h-[40px] before:w-6 before:translate-x-12 before:rotate-6 before:bg-white before:opacity-10 before:duration-700 hover:shadow-primaryColor-500 hover:before:-translate-x-40';

  const {
    data: availableTimes,
    isLoading: isLoadingTimes,
    isError,
    error: fetchError,
  } = useQuery({
    queryFn: () => fetchAvailability({ ReservationId: reservation?.id, RequestDate: details?.bookingDateTime }),
    queryKey: ['availability', reservation?.id, details?.bookingDateTime],
    enabled: !!reservation?.id && !!details?.bookingDateTime,
  });

  const handleBookReservation = async (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (!details.firstName) {
      setError((prev) => ({ ...prev, firstName: 'First name is compulsory' }));
    }
    if (!details.lastName) {
      setError((prev) => ({ ...prev, lastName: 'Last name is compulsory' }));
    }
    if (!details.emailAddress || !validateEmail(details.emailAddress)) {
      setError((prev) => ({ ...prev, emailAddress: 'Please enter a valid email address.' }));
    }
    if (!details.bookingDateTime || !Array.from(selectedTime).join(', ')) {
      setError((prev) => ({ ...prev, bookingDateTime: 'Preferred date and time is compulsory' }));
    }
    if (!details.time) {
      setError((prev) => ({ ...prev, time: 'Time is compulsory' }));
    }
    if (details.firstName && details.lastName && details.emailAddress && validateEmail(details.emailAddress) && details.bookingDateTime) {
      setIsLoading(true);
      const { time, ...others } = details;

      const updateDetails = {
        ...others,
        bookingDateTime: convertToISO(details.bookingDateTime, Array.from(selectedTime).join(', ')),
        reservationId: reservation?.id,
        cooperateId: reservation?.cooperateID,
        businessId: reservation?.businessID,
        numberOfGuest: noOfGuests,
        quantity,
      };

      const data: any = await BookReservationApi(updateDetails);

      setIsLoading(false);

      if (data?.data?.isSuccessful) {
        setDetails(defaultValues);
        setOpen(true);
      } else if (data?.data?.error) {
        notify({
          title: 'Error!',
          text: data?.data?.error,
          type: 'error',
        });
      }
    }
  };

  const currentSelection: string = Array.from(selectedTime).join(', ');

  const formattedTimeSlots =
    availableTimes &&
    availableTimes?.data?.data?.map((slot: { timeSlot: string }) => ({
      ...slot,
      timeSlot: formatTime(formatTimeSlot(slot.timeSlot)),
    }));

  const timeSlotMap =
    availableTimes &&
    new Map(
      formattedTimeSlots.map((item: { quantity: number; timeSlot: string }) => [
        item.timeSlot,
        { ...item, availability: item.quantity > 0 }, // Set availability based on quantity
      ])
    );

  // Check all times in array2 and update or add them
  const updatedAvailableTime = generateTimeSlots(reservation?.startTime || '10:00:00', reservation?.endTime || '23:59:00', 1).map((time) =>
    timeSlotMap?.has(time) ? timeSlotMap?.get(time) : { timeSlot: time, quantity: 0, availability: false }
  );

  const handleSelectTime = (each: { timeSlot: string; quantity: number }) => {
    setSelectedTime(new Set([each.timeSlot || '']));
    setSelectedPeriod(each);
  };

  useEffect(() => {
    if (selectedTime) {
      setDetails((prev) => ({ ...prev, time: Array.from(selectedTime).join(', ') }));
      setError((prev) => ({ ...prev, time: '' }));
    }
  }, [selectedTime]);

  return (
    <div className={cn('font-satoshi px-6 lg:px-24 space-y-4 mt-12', className)}>
      <section className="space-y-10">
        <div className="space-y-2 text-[#161618]">
          <div className="flex items-center space-x-2">
            <h1 className="text-[32px] font-bricolage_grotesque">Book Reservation</h1>
          </div>
          <p className="text-sm">Please provide your details below to book this reservation</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-20">
          <div className="space-y-8">
            <form autoComplete="off" className="block">
              <div className="flex space-x-8">
                <CustomInput
                  name="firstName"
                  type="text"
                  label="First name"
                  placeholder="Enter your first name"
                  defaultValue={details.firstName}
                  value={details.firstName}
                  onChange={({ target }: any) => {
                    setError((prev) => ({ ...prev, firstName: '' }));
                    setDetails((prev) => ({ ...prev, firstName: target.value }));
                  }}
                  errorMessage={error.firstName}
                />
                <CustomInput
                  name="lastName"
                  type="text"
                  label="Last name"
                  placeholder="Enter your last name"
                  defaultValue={details.lastName}
                  value={details.lastName}
                  onChange={({ target }: any) => {
                    setError((prev) => ({ ...prev, lastName: '' }));
                    setDetails((prev) => ({ ...prev, lastName: target.value }));
                  }}
                  errorMessage={error.lastName}
                />
              </div>
              <CustomInput
                name="email"
                type="email"
                label="Email"
                placeholder="Enter your email"
                classnames="mt-6"
                defaultValue={details.emailAddress}
                value={details.emailAddress}
                onChange={({ target }: any) => {
                  setError((prev) => ({ ...prev, emailAddress: '' }));
                  setDetails((prev) => ({ ...prev, emailAddress: target.value }));
                }}
                errorMessage={error.emailAddress}
              />

              <CustomInput
                name="date"
                type="date"
                label="Reservation date"
                placeholder="DD/MM/YY, 00 : 00 AM"
                classnames="mt-6"
                defaultValue={details.bookingDateTime}
                value={details.bookingDateTime}
                min={new Date().toISOString().split('T')[0]}
                onChange={({ target }: any) => {
                  setError((prev) => ({ ...prev, bookingDateTime: '' }));
                  setDetails((prev) => ({ ...prev, bookingDateTime: target.value }));
                }}
                errorMessage={error.bookingDateTime}
              />

              {details?.bookingDateTime && (
                <React.Fragment>
                  {isLoadingTimes ? (
                    <div className="mt-4 flex items-center text-dark">
                      <AiOutlineLoading3Quarters className="mr-2 h-4 w-4 animate-spin" />
                      <p className="text-sm font-light italic">Please wait..., loading available time</p>
                    </div>
                  ) : (
                    <React.Fragment>
                      {isError ? (
                        <div>
                          {generateTimeSlots(reservation?.startTime || '10:00:00', reservation?.endTime || '23:59:00', 1).map((each: any) => (
                            <Tooltip content={each.availability ? `${each.quantity} quantity Available` : 'Not available'} color="default">
                              <div
                                className={cn(
                                  'rounded-md py-2 px-3 flex space-x-2 items-center text-xs lg:text-sm border border-primaryColor bg-white text-primaryColor',
                                  currentSelection === each.timeSlot && 'bg-primaryColor text-white',
                                  each.availability ? 'cursor-pointer' : 'cursor-not-allowed opacity-70'
                                )}
                                key={each.timeSlot}
                                onClick={() => {
                                  each.availability ? handleSelectTime(each) : null;
                                }}
                              >
                                <MdTimer />
                                <p className="">{each.timeSlot}</p>
                              </div>
                            </Tooltip>
                          ))}
                        </div>
                      ) : (
                        <React.Fragment>
                          <div className="space-y-4 mt-6">
                            <p className="text-[#161618] text-xs font-medium">
                              Opens from{' '}
                              <span className="font-bold">
                                {reservation?.startTime || '10:00AM'} to {reservation?.endTime || '11:59PM'}
                              </span>
                            </p>
                            <div className="text-[#161618] grid grid-cols-3 lg:grid-cols-5 gap-4">
                              {updatedAvailableTime.map((each: any) => (
                                <Tooltip content={<p className="text-[#000]">{each.availability ? `${each.quantity} quantity Available` : 'Not available'}</p>}>
                                  <div
                                    className={cn(
                                      'rounded-md py-2 px-3 flex space-x-2 items-center text-xs lg:text-sm border border-primaryColor bg-white text-primaryColor',
                                      currentSelection === each.timeSlot && 'bg-primaryColor text-white',
                                      each.availability ? 'cursor-pointer' : 'cursor-not-allowed opacity-70'
                                    )}
                                    key={each.timeSlot}
                                    onClick={() => {
                                      each.availability ? handleSelectTime(each) : null;
                                    }}
                                  >
                                    <MdTimer />
                                    <p className="">{each.timeSlot}</p>
                                  </div>
                                </Tooltip>
                              ))}
                            </div>
                          </div>

                          <div className="grid grid-cols-1 gap-4">
                            <div className="space-y-2.5 mt-5">
                              <p className="text-[#000] font-[500] text-[14px]">Reservation time</p>
                              <Select
                                label=""
                                className="w-full"
                                variant="bordered"
                                size="lg"
                                labelPlacement="inside"
                                selectedKeys={selectedTime}
                                onSelectionChange={setSelectedTime}
                                placeholder="Select Time"
                                errorMessage={error.time ? 'You must select a reservation time' : ''}
                                isInvalid={error.time ? true : false}
                              >
                                {updatedAvailableTime
                                  ?.filter((time: any) => !!time.availability)
                                  .map((each: any) => (
                                    <SelectItem key={each.timeSlot || ''} className="text-[#000]">
                                      {each.timeSlot}
                                    </SelectItem>
                                  ))}
                              </Select>
                            </div>
                          </div>
                        </React.Fragment>
                      )}
                    </React.Fragment>
                  )}
                </React.Fragment>
              )}

              <div className="mt-4">
                <CustomTextArea
                  name="description"
                  label="Add a description for this reservation"
                  placeholder="Describe your reservation"
                  defaultValue={details.description}
                  value={details.description}
                  onChange={({ target }: any) => {
                    setError((prev) => ({ ...prev, description: '' }));
                    setDetails((prev) => ({ ...prev, description: target.value }));
                  }}
                  errorMessage={error.description}
                />
              </div>
            </form>

            <div className="space-y-10">
              <div className="bg-[#F0F2F4] p-4 text-[#5A5A63] space-y-2 rounded-lg">
                <p className="text-primaryColor font-semibold text-lg">Important Note</p>
                <p className="text-sm">
                  We offer a 15-minute grace period. If you anticipate arriving more than 15 minutes past your reservation time, kindly give us a call in
                  advance.
                </p>
              </div>
            </div>
          </div>

          <div className="lg:space-y-6 space-y-6 lg:-mt-16">
            <div className="space-y-1.5">
              <p className="text-lg font-medium text-[#161618]">Selected Reservation</p>
            </div>
            {reservation && (
              <div className="border border-[#E4E7EC] py-4 px-5 rounded-lg space-y-4">
                <div className="lg:flex border-b border-b-[#E4E7EC] pb-6 items-start lg:space-x-4 space-y-2.5 lg:space-y-0">
                  <div className="w-full lg:w-[25%] h-fit rounded-md">
                    {reservation?.image ? (
                      <Image
                        src={`data:image/png;base64,${reservation?.image}`}
                        alt="bottle"
                        className="rounded-md w-full h-full object-contain"
                        width={150}
                        height={150}
                      />
                    ) : (
                      <div className="w-full h-[75px] lg:h-[150px] rounded-md bg-[#DDDCFE] text-primaryColor font-medium text-[40px] lg:text-[80px] font-bricolage_grotesque flex items-center justify-center">
                        <p>{getInitials2(reservation?.businessName)}</p>
                      </div>
                    )}
                  </div>
                  <div className="text-[#3D424A]">
                    <p className="font-medium">{reservation?.reservationName || ''}</p>
                    <p className="text-sm font-light">{reservation?.reservationDescription || ''}</p>
                  </div>
                </div>

                <div className="space-y-4 border-b border-b-[#E4E7EC]  pb-6">
                  <div className="text-sm flex justify-between">
                    <div className="text-[#808B9F] flex space-x-2 items-center">
                      <p>Minimum Spend</p>
                      <InfoCircle />
                    </div>
                    <p className="text-[#808B9F]">₦{formatNumber(reservation?.minimumSpend || 0)}.00</p>
                  </div>

                  <div className="text-sm flex justify-between">
                    <div className="text-[#404245] flex space-x-2 items-center">
                      <p>Reservation fee</p>
                      <InfoCircle />
                    </div>
                    <p className="text-[#404245]">₦{formatNumber(reservation?.reservationFee || 0)}.00</p>
                  </div>

                  <div className="text-sm flex justify-between">
                    <div className="text-[#404245] flex space-x-2 items-center">
                      <p>Quantity</p>
                      <InfoCircle />
                    </div>
                    <div className="flex space-x-4 text-[#000] items-center">
                      <button
                        className="border border-[#E4E7EC] rounded-md w-7 text-[#000000] flex items-center justify-center h-7"
                        disabled={quantity <= 1}
                        role="button"
                        onClick={() => {
                          quantity > 1 ? setQuantity((prev) => prev - 1) : null;
                        }}
                      >
                        -
                      </button>
                      <p className="font-medium w-4 flex justify-center items-center">{quantity}</p>
                      <button
                        className="border border-[#E4E7EC] rounded-md w-7 text-[#000000] flex items-center justify-center h-7"
                        disabled={quantity >= selectedPeriod.quantity}
                        role="button"
                        onClick={() => {
                          quantity >= selectedPeriod?.quantity ? null : setQuantity((prev) => prev + 1);
                        }}
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="text-sm flex justify-between">
                    <div className="text-[#404245] flex space-x-2 items-center">
                      <p>Number of Guests</p>
                      <InfoCircle />
                    </div>
                    <div className="flex space-x-4 text-[#000] items-center">
                      <button
                        className="border border-[#E4E7EC] rounded-md w-7 text-[#000000] flex items-center justify-center h-7"
                        disabled={noOfGuests <= 1}
                        role="button"
                        onClick={() => {
                          noOfGuests > 1 ? setNoOfGuests((prev) => prev - 1) : null;
                        }}
                      >
                        -
                      </button>
                      <p className="font-medium w-4 flex justify-center items-center">{noOfGuests}</p>
                      <button
                        className="border border-[#E4E7EC] rounded-md w-7 text-[#000000] flex items-center justify-center h-7"
                        // disabled={noOfGuests >= selectedPeriod.noOfGuests}
                        role="button"
                        onClick={() => setNoOfGuests((prev) => prev + 1)}
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>

                <div className="font-bold flex justify-between text-[#404245]">
                  <p>Total</p>
                  <p className="opacity-20">₦{formatNumber(Number(reservation?.reservationFee || 0) * quantity)}.00</p>
                </div>

                <div className="bg-[#F0F2F4] p-4 text-[#5A5A63] flex items-baseline space-x-2 rounded-lg">
                  <InfoCircle className="mt-1" />
                  <p>The minimum spend is the amount you’re required to spend when visiting this location.</p>
                </div>

                <div>
                  <CustomButton className={btnClassName} onClick={handleBookReservation} loading={isLoading}>
                    Book Reservation
                  </CustomButton>
                </div>
              </div>
            )}

            <div className="text-[#161618] border border-[#E4E7EC] py-2 px-4 rounded-lg space-y-2">
              <p className="font-medium">
                Locate <span className="uppercase font-medium text-[18px]">{reservation?.businessName || '-'}</span>
              </p>
              <div className="flex space-x-2 items-center text-sm">
                <LocationIcon />
                <p>{reservation?.businessAddress || '-'}</p>
              </div>
              <div className="flex space-x-2 items-center text-sm">
                <IoCall color="848E9E" />
                <p>{reservation?.businessPhoneNumber || '-'}</p>
              </div>
              <div className="flex space-x-2 items-center text-sm">
                <MdEmail color="848E9E" />
                <p>{reservation?.businessEmailAddress || '-'}</p>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* <Footer /> */}

      <Modal isOpen={open} onOpenChange={setOpen}>
        <ModalContent>
          <ModalBody className="text-center px-10 py-8">
            <Image src={CheckImage} alt="Success" width={90} height={90} className="mx-auto" />
            <h1 className="text-[#000] text-xl font-bricolage_grotesque">Reservation has been booked!</h1>
            <p className="text-[#475367] font-satoshi">You’ll get an email after details of your reservation has been confirmed.</p>
            <CustomButton className={btnClassName} onClick={() => router.push(`/${RESERVATIONS_URL}`)}>
              Done
            </CustomButton>
          </ModalBody>
        </ModalContent>
      </Modal>
    </div>
  );
}
