import { Spacer } from '@nextui-org/react';
import Link from 'next/link';
import HobinkLogo from '@/components/logo';
import SignupForm from '@/components/ui/auth/signupForm';
import Background from '../../../public/assets/images/nightlife-party-with-drinks-bar 1.png';
import Image from 'next/image';

export const metadata = {
  title: 'Hobink | Create account',
  description: 'Streamline your business processes',
};

<div className='h-[50rem] w-full dark:bg-black bg-white  dark:bg-grid-white/[0.2] bg-grid-black/[0.2] relative flex items-center justify-center'>
  <div className='absolute pointer-events-none inset-0 flex items-center justify-center dark:bg-black bg-white [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]'></div>
  <p className='text-4xl sm:text-7xl font-bold relative z-20 bg-clip-text text-transparent bg-gradient-to-b from-neutral-200 to-neutral-500 py-8'>
    Backgrounds
  </p>
</div>;

export default function Signup() {
  return (
    <main
      className={`  relative xl:py-8 py-2   flex justify-center xl:items-center items-start  min-h-screen `}
    >
      <Image fill className='absolute' src={Background} alt='background' />
      <div className='container flex flex-col justify-center  w-full xl:p-0 px-4 '>
        <HobinkLogo
          textColor='text-white'
          containerClass='flex xl:hidden z-10 gap-2 items-center pt-8 mb-10'
        />
        <div className='flex w-full flex-col  justify-between xl:flex-row'>
          {/* Left Card: Text Content */}
          <div className='relative w-[400px] xl:flex flex-col  hidden  text-white'>
            <HobinkLogo
              textColor='text-white'
              containerClass='xl:flex hidden gap-2 '
            />
            <div className='absolute bottom-0'>
              <h2 className='text-[32px] font-[600]  leading-9 mb-3'>
                Streamline your business processes{' '}
              </h2>
              <p className='text-foreground-400 font-[400]'>
                Increase efficiency and improve user experience, from
                reservation to checkout. Manage orders and inventory like a pro.
              </p>
            </div>
          </div>

          {/* Right Card: Login Form */}
          <div className='flex-1 z-10  mb-10 xl:max-w-[456px]  w-full md:mb-0 bg-white text-black lg:p-7 py-12 px-6  rounded-xl'>
            <h2 className='text-[28px] font-bold mb-2'>Create Account</h2>
            <p className='text-sm  text-grey500 mb-8'>
              Enter your details to create your account
            </p>
            <SignupForm />
            {/* <SignupForm /> */}
            <Spacer y={8} />
            <div className='flex items-center gap-2'>
              <p className='text-grey400 text-xs m-0'>
                {'Already have an account?'}
              </p>
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
