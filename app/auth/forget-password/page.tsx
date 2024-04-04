import React from 'react';
import HobinkLogo from '@/components/logo';
import EntryPoint from '@/components/ui/auth/forget-password/EntryPoint';
import BackButton from '@/components/backButton';
import Background from '../../../public/assets/images/nightlife-party-with-drinks-bar 1.png';
import Image from 'next/image';

export const metadata = {
  title: 'Create account',
  description: 'Streamline your business processes',
};
const ForgetPassword = () => {
  return (
    <main className='min-h-screen background flex flex-col md:justify-center justify-start items-center md:p-0 py-24 px-4 '>
      <Image
        fill
        className='absolute bg-no-repeat h-full   w-full bg-cover'
        src={Background}
        alt='background'
      />
      <div className='absolute top-0 left-0'>
        <BackButton color='text-white' url='/auth/login' />
      </div>
      <div className='md:w-[464px] w-full z-10 bg-white text-black lg:p-7 py-12 px-6  md:rounded-2xl rounded-lg'>
        <HobinkLogo />

        <EntryPoint />
      </div>
    </main>
  );
};

export default ForgetPassword;
