import { Spacer } from '@nextui-org/react';
import Image from 'next/image';
import NoBooking from '../../../../public/assets/images/no-booking.png';

const EmptyBooking = () => {
  return (
    <section className='bg-[#F8F8F8] rounded-md flex flex-col p-4 justify-center items-center flex-grow'>
      <div className='flex flex-col items-center'>
        <Image src={NoBooking} alt='no menu illustration' />
        <Spacer y={5} />
        <p className='text-lg font-[600]'>No bookings yet</p>
        <p className='text-sm font-[400]  w-full text-center text-[#475367]'>
          Bookings will appear here as they are made
        </p>
      </div>
    </section>
  );
};

export default EmptyBooking;
