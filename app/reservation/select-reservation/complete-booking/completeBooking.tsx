'use client';
import { createBooking } from '@/app/api/controllers/dashboard/bookings';
import { CustomInput } from '@/components/CustomInput';
import BackButton from '@/components/backButton';
import { CustomButton } from '@/components/customButton';
import {
  formatDateTime,
  getJsonItemFromLocalStorage,
  saveJsonItemToLocalStorage,
} from '@/lib/utils';
import { getLocalTimeZone, now } from '@internationalized/date';
import { DatePicker } from '@nextui-org/date-picker';
import { Checkbox, Spacer } from '@nextui-org/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { MdOutlineMailOutline, MdOutlinePhone } from 'react-icons/md';

const CompleteBookingComponent = () => {
  const getSingleReservation = getJsonItemFromLocalStorage('singleReservation');

  const searchParams = useSearchParams();
  let businessName = searchParams.get('businessName');
  let businessId = searchParams.get('businessId');
  let cooperateID = searchParams.get('cooperateID');
  let reservationId = searchParams.get('reservationId');

  const router = useRouter();

  const [response, setResponse] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSelected, setIsSelected] = useState(false);
  const [timeNdate, setTimeNdate] = useState(now(getLocalTimeZone()));
  const [bookings, setBookings] = useState<any>({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',

    id: reservationId ? reservationId : getSingleReservation.id,
  });

  const formSubmit = () => {
    return (
      bookings.firstName &&
      bookings.lastName &&
      bookings.email &&
      bookings.phoneNumber &&
      timeNdate &&
      isSelected
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
      reservationId: bookings.id,
      firstName: bookings.firstName,
      lastName: bookings.lastName,
      emailAddress: bookings.email,
      phoneNumber: bookings.phoneNumber,
      bookingDateTime: formatDateTime(timeNdate),
    };

    setIsLoading(true);
    const data = await createBooking(businessId, payload, cooperateID);

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
      setTimeNdate(now(getLocalTimeZone()));
      reservationId
        ? router.push(
            `https://hobink-corporate-web.vercel.app/reservation/select-reservation/complete-booking/success?businessName=${businessName}&businessId=${businessId}&cooperateID=${cooperateID}&reservationId=${reservationId}`
          )
        : router.push(
            `https://hobink-corporate-web.vercel.app/reservation/select-reservation/complete-booking/success?businessName=${businessName}&businessId=${businessId}&cooperateID=${cooperateID}`
          );
      saveJsonItemToLocalStorage('bookingDetails', data?.data?.data);
    } else if (data?.data?.error) {
      toast.error(data?.data?.error);
    }
  };

  return (
    <>
      <div className='flex justify-between items-center'>
        <h1 className='text-2xl  text-black'>{businessName}</h1>
        {reservationId ? null : (
          <BackButton
            color='text-black'
            url={`https://hobink-corporate-web.vercel.app/reservation/select-reservation/single-reservation?businessName=${businessName}&businessId=${businessId}&cooperateID=${cooperateID}`}
          />
        )}
      </div>
      <div className='mt-7 mb-12'>
        <h2 className='text-xl text-black font-bold'>Complete Booking</h2>
        <p className='text-grey600'>Select a reservation to make a booking</p>
      </div>
      <form onSubmit={placeBooking}>
        <CustomInput
          type='text'
          value={bookings.firstName}
          errorMessage={response?.errors?.firstName?.[0]}
          onChange={handleInputChange}
          name='firstName'
          label='First name'
          placeholder='First name'
        />
        <Spacer y={5} />
        <CustomInput
          type='text'
          value={bookings.lastName}
          errorMessage={response?.errors?.lastName?.[0]}
          onChange={handleInputChange}
          name='lastName'
          label='Last name'
          placeholder='Last name'
        />
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
        <div className='flex '>
          <Checkbox
            isSelected={isSelected}
            onValueChange={setIsSelected}
            size='sm'
          />
          <div className='text-black text-[14px]'>
            I accept the{' '}
            <span className='text-primaryColor cursor-pointer'>
              terms and condition
            </span>
          </div>
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
    </>
  );
};

export default CompleteBookingComponent;
