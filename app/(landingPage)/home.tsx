'use client';
import Image from 'next/image';
import React, { useEffect, useState } from 'react';
import { ArrowLeftIcon, ArrowRight, ArrowRightIcon, CampaignIcon, TagIcon } from '@/public/assets/svg';
import { CustomButton } from '@/components/customButton';
import Airbnb from '@/public/assets/icons/airbnb.png';
import Hubspot from '@/public/assets/icons/hubspot.png';
import Google from '@/public/assets/icons/google.png';
import Microsoft from '@/public/assets/icons/microsoft.png';
import FedEx from '@/public/assets/icons/fedex.png';
import AdvertOne from '@/public/assets/images/advert-1.png';
import PricePlan from '@/public/assets/images/price-bg.png';
import { Transition } from '@/components/ui/landingPage/transition';
import Link from 'next/link';
import { SIGN_UP_URL } from '@/utilities/routes';

import dynamic from 'next/dynamic';

const LandingPageHeader = dynamic(() => import('@/components/ui/landingPage/header'), { ssr: false });
const Navbar = dynamic(() => import('@/components/ui/landingPage/navBar'), { ssr: false });
const Features = dynamic(() => import('@/components/ui/landingPage/features'), { ssr: false });
const PricingComponent = dynamic(() => import('@/components/ui/landingPage/pricing'), { ssr: false });
const BestToolsComponent = dynamic(() => import('@/components/ui/landingPage/bestTools'), { ssr: false });
const FAQs = dynamic(() => import('@/components/ui/landingPage/faq'), { ssr: false });
const JoinCommunity = dynamic(() => import('@/components/ui/landingPage/joinCommunity'), { ssr: false });
const Footer = dynamic(() => import('@/components/ui/landingPage/footer'), { ssr: false });

