'use client';
import BackButton from '@/components/backButton';
import { CustomButton } from '@/components/customButton';
import useSingleReservation from '@/hooks/cachedEndpoints/useSingleReservation';
import { formatPrice, getJsonItemFromLocalStorage } from '@/lib/utils';
import { Code, Spinner } from '@nextui-org/react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import noImage from '../../../../public/assets/images/no-image.svg';

const SingleReservationComponent = () => {
  const singleReservation = getJsonItemFromLocalStorage('singleReservation');
  const router = useRouter();
  const searchParams = useSearchParams();
  let businessName = searchParams.get('businessName');
  let businessId = searchParams.get('businessId');
  let cooperateID = searchParams.get('cooperateID');
  let reservationId = searchParams.get('reservationId');

  const { data, isLoading } = useSingleReservation(reservationId);

  if (isLoading) {
    return (
      <div className='loadingContainer flex flex-col justify-center items-center'>
        <Spinner />
      </div>
    );
  }
  console.log(singleReservation, 'singleReservation');
  const getSingleReservation = reservationId ? data : singleReservation;

  return (
    <>
      <div className='flex justify-between items-center'>
        <h1 className='text-2xl  text-black'>{businessName}</h1>
        {reservationId ? null : (
          <BackButton
            color='text-black'
            url={`https://hobink-corporate-web.vercel.app/reservation/select-reservation?businessName=${businessName}&businessId=${businessId}&cooperateID=${cooperateID}`}
          />
        )}
      </div>
      <div className='mt-7 mb-2'>
        <h2 className='text-xl text-black font-bold'>Reservations</h2>
        <p className='text-grey600'>Select a reservation to make a booking</p>
      </div>
      <Image
        width={343}
        height={343}
        src={
          getSingleReservation?.image
            ? `data:image/jpeg;base64,${getSingleReservation?.image}`
            : noImage
        }
        alt={'reservation image'}
        className='w-full  h-[343px] rounded-lg border border-primaryGrey  mb-2 bg-cover'
      />
      <div className='py-3'>
        <p className='font-bold text-[18px] text-black'>
          {getSingleReservation?.reservationName}
        </p>
        <p className='text-grey600 text-[14px]'>
          {getSingleReservation?.reservationDescription}
        </p>
        <Code className='text-xs' color='danger'>
          Only {getSingleReservation?.quantityLeft} left
        </Code>
      </div>
      <div className='flex gap-3'>
        {getSingleReservation?.reservationFee > 0 && (
          <div className='flex bg-secondaryGrey rounded-lg p-3 mb-4 flex-col justify-center text-black items-center flex-grow'>
            <p className='text-[14px]'>RESERVATION FEE</p>
            <p className='text-[14px] font-bold'>
              {formatPrice(getSingleReservation?.reservationFee)}
            </p>
          </div>
        )}
        {getSingleReservation?.minimumSpend > 0 && (
          <div className='flex bg-secondaryGrey rounded-lg p-3 mb-4 flex-col justify-center text-black items-center flex-grow'>
            <p className='text-[14px]'>MINUMUM SPEND</p>
            <p className='text-[14px] font-bold'>
              {formatPrice(getSingleReservation?.minimumSpend)}
            </p>
          </div>
        )}
      </div>
      <CustomButton
        onClick={() => {
          reservationId
            ? router.push(
                `/reservation/select-reservation/complete-booking?businessName=${businessName}&businessId=${businessId}&cooperateID=${cooperateID}&reservationId=${reservationId}`
              )
            : router.push(
                `/reservation/select-reservation/complete-booking?businessName=${businessName}&businessId=${businessId}&cooperateID=${cooperateID}`
              );
        }}
      >
        Select this reservation
      </CustomButton>
    </>
  );
};

export default SingleReservationComponent;
