'use client';
import Image from 'next/image';
import HobinkLogo from '@/public/assets/images/hobink-logo.png';
import { navItem } from './navBar';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { EclipseIcon, FacebookIcon, InstgramIcon, LinkedInIcon, TwitterIcon } from '@/public/assets/svg';

export function Footer() {
  const socialMedia = [
    { icon: <FacebookIcon />, url: 'fb' },
    { icon: <TwitterIcon />, url: 'x' },
    { icon: <InstgramIcon />, url: 'ig' },
    { icon: <LinkedInIcon />, url: 'linkedin' },
  ];
  return (
    <footer className="font-satoshi w-full pt-20 pb-4 space-y-12 bg-white text-[#4C4C4C]">
      <Image src={HobinkLogo} alt="Hobink logo" width={240} className="mx-auto" />
      <div className="w-1/2 mx-auto flex items-center space-x-6">
        {navItem.map((each, index) => (
          <div className="items-center flex">
            <Link href={each.href} key={each.title} className={cn('px-4 nav_link hover:text-primaryColor')}>
              {each.title}
            </Link>
            {index !== navItem.length - 1 && <EclipseIcon />}
          </div>
        ))}
      </div>
      <div className="px-12 space-y-10 text-sm">
        <div className="w-full border border-[#E8E8E8]" />
        <div className="flex items-center justify-between">
          <p className="">© 2024 hobink. All rights reserved.</p>

          <div className="flex space-x-4">
            {socialMedia.map((each) => (
              <div key={each.url}>{each.icon}</div>
            ))}
          </div>

          <div className="flex items-center space-x-6">
            <p>Privacy Policy</p>
            <EclipseIcon />
            <p>Terms of Service</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
