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
    title: 'Never run out of your best-sellers',
    body: "Real-time stock tracking with low-stock alerts before items hit zero — so you stop losing sales you've already won.",
  },
  {
    icon: IconSales,
    tint: 'from-[#E5F3F9]',
    title: "See today's sales from anywhere",
    body: 'Live revenue, orders and payment status on your phone. Check the till from traffic, no phone call to the manager required.',
  },
  {
    icon: IconBookings,
    tint: 'from-[#E6F7EE]',
    title: 'Handle bookings without the back and forth',
    body: 'One calendar for every reservation, from every channel. No more double-bookings, fewer no-shows, happier guests.',
  },
  {
    icon: IconPayments,
    tint: 'from-[#EAEBFC]',
    title: 'Get paid faster, track every naira',
    body: 'Transfer, cash and card in one ledger. Spot high refund rates and unpaid tabs the day they happen, not at month-end.',
  },
  {
    icon: IconStaff,
    tint: 'from-[#EEE8FD]',
    title: 'Coordinate your staff and monitor performance',
    body: 'Per-staff performance, shift activity and order ownership. Reward your stars and catch the leaks — with receipts.',
  },
  {
    icon: IconOps,
    tint: 'from-[#F7E5F5]',
    title: 'Take charge of your operations from anywhere',
    body: 'Hospira, your built-in AI assistant, answers operational questions, flags problems and trains new staff — any time of night.',
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
