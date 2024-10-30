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

function useParallax(value: MotionValue<number>, distance: number) {
  return useTransform(value, [0, 1], [-distance, distance]);
}

function ImageDisplay({ content }: { content: { image: any } }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref });
  const y = useParallax(scrollYProgress, 300);

  return (
    <section className="section">
      <div ref={ref} className="content_div">
        <Image src={content.image} alt="content" priority className="h-[450px] object-contain absolute right-0 top-0" />
      </div>
    </section>
  );
}

export default function Features() {
  const { scrollYProgress } = useScroll();
  const scaleY = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  const sectionHeaderClass: string =
    'flex items-center w-fit space-x-2 text-primaryColor bg-[#6840D50D] border-[#5F35D24D] border px-4 py-1.5 rounded-full text-xs mx-auto shadow_custom-inset';

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
        <div className="w-[65%] mx-auto">
          <h2 className="text-[40px] text-[#161618] leading-[64px] font-bricolage_grotesque">
            Unlock the Power of Hospitality with an All-in-One Management Platform
          </h2>
          <p className="font-normal text-[#44444A] text-center w-[80%] mx-auto text-sm">
            Transform how you manage your restaurant, hotel, or bar with Hobink&apos;s comprehensive platform that integrates everything you need in one place.
          </p>
        </div>
      </Transition>

      <Transition>
        <div className="h-[400px] overflow-y-scroll bg-white border border-[#ECEFF2] rounded-xl px-12 mx-36 space-y-4 content">
          {contents.map((content) => (
            <div className="flex space-x-12 items-center justify-between" key={content.title}>
              <div className="text-left w-[55%] space-y-8">
                <div className="space-y-4">
                  <h4 className="text-[#101928] text-[24px] font-bricolage_grotesque border-b-[4px] rounded-lg w-fit border-b-primaryColor">{content.title}</h4>
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
              <div className="w-[35%] flex">
                <ImageDisplay content={content} />
              </div>
            </div>
          ))}
        </div>
      </Transition>
    </React.Fragment>
  );
}
