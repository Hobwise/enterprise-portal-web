'use client';
import Image from 'next/image';
import HobinkLogo from '@/public/assets/images/hobink-logo.png';
import HobinkLogoWhite from '@/public/assets/images/hobink-logo-white.png';
import Link from 'next/link';
import { BUSINESS_URL, CONTACT_URL, HOME_URL, PRICING_URL, RESERVATIONS_URL } from '@/utilities/routes';
import { CustomButton } from '@/components/customButton';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

export const navItem = [
  { title: 'Home', href: HOME_URL },
  { title: 'Pricing', href: PRICING_URL },
  { title: 'Businesses', href: BUSINESS_URL },
  { title: 'Reservations', href: RESERVATIONS_URL },
  { title: 'Contact', href: CONTACT_URL },
];

interface INavbar {
  type?: 'colored' | 'non-colored';
}

export default function Navbar({ type = 'non-colored' }: INavbar) {
  const pathname = usePathname();
  console.log(pathname);
  const btnClassName =
    'before:ease relative h-[40px] overflow-hidden border border-[#FFFFFF26] px-8 shadow-[inset_0_7.4px_18.5px_0px_rgba(255,255,255,0.11)] border-white bg-primaryColor text-white shadow-2xl transition-all before:absolute before:right-0 before:top-0 before:h-[40px] before:w-6 before:translate-x-12 before:rotate-6 before:bg-white before:opacity-10 before:duration-700 hover:shadow-primaryColor-500 hover:before:-translate-x-40';

  return (
    <div className={cn('flex items-center font-satoshi w-full justify-between px-12 py-2.5', type === 'colored' ? 'bg-primaryColor' : 'bg-white/60')}>
      <Link href={HOME_URL}>
        <Image src={type === 'colored' ? HobinkLogoWhite : HobinkLogo} alt="Hobink logo" width={240} />
      </Link>
      <nav className={cn('flex py-4 space-x-6 text-sm', type === 'colored' ? 'text-[#C0AFF7]' : 'text-navColor')}>
        {navItem.map((each) => {
          const linkStyle = `px-4 ${
            pathname === each.href
              ? `border-b-1 font-semibold pb-1.5 ${type === 'colored' ? 'border-b-[#9A7DFA] text-white' : 'border-b-primaryColor text-primaryColor'}`
              : type === 'colored'
              ? 'nav_link_colored'
              : 'nav_link'
          }`;
          return (
            <Link href={each.href} key={each.title} className={cn('px-4 cursor-pointer', linkStyle)}>
              {each.title}
            </Link>
          );
        })}
      </nav>
      <div className="flex space-x-4">
        <CustomButton className="bg-white border border-primaryColor text-primaryColor h-[38px] px-8">Login</CustomButton>
        <CustomButton className={btnClassName}>Get Started</CustomButton>
      </div>
    </div>
  );
}
