'use client';
import Image from 'next/image';
import React from 'react';
import { CampaignIcon } from '@/public/assets/svg';
import { CustomButton } from '@/components/customButton';
import { Transition } from '@/components/ui/landingPage/transition';
import Link from 'next/link';
import { REQUEST_DEMO_URL, SIGN_UP_URL } from '@/utilities/routes';
import Companies from '@/components/ui/landingPage/companies';
import LandingPageHeader from '@/components/ui/landingPage/header';
import Navbar from '@/components/ui/landingPage/navBar';
import Features from '@/components/ui/landingPage/features';
import FAQs from '@/components/ui/landingPage/faq';
import JoinCommunity from '@/components/ui/landingPage/joinCommunity';
import Footer from '@/components/ui/landingPage/footer';
import BestToolsComponent from '@/components/ui/landingPage/bestTools';
import Campaigns from '@/components/ui/landingPage/campaigns';
import LandingPageBg from '@/public/assets/images/landing-page-bg.png';
import MainSideImage from '@/public/assets/images/main-side-image.png';
import Demo from '@/components/ui/landingPage/demo';

export default function HomeComponent() {
  const sectionHeaderClass: string =
    'flex items-center w-fit space-x-2 text-primaryColor bg-[#6840D50D] border-[#5F35D24D] border px-4 py-1 rounded-full text-xs lg:mx-auto shadow_custom-inset';

  return (
    <div className="overflow-y-scroll scroll-smooth h-screen bg-white">
      <main className="gap-3 text-center relative bg-white overflow-x-hidden font-satoshi h-full">
        <section className="w-full overflow-hidden h-screen">
          <header className="z-[100] w-full top-0 lg:mx-auto font-satoshi fixed bg-white backdrop-filter backdrop-blur-md right-0 left-0">
            <LandingPageHeader />
            <Navbar className="bg-none py-4 lg:py-2" type="default" />
          </header>

          <div className="relative">
            <Image src={LandingPageBg} alt="background" className="absolute" />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 pt-36 lg:pt-48 px-6 lg:px-16 text-center lg:text-left">
              <div className="space-y-6 lg:space-y-10 mt-20">
                {/* <div className={sectionHeaderClass2}>
                  <p className="font-normal text-[#5F35D2] lg:text-base text-sm">New: Contactless Service with QR Codes</p>
                  <ArrowRight className="text-[#5F35D2]" />
                </div> */}

                <div>
                  <h1 className="text-[30px] lg:text-[50px] lg:leading-[64px] text-[#161618] font-bricolage_grotesque font-medium">
                    Effortless Management For Your Hospitality Business
                  </h1>
                  <p className="font-normal text-[#44444A] lg:text-base text-sm">
                    From restaurants to hotels, cafe, club, bars, lounges and many more — streamline your operations and boost efficiency all from one powerful
                    platform.
                  </p>
                </div>

                <div className="flex space-x-4 justify-center lg:justify-start">
                  <Link href={REQUEST_DEMO_URL}>
                    <CustomButton className="before:ease relative h-[40px] overflow-hidden px-8 border-white bg-primaryColor text-white shadow-2xl transition-all before:absolute before:right-0 before:top-0 before:h-[40px] before:w-6 before:translate-x-12 before:rotate-6 before:bg-white before:opacity-10 before:duration-700 hover:shadow-primaryColor-500 hover:before:-translate-x-40">
                      Request a Demo
                    </CustomButton>
                  </Link>
                  <Link href={SIGN_UP_URL}>
                    <CustomButton className="bg-white border border-primaryColor  text-primaryColor h-[38px] px-8">Get Started</CustomButton>
                  </Link>
                </div>
              </div>
              <div>
                <Image src={MainSideImage} alt="reservations" className="landing-page-image" />
              </div>
            </div>
          </div>
        </section>

        <section className="lg:space-y-6 p-6 lg:py-10 px-6 lg:px-0">
          <Transition>
            <div className="space-y-4 lg:space-y-10 overflow-hidden">
              <p className="font-bricolage_grotesque text-[#677182] font-light text-sm lg:text-base">Some companies enjoy using our product</p>

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
                  <Companies />
                </ul>
                <ul className="flex animate-infinite-scroll items-center justify-center md:justify-start [&_img]:max-w-none [&_li]:mx-8" aria-hidden="true">
                  <Companies />
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
            <Campaigns />
          </section>
        </Transition>

        <Demo />

        <FAQs />

        <JoinCommunity />
        <Footer />
      </main>
    </div>
  );
}
