'use client';
import { CustomButton } from '@/components/customButton';
import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className='absolute top-0 left-0 w-full h-full  flex flex-col justify-center items-center'>
      <h2 className='text-center text-sm mb-2'>Something went wrong!</h2>
      <CustomButton
        className='bg-primaryColor w-25 py-4 text-white'
        onClick={() => reset()}
      >
        Try again
      </CustomButton>
    </main>
  );
}
