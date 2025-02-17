import SignupForm from '@/components/ui/auth/signupForm';
import { companyInfo } from '@/lib/companyInfo';
import { Spacer } from '@nextui-org/react';
import Image from 'next/image';
import Link from 'next/link';
import { Suspense } from 'react';
import ReaceptionImage from '@/public/assets/images/reception-vector.png';
import { LampContainer } from '@/components/ui/lampEffect';
import { FlipWords } from '@/components/ui/flipword';
import { HOME_URL } from '@/utilities/routes';

export const metadata = {
  title: `${companyInfo.name}| Create account`,
  description: 'Streamline your business processes',
};

export default function Signup() {
  const words = ['bookings', 'orders', 'campaigns', 'payments'];
  return (
    <main className="flex min-h-screen bg-white text-black">
      <div className="hidden lg:block lg:fixed inset-y-0 left-0 w-1/2 m-3">
        {/* <div className="relative h-full">
          <Suspense fallback={<div className="absolute inset-0 w-full h-full object-cover bg-primaryGrey rounded-[32px]" />}>
            <Image src={ReaceptionImage} alt="reception" className="w-full h-full" />
          </Suspense>
        </div> */}
        <LampContainer>
          <h1 className=" mx-auto">
            Manage
            <FlipWords className="text-white" words={words} /> <br />
            <span className="text-2xl">Ensuring smooth business operation.</span>
          </h1>
        </LampContainer>
      </div>

      <div className="w-full lg:w-1/2 lg:ml-[50%]">
        <div className="min-h-screen flex flex-col">
          <div className="pt-8 px-8 lg:pt-16 lg:px-16">
            <div className="flex justify-center">
              <div className="flex items-center gap-2">
                <Link className="block" href={HOME_URL}>
                  <Image src={companyInfo.logo} height={150} width={150} style={{ objectFit: 'cover' }} alt="company logo" />
                </Link>
              </div>
            </div>
          </div>

          <div className="flex-1 flex lg:items-center items-start xl:py-6 py-12  justify-center px-8 lg:px-16">
            <div className="w-full max-w-md">
              <h1 className="text-4xl text-center font-semibold mb-2">Create Account</h1>
              <p className="text-grey600 text-center">Enter your details to create your account</p>
              <Spacer y={10} />
              <SignupForm />

              <p className="text-center mt-8 text-sm text-grey600">
                Already have an account?{' '}
                <Link href="/auth/login" className="text-primaryColor font-medium">
                  Log In
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
