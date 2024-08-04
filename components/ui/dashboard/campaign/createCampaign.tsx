'use client';
import { CustomButton } from '@/components/customButton';
import usePermission from '@/hooks/cachedEndpoints/usePermission';
import { Spacer } from '@nextui-org/react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { IoMdAdd } from 'react-icons/io';
import NoOrder from '../../../../public/assets/images/no-order.png';

const CreateCampaign = () => {
  const router = useRouter();
  const { ...userRolePermissions } = usePermission();
  const { ...managerRolePermissions } = usePermission();

  return (
    <section>
      <Spacer y={14} />
      <div className='flex flex-col items-center'>
        <Image src={NoOrder} alt='no menu illustration' />
        <Spacer y={5} />
        <p className='text-lg font-[600]'>You have no campaigns yet</p>
        <p className='text-sm font-[400] xl:w-[260px] w-full text-center text-[#475367]'>
          Create a campaign to share special offers with your customers
        </p>
        <Spacer y={5} />
        {managerRolePermissions?.canCreateCampaign &&
          userRolePermissions?.canCreateCampaign !== false && (
            <CustomButton
              onClick={() =>
                router.push('/dashboard/campaigns/create-campaign')
              }
              className='py-2 px-4 md:mb-0 mb-4 text-white'
              backgroundColor='bg-primaryColor'
            >
              <div className='flex gap-2 items-center justify-center'>
                <IoMdAdd className='text-[22px]' />

                <p>Create campaign</p>
              </div>
            </CustomButton>
          )}
      </div>
    </section>
  );
};

export default CreateCampaign;
