'use client';
import { CustomButton } from '@/components/customButton';
import HeroCollage from '@/public/assets/images/landing-v2/hero-collage.png';
import { REQUEST_DEMO_URL, SIGN_UP_URL } from '@/utilities/routes';
import Image from 'next/image';
import Link from 'next/link';
import { FiArrowRight } from 'react-icons/fi';

function ScribbleEllipse({ className }: { className?: string }) {
  return (
    <svg
      viewBox='0 0 320 100'
      fill='none'
      preserveAspectRatio='none'
      aria-hidden='true'
      className={className}
    >
      <ellipse
        cx='160'
        cy='50'
        rx='156'
        ry='44'
        stroke='currentColor'
        strokeWidth='2.5'
        transform='rotate(-2 160 50)'
      />
    </svg>
  );
}

export default function Hero() {
  return (
    <section className='bg-[#F8F8F8] pt-32 lg:pt-44 font-satoshi overflow-hidden'>
      <div className='text-center px-6 space-y-6'>
        <p className='text-primaryColor text-xs lg:text-sm font-semibold tracking-[0.2em] uppercase'>
          The hospitality OS for growing restaurants
        </p>

        <h1 className='font-bricolage_grotesque font-medium text-[#161618] text-[40px] leading-[46px] lg:text-[72px] lg:leading-[80px]'>
          Run your restaurant
          <br />
          <span className='relative inline-block px-3'>
            without the chaos.
            <ScribbleEllipse className='absolute -inset-x-4 inset-y-0 w-[calc(100%+32px)] h-full text-primaryColor' />
          </span>
        </h1>

        <p className='text-[#44444A] text-sm lg:text-base max-w-xl mx-auto'>
          Everything your restaurant needs to operate smoothly — from orders and payments to
          inventory and reporting. Built for restaurants that want faster operations, better
          visibility, and fewer daily headaches.
        </p>

        <div className='flex flex-col sm:flex-row items-center justify-center gap-4 pt-2'>
          <Link href={`/${REQUEST_DEMO_URL}`}>
            <CustomButton className='h-[48px] px-8 rounded-md bg-gradient-to-r from-[#5F35D2] to-[#7C3AED] text-white'>
              <span className='flex items-center gap-2'>
                Book Live Demo <FiArrowRight />
              </span>
            </CustomButton>
          </Link>
          <Link href={SIGN_UP_URL} target='_blank'>
            <CustomButton className='h-[48px] px-8 rounded-md bg-white border border-[#E4E4E7] text-[#161618]'>
              <span className='flex items-center gap-2'>
                Try It Free <FiArrowRight />
              </span>
            </CustomButton>
          </Link>
        </div>
      </div>

      <Image
        src={HeroCollage}
        alt='Hobwise dashboard widgets — payments, bookings and revenue at a glance'
        priority
        className='w-full h-auto mt-8 lg:mt-12'
      />
    </section>
  );
}
