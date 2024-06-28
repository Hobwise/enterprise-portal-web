'use client';
import { createBooking } from '@/app/api/controllers/dashboard/bookings';
import { CustomInput } from '@/components/CustomInput';
import { CustomButton } from '@/components/customButton';
import { selectClassNames } from '@/components/selectInput';
import useBookings from '@/hooks/cachedEndpoints/useBookings';
import useReservation from '@/hooks/cachedEndpoints/useReservation';
import {
  formatDateTime,
  formatPrice,
  getJsonItemFromLocalStorage,
  notify,
} from '@/lib/utils';
import { getLocalTimeZone, now } from '@internationalized/date';
import { DatePicker } from '@nextui-org/date-picker';
import {
  Modal,
  ModalBody,
  ModalContent,
  Select,
  SelectItem,
  Spacer,
} from '@nextui-org/react';
import Image from 'next/image';
import React, { useState } from 'react';
import { MdOutlineMailOutline, MdOutlinePhone } from 'react-icons/md';
import noImage from '../../../../public/assets/images/no-image.svg';

const CreateBooking = ({
  openCreateBookingModal,

  showSuccessModal,
  closeCreateBookingModal,
  setCompletedBooking,
}: any) => {
  const businessInformation = getJsonItemFromLocalStorage('business');
  const { data } = useReservation();
  const { refetch } = useBookings();

  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [timeNdate, setTimeNdate] = useState(now(getLocalTimeZone()));
  const [bookings, setBookings] = useState<any>({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
  });

  const [id, setId] = useState('');

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
    e.preventDefault();
    const payload = {
      reservationId: id,
      firstName: bookings.firstName,
      lastName: bookings.lastName,
      emailAddress: bookings.email,
      phoneNumber: bookings.phoneNumber,
      bookingDateTime: formatDateTime(timeNdate),
    };

    setIsLoading(true);
    const data = await createBooking(
      businessInformation[0]?.businessId,
      payload
    );

    setResponse(data);

    setIsLoading(false);

    if (data?.data?.isSuccessful) {
      setBookings({
        firstName: '',
        lastName: '',
        email: '',
        phoneNumber: '',

        id: '',
      });
      refetch();
      setTimeNdate(now(getLocalTimeZone()));
      closeCreateBookingModal();
      showSuccessModal();
      setCompletedBooking(data?.data?.data);
    } else if (data?.data?.error) {
      notify({
        title: 'Error!',
        text: data?.data?.error,
        type: 'error',
      });
    }
  };

  const Reservations = ({ reservation }: any) => {
    return (
      <div className='flex'>
        <Image
          className='h-[60px] w-[60px] bg-cover rounded-lg'
          width={60}
          height={60}
          alt='menu'
          unoptimized
          aria-label='menu'
          src={
            reservation.image
              ? `data:image/jpeg;base64,${reservation.image}`
              : noImage
          }
        />

        <div className='ml-5 gap-1 grid place-content-center'>
          <p className='font-bold text-sm mb-1'>
            {reservation.reservationName}
          </p>

          <div>
            <p className=' text-sm'>Reservation Fee</p>
            <p className='font-bold text-sm'>
              {formatPrice(reservation.reservationFee)}
            </p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Modal
      isDismissable={false}
      isOpen={openCreateBookingModal}
      onOpenChange={() => closeCreateBookingModal()}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalBody>
              <h2 className='text-[24px] leading-3 py-8 text-black font-semibold'>
                Complete booking
              </h2>

              <form onSubmit={placeBooking}>
                <div className='flex gap-4'>
                  <CustomInput
                    type='text'
                    value={bookings.firstName}
                    errorMessage={response?.errors?.firstName?.[0]}
                    onChange={handleInputChange}
                    name='firstName'
                    label='First name'
                    placeholder='First name'
                  />
                  <CustomInput
                    type='text'
                    value={bookings.lastName}
                    errorMessage={response?.errors?.lastName?.[0]}
                    onChange={handleInputChange}
                    name='lastName'
                    label='Last name'
                    placeholder='Last name'
                  />
                </div>
                <Spacer y={5} />
                <CustomInput
                  type='text'
                  value={bookings.email}
                  errorMessage={response?.errors?.email?.[0]}
                  onChange={handleInputChange}
                  name='email'
                  endContent={<MdOutlineMailOutline className='text-grey500' />}
                  label='Email address'
                  placeholder='Enter email'
                />
                <Spacer y={5} />
                <Select
                  labelPlacement='outside'
                  key='outside'
                  variant={'bordered'}
                  errorMessage={response?.errors?.reservationId?.[0]}
                  items={data?.reservations}
                  value={id}
                  onChange={(e) => setId(e.target.value)}
                  size='lg'
                  className='text-black'
                  label='Choose reservation'
                  placeholder='Select reservation to book'
                  classNames={selectClassNames}
                  renderValue={(items) => {
                    return items.map((item) => (
                      <span className='text-black'>{item.textValue}</span>
                    ));
                  }}
                >
                  {(reservation) => (
                    <SelectItem
                      className='text-black'
                      key={reservation.id}
                      textValue={reservation.reservationName}
                    >
                      <Reservations reservation={reservation} />
                    </SelectItem>
                  )}
                </Select>
                <Spacer y={5} />
                <CustomInput
                  type='text'
                  value={bookings.phoneNumber}
                  errorMessage={response?.errors?.phoneNumber?.[0]}
                  onChange={handleInputChange}
                  name='phoneNumber'
                  endContent={<MdOutlinePhone className='text-grey500' />}
                  label='Phone number'
                  placeholder='Enter phone number'
                />
                <Spacer y={5} />

                <div>
                  <label className='font-[500] text-black text-[14px] pb-1'>
                    Time and date
                  </label>
                  <DatePicker
                    variant='bordered'
                    hideTimeZone
                    size='lg'
                    radius='sm'
                    errorMessage={response?.errors?.timeNdate?.[0]}
                    value={timeNdate}
                    onChange={setTimeNdate}
                    showMonthAndYearPickers
                    minValue={now(getLocalTimeZone())}
                    defaultValue={now(getLocalTimeZone())}
                  />
                </div>
                <Spacer y={6} />

                <CustomButton
                  loading={isLoading}
                  disabled={isLoading || !formSubmit()}
                  type='submit'
                >
                  {' '}
                  {isLoading ? 'Loading' : 'Proceed to checkout'}
                </CustomButton>
              </form>
              <Spacer y={4} />
            </ModalBody>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default CreateBooking;
