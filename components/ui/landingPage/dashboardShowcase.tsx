'use client';
import DashboardShowcaseImage from '@/public/assets/images/dashboard-showcase.png';
import Image from 'next/image';
import React from 'react';
import { Transition } from './transition';

export default function DashboardShowcase() {
  return (
    <section className="font-satoshi px-6 lg:px-12 pb-8 lg:pb-16">
      <Transition>
        <div className="lg:w-[85%] mx-auto">
          <Image src={DashboardShowcaseImage} alt="Hobwise stock analysis dashboard" priority className="w-full h-auto object-contain" />
        </div>
      </Transition>
    </section>
  );
}
