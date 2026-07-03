'use client';
import { CustomButton } from '@/components/customButton';
import { cn } from '@/lib/utils';
import LogoLight from '@/public/assets/images/landing-v2/logo-light.png';
import { HOME_URL, LOGIN_URL, SIGN_UP_URL } from '@/utilities/routes';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { FiArrowRight, FiMenu, FiX } from 'react-icons/fi';

export const landingNavItems = [
  { title: 'About', href: '/#about' },
  { title: 'Features', href: '/#features' },
  { title: 'Hospira AI', href: '/#hospira' },
  { title: 'Pricing', href: '/#pricing' },
  { title: 'FAQ', href: '/#faq' },
];

export default function LandingNav() {
  const [openNav, setOpenNav] = useState(false);

  return (
    <header className='fixed top-0 inset-x-0 z-[100] bg-[#F8F8F8]/90 backdrop-blur-md font-satoshi'>
      <div className='flex items-center justify-between px-6 lg:px-16 py-4'>
        <Link href={HOME_URL}>
          <Image src={LogoLight} alt='Hobwise logo' width={130} priority />
        </Link>

        <nav className='hidden lg:flex items-center bg-white border border-[#ECECEC] rounded-md px-2 py-1 text-sm text-[#3F3F46]'>
          {landingNavItems.map((each) => (
            <Link
              key={each.title}
              href={each.href}
              className='px-5 py-2 hover:text-primaryColor transition-colors'
            >
              {each.title}
            </Link>
          ))}
        </nav>

        <div className='hidden lg:flex items-center space-x-4'>
          <Link href={LOGIN_URL} target='_blank' className='text-sm text-[#3F3F46] hover:text-primaryColor'>
            Log in
          </Link>
          <Link href={SIGN_UP_URL} target='_blank'>
            <CustomButton className='h-[44px] px-6 rounded-md bg-gradient-to-r from-[#5F35D2] to-[#7C3AED] text-white'>
              <span className='flex items-center gap-2'>
                Book a Demo <FiArrowRight />
              </span>
            </CustomButton>
          </Link>
        </div>

        <button
          type='button'
          aria-label='Toggle menu'
          className='lg:hidden text-[#161618] text-2xl'
          onClick={() => setOpenNav((prev) => !prev)}
        >
          {openNav ? <FiX /> : <FiMenu />}
        </button>
      </div>

      <div
        className={cn(
          'lg:hidden bg-[#F8F8F8] border-t border-[#ECECEC] px-6 py-6 space-y-4',
          !openNav && 'hidden'
        )}
      >
        {landingNavItems.map((each) => (
          <Link
            key={each.title}
            href={each.href}
            className='block text-lg text-[#161618] font-bricolage_grotesque'
            onClick={() => setOpenNav(false)}
          >
            {each.title}
          </Link>
        ))}
        <div className='pt-2 flex items-center gap-4'>
          <Link href={SIGN_UP_URL} target='_blank' onClick={() => setOpenNav(false)}>
            <CustomButton className='h-[44px] px-6 rounded-md bg-primaryColor text-white'>
              Book a Demo
            </CustomButton>
          </Link>
          <Link href={LOGIN_URL} target='_blank' className='text-sm text-[#3F3F46]'>
            Log in
          </Link>
        </div>
      </div>
    </header>
  );
}
