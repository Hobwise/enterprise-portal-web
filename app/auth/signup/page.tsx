import SignupForm from '@/components/ui/auth/signupForm';
import { companyInfo } from '@/lib/companyInfo';
import { Spacer } from '@nextui-org/react';
import Image from 'next/image';
import Link from 'next/link';
import { Suspense } from 'react';

export const metadata = {
  title: `${companyInfo.name}| Create account`,
  description: 'Streamline your business processes',
};

export default function Signup() {
  return (
    <main className="flex min-h-screen bg-white text-black">
      <div className="hidden lg:block lg:fixed inset-y-0 left-0 w-1/2 m-3">
        <div className="relative h-full">
          <Suspense fallback={<div className="absolute inset-0 w-full h-full object-cover bg-primaryGrey rounded-[32px]" />}>
            <video className="absolute inset-0 w-full h-full object-cover bg-primaryGrey rounded-[32px]" autoPlay loop muted playsInline>
              <source src="/onboarding-vids.mp4" type="video/mp4" />
            </video>
          </Suspense>

          <div className="absolute bottom-10 left-10 text-white max-w-md">
            <h1 className="text-5xl font-display mb-4">Streamline your business processes</h1>
            <p className="text-primaryGrey">
              Increase efficiency and improve user experience, from reservation to checkout. Manage orders and inventory like a pro.
            </p>
          </div>
        </div>
      </div>

      <div className="w-full lg:w-1/2 lg:ml-[50%]">
        <div className="min-h-screen flex flex-col">
          <div className="pt-8 px-8 lg:pt-16 lg:px-16">
            <div className="flex justify-center">
              <div className="flex items-center gap-2">
                <Image src={companyInfo.logo} height={150} width={150} style={{ objectFit: 'cover' }} alt="company logo" />
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
                  Log in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
