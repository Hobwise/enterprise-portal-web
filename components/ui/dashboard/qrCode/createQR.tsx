'use client';
import { CustomButton } from '@/components/customButton';
import usePermission from '@/hooks/cachedEndpoints/usePermission';
import { Spacer } from '@nextui-org/react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { IoMdAdd } from 'react-icons/io';
import NoOrder from '../../../../public/assets/images/no-order.png';

const CreateQRcode = () => {
  const router = useRouter();
  const { userRolePermissions, role } = usePermission();
  return (
    <section>
      <Spacer y={14} />
      <div className='flex flex-col items-center'>
        <Image src={NoOrder} alt='no menu illustration' />
        <Spacer y={5} />
        <p className='text-lg font-[600]'>You have no Quick response yet</p>
        <p className='text-sm font-[400] xl:w-[260px] w-full text-center text-[#475367]'>
          Create Quick response so users can scan them to access your menu and
          place orders
        </p>
        <Spacer y={5} />
        {(role === 0 || userRolePermissions?.canCreateQR === true) && (
          <CustomButton
            onClick={() => router.push('/dashboard/quick-response/create-qr')}
            className='py-2 px-4 md:mb-0 mb-4 text-white'
            backgroundColor='bg-primaryColor'
          >
            <div className='flex gap-2 items-center justify-center'>
              <IoMdAdd className='text-[22px]' />

              <p>Create Quick Response</p>
            </div>
          </CustomButton>
        )}
      </div>
    </section>
  );
};

export default CreateQRcode;
