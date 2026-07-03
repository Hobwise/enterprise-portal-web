import PainIcon from '@/public/assets/images/landing-v2/pain-icon.png';
import Image from 'next/image';

const painPoints = [
  {
    title: 'You find out too late',
    body: 'The jollof runs out at 8pm on a Friday. You only hear about it when a table complains.',
  },
  {
    title: 'Bookings get lost during busy hours',
    body: 'Reservations come by call, by DM, by walk-in. Double-bookings and no-shows are just "normal" now.',
  },
  {
    title: 'Cash keeps going missing',
    body: 'Refunds, unpaid tabs, staff "mistakes." By month-end the numbers never quite add up.',
  },
  {
    title: 'No clear picture',
    body: "Want today's sales while you're away? You're calling a manager and hoping they pick up.",
  },
];

export default function PainPoints() {
  return (
    <section
      id='about'
      className='scroll-mt-24 bg-[#130E20] font-satoshi py-16 lg:py-24 px-6 lg:px-16'
      style={{
        backgroundImage: 'url(/assets/images/landing-v2/dark-pattern.png)',
        backgroundRepeat: 'repeat',
        backgroundSize: '1280px 105px',
      }}
    >
      <div className='text-center space-y-4 max-w-2xl mx-auto'>
        <p className='text-[#FACC15] text-xs lg:text-sm font-semibold tracking-[0.2em] uppercase'>
          Sound familiar?
        </p>
        <h2 className='font-bricolage_grotesque font-medium text-white text-[30px] leading-[38px] lg:text-[48px] lg:leading-[56px]'>
          Running a busy kitchen shouldn&apos;t feel like firefighting.
        </h2>
        <p className='text-[#A29FB0] text-sm lg:text-base'>
          Hobwise helps your team stay coordinated during rush hours, reduce mistakes, and keep
          service running smoothly.
        </p>
      </div>

      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-12 lg:mt-16 text-left'>
        {painPoints.map((each) => (
          <div
            key={each.title}
            className='bg-white/[0.04] border border-white/5 p-6 space-y-4'
          >
            <Image src={PainIcon} alt='' width={44} height={44} />
            <h3 className='text-white font-bricolage_grotesque text-lg lg:text-xl'>
              {each.title}
            </h3>
            <p className='text-[#A29FB0] text-sm lg:text-base'>{each.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
