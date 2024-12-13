'use client';
import Navbar from '@/components/ui/landingPage/navBar';
import Image from 'next/image';
import React, { useState } from 'react';
import PricePlan from '@/public/assets/images/pricing-bg-2.png';
import { TagIcon } from '@/public/assets/svg';
import PricingComponent from '@/components/ui/landingPage/pricing';
import JoinCommunity from '@/components/ui/landingPage/joinCommunity';
import BestToolsComponent from '@/components/ui/landingPage/bestTools';
import Footer from '@/components/ui/landingPage/footer';
import Companies from '@/components/ui/landingPage/companies';
import LandingPageHeader from '@/components/ui/landingPage/header';
import { Transition } from '@/components/ui/landingPage/transition';

export default function Pricing() {
  const [plan, setPlan] = useState<string>('monthly');

  return (
    <div className="bg-white">
      <header className="z-50 backdrop-filter backdrop-blur-md fixed w-full">
        <LandingPageHeader />
        <Navbar type="default" />
      </header>

      <main className="w-full pt-12 font-satoshi">
        <section className=" font-satoshi py-12 space-y-12 bg-white  main-section">
          <Image src={PricePlan} alt="" className="absolute top-0 w-[60%] right-[20%] px-6 lg:px-12" priority />
          <div className="bg-[#6840D50D] text-[#5F35D2] lg:px-12 border border-[#5F35D2] flex items-center w-fit space-x-2 px-4 py-1.5 rounded-full mx-auto shadow-custom_inset_2">
            <TagIcon className="text-[#5F35D2]" />
            <p className="font-normal text-[#5F35D2] text-sm">Pricing</p>
          </div>

          <div className="w-[100%] mx-auto px-6 lg:px-12 text-satoshi space-y-2 text-center">
            <h2 className="text-[32px] lg:text-[56px] text-[#0E0E33] lg:leading-[64px] font-bricolage_grotesque">Simple Pricing for Every Business</h2>
            <p className="text-[#565A5D]">Our transparent and straightforward pricing plans are designed to meet the needs of businesses of all sizes.</p>
          </div>

          <div className="px-6 lg:px-12">
            <PricingComponent />
          </div>

          <section className="lg:space-y-6 p-6 lg:py-4 px-6 lg:px-0 bg-white">
            <Transition>
              <div className="space-y-4 lg:space-y-10 overflow-hidden">
                <p className="font-bricolage_grotesque text-[#677182] text-center font-light text-sm lg:text-base">Some companies enjoy using our product</p>

                <div
                  x-data="{}"
                  x-init="$nextTick(() => {
                  let ul = $refs.logos;
                  ul.insertAdjacentHTML('afterend', ul.outerHTML);
                  ul.nextSibling.setAttribute('aria-hidden', 'true');
              })"
                  className="inline-flex w-[95%] lg:w-[100%] flex-nowrap overflow-hidden [mask-image:_linear-gradient(to_right,transparent_0,_black_128px,_black_calc(100%-128px),transparent_100%)]"
                >
                  <ul className="flex animate-infinite-scroll items-center justify-center md:justify-start [&_img]:max-w-none [&_li]:mx-8">
                    <Companies />
                  </ul>
                  <ul className="flex animate-infinite-scroll items-center justify-center md:justify-start [&_img]:max-w-none [&_li]:mx-8" aria-hidden="true">
                    <Companies />
                  </ul>
                </div>
              </div>
            </Transition>
          </section>

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

        <section className="bg-white pb-12 pt-4 lg:pb-20 px-6 lg:px-12 text-center">
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
