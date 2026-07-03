import { CustomButton } from '@/components/customButton';
import CtaGraphics from '@/public/assets/images/landing-v2/cta-graphics.png';
import { SIGN_UP_URL } from '@/utilities/routes';
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

export default function Cta() {
  return (
    <section
      className='font-satoshi py-16 lg:py-24 px-6 lg:px-16 overflow-hidden'
      style={{ background: 'linear-gradient(65deg, #4904A9 55%, #6C01FF 55%)' }}
    >
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-12 items-center'>
        <div className='space-y-6 text-left'>
          <p className='text-white/80 text-xs lg:text-sm font-semibold tracking-[0.2em] uppercase'>
            Get in touch
          </p>
          <h2 className='font-bricolage_grotesque font-medium text-white text-[36px] leading-[44px] lg:text-[56px] lg:leading-[66px]'>
            Stop firefighting.
            <br />
            <span className='relative inline-block'>
              Start running the
              <ScribbleEllipse className='absolute -inset-x-3 inset-y-0 w-[calc(100%+24px)] h-full text-[#F59E0B]' />
            </span>
            <br />
            place.
          </h2>
          <p className='text-white/85 text-sm lg:text-base max-w-md'>
            Bring orders, staff, inventory, reservations, and reporting into one system built for
            modern restaurants.
          </p>
          <Link href={SIGN_UP_URL} target='_blank' className='inline-block'>
            <CustomButton className='h-[48px] px-8 rounded-sm bg-white text-primaryColor'>
              <span className='flex items-center gap-2'>
                Book a Demo <FiArrowRight />
              </span>
            </CustomButton>
          </Link>
        </div>

        <Image
          src={CtaGraphics}
          alt='Hobwise sales analysis and repeat guest rate dashboards'
          className='w-full h-auto'
        />
      </div>
    </section>
  );
}
