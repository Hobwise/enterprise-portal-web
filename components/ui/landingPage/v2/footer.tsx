'use client';
import LogoDark from '@/public/assets/images/landing-v2/logo-dark.png';
import {
  CONTACT_URL,
  LOGIN_URL,
  PRIVACY_POLICY,
  REQUEST_DEMO_URL,
} from '@/utilities/routes';
import Image from 'next/image';
import Link from 'next/link';
import { socialMedia } from '../footer';

const linkColumns = [
  [
    { title: 'Features', href: '/#features' },
    { title: 'Hospira AI', href: '/#hospira' },
    { title: 'Dashboard', href: LOGIN_URL },
    { title: 'Pricing', href: '/#pricing' },
  ],
  [
    { title: 'Book a Live Demo', href: `/${REQUEST_DEMO_URL}` },
    { title: 'FAQ', href: '/#faq' },
    { title: 'Contact', href: `/${CONTACT_URL}` },
    { title: 'Email', href: 'mailto:hello@hobwise.com' },
  ],
  [
    { title: 'Terms of Use', href: `${PRIVACY_POLICY}?tab=Terms Of Use` },
    { title: 'Privacy Policy', href: PRIVACY_POLICY },
    { title: 'User Guide', href: `${PRIVACY_POLICY}?tab=User Guide` },
  ],
];

export default function LandingFooter() {
  return (
    <footer className='font-satoshi text-left'>
      <div className='bg-[#110927] text-white px-6 lg:px-16 py-14 lg:py-20 grid grid-cols-1 lg:grid-cols-[1.4fr_1fr_1fr_1fr] gap-12'>
        <div className='space-y-6'>
          <Image src={LogoDark} alt='Hobwise logo' width={140} />
          <p className='text-white/80 text-sm lg:text-base max-w-xs'>
            The hospitality operations platform for modern restaurants, bars and lounges. One
            dashboard, one AI assistant, zero chaos.
          </p>
          <div className='space-y-3'>
            <p className='font-semibold'>Follow us:</p>
            <div className='flex space-x-3'>
              {socialMedia.map((each) => (
                <Link
                  href={each.url}
                  target='_blank'
                  key={each.url}
                  className='h-9 w-9 rounded-full border border-white/20 flex items-center justify-center hover:bg-white/10 transition-colors'
                >
                  {each.icon}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {linkColumns.map((column, columnIndex) => (
          <nav key={`footer-column-${columnIndex}`} className='space-y-5 text-white/90'>
            {column.map((each) => (
              <Link
                key={each.title}
                href={each.href}
                className='block hover:text-white transition-colors'
              >
                {each.title}
              </Link>
            ))}
          </nav>
        ))}
      </div>

      <div className='bg-[#F8F8F8] text-[#4C4C4C] text-sm px-6 lg:px-16 py-5 flex flex-col lg:flex-row gap-3 items-center justify-between'>
        <p>
          © {new Date().getFullYear()} <span className='font-bold'>Hobwise</span>. All rights
          reserved.
        </p>
        <div className='flex items-center space-x-6'>
          <Link href={PRIVACY_POLICY}>Privacy Policy</Link>
          <Link href={`${PRIVACY_POLICY}?tab=Terms Of Use`}>Terms of Use</Link>
        </div>
      </div>
    </footer>
  );
}
