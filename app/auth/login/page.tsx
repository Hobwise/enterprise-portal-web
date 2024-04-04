import { Spacer } from '@nextui-org/react';
import Link from 'next/link';
import HobinkLogo from '@/components/logo';
import LoginForm from '@/components/ui/auth/loginForm';

export const metadata = {
  title: 'Log in to Hobink',
  description: 'Streamline your business processes',
};

export default function Login() {
  return (
    <main
      className={` auth-background relative xl:py-8 py-2 bg-no-repeat flex justify-center xl:items-center items-start bg-cover  min-h-screen `}
    >
      <div className='container flex flex-col justify-center  w-full xl:p-0 px-4 '>
        <HobinkLogo
          textColor='text-white'
          containerClass='flex xl:hidden gap-2 items-center pt-8 mb-10'
        />
        <div className='flex flex-col justify-between xl:flex-row'>
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

          <div className='flex-1   mb-10 xl:max-w-[456px] w-full md:mb-0 bg-white text-black lg:p-7 py-12 px-6  rounded-xl'>
            <h2 className='text-[28px] font-bold mb-2'>Log In</h2>
            <p className='text-sm  text-grey500 mb-14'>
              Enter your credentials to access your account
            </p>
            <LoginForm />
            <Spacer y={8} />
            <div className='flex items-center gap-2'>
              <p className='text-grey400 text-xs m-0'>
                {"Don't  have an account?"}
              </p>
              <Link className='text-primaryColor text-sm' href='/auth/signup'>
                Create Account
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
