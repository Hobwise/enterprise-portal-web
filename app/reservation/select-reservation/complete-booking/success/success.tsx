'use client';

import { CustomButton } from '@/components/customButton';
import {
  clearItemLocalStorage,
  getJsonItemFromLocalStorage,
} from '@/lib/utils';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import Success from '../../../../../public/assets/images/success.png';
const SuccessComponent = () => {
  const searchParams = useSearchParams();
  let businessName = searchParams.get('businessName');
  let businessId = searchParams.get('businessId');
  let cooperateID = searchParams.get('cooperateID');
  let reservationId = searchParams.get('reservationId');
  const router = useRouter();

  const bookingDetails = getJsonItemFromLocalStorage('bookingDetails');

  // useEffect(() => {
  //   clearItemLocalStorage('singleReservation');
  // }, []);

  return (
    <>
      <div className='grid place-content-center mt-8'>
        <Image src={Success} alt='success' />
      </div>

      <h2 className='text-[16px] text-center leading-3 my-4 text-black font-semibold'>
        Fantastic!
      </h2>
      <h3 className='text-sm text-center text-grey600  mb-4'>
        You have successfully made a booking for{' '}
        <span className='font-[600] text-black'>
          {bookingDetails?.firstName} {bookingDetails?.lastName}.
        </span>{' '}
        Confirmation email has been sent to{' '}
        <span className='font-[600] text-black'>
          {bookingDetails?.emailAddress}
        </span>
      </h3>

      <div className='flex gap-3'>
        <CustomButton
          onClick={async () => {
            // reservationId
            //   ? router.push(
            //       `/reservation/select-reservation/single-reservation?businessName=${businessName}&businessId=${businessId}&cooperateID=${cooperateID}`
            //     )
            //   :
            router.push(
              `/reservation/select-reservation?businessName=${businessName}&businessId=${businessId}&cooperateID=${cooperateID}`
            );

            clearItemLocalStorage('bookingDetails');
          }}
          className='h-[49px] md:mb-0 w-full flex-grow text-black border border-[#D0D5DD] mb-4 '
          backgroundColor='bg-white'
          type='submit'
        >
          Close
        </CustomButton>
      </div>
    </>
  );
};

export default SuccessComponent;
