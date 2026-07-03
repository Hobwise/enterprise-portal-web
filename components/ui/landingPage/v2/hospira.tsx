'use client';
import HospiraChat from '@/public/assets/images/landing-v2/hospira-chat.png';
import HospiraSupport from '@/public/assets/images/landing-v2/hospira-support.png';
import Image from 'next/image';
import { PiChartPieSliceFill, PiLightningFill, PiRobotFill } from 'react-icons/pi';

const DEMO_VIDEO_URL =
  'https://res.cloudinary.com/dboqyj4bp/video/upload/v1744286255/hob-wizz_pvswyr.mp4';
const DEMO_VIDEO_POSTER = '/assets/images/landing-v2/hospira-dashboard.png';

const capabilities = [
  {
    icon: <PiLightningFill />,
    text: 'Ask about stocks, reservations, bookings, menu and more.',
  },
  {
    icon: <PiChartPieSliceFill />,
    text: 'Generates reports & spots trends easily.',
  },
  {
    icon: <PiRobotFill />,
    text: 'Always on — never clocks out',
  },
];

export default function Hospira() {
  return (
    <section id='hospira' className='scroll-mt-24 bg-white font-satoshi py-16 lg:py-24 px-6 lg:px-16'>
      <div className='text-center space-y-4 max-w-2xl mx-auto'>
        <p className='text-[#667085] text-xs lg:text-sm font-semibold tracking-[0.2em] uppercase'>
          New · AI powered
        </p>
        <h2 className='font-bricolage_grotesque font-medium text-[#161618] text-[30px] leading-[38px] lg:text-[48px] lg:leading-[56px]'>
          Meet Hospira —
          <br className='hidden lg:block' /> your operations assistant.
        </h2>
        <p className='text-[#44444A] text-sm lg:text-base'>
          Hospira helps you track performance, monitor stock, and answer operational questions
          about your business in seconds.
        </p>
      </div>

      <video
        controls
        preload='none'
        poster={DEMO_VIDEO_POSTER}
        src={DEMO_VIDEO_URL}
        className='w-full h-auto mt-12 rounded-2xl border border-[#ECECEC] shadow-custom'
      >
        <source src={DEMO_VIDEO_URL} type='video/mp4' />
        Your browser does not support the video tag.
      </video>

      <div className='grid grid-cols-1 lg:grid-cols-[0.68fr_1fr_1fr] gap-6 mt-8 text-left'>
        <div className='bg-white border border-[#ECECEC] p-6 space-y-5'>
          <h3 className='text-[#161618] font-bricolage_grotesque text-xl lg:text-2xl'>
            What Hospira handles for you
          </h3>
          <ul className='space-y-4'>
            {capabilities.map((each) => (
              <li
                key={each.text}
                className='flex items-start gap-3 border-b border-[#F0F0F0] last:border-b-0 pb-4 last:pb-0'
              >
                <span className='shrink-0 h-8 w-8 rounded-lg bg-[#EEE8FD] text-primaryColor flex items-center justify-center text-base'>
                  {each.icon}
                </span>
                <p className='text-[#44444A] text-sm lg:text-base'>{each.text}</p>
              </li>
            ))}
          </ul>
        </div>

        <Image
          src={HospiraChat}
          alt='Hospira chat assistant answering questions about sales, reservations and stock'
          className='w-full h-full object-cover'
        />
        <Image
          src={HospiraSupport}
          alt='Built to support real restaurant operations even on busy days'
          className='w-full h-full object-cover'
        />
      </div>
    </section>
  );
}
