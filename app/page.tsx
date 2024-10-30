'use client';
import Image from 'next/image';
import React from 'react';
import LandingPageHeader from '@/components/ui/landingPage/header';
import Navbar from '@/components/ui/landingPage/navBar';
import { ArrowLeftIcon, ArrowRight, ArrowRightIcon, CampaignIcon, TagIcon } from '@/public/assets/svg';
import { CustomButton } from '@/components/customButton';
import DashboardImage from '@/public/assets/images/dashboard-image.png';
import Airbnb from '@/public/assets/icons/airbnb.png';
import Hubspot from '@/public/assets/icons/hubspot.png';
import Google from '@/public/assets/icons/google.png';
import Microsoft from '@/public/assets/icons/microsoft.png';
import FedEx from '@/public/assets/icons/fedex.png';
import AdvertOne from '@/public/assets/images/advert-1.png';
import PricePlan from '@/public/assets/images/price-bg.png';
import { Footer } from '@/components/ui/landingPage/footer';
import Features from '@/components/ui/landingPage/features';
import PricingComponent from '@/components/ui/landingPage/pricing';
import { BestToolsComponent } from '@/components/ui/landingPage/bestTools';
import JoinCommunity from '@/components/ui/landingPage/joinCommunity';
import FAQs from '@/components/ui/landingPage/faq';
import { Transition } from '@/components/ui/landingPage/transition';

export default function LandingPage() {
  const companies = [
    { image: Airbnb, title: 'Airbnb' },
    { image: Hubspot, title: 'Hubspot' },
    { image: Google, title: 'Google' },
    { image: Microsoft, title: 'Microsoft' },
    { image: FedEx, title: 'FedEx' },
  ];
  const sectionHeaderClass: string =
    'flex items-center w-fit space-x-2 text-primaryColor bg-[#6840D50D] border-[#5F35D24D] border px-4 py-1.5 rounded-full text-xs mx-auto shadow_custom-inset';
  return (
    <React.Fragment>
      <header className="z-50 backdrop-filter backdrop-blur-md fixed w-full">
        <LandingPageHeader />
        <Navbar />
      </header>

      <main className="gap-3 relative text-center pt-32 bg-white overflow-x-hidden font-satoshi scroll-smooth focus:scroll-auto">
        <Transition>
          <section className="w-[50%] mx-auto space-y-6 font-satoshi pt-20 home-main-section">
            <div className={sectionHeaderClass}>
              <p className="font-normal">New: Contactless Service with QR Codes</p>
              <ArrowRight />
            </div>
            <h1 className="text-[50px] leading-[64px] text-[#161618] font-bricolage_grotesque">Effortless Management for Restaurants, Hotels, and Bars</h1>
            <p className="font-normal text-dark">
              Streamline your business with real-time analytics, seamless order management, and easy booking—all in one platform.
            </p>

            <div className="flex space-x-4 justify-center">
              <CustomButton className="before:ease relative h-[40px] overflow-hidden border border-[#FFFFFF26] px-8 border-white bg-primaryColor text-white shadow-2xl transition-all before:absolute before:right-0 before:top-0 before:h-[40px] before:w-6 before:translate-x-12 before:rotate-6 before:bg-white before:opacity-10 before:duration-700 hover:shadow-primaryColor-500 hover:before:-translate-x-40">
                Request a Demo
              </CustomButton>
              <CustomButton className="bg-[#DDDCFE] border border-primaryColor text-primaryColor h-[38px] px-8">Get Started</CustomButton>
            </div>
          </section>
        </Transition>

        <section className="space-y-6 pb-16">
          <Image src={DashboardImage} alt="dashboard video" />
          <Transition>
            <div className="space-y-6">
              <p className="font-bricolage_grotesque text-[#677182] font-light">More than 10,000 companies enjoy using our product</p>
              <div className="grid grid-cols-5 gap-10 w-[50%] items-center mx-auto">
                {companies.map((each) => (
                  <img src={each.image.src} alt={each.title} key={each.title} />
                ))}
              </div>
            </div>
          </Transition>
        </section>

        <section className="bg-[#FBFBFC] py-16 space-y-8 font-satoshi">
          <Features />
        </section>

        <section className="bg-white py-16 font-satoshi space-y-8 px-12">
          <BestToolsComponent />
        </section>

        <Transition>
          <section className="bg-white py-16 font-satoshi space-y-8 px-12">
            <div className={sectionHeaderClass}>
              <CampaignIcon />
              <p className="font-normal">Campaigns</p>
            </div>
            <div className="w-[85%] mx-auto">
              <h2 className="text-[40px] text-[#161618] leading-[64px] font-bricolage_grotesque">Checkout amazing deals from brands registered with us</h2>
            </div>
            <div className="w-full relative px-8">
              <Image src={AdvertOne} alt="advert" />
              <div className="p-3 rounded-full w-fit shadow-custom_shadow absolute left-1 bottom-[45%] bg-white">
                <ArrowLeftIcon />
              </div>
              <div className="p-3 rounded-full w-fit shadow-custom_shadow absolute bottom-[45%] right-0 bg-white">
                <ArrowRightIcon />
              </div>
            </div>
          </section>
        </Transition>

        <section className="bg-[#5F35D2] py-20 font-satoshi space-y-8 px-12 price-plan-section relative">
          <Image src={PricePlan} alt="" className="absolute top-0 w-[90%]" priority />
          <Transition>
            <div className="bg-[#703CFF] flex items-center w-fit space-x-2 px-4 py-1.5 rounded-full mx-auto shadow-custom-inset">
              <TagIcon />
              <p className="font-normal text-white">Pricing Plan</p>
            </div>

            <div className="w-[85%] mx-auto text-satoshi space-y-2">
              <h2 className="text-[40px] text-white leading-[64px] font-bricolage_grotesque">Plans That Fit Your Business</h2>
              <p className="text-[#ACB5BB]">From startups to enterprises, find the right solution to streamline your HR processes</p>
            </div>
          </Transition>

          <PricingComponent />
        </section>

        <FAQs />

        <JoinCommunity />
      </main>

      <Footer />
    </React.Fragment>
  );
}
