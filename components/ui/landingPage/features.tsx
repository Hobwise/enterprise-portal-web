'use client';
import { RoundedCheckIcon, SettingsIcon } from '@/public/assets/svg';
import ContentImage from '@/public/assets/images/content-image.png';
import ContentImage2 from '@/public/assets/images/content-image-2.png';
import ContentImage3 from '@/public/assets/images/content-image-3.png';
import ContentImage4 from '@/public/assets/images/content-image-4.png';
import React, { useRef } from 'react';
import Image from 'next/image';
import { motion, useScroll, useSpring, useTransform, MotionValue } from 'framer-motion';
import { Transition } from './transition';
import { IntersectionObserver } from '../intersectionObserver';
import { StaggerWrap } from './staggerWrap';
import { useMediaQuery } from '@/hooks/use-media-query';

function useParallax(value: MotionValue<number>, distance: number) {
  return useTransform(value, [0, 1], [-distance, distance]);
}

function ImageDisplay({ content }: { content: { image: any } }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref });
  const y = useParallax(scrollYProgress, 300);

  return (
    <section className="section">
      <div ref={ref} className="content_div lg:content_div_small">
        <Image src={content.image} alt="content" priority className="lg:h-[450px] object-contain absolute right-0 top-0" />
      </div>
    </section>
  );
}

export default function Features() {
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const { scrollYProgress } = useScroll();
  const scaleY = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  const sectionHeaderClass: string =
    'flex items-center w-fit mx-6 space-x-2 text-primaryColor bg-[#6840D50D] border-[#5F35D24D] border px-4 py-1.5 rounded-full text-xs lg:mx-auto shadow_custom-inset';

  const contents = [
    {
      title: 'Real-Time Analytics',
      description:
        'Stay in the know with real-time insights that give you a clear picture of how your business is doing. Make smart, data-driven decisions that help you run things smoothly and efficiently.',
      lists: [
        'Gain detailed insights on customer trends and preferences.',
        'Monitor sales, orders, and stock levels in real-time for better management.',
        'Identify opportunities to streamline processes and reduce costs.',
      ],
      image: ContentImage,
    },
    {
      title: 'Seamless Order Management',
      description:
        'Managing orders has never been easier. With our integrated menu and QR code functionality, you can streamline the process and ensure your guests have a seamless dining experience.',
      lists: [
        'Scan the QR code to access menu.',
        'Browse the menu and select your desired items directly from your phone.',
        'Place your order instantly through your phone.',
        'Orders are processed and delivered right to your table.',
      ],
      image: ContentImage2,
    },
    {
      title: 'Easy Campaign Management',
      description: 'Engage your customers and grow your business with our intuitive marketing tools.',
      lists: [
        'Create, track, and optimize campaigns effortlessly to keep your business top of mind.',
        'Target specific customer segments with personalized messaging to increase engagement.',
        'Monitor the performance of each campaign and make real-time adjustments for better results.',
        'Automate follow-up campaigns to stay connected with your audience consistently.',
      ],
      image: ContentImage3,
    },
    {
      title: 'Effortless Booking & Reservations',
      description:
        'From reservations to bookings, Hobink makes it simple to manage everything in one place, ensuring your guests enjoy a smooth and welcoming experience, every time.',
      lists: ['Easily book available reservations, ensuring your spot is secured and ready for you.', 'As a business owner, create and manage reservations'],
      image: ContentImage4,
    },
  ];

  return (
    <React.Fragment>
      <div className={sectionHeaderClass}>
        <SettingsIcon className="text-[#5F35D2]" />
        <p className="font-normal">Features</p>
      </div>

      <Transition>
        <div className="lg:w-[65%] lg:mx-auto text-left lg:text-center px-6 lg:px-0">
          <h2 className="text-[24px] lg:text-[40px] text-[#161618] lg:leading-[64px] font-bricolage_grotesque">
            Unlock the Power of Hospitality with an All-in-One Management Platform
          </h2>
          <p className="font-normal text-[#44444A] lg:text-center lg:w-[80%] lg:mx-auto text-sm">
            Transform how you manage your restaurant, hotel, or bar with Hobink&apos;s comprehensive platform that integrates everything you need in one place.
          </p>
        </div>
      </Transition>

      {isDesktop ? (
        <div className="px-6 lg:px-24 space-y-16 mt-8">
          {contents.map((content, index) => (
            <div
              className="lg:flex items-center justify-between"
              key={content.title}
              style={{
                flexDirection: index % 2 === 0 ? 'row' : 'row-reverse',
              }}
            >
              <div className="text-left lg:w-[50%] lg:space-y-8">
                <Transition>
                  <div className="space-y-6">
                    <h4 className="text-[#101928] text-[24px] font-bricolage_grotesque border-b-[4px] rounded-lg w-fit border-b-primaryColor">
                      {content.title}
                    </h4>
                    <p className="text-[#808B9F] text-sm">{content.description}</p>
                  </div>
                  <div className="space-y-6 mt-8">
                    {content.lists.map((each) => (
                      <div key={each} className="flex items-start space-x-2 text-sm">
                        <RoundedCheckIcon />
                        <p className="text-dark">{each}</p>
                      </div>
                    ))}
                  </div>
                </Transition>
              </div>
              <div className="w-[50%] flex" style={{ justifyContent: index % 2 ? 'start' : 'end' }}>
                <Transition>
                  <img src={content.image.src} alt="content" className="h-[400px] object-contain justify-start" />
                </Transition>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="px-6 space-y- w-full">
          {contents.map((content) => (
            <div className="grid grid-cols-1" key={content.title}>
              <div className="text-left w-full space-y-8">
                <div className="space-y-4">
                  <h4 className="text-[#101928] text-[24px] font-bricolage_grotesque rounded-lg w-fit">{content.title}</h4>
                  <p className="text-[#808B9F] text-sm">{content.description}</p>
                </div>
                <div className="space-y-4">
                  {content.lists.map((each) => (
                    <div key={each} className="flex items-start space-x-2 text-sm">
                      <RoundedCheckIcon />
                      <p className="text-dark">{each}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="w-[100%]">
                <img src={content.image.src} alt="content" className="h-[450px] object-contain " />
              </div>
            </div>
          ))}
        </div>
      )}
    </React.Fragment>
  );
}
