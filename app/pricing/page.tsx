'use client';
import Navbar from '@/components/ui/landingPage/navBar';
import Image from 'next/image';
import React, { useState } from 'react';
import PricePlan from '@/public/assets/images/price-bg.png';
import { SettingsIcon, TagIcon } from '@/public/assets/svg';
import PricingComponent, { PricingExtended, SwitchPlan } from '@/components/ui/landingPage/pricing';
import JoinCommunity from '@/components/ui/landingPage/joinCommunity';
import FAQs from '@/components/ui/landingPage/faq';
import BestToolsComponent from '@/components/ui/landingPage/bestTools';
import Footer from '@/components/ui/landingPage/footer';
import Companies from '@/components/ui/landingPage/companies';

export default function Pricing() {
  const [plan, setPlan] = useState<string>('monthly');

  return (
    <div className="bg-primaryColor">
      <header className="z-50 backdrop-filter backdrop-blur-md fixed w-full">
        <Navbar type="colored" />
      </header>

      <main className="w-full pt-12 font-satoshi">
        <section className="px-6 lg:px-12 font-satoshi py-12 space-y-8 bg-primaryColor">
          <Image src={PricePlan} alt="" className="absolute top-0 w-[90%]" priority />
          <div className="bg-[#6840D50D] border border-[#5F35D2] flex items-center w-fit space-x-2 px-4 py-1.5 rounded-full mx-auto shadow-custom_inset_2">
            <TagIcon />
            <p className="font-normal text-white text-sm">Pricing</p>
          </div>

          <div className="w-[100%] mx-auto text-satoshi space-y-2 text-center">
            <h2 className="text-[32px] lg:text-[56px] text-white lg:leading-[64px] font-bricolage_grotesque">Simple Pricing for Every Business</h2>
            <p className="text-[#ACB5BB]">Our transparent and straightforward pricing plans are designed to meet the needs of businesses of all sizes.</p>
          </div>

          <PricingComponent />

          <div className="mt-12 space-y-12">
            <p className="text-center text-white text-[20px] mt-16">More than 10,000 companies enjoy using our product</p>
            <Companies type="min" />
          </div>

          {/* <div className="space-y-4 pb-24">
            <div className="lg:mt-24 space-y-4">
              <div className="bg-[#9F7CFE] border border-white/30 flex items-center w-fit space-x-2 px-4 py-1.5 rounded-full shadow-custom_inset_2">
                <SettingsIcon className="text-white" />
                <p className="font-normal text-white text-sm">Compare pricing</p>
              </div>
              <p className="font-normal text-white text-[24px] lg:text-[40px] font-bricolage_grotesque">Choose the Right Plan for Your Growth</p>
            </div>

            <div className="my-8 col-span-1 block lg:hidden">
              <div className="my-8 flex justify-center">
                <SwitchPlan className="mx-0" plan={plan} setPlan={setPlan} />
              </div>
            </div>

            <PricingExtended plan={plan} setPlan={setPlan} />
          </div> */}
        </section>

        <section className="bg-white py-12 lg:py-20 px-6 lg:px-12 text-center">
          <BestToolsComponent />
        </section>

        <section className="text-center">
          <JoinCommunity className="mt-0" />
        </section>
      </main>
      <Footer />
    </div>
  );
}
