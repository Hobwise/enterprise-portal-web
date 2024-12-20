'use client';
import { EclipseIcon, FacebookIcon, InstgramIcon, LinkedInIcon, TwitterIcon } from '@/public/assets/svg';
import Image from 'next/image';
import Link from 'next/link';
import { navItem } from './navBar';
import { Transition } from './transition';
import Hobwise from '@/public/assets/images/hobwise.png';
import { PRIVACY_POLICY } from '@/utilities/routes';

export const socialMedia = [
  { icon: <FacebookIcon />, url: 'https://www.facebook.com/profile.php?id=61570807141575&mibextid=ZbWKwL' },
  { icon: <TwitterIcon />, url: 'https://x.com/HobwiseApp' },
  { icon: <InstgramIcon />, url: 'https://www.instagram.com/hobwise' },
  { icon: <LinkedInIcon />, url: '#' },
];
export default function Footer() {
  return (
    <Transition>
      <footer className="font-satoshi w-full pt-10 lg:pt-20 pb-10 space-y-6 lg:space-y-12 bg-white text-[#4C4C4C]">
        <Image src={Hobwise} alt="Hobwise logo" width={140} className="mx-auto" />
        <div className="lg:w-1/2 mx-auto flex flex-wrap justify-center items-center">
          {navItem.map((each, index) => (
            <div className="flex items-center px-2 lg:px-0 mb-4 justify-center" key={each.title + 'footer'}>
              <Link href={each.href} className="px-4 nav_link hover:text-primaryColor">
                {each.title}
              </Link>
              {index !== navItem.length - 1 && <EclipseIcon />}
            </div>
          ))}
        </div>

        <div className="px-6 lg:px-12 space-y-4 lg:space-y-10 text-sm">
          <div className="w-full border border-[#E8E8E8]" />
          <div className="lg:flex items-center justify-between space-y-4 lg:space-y-0">
            <p className="">© {new Date().getFullYear()} hobwise. All rights reserved.</p>

            <div className="flex space-x-4 justify-center">
              {socialMedia.map((each, index) => (
                <div key={each.url + index}>{each.icon}</div>
              ))}
            </div>

            <div className="flex items-center space-x-4 lg:space-x-6 justify-center lg:justify-end">
              <Link href={PRIVACY_POLICY}>
                <p>Privacy Policy</p>
              </Link>
              <EclipseIcon />
              <Link href={`${PRIVACY_POLICY}?tab=Terms Of Use`}>
                <p>Terms of Service</p>
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </Transition>
  );
}
