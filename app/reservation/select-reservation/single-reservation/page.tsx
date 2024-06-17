'use client';
import BackButton from '@/components/backButton';
import { CustomButton } from '@/components/customButton';
import {
  formatPrice,
  getFromLocalStorage,
  getJsonItemFromLocalStorage,
} from '@/lib/utils';
import Image from 'next/image';
import noImage from '../../../../public/assets/images/no-image.svg';

const SingleReservation = () => {
  const getSingleReservation = getJsonItemFromLocalStorage('singleReservation');
  const businessName = getFromLocalStorage('businessName');
  console.log(getSingleReservation, 'SingleReservation');
  return (
    <main className='items-center h-screen bg-white p-4 flex flex-col'>
      <section className='lg:w-[360px] w-full py-5'>
        <div className='flex justify-between items-center'>
          <h1 className='text-2xl  text-black'>{businessName}</h1>

          <BackButton
            color='text-black'
            url='/reservation/select-reservation'
          />
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
          className='lg:w-full w-[343px] h-[343px] rounded-lg border border-primaryGrey  mb-2 bg-cover'
        />
        <div className='py-3'>
          <p className='font-bold text-[18px] text-black'>
            {getSingleReservation?.reservationName}
          </p>
          <p className='text-grey600 text-[14px]'>
            {getSingleReservation?.reservationDescription}
          </p>
        </div>
        <div className='flex gap-3'>
          {getSingleReservation.reservationFee > 0 && (
            <div className='flex bg-secondaryGrey rounded-lg p-3 mb-4 flex-col justify-center text-black items-center flex-grow'>
              <p className='text-[14px]'>RESERVATION FEE</p>
              <p className='text-[14px] font-bold'>
                {formatPrice(getSingleReservation.reservationFee)}
              </p>
            </div>
          )}
          {getSingleReservation.minimumSpend > 0 && (
            <div className='flex bg-secondaryGrey rounded-lg p-3 mb-4 flex-col justify-center text-black items-center flex-grow'>
              <p className='text-[14px]'>MINUMUM SPEND</p>
              <p className='text-[14px] font-bold'>
                {formatPrice(getSingleReservation.minimumSpend)}
              </p>
            </div>
          )}
        </div>
        <CustomButton>Select this reservation</CustomButton>
      </section>
    </main>
  );
};

export default SingleReservation;
