'use client';
import Image from 'next/image';
import HobinkLogo from '@/public/assets/images/hobink-logo.png';
import HobinkLogoWhite from '@/public/assets/images/hobink-logo-white.png';
import Link from 'next/link';
import { BUSINESS_URL, CONTACT_URL, HOME_URL, LOGIN_URL, PRICING_URL, RESERVATIONS_URL, SIGN_UP_URL } from '@/utilities/routes';
import { CustomButton } from '@/components/customButton';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { CloseIcon, FlashIcon, HamburgerIcon } from '@/public/assets/svg';
import { useState } from 'react';
import SmallScreenBackground from '@/public/assets/images/small-screen-bg.png';
import { socialMedia } from './footer';
import { Transition } from './transition';
import { useMediaQuery } from '@/hooks/use-media-query';

export const navItem = [
  { title: 'Home', href: HOME_URL },
  { title: 'Pricing', href: PRICING_URL },
  // { title: 'Businesses', href: BUSINESS_URL },
  { title: 'Reservations', href: RESERVATIONS_URL },
  { title: 'Contact', href: CONTACT_URL },
];

interface INavbar {
  type?: 'colored' | 'non-colored' | 'default';
  className?: string;
}

export default function Navbar({ type = 'non-colored', className }: INavbar) {
  const [openNav, setOpenNav] = useState(false);
  const pathname = usePathname();

  const btnClassName = `before:ease relative h-[40px] overflow-hidden ${
    type === 'default' || (type === 'colored' && 'border border-[#FFFFFF26]')
  } px-8 shadow-[inset_0_7.4px_18.5px_0px_rgba(255,255,255,0.11)] border-white bg-primaryColor text-white shadow-2xl transition-all before:absolute before:right-0 before:top-0 before:h-[40px] before:w-6 before:translate-x-12 before:rotate-6 before:bg-white before:opacity-10 before:duration-700 hover:shadow-primaryColor-500 hover:before:-translate-x-40`;
  // type === 'colored' || type === 'default' || !openNav ? HobinkLogoWhite :
  return (
    <div className={cn(openNav && 'w-full bg-white h-screen relative')}>
      {openNav && <Image src={SmallScreenBackground} alt="" className="absolute top-0 right-0 w-[90%] lg:hidden" priority />}

      <div className={cn('flex items-center font-satoshi w-full z-[999] justify-between px-6 lg:px-12 py-2.5', className)}>
        <Link href={HOME_URL}>
          <Image src={type === 'default' ? HobinkLogo : HobinkLogoWhite} alt="Hobink logo" width={type === 'default' ? 120 : 240} />
        </Link>
        <nav className={cn('lg:flex py-4 space-x-6 text-sm text-white hidden', type === 'colored' && 'text-[#C0AFF7]', type === 'default' && 'text-[#616B7C]')}>
          {navItem.map((each) => {
            const linkStyle = `px-4 ${
              pathname.slice(1).startsWith(each.href) || (each.href === '/' && pathname === each.href)
                ? `border-b-1 font-semibold pb-1.5 ${type === 'colored' ? 'border-b-[#9A7DFA] text-white' : 'border-b-primaryColor text-primaryColor'}`
                : type === 'colored'
                ? 'nav_link_colored'
                : 'nav_link'
            }`;

            return (
              <Link href={`/${each.href}`} key={each.title} className={cn('px-4 cursor-pointer', linkStyle)}>
                {each.title}
              </Link>
            );
          })}
        </nav>
        <div className="flex space-x-4 items-center">
          <Link href={LOGIN_URL} className="hidden lg:flex">
            <CustomButton className={cn('bg-white text-primaryColor h-[38px] lg:px-8', type === 'default' && 'border border-primaryColor')}>Login</CustomButton>
          </Link>
          <Link href={SIGN_UP_URL}>
            <CustomButton className={btnClassName}>Get Started</CustomButton>
          </Link>

          <div className="flex lg:hidden z-50" onClick={() => setOpenNav((prev) => !prev)}>
            {openNav ? <CloseIcon /> : <HamburgerIcon className={cn(type === 'default' ? 'text-[#1A198C]' : 'text-white')} />}
          </div>
        </div>
      </div>

      {openNav && (
        <div className="my-6 px-6 space-y-6 lg:hidden">
          <Transition>
            <div className="flex items-center w-fit space-x-2 text-primaryColor bg-[#6840D50D] border-[#5F35D24D] border px-2.5 py-1.5 rounded-full text-xs shadow_custom-inset">
              <FlashIcon />
              <p className="font-normal">Menu</p>
            </div>
          </Transition>

          <nav className={cn('block text-left text-[32px] space-y-4 text-[#616B7C] font-bricolage_grotesque')}>
            {navItem.map((each) => {
              const isActive = pathname.slice(1).startsWith(each.href) || (each.href === '/' && pathname === each.href);

              return (
                <Transition>
                  <ul>
                    <li>
                      <Link href={`/${each.href}`} key={each.title} className={cn('cursor-pointer w-full', isActive && 'text-primaryColor')}>
                        {each.title}
                      </Link>
                      {isActive && <div className="border border-primaryColor w-full" />}
                    </li>
                  </ul>
                </Transition>
              );
            })}
          </nav>

          <Transition>
            <div className="text-left px-2 space-y-4">
              <div className="">
                <p className="text-[#16161866] font-light">Get in touch</p>
                <p className="text-primaryColor underline">hello@hobink.com</p>
              </div>

              <div className="flex space-x-4">
                {socialMedia.map((each) => (
                  <div key={each.url}>{each.icon}</div>
                ))}
              </div>
            </div>
          </Transition>
        </div>
      )}
    </div>
  );
}
