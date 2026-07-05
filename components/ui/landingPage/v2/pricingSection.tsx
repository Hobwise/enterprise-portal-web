'use client';
import { getPricings } from '@/app/api/controllers/landingPage';
import { CustomButton } from '@/components/customButton';
import { formatKey, formatNumber } from '@/lib/utils';
import { SIGN_UP_URL } from '@/utilities/routes';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { FiArrowRight } from 'react-icons/fi';
import { PiCheckCircle } from 'react-icons/pi';
import PricingLoading from '../skeleton-loading';
import { SwitchPlan } from '../pricing';

const UNLIMITED_USERS = 2147483647;

/** Static copy per API plan key — everything else comes from getPricings(). */
const PLAN_META: Record<string, { audience: string; popular?: boolean }> = {
  Basic: {
    audience:
      'Recommended for small businesses, looking to streamline their menu & order management process.',
  },
  Professional: {
    audience:
      'Suitable for medium size businesses looking to manage booking, process order & menu while leveraging the campaign feature also.',
    popular: true,
  },
  Premium: {
    audience:
      'For large scale businesses operations, enabling businesses with multiple locations manage their operations effectively.',
  },
};

interface Plan {
  name: string;
  monthlyFee: number;
  yearlyFee: number;
  limits: string;
  audience: string;
  features: string[];
  popular?: boolean;
}

const toPlans = (pricings: Record<string, any>): Plan[] =>
  Object.entries(PLAN_META)
    .filter(([key]) => pricings[key])
    .map(([key, meta]) => {
      const plan = pricings[key];
      const maxUsers = plan.maxUsers;

      return {
        name: `${key} Plan`,
        monthlyFee: plan.monthlyFee,
        yearlyFee: plan.yearlyFee,
        limits:
          maxUsers === UNLIMITED_USERS
            ? 'Unlimited users'
            : `Up to ${maxUsers} users`,
        audience: meta.audience,
        popular: meta.popular,
        features: Object.entries(plan)
          .filter(([feature, enabled]) => feature.startsWith('canAccess') && enabled)
          .map(([feature]) => formatKey(feature)),
      };
    });

export default function PricingSection() {
  const [pricings, setPricings] = useState<Record<string, any> | null>(null);
  const [billing, setBilling] = useState<string>('monthly');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchPricings = async () => {
      const data = await getPricings();
      if (data?.data?.isSuccessful) {
        setPricings(data.data.data);
      }
      setIsLoading(false);
    };

    fetchPricings();
  }, []);

  const plans = pricings ? toPlans(pricings) : [];

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

      {isLoading ? (
        <div className='mt-12'>
          <PricingLoading />
        </div>
      ) : (
        plans.length > 0 && (
          <>
            <div className='mt-12'>
              <SwitchPlan plan={billing} setPlan={setBilling} />
            </div>

            <div className='grid grid-cols-1 lg:grid-cols-3 gap-6 mt-10 text-left items-start'>
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
                        Recommended
                      </span>
                    )}
                  </div>

                  <div className='space-y-1 border-b border-[#E0E0EA] pb-6'>
                    <p className='text-[#161618] font-bricolage_grotesque font-semibold text-[32px]'>
                      ₦{formatNumber(billing === 'monthly' ? plan.monthlyFee : plan.yearlyFee)}
                      <span className='text-[#44444A] font-normal text-base'>
                        /{billing === 'monthly' ? 'month' : 'year'}
                      </span>
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
                        Get Started <FiArrowRight />
                      </span>
                    </CustomButton>
                  </Link>
                </div>
              ))}
            </div>
          </>
        )
      )}
    </section>
  );
}
