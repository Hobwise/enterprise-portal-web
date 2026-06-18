'use client';
import Image from 'next/image';
import React, { useEffect, useState } from 'react';
import { CustomButton } from '@/components/customButton';
import Link from 'next/link';
import { REQUEST_DEMO_URL, SIGN_UP_URL } from '@/utilities/routes';
import LandingPageHeader from '@/components/ui/landingPage/header';
import Navbar from '@/components/ui/landingPage/navBar';
import FAQs from '@/components/ui/landingPage/faq';
import JoinCommunity from '@/components/ui/landingPage/joinCommunity';
import Footer from '@/components/ui/landingPage/footer';
import BestToolsComponent from '@/components/ui/landingPage/bestTools';
import Campaigns from '@/components/ui/landingPage/campaigns';
import Demo from '@/components/ui/landingPage/demo';
import HospiraAI from '@/components/ui/landingPage/hospiraAI';
import Inventory from '@/components/ui/landingPage/inventory';
import DashboardShowcase from '@/components/ui/landingPage/dashboardShowcase';
import { StarIcon } from '@/public/assets/svg';
import HeroGrid from '@/public/assets/images/hero-grid.png';
import HeroGridMobile from '@/public/assets/images/hero-grid-mobile.png';

export default function HomeComponent() {
  const [isSignedIn, setIsSignedIn] = useState<boolean>(false);
  const userInformation = typeof window !== 'undefined' && localStorage.getItem('userInformation');

  useEffect(() => {
    if (userInformation) {
      const userToken = JSON.parse(userInformation).token;
      if (userToken) {
        setIsSignedIn(true);
      }
    }
  }, [userInformation]);

  return (
    <div className="overflow-y-scroll scroll-smooth h-screen bg-white">
      <main className="gap-3 text-center relative bg-white overflow-x-hidden font-satoshi h-full">
        <section className="w-full overflow-hidden">
          <header className="z-[100] w-full top-0 lg:mx-auto font-satoshi fixed bg-white backdrop-filter backdrop-blur-md right-0 left-0">
            <LandingPageHeader />
            <Navbar className="bg-none py-4 lg:py-2" type="default" />
          </header>

          <div className="relative">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-12 pt-36 lg:pt-44 lg:items-center">
              <div className="space-y-6 lg:space-y-8 px-6 lg:pl-16 text-center lg:text-left">
                <div className="flex items-center w-fit mx-auto lg:mx-0 space-x-2 text-primaryColor bg-[#6840D50D] border-[#5F35D24D] border px-4 py-1.5 rounded-full text-xs shadow_custom-inset">
                  <StarIcon />
                  <p className="font-normal">Now with Artificial Intelligence · Hospira</p>
                </div>

                <div className="space-y-4">
                  <h1 className="text-[32px] lg:text-[54px] lg:leading-[64px] text-[#161618] font-bricolage_grotesque font-medium">
                    Modern Hospitality Management With Built-In <span className="text-primaryColor">AI Assistance</span>
                  </h1>
                  <p className="font-normal text-[#44444A] lg:text-base text-sm lg:w-[90%]">
                    Manage reservations, orders, inventory, payments, staff operations, and more from one platform, now with an intelligent AI assistant ready
                    to help whenever you need it.
                  </p>
                </div>

                <div className="flex space-x-4 justify-center lg:justify-start">
                  <Link href={REQUEST_DEMO_URL}>
                    <CustomButton className="before:ease relative h-[40px] overflow-hidden px-8 border-white bg-primaryColor text-white shadow-2xl transition-all before:absolute before:right-0 before:top-0 before:h-[40px] before:w-6 before:translate-x-12 before:rotate-6 before:bg-white before:opacity-10 before:duration-700 hover:shadow-primaryColor-500 hover:before:-translate-x-40">
                      Request a Demo
                    </CustomButton>
                  </Link>
                  {isSignedIn ? null : (
                    <Link href={SIGN_UP_URL} target="_blank">
                      <CustomButton className="bg-white border border-primaryColor text-primaryColor h-[38px] px-8">Get Started</CustomButton>
                    </Link>
                  )}
                </div>
              </div>
              <div className="w-full lg:pr-16">
                <Image src={HeroGrid} alt="Hobwise hospitality management" priority className="hidden lg:block w-full h-auto object-contain" />
                <Image src={HeroGridMobile} alt="Hobwise hospitality management" priority className="lg:hidden w-full h-auto object-contain px-6" />
              </div>
            </div>
          </div>
        </section>

        <HospiraAI />

        <Inventory />

        <DashboardShowcase />

        <section id="features" className="scroll-mt-28 bg-white py-8 lg:py-16 font-satoshi space-y-4 lg:space-y-8 px-6 lg:px-12">
          <BestToolsComponent />
        </section>

        <Demo />

        <Campaigns />

        <FAQs />

        <JoinCommunity />
        <Footer />
      </main>
    </div>
  );
}
