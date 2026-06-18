'use client';
import { FlashIcon } from '@/public/assets/svg';
import React from 'react';
import BestTools from './tools';
import { Transition } from './transition';

export default function BestToolsComponent() {
  const sectionHeaderClass: string =
    'flex items-center w-fit space-x-2 text-primaryColor bg-[#6840D50D] border-[#5F35D24D] border px-4 py-1.5 rounded-full text-xs lg:mx-auto shadow_custom-inset';
  return (
    <React.Fragment>
      <Transition>
        <div className={sectionHeaderClass}>
          <FlashIcon />
          <p className='font-normal'>Best Tools</p>
        </div>
        <div className='lg:w-[55%] lg:mx-auto space-y-4 lg:space-y-0 mt-4 lg:mt-0'>
          <h2 className='text-[28px] text-left lg:text-center lg:text-[44px] text-[#1D2939] lg:leading-[52px] font-bricolage_grotesque font-bold'>
            Everything You Need To Run Your Business
          </h2>
          <p className='font-normal text-[#44444A] text-left lg:text-center lg:w-[80%] mx-auto text-sm'>
            We&apos;ve carefully designed Hobwise to help you manage your
            restaurant, hotel, or bar with ease, so you can focus on what
            matters most—your guests.
          </p>
        </div>
      </Transition>

      <BestTools />
    </React.Fragment>
  );
}
