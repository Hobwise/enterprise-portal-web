'use client';
import { CustomInput } from '@/components/CustomInput';
import { CustomButton } from '@/components/customButton';
import { Spacer } from '@nextui-org/react';
import Image from 'next/image';
import React from 'react';
import confirmEmailLogo from '../../../public/assets/images/confirmEmailImage.png';
import hobink from '../../../public/assets/images/hobink.png';
import { lexend } from '@/utilities/ui-config/fonts';
import HobinkLogo from '@/components/logo';
import { useRouter } from 'next/navigation';

const metadata = {
  title: 'Confirm your email',
  description: 'Streamline your business processes',
};
const ConfirmEmail = () => {
  const router = useRouter();
  return (
    <main className='min-h-screen md:p-0 py-4 px-4 flex flex-col justify-center items-center bg-pink200'>
      <HobinkLogo />
      <section className='md:w-[464px] w-full bg-white text-black lg:p-7 py-12 px-6  rounded-2xl'>
        <div className='grid place-content-center'>
          <Image src={confirmEmailLogo} alt='confirm email logo' />
        </div>
        <Spacer y={6} />
        <h2 className='text-[28px]  leading-8 mb-2 text-center font-bold '>
          Confirm your email address
        </h2>
        <p className='text-sm md:w-[400px] w-full  text-center text-grey600 mb-10'>
          We sent a verification code to chike@email.com. Enter the code here to
          confirm your email address.
        </p>
        <form
          action={() => router.push('/auth/business-information')}
          autoComplete='off'
        >
          <Spacer y={6} />
          <CustomInput
            type='text'
            label='Verification code'
            placeholder='Verification code'
          />
          <Spacer y={8} />

          <CustomButton type='submit'>Proceed</CustomButton>
        </form>
      </section>
    </main>
  );
};

export default ConfirmEmail;
