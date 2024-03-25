import { Spacer } from '@nextui-org/react';
import Link from 'next/link';
import React from 'react';
import HobinkLogo from '@/components/logo';
import ForgetPasswordForm from '@/components/ui/auth/forgetPasswordForm';

export const metadata = {
  title: 'Create account',
  description: 'Streamline your business processes',
};
const ForgetPassword = () => {
  return (
    <main className='min-h-screen flex flex-col md:justify-center justify-start items-center md:p-0 py-24 px-4 bg-secondaryColor'>
      <div className='md:w-[464px] w-full  bg-white text-black lg:p-7 py-12 px-6  md:rounded-2xl rounded-lg'>
        <HobinkLogo />
        <h2 className='text-[28px] font-bold '>Forgot Password</h2>
        <p className='text-sm  text-grey500 mb-8'>
          Enter your email to reset your password
        </p>
        <Spacer y={8} />
        <ForgetPasswordForm />
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
