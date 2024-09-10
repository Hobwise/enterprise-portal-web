'use client';
import { CustomButton } from '@/components/customButton';
import usePermission from '@/hooks/cachedEndpoints/usePermission';
import useReservation from '@/hooks/cachedEndpoints/useReservation';
import { Spacer } from '@nextui-org/react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { IoMdAdd } from 'react-icons/io';
import NoBooking from '../../../../public/assets/images/no-booking.png';

const CreateReservation = ({ showCreateBookingModal }: any) => {
  const router = useRouter();
  const { data } = useReservation();
  const { userRolePermissions, role } = usePermission();

  return (
    <section>
      <Spacer y={14} />
      <div className='flex flex-col items-center'>
        <Image src={NoBooking} alt='no menu illustration' />
        <Spacer y={5} />
        <p className='text-lg font-[600]'>You have no bookings yet</p>
        <p className='text-sm font-[400] xl:w-[260px] w-full text-center text-[#475367]'>
          {data?.totalCount === 0
            ? 'Create a reservation so that customers can start booking.'
            : 'Create a booking for the customers.'}
        </p>
        <Spacer y={5} />

        {(role === 0 || userRolePermissions?.canCreateReservation === true) && (
          <CustomButton
            onClick={() =>
              data?.totalCount === 0
                ? router.push('/dashboard/reservation/create-reservation')
                : showCreateBookingModal()
            }
            className='py-2 px-4 md:mb-0 mb-4 text-white'
            backgroundColor='bg-primaryColor'
          >
            <div className='flex gap-2 items-center justify-center'>
              <IoMdAdd className='text-[22px]' />
              <p>
                {data?.totalCount === 0
                  ? 'Create reservation'
                  : 'Create booking'}
              </p>
            </div>
          </CustomButton>
        )}
      </div>
    </section>
  );
};

export default CreateReservation;
