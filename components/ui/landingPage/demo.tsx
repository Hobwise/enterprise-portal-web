'use client';
import { FlashIcon } from '@/public/assets/svg';
import { Transition } from './transition';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import DemoIllustration from '@/public/assets/images/demo-illustration.png';

interface ITab {
  title: string;
  description: string;
  linkId: string;
  src?: string;
}

const tabs: ITab[] = [
  {
    title: 'Introduction to Hobwise',
    description: 'How it works',
    linkId: '5OeASZGN0iw',
    src: '/assets/videos/hob-wizz.mp4',
  },
  {
    title: 'Testimonial',
    description: 'See what people are saying about us',
    linkId: 'GWaQiFeQ87g',
  },
  {
    title: 'Our Future',
    description: 'Our vision 2030',
    linkId: 'SR__amDl1c8',
  },
];

export default function Demo() {
  const [selectedTab, setSelectedTab] = useState<ITab>(tabs[0]);
  const sectionHeaderClass: string =
    'flex items-center w-fit space-x-2 text-primaryColor bg-[#6840D50D] border-[#5F35D24D] border px-4 py-1 rounded-full text-xs lg:mx-auto shadow_custom-inset';

  return (
    <section className="bg-[#ECE6FB] py-8 lg:py-16 font-satoshi space-y-4 lg:space-y-8 px-6 lg:px-12">
      <div className={cn(sectionHeaderClass, 'bg-white')}>
        <FlashIcon />
        <p className="font-normal">Demo</p>
      </div>

      <div className="lg:w-[85%] lg:mx-auto mx-0 lg:text-center">
        <h2 className="text-[28px] lg:text-[44px] text-[#1D2939] lg:leading-[52px] font-bricolage_grotesque font-bold">How our Application Works</h2>
        <p className="text-[#44444A]">Sample description to speak about the header above</p>
      </div>
      <div className="lg:flex lg:space-x-16 mt-6 lg:mt-12 items-center">
        <div className="w-full lg:w-[35%]">
          <Transition>
            <div className="w-full">
              {tabs.map((tab, index) => (
                <div key={tab.title}>
                  <div
                    className={cn(
                      'p-4 rounded-2xl flex space-x-4 items-center cursor-pointer',
                      !tab.src ? 'cursor-not-allowed' : 'cursor-pointer',
                      selectedTab.title === tab.title ? 'bg-white shadow-custom' : 'bg-transparent'
                    )}
                    onClick={() => {
                      tab.src ? setSelectedTab(tab) : null;
                    }}
                  >
                    <div
                      className={cn(
                        'text-white text-[14px] lg:text-[20px] font-medium flex items-center justify-center rounded-full lg:h-[50px] lg:w-[50px] h-[35px] w-[35px]',
                        selectedTab.title === tab.title ? 'bg-[#744BE3]' : 'bg-white border border-[#808B9F] text-[#808B9F]'
                      )}
                    >
                      0{index + 1}.
                    </div>
                    <div className="text-left">
                      <p className="font-bricolage_grotesque text-[18px] lg:text-[24px] text-[#101928]">{tab.title}</p>
                      <p className="text-[#808B9F] text-xs lg:text-sm font-satoshi">{tab.description}</p>
                    </div>
                  </div>
                  {index !== 2 && <div className="h-6 lg:h-16 border border-[#DEE1E6] w-[1px] ml-10 my-1.5 lg:my-4" />}
                </div>
              ))}
            </div>
          </Transition>
        </div>
        <div className="w-full lg:w-[65%] mt-6 lg:mt-0">
          <Transition>
            <Image src={DemoIllustration} alt="How Hobwise works" priority className="w-full h-auto" />
          </Transition>
        </div>
      </div>
    </section>
  );
}
