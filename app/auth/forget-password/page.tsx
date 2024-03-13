import { CustomInput } from '@/components/CustomInput';
import { CustomButton } from '@/components/customButton';
import { Spacer } from '@nextui-org/react';
import Image from 'next/image';
import Link from 'next/link';

import React from 'react';
import { FaRegEnvelope } from 'react-icons/fa6';
import hobink from '../../../public/assets/images/hobink.png';
import { lexend } from '@/utilities/ui-config/fonts';
import HobinkLogo from '@/components/logo';

export const metadata = {
  title: 'Create account',
  description: 'Streamline your business processes',
};
const ForgetPassword = () => {
  return (
    <main className='min-h-screen flex flex-col md:justify-center justify-start items-center md:p-0 py-24 px-4 bg-secondaryColor'>
      <div className='md:w-[464px] w-full  bg-white text-black lg:p-7 py-12 px-6  rounded-2xl'>
        <HobinkLogo />
        <h2 className='text-[28px] font-bold '>Forgot Password</h2>
        <p className='text-sm  text-grey500 mb-8'>
          Enter your email to reset your password
        </p>
        <Spacer y={6} />
        <form autoComplete='off'>
          <CustomInput
            type='email'
            label='Email Address'
            placeholder='Enter Email'
            endContent={
              <FaRegEnvelope className='text-foreground-500 text-l' />
            }
          />
          <Spacer y={8} />
          <CustomButton type='submit'>Send password reset link</CustomButton>
        </form>
        <Spacer y={8} />
        <div className='flex items-center gap-2'>
          <p className='text-grey400 text-xs m-0'>{`Remember password?`}</p>
          <Link className='text-primaryColor text-sm' href='/auth/login'>
            Log in
          </Link>
        </div>
      </div>
    </main>
  );
};

export default ForgetPassword;
