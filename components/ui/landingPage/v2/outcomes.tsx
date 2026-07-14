import IconBookings from '@/public/assets/images/landing-v2/icon-bookings.png';
import IconOps from '@/public/assets/images/landing-v2/icon-ops.png';
import IconPayments from '@/public/assets/images/landing-v2/icon-payments.png';
import IconSales from '@/public/assets/images/landing-v2/icon-sales.png';
import IconStaff from '@/public/assets/images/landing-v2/icon-staff.png';
import IconStock from '@/public/assets/images/landing-v2/icon-stock.png';
import Image, { StaticImageData } from 'next/image';

interface Outcome {
  icon: StaticImageData;
  tint: string;
  title: string;
  body: string;
}

const outcomes: Outcome[] = [
  {
    icon: IconStock,
    tint: 'from-[#FDF5E3]',
    title: 'Real-Time Stock Tracking',
    body: 'Stops you from losing sales when a popular dish sells out without warning.',
  },
  {
    icon: IconSales,
    tint: 'from-[#E5F3F9]',
    title: 'Live Sales Dashboard',
    body: 'Gives owners an accurate, real-time sales picture without calling staff for updates.',
  },
  {
    icon: IconBookings,
    tint: 'from-[#E6F7EE]',
    title: 'Unified Booking Calendar',
    body: 'Prevents double-bookings and no-shows caused by reservations coming in through calls, DMs, and walk-ins separately.',
  },
  {
    icon: IconPayments,
    tint: 'from-[#EAEBFC]',
    title: 'Unified Payment Ledger',
    body: 'Catches payment discrepancies and unpaid tabs immediately instead of at month-end reconciliation.',
  },
  {
    icon: IconStaff,
    tint: 'from-[#EEE8FD]',
    title: 'Multi locations',
    body: 'Gives visibility into different business locations by a simple switch with one login.',
  },
  {
    icon: IconOps,
    tint: 'from-[#F7E5F5]',
    title: 'Hospira AI Assistant',
    body: 'Delivers instant answers on stock, bookings, and trends without digging through reports.',
  },
];

export default function Outcomes() {
  return (
    <section id='features' className='scroll-mt-24 bg-white font-satoshi py-16 lg:py-24 px-6 lg:px-16'>
      <div className='text-center space-y-4 max-w-2xl mx-auto'>
        <p className='text-[#667085] text-xs lg:text-sm font-semibold tracking-[0.2em] uppercase'>
          What you actually get
        </p>
        <h2 className='font-bricolage_grotesque font-medium text-[#161618] text-[30px] leading-[38px] lg:text-[48px] lg:leading-[56px]'>
          Built around outcomes,
          <br className='hidden lg:block' /> not features.
        </h2>
        <p className='text-[#44444A] text-sm lg:text-base'>
          Reduce delays, improve visibility, and keep your restaurant running smoothly from one
          connected system.
        </p>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12 lg:mt-16 text-left'>
        {outcomes.map((each) => (
          <div
            key={each.title}
            className={`bg-gradient-to-b ${each.tint} to-white p-8 space-y-4 rounded-sm`}
          >
            <Image src={each.icon} alt='' width={56} height={56} />
            <h3 className='text-[#161618] font-bricolage_grotesque text-xl lg:text-2xl leading-snug'>
              {each.title}
            </h3>
            <p className='text-[#44444A] text-sm lg:text-base'>{each.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
