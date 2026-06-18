'use client';
import InventoryIllustration from '@/public/assets/images/inventory-illustration.png';
import Image from 'next/image';
import React from 'react';
import { Transition } from './transition';

const features: string[] = [
  'Real-Time Stock Tracking',
  'Inventory Monitoring',
  'Low Stock Notifications',
  'Supplier & Purchase Tracking',
  'Centralized Inventory Records',
];

export default function Inventory() {
  return (
    <section className="font-satoshi px-6 lg:px-12 py-8 lg:py-16 overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10 items-center">
        <Transition>
          <div className="flex justify-center lg:justify-start">
            <Image src={InventoryIllustration} alt="Inventory manager" priority className="w-full max-w-[520px] lg:max-w-none object-contain" />
          </div>
        </Transition>

        <Transition>
          <div className="text-left space-y-6">
            <div className="flex items-center w-fit space-x-2 text-primaryColor bg-[#6840D50D] border-[#5F35D24D] border px-4 py-1.5 rounded-full text-xs shadow_custom-inset">
              <span className="h-2 w-2 rounded-full bg-primaryColor" />
              <p className="font-normal">Inventory Manager</p>
            </div>
            <h2 className="text-[28px] lg:text-[44px] lg:leading-[52px] text-[#1D2939] font-bricolage_grotesque font-bold">Stay In Control Of Your Inventory</h2>
            <p className="font-normal text-[#475467] text-base lg:text-lg leading-relaxed">
              Track stock levels, monitor inventory movement, and manage supplies from a centralized dashboard designed for hospitality businesses.
            </p>
            <div className="space-y-5 pt-2">
              <h4 className="text-[#1D2939] font-bricolage_grotesque font-bold text-xl lg:text-2xl">Features</h4>
              {features.map((each) => (
                <div key={each} className="flex items-center space-x-3">
                  <span className="h-3 w-3 rounded-full bg-primaryColor shrink-0" />
                  <p className="text-[#1D2939] font-medium text-base lg:text-lg">{each}</p>
                </div>
              ))}
            </div>
          </div>
        </Transition>
      </div>
    </section>
  );
}
