'use client';
import LandingPageBg from '@/public/assets/images/landing-page-bg.png';
import Image from 'next/image';
import React from 'react';
import LandingPageHeader from '@/components/ui/landingPage/header';
import Navbar from '@/components/ui/landingPage/nav-bar';
import { ArrowRight } from '@/public/assets/svg';
import { bricolage_grotesque } from '@/utilities/ui-config/fonts';
import { cn } from '@/lib/utils';
import { CustomButton } from '@/components/customButton';

// export const metadata = {
//   title: companyInfo.name,
//   description: 'Streamline your business processes',
// };

export default function LandingPage() {
  return (
    <React.Fragment>
      <header className="z-50 backdrop-filter backdrop-blur-md fixed w-full">
        <LandingPageHeader />
        <Navbar />
      </header>

      <main className="gap-3 main relative text-center pt-32">
        <Image src={LandingPageBg} alt="" className="absolute top-0" />
        <section className="w-[50%] mx-auto space-y-6 font-satoshi pt-20 main-section">
          <div
            className="flex items-center w-fit space-x-2 text-primaryColor bg-[#6840D50D] border-[#5F35D24D] border px-4 py-1.5 rounded-full text-xs mx-auto"
            style={{ boxShadow: '0px 7.4px 18.5px 0px #FFFFFF1C inset' }}
          >
            <p className="font-normal">New: Contactless Service with QR Codes</p>
            <ArrowRight />
          </div>
          <h1 className={cn('text-[50px] leading-[64px]', bricolage_grotesque.className)}>Effortless Management for Restaurants, Hotels, and Bars</h1>
          <p className="font-normal text-[#44444A]">
            Streamline your business with real-time analytics, seamless order management, and easy booking—all in one platform.
          </p>

          <div className="flex space-x-4 justify-center">
            <CustomButton className="before:ease relative h-[40px] overflow-hidden border border-[#FFFFFF26] px-8 border-white bg-primaryColor text-white shadow-2xl transition-all before:absolute before:right-0 before:top-0 before:h-[40px] before:w-6 before:translate-x-12 before:rotate-6 before:bg-white before:opacity-10 before:duration-700 hover:shadow-primaryColor-500 hover:before:-translate-x-40">
              Request a Demo
            </CustomButton>
            <CustomButton className="bg-[#DDDCFE] border border-primaryColor text-primaryColor h-[38px] px-8">Get Started</CustomButton>
          </div>
        </section>
      </main>
    </React.Fragment>
  );
}
