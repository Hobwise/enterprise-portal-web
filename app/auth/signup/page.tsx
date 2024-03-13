'use client';
import { Checkbox, Spacer } from '@nextui-org/react';
import { FaRegEnvelope } from 'react-icons/fa6';
import Image from 'next/image';
import hobink from '../../../public/assets/images/hobink.png';
import Link from 'next/link';
import { CustomInput } from '@/components/CustomInput';
import { CustomButton } from '@/components/customButton';
import { lexend } from '@/utilities/ui-config/fonts';
import { useRouter } from 'next/navigation';
import HobinkLogo from '@/components/logo';

const metadata = {
  title: 'Create account',
  description: 'Streamline your business processes',
};

export default function Signup() {
  const router = useRouter();

  return (
    <main className='bg-secondaryColor'>
      <div className='xl:grid  md:w-3/4 xl:max-w-[912px] mx-auto px-4 xl:px-0 w-full xl:place-content-center min-h-screen'>
        <HobinkLogo
          textColor='text-white'
          containerClass='flex xl:hidden gap-2 items-center pt-8 mb-10'
        />
        <div className='flex flex-col lg:flex-row'>
          {/* Left Card: Text Content */}
          <div className='login-background flex-1 h-full relative  xl:flex flex-col justify-between hidden  text-white p-10 rounded-tl-3xl rounded-bl-3xl '>
            <HobinkLogo
              textColor='text-white'
              containerClass='flex gap-2 items-center mb-4'
            />
            <div className='flex flex-col justify-between'>
              <h2 className='text-[32px] font-[600] leading-9 mb-3'>
                Streamline your business processes{' '}
              </h2>
              <p className='text-foreground-400 font-[400]'>
                Increase efficiency and improve user experience, from
                reservation to checkout. Manage orders and inventory like a pro.
              </p>
            </div>
          </div>

          {/* Right Card: Login Form */}
          <div className='flex-1 mb-10 md:mb-0 bg-white text-black lg:p-7 py-12 px-6  xl:rounded-tr-3xl xl:rounded-br-3xl xl:rounded-none rounded-lg'>
            <h2 className='text-[28px] font-bold mb-2'>Create Account</h2>
            <p className='text-sm  text-grey500 mb-8'>
              Enter your details to create your account
            </p>
            <form
              action={() => router.push('/auth/confirm-email')}
              autoComplete='off'
            >
              <div className='flex md:flex-row flex-col gap-5'>
                <CustomInput
                  type='text'
                  label='First name'
                  placeholder='First name'
                  // isRequired={true}
                />
                <CustomInput
                  type='text'
                  label='Last name'
                  placeholder='Last name'
                  // isRequired={true}
                />
              </div>
              <Spacer y={6} />
              <CustomInput
                type='email'
                label='Email Address'
                placeholder='Enter Email'
                // isRequired={true}
                endContent={
                  <FaRegEnvelope className='text-foreground-500 text-l' />
                }
              />

              <Spacer y={6} />
              <CustomInput
                type='password'
                label='password'
                placeholder='Enter password'
                // isRequired={true}
              />

              <Spacer y={6} />

              <CustomButton type='submit'>Create Account</CustomButton>
            </form>
            <Spacer y={8} />
            <div className='flex items-center gap-2'>
              <p className='text-grey400 text-xs m-0'>{`Already have an account?`}</p>
              <Link className='text-primaryColor text-sm' href='/auth/login'>
                Log in
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
