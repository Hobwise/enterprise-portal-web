import LandingPageBg from '@/public/assets/images/landing-page-bg.png';
import Image from 'next/image';
import React from 'react';
import LandingPageHeader from '@/components/ui/landingPage/header';
import Navbar from '@/components/ui/landingPage/nav-bar';
import { ArrowRight, RoundedCheckIcon, SettingsIcon } from '@/public/assets/svg';
import { CustomButton } from '@/components/customButton';
import DashboardImage from '@/public/assets/images/dashboard-image.png';
// import { companies } from '@/lib/utils';
import Airbnb from '@/public/assets/icons/airbnb.png';
import Hubspot from '@/public/assets/icons/hubspot.png';
import Google from '@/public/assets/icons/google.png';
import Microsoft from '@/public/assets/icons/microsoft.png';
import FedEx from '@/public/assets/icons/fedex.png';
import ContentImage from '@/public/assets/images/content-image.png';

// export const metadata = {
//   title: companyInfo.name,
//   description: 'Streamline your business processes',
// };

export default function LandingPage() {
  const companies = [
    { image: Airbnb, title: 'Airbnb' },
    { image: Hubspot, title: 'Hubspot' },
    { image: Google, title: 'Google' },
    { image: Microsoft, title: 'Microsoft' },
    { image: FedEx, title: 'FedEx' },
  ];
  const sectionHeaderClass: string =
    'flex items-center w-fit space-x-2 text-primaryColor bg-[#6840D50D] border-[#5F35D24D] border px-4 py-1.5 rounded-full text-xs mx-auto shadow-custom-inset';
  const realTimeAnalytics: string[] = [
    'Gain detailed insights on customer trends and preferences.',
    'Monitor sales, orders, and stock levels in real-time for better management.',
    'Identify opportunities to streamline processes and reduce costs.',
  ];
  return (
    <React.Fragment>
      <header className="z-50 backdrop-filter backdrop-blur-md fixed w-full">
        <LandingPageHeader />
        <Navbar />
      </header>

      <main className="gap-3 relative text-center py-32 bg-white">
        <Image src={LandingPageBg} alt="" className="absolute top-0" priority />
        <section className="w-[50%] mx-auto space-y-6 font-satoshi pt-20 main-section">
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

        <section className="space-y-6 pb-16">
          <Image src={DashboardImage} alt="dashboard video" />
          <p className="font-bricolage_grotesque text-[#677182] font-light">More than 10,000 companies enjoy using our product</p>
          <div className="grid grid-cols-5 gap-10 w-[50%] items-center mx-auto">
            {companies.map((each) => (
              <img src={each.image.src} alt={each.title} key={each.title} />
            ))}
          </div>
        </section>

        <section className="bg-[#FBFBFC] py-16 space-y-10 font-satoshi">
          <div className={sectionHeaderClass}>
            <SettingsIcon />
            <p className="font-normal">Features</p>
          </div>
          <div className="w-[65%] mx-auto">
            <h2 className="text-[40px] text-[#161618] leading-[64px] font-bricolage_grotesque">
              Unlock the Power of Hospitality with an All-in-One Management Platform
            </h2>
            <p className="font-normal text-[#44444A] text-center w-[80%] mx-auto text-sm">
              Transform how you manage your restaurant, hotel, or bar with Hobink&apos;s comprehensive platform that integrates everything you need in one
              place.
            </p>
          </div>

          <div className="bg-white border border-[#ECEFF2] rounded-xl px-12 py-6 flex space-x-12 mx-36 items-center">
            <div className="text-left w-1/2 space-y-6">
              <div className="space-y-2">
                <h4 className="text-[#101928] text-[24px] font-bricolage_grotesque border-b-[4px] rounded-lg w-fit border-b-primaryColor">
                  Real-Time Analytics
                </h4>
                <p className="text-[#808B9F] text-sm">
                  Stay in the know with real-time insights that give you a clear picture of how your business is doing. Make smart, data-driven decisions that
                  help you run things smoothly and efficiently.
                </p>
              </div>
              <div className="space-y-2.5">
                {realTimeAnalytics.map((each) => (
                  <div key={each} className="flex items-center space-x-2 text-sm">
                    <RoundedCheckIcon />
                    <p className="text-dark">{each}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="w-1/2 flex">
              <Image src={ContentImage} alt="content" priority />
            </div>
          </div>
        </section>
      </main>
    </React.Fragment>
  );
}
