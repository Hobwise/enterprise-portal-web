'use client';
import HospiraChat from '@/public/assets/images/landing-v2/hospira-chat.png';
import HospiraDashboard from '@/public/assets/images/landing-v2/hospira-dashboard.png';
import HospiraSupport from '@/public/assets/images/landing-v2/hospira-support.png';
import Image from 'next/image';
import { useRef, useState } from 'react';
import { PiChartPieSliceFill, PiLightningFill, PiRobotFill } from 'react-icons/pi';

const DEMO_VIDEO_URL =
  'https://res.cloudinary.com/dboqyj4bp/video/upload/v1744286255/hob-wizz_pvswyr.mp4';

const capabilities = [
  {
    icon: <PiLightningFill />,
    text: 'Get immediate answers about platform features and workflows.',
  },
  {
    icon: <PiChartPieSliceFill />,
    text: 'Learn how to place orders, manage bookings, or update inventory records.',
  },
  {
    icon: <PiRobotFill />,
    text: 'Always on — helps new staff learn the system, any time.',
  },
];

export default function Hospira() {
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const startPlayback = () => {
    setIsPlaying(true);
    // play() must be called synchronously inside the click handler —
    // browsers block autoplay-with-sound on elements mounted after the fact.
    videoRef.current?.play().catch(() => {
      // Autoplay refused: the video stays visible with native controls.
    });
  };

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
          Need help navigating the platform? Get guidance on placing orders, managing reservations,
          checking inventory, or using specific features — simply ask.
        </p>
      </div>

      <div className='mt-12 rounded-2xl overflow-hidden border border-[#ECECEC] shadow-custom'>
        <video
          ref={videoRef}
          controls
          playsInline
          preload='metadata'
          onEnded={() => setIsPlaying(false)}
          className={isPlaying ? 'w-full h-auto' : 'hidden'}
        >
          <source src={DEMO_VIDEO_URL} type='video/mp4' />
          Your browser does not support the video tag.
        </video>
        {!isPlaying && (
          // The poster artwork already carries the play button — make the
          // whole frame the actual control so tapping it starts playback.
          <button
            type='button'
            aria-label='Play the Hobwise demo video'
            onClick={startPlayback}
            className='group block w-full cursor-pointer'
          >
            <Image
              src={HospiraDashboard}
              alt='Watch the Hobwise demo video'
              className='w-full h-auto transition-transform duration-300 group-hover:scale-[1.01]'
            />
          </button>
        )}
      </div>

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
