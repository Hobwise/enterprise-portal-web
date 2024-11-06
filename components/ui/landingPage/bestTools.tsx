'use client';
import { FlashIcon } from '@/public/assets/svg';
import React from 'react';
import BestTools from './tools';
import { Transition } from './transition';

export default function BestToolsComponent() {
  const sectionHeaderClass: string =
    'flex items-center w-fit space-x-2 text-primaryColor bg-[#6840D50D] border-[#5F35D24D] border px-4 py-1.5 rounded-full text-xs mx-auto shadow_custom-inset';
  return (
    <React.Fragment>
      <Transition>
        <div className={sectionHeaderClass}>
          <FlashIcon />
          <p className="font-normal">Best Tools</p>
        </div>
        <div className="w-[55%] mx-auto">
          <h2 className="text-[40px] text-[#161618] leading-[64px] font-bricolage_grotesque">Everything You Need to Run Your Business — All in One Place</h2>
          <p className="font-normal text-[#44444A] text-center w-[80%] mx-auto text-sm">
            We&apos;ve carefully designed Hobink to help you manage your restaurant, hotel, or bar with ease, so you can focus on what matters most—your guests.
          </p>
        </div>
      </Transition>

      <BestTools />
    </React.Fragment>
  );
}