export default function HomeComponent() {
  const companies = [
    { image: Airbnb, title: 'Airbnb' },
    { image: Hubspot, title: 'Hubspot' },
    { image: Google, title: 'Google' },
    { image: Microsoft, title: 'Microsoft' },
    { image: FedEx, title: 'FedEx' },
  ];
  const sectionHeaderClass: string =
    'flex items-center w-fit space-x-2 text-primaryColor bg-[#6840D50D] border-[#5F35D24D] border px-4 py-1.5 rounded-full text-xs lg:mx-auto shadow_custom-inset';
  const sectionHeaderClass2: string =
    'flex items-center w-fit space-x-2 text-[#cbd2d6] bg-[#6840D50D] border-[#cbd2d6] border px-4 py-1.5 rounded-full text-xs lg:mx-auto shadow_custom-inset';

  return (
    <div className="overflow-y-scroll scroll-smooth lg:h-screen bg-white">
      <main className="gap-3 text-center relative bg-white overflow-x-hidden font-satoshi h-full">
        <section className="w-full overflow-hidden">
          <video autoPlay loop muted className="absolute top-10 left-0 w-full h-screen lg:h-full object-cover">
            <source src="/assets/video/landing-page.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>

          <header className="z-50 w-full top-0 lg:mx-auto space-y- font-satoshi fixed bg-opacity-15 bg-textGrey backdrop-filter backdrop-blur-md right-0 left-0">
            <LandingPageHeader />
            <Navbar className="bg-none py-4 lg:py-2" />
          </header>
          <div className="lg:w-[50%] text-left lg:text-center lg:mx-auto space-y-4 lg:space-y-6 font-satoshi absolute top-[65vh] lg:top-[55vh] px-4 lg:px-0 lg:bottom-12 right-0 left-0 z-10">
            <div className={sectionHeaderClass2}>
              <p className="font-normal text-white lg:text-base text-sm">New: Contactless Service with QR Codes</p>
              <ArrowRight className="text-[#cbd2d6]" />
            </div>
            <h1 className="text-[30px] lg:text-[50px] lg:leading-[64px] text-white font-bricolage_grotesque font-medium">
              Effortless Management for Restaurants, Hotels, and Bars
            </h1>
            <p className="font-normal text-[#cbd2d6] lg:text-base text-sm">
              Streamline your business with real-time analytics, seamless order management, and easy booking—all in one platform.
            </p>

            <div className="flex space-x-4 lg:justify-center">
              <CustomButton className="before:ease relative h-[40px] overflow-hidden px-8 border-white bg-primaryColor text-white shadow-2xl transition-all before:absolute before:right-0 before:top-0 before:h-[40px] before:w-6 before:translate-x-12 before:rotate-6 before:bg-white before:opacity-10 before:duration-700 hover:shadow-primaryColor-500 hover:before:-translate-x-40">
                Request a Demo
              </CustomButton>
              <Link href={SIGN_UP_URL}>
                <CustomButton className="bg-[#DDDCFE]  text-primaryColor h-[38px] px-8">Get Started</CustomButton>
              </Link>
            </div>
          </div>
        </section>

        <section className="lg:space-y-6 p-6 lg:py-16 mt-[105vh] px-6 lg:px-0">
          <Transition>
            <div className="space-y-4 lg:space-y-10 overflow-hidden">
              <p className="font-bricolage_grotesque text-[#677182] font-light text-sm lg:text-base">More than 10,000 companies enjoy using our product</p>

              <div
                x-data="{}"
                x-init="$nextTick(() => {
                  let ul = $refs.logos;
                  ul.insertAdjacentHTML('afterend', ul.outerHTML);
                  ul.nextSibling.setAttribute('aria-hidden', 'true');
              })"
                className="inline-flex w-[95%] lg:w-[70%] flex-nowrap overflow-hidden [mask-image:_linear-gradient(to_right,transparent_0,_black_128px,_black_calc(100%-128px),transparent_100%)]"
              >
                <ul className="flex animate-infinite-scroll items-center justify-center md:justify-start [&_img]:max-w-none [&_li]:mx-8">
                  {companies.map((logo, index) => (
                    <li key={index}>
                      <img src={logo.image.src} alt={logo.title} className="w-[60px] lg:w-[120px]" loading="lazy" />
                    </li>
                  ))}
                </ul>
                <ul className="flex animate-infinite-scroll items-center justify-center md:justify-start [&_img]:max-w-none [&_li]:mx-8" aria-hidden="true">
                  {companies.map((logo, index) => (
                    <li key={index}>
                      <img src={logo.image.src} alt={logo.title} className="w-[60px] lg:w-[120px]" loading="lazy" />
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Transition>
        </section>

        <section className="bg-[#FBFBFC] py-8 space-y-4 lg:py-16 lg:space-y-8 font-satoshi">
          <Features />
        </section>

        <section className="bg-white py-8 lg:py-16 font-satoshi space-y-4 lg:space-y-8 px-6 lg:px-12">
          <BestToolsComponent />
        </section>

        <Transition>
          <section className="bg-white py-8 lg:py-16 font-satoshi space-y-4 lg:space-y-8 px-6 lg:px-12">
            <div className={sectionHeaderClass}>
              <CampaignIcon />
              <p className="font-normal">Campaigns</p>
            </div>
            <div className="lg:w-[85%] lg:mx-auto">
              <h2 className="text-[24px] text-left lg:text-center lg:text-[40px] text-[#161618] lg:leading-[64px] font-bricolage_grotesque">
                Checkout amazing deals from brands registered with us
              </h2>
            </div>
            <div className="w-full relative px-4 lg:px-8">
              <Image src={AdvertOne} alt="advert" />
              <div className="p-3 rounded-full w-fit shadow-custom_shadow absolute left-1 bottom-[45%] bg-white">
                <ArrowLeftIcon className="hidden lg:flex" />
              </div>
              <div className="p-3 rounded-full w-fit shadow-custom_shadow absolute bottom-[45%] right-0 bg-white">
                <ArrowRightIcon className="hidden lg:flex" />
              </div>
            </div>
          </section>
        </Transition>

        <section className="bg-[#5F35D2] py-10 lg:py-20 font-satoshi space-y-4 lg:space-y-8 px-6 lg:px-12 price-plan-section relative">
          <Image src={PricePlan} alt="" className="absolute top-0 w-[90%]" priority />
          <Transition>
            <div className="bg-[#703CFF] flex items-center w-fit space-x-2 px-4 py-1.5 rounded-full mx-auto shadow-custom-inset">
              <TagIcon />
              <p className="font-normal text-white">Pricing Plan</p>
            </div>

            <div className="w-[85%] mx-auto text-satoshi space-y-2">
              <h2 className="text-[24px] lg:text-[40px] text-white lg:leading-[64px] font-bricolage_grotesque">Plans That Fit Your Business</h2>
              <p className="text-[#ACB5BB] text-sm lg:text-base">From startups to enterprises, find the right solution to streamline your HR processes</p>
            </div>
          </Transition>

          <PricingComponent />
        </section>

        <FAQs />

        <JoinCommunity />
        <Footer />
      </main>
    </div>
  );
}
