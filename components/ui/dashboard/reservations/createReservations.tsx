'use client';
import { CustomButton } from '@/components/customButton';
import usePermission from '@/hooks/cachedEndpoints/usePermission';
import { Spacer } from '@nextui-org/react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { IoMdAdd } from 'react-icons/io';
import NoBooking from '../../../../public/assets/images/no-booking.png';

const CreateReservation = () => {
  const router = useRouter();

  const { userRolePermissions, role } = usePermission();
  return (
    <section>
      <Spacer y={14} />
      <div className="flex flex-col items-center">
        <Image src={NoBooking} alt="no menu illustration" />
        <Spacer y={5} />
        <p className="text-lg font-[600]">You have no Reservations yet</p>
        <p className="text-sm font-[400] xl:w-[260px] w-full text-center text-[#475367]">
          Create reservations so that customers can start booking
        </p>
        <Spacer y={5} />
        {(role === 0 || userRolePermissions?.canCreateReservation === true) && (
          <CustomButton
            onClick={() =>
              router.push("/dashboard/reservation/create-reservation")
            }
            className="py-2 px-4 md:mb-0 mb-4 text-white"
            backgroundColor="bg-primaryColor"
          >
            <div className="flex gap-2 items-center justify-center">
              <IoMdAdd className="text-[22px]" />

              <p>Create reservation</p>
            </div>
          </CustomButton>
        )}
        {/* {canCreateReservation && (
          <CustomButton
            onClick={() =>
              router.push('/dashboard/reservation/create-reservation')
            }
            className='py-2 px-4 md:mb-0 mb-4 text-white'
            backgroundColor='bg-primaryColor'
          >
            <div className='flex gap-2 items-center justify-center'>
              <IoMdAdd className='text-[22px]' />

              <p>Create reservation</p>
            </div>
          </CustomButton>
        )} */}
      </div>
    </section>
  );
};

export default CreateReservation;
