import { CustomButton } from '@/components/customButton';
import { SIGN_UP_URL } from '@/utilities/routes';
import Link from 'next/link';
import { FiArrowRight } from 'react-icons/fi';
import { PiCheckCircle } from 'react-icons/pi';

interface Plan {
  name: string;
  price: string;
  limits: string;
  audience: string;
  features: string[];
  popular?: boolean;
}

const basePlanFeatures = [
  'Up to 5 staff users',
  'Monitor operations in real time',
  'Update menus instantly',
  'Keep staff instantly informed',
  'Track every order live',
  'Accept payments seamlessly',
  'Customize your workflow',
  'Digital menus',
];

const growthFeatures = [
  'Up to 20 staff users',
  ...basePlanFeatures.slice(1),
  'Manage reservations effortlessly',
  'Handle bookings seamlessly',
  'Run targeted customer campaigns',
  'Track sales and performance instantly',
  'Monitor stock levels in real time',
];

const plans: Plan[] = [
  {
    name: 'Starter',
    price: '₦18,000/mo',
    limits: 'Up to 3 staff · 1 location',
    audience: 'For cafés & small spots finding their feet.',
    features: basePlanFeatures,
  },
  {
    name: 'Growth',
    price: '₦45,000/mo',
    limits: 'Up to 15 staff · 1 location',
    audience: 'For busy restaurants, bars & lounges.',
    features: growthFeatures,
    popular: true,
  },
  {
    name: 'Multi-Location',
    price: '₦100,000/mo',
    limits: 'Unlimited staff · Multiple locations',
    audience: 'For groups running multiple locations.',
    features: [
      ...growthFeatures,
      'Manage all branches from one place',
      'Get fast support whenever you need it',
    ],
  },
];

export default function PricingSection() {
  return (
    <section id='pricing' className='scroll-mt-24 bg-[#F8F8F8] font-satoshi py-16 lg:py-24 px-6 lg:px-16'>
      <div className='lg:flex lg:items-end lg:justify-between space-y-4 lg:space-y-0'>
        <div className='space-y-4'>
          <p className='text-[#667085] text-xs lg:text-sm font-semibold tracking-[0.2em] uppercase'>
            Pricing
          </p>
          <h2 className='font-bricolage_grotesque font-medium text-[#161618] text-[30px] leading-[38px] lg:text-[48px] lg:leading-[56px]'>
            Priced for where
            <br className='hidden lg:block' /> your business is now.
          </h2>
        </div>
        <p className='text-[#44444A] text-sm lg:text-base lg:max-w-xs'>
          Start small, scale when you grow. Every plan includes Hospira AI and free onboarding.
        </p>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6 mt-12 text-left items-start'>
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`bg-[#F2F2F8] p-7 space-y-6 border ${
              plan.popular ? 'border-primaryColor' : 'border-[#E7E7EF]'
            }`}
          >
            <div className='flex items-center gap-3'>
              <h3 className='text-[#161618] font-bricolage_grotesque text-xl'>{plan.name}</h3>
              {plan.popular && (
                <span className='bg-[#D9F2E1] text-[#15803D] text-xs px-3 py-1 rounded-full'>
                  Most Popular
                </span>
              )}
            </div>

            <div className='space-y-1 border-b border-[#E0E0EA] pb-6'>
              <p className='text-[#161618] font-bricolage_grotesque font-semibold text-[32px]'>
                {plan.price}
              </p>
              <p className='text-[#44444A] text-sm'>{plan.limits}</p>
            </div>

            <p className='text-[#161618] font-semibold text-sm lg:text-base'>{plan.audience}</p>

            <ul className='space-y-3'>
              {plan.features.map((feature) => (
                <li key={feature} className='flex items-center gap-3 text-[#44444A] text-sm lg:text-base'>
                  <PiCheckCircle className='shrink-0 text-[#667085] text-lg' />
                  {feature}
                </li>
              ))}
            </ul>

            <Link href={SIGN_UP_URL} target='_blank' className='block pt-2'>
              <CustomButton
                className={`h-[48px] w-full rounded-sm ${
                  plan.popular
                    ? 'bg-gradient-to-r from-[#5F35D2] to-[#7C3AED] text-white'
                    : 'bg-white border border-[#E4E4E7] text-primaryColor'
                }`}
              >
                <span className='flex items-center gap-2'>
                  Start your free trial <FiArrowRight />
                </span>
              </CustomButton>
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}
