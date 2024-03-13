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
      <div className='p-10'>
        <HobinkLogo />
      </div>
      <section className='flex flex-col justify-center items-center'>
        <div className='md:w-[464px] w-full  bg-white text-black lg:p-7 py-12 px-6  rounded-2xl'>
          <h2 className='text-[28px] font-bold '>
            Tell us about your business
          </h2>

          <Spacer y={6} />
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
