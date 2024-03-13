'use client';
import { CustomInput } from '@/components/CustomInput';
import { CustomButton } from '@/components/customButton';
import HobinkLogo from '@/components/logo';
import SelectInput from '@/components/selectInput';
import { Spacer } from '@nextui-org/react';
import { useRouter } from 'next/navigation';
import React from 'react';

const BusinessInformation = () => {
  const router = useRouter();
  return (
    <main className='min-h-screen md:p-0 py-4 px-4  bg-pink200'>
      <div className='md:p-10 p-0 pb-4 md:pb-0'>
        <HobinkLogo />
      </div>
      <section className='md:min-h-screen min-h-full md:top[-10rem] top-0 w-full md:absolute static grid md:place-content-center place-content-start'>
        <div className='md:w-[464px] w-full  bg-white text-black lg:p-7 py-12 px-6  md:rounded-2xl rounded-lg'>
          <h2 className='text-[28px] leading-8 font-bold '>
            Tell us about your business
          </h2>

          <Spacer y={8} />
          <form action={() => router.push('/dashboard')} autoComplete='off'>
            <CustomInput
              type='text'
              label='Business name'
              placeholder='Name of your business'
            />
            <Spacer y={6} />
            <CustomInput
              type='text'
              label='Business address'
              placeholder='Where is your business located'
            />
            <Spacer y={6} />
            <SelectInput
              label={'Business category'}
              placeholder={'Business category'}
              contents={[
                {
                  label: 'Business center',
                  value: 'Business center',
                },
                {
                  label: 'Logistics',
                  value: 'Logistics',
                },
              ]}
            />
            <Spacer y={8} />
            <CustomButton type='submit'>Proceed</CustomButton>
          </form>
        </div>
      </section>
    </main>
  );
};

export default BusinessInformation;
