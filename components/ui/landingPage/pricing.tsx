'use client';
import { CustomButton } from '@/components/customButton';
import { cn, formatKey, formatNumber, notify } from '@/lib/utils';
import { RoundedCheckIcon, TickIcon } from '@/public/assets/svg';
import { Transition } from './transition';
import React, { useEffect, useState } from 'react';
import { useMediaQuery } from '@/hooks/use-media-query';
import Link from 'next/link';
import { REQUEST_DEMO_URL, SIGN_UP_URL } from '@/utilities/routes';
import { getPricings } from '@/app/api/controllers/landingPage';
import PricingLoading from './skeleton-loading';

interface ISwitchPlan {
  className?: string;
  plan: string;
  setPlan: (arg: string) => void;
}

export function SwitchPlan({ className, plan, setPlan }: ISwitchPlan) {
  const plans: string[] = ['monthly', 'annually'];

  return (
    <div className={cn('bg-white shadow-shadow_2 w-fit mx-auto flex py-2 px-1 rounded-lg relative cursor-pointer', className)} role="switch">
      <div
        className={`absolute top-1.5 h-[80%] w-[48%] rounded-lg bg-[#5F35D2] transition-transform duration-300 ease-in-out ${
          plan === plans[1] ? 'translate-x-full' : ''
        }`}
      ></div>

      {plans.map((each) => (
        <p
          key={each}
          className={cn(
            'px-10 py-2 z-10 text-[#949494] font-satoshi font-normal capitalize cursor-pointer transition-colors duration-300',
            each === plan ? 'text-white' : ''
          )}
          onClick={() => setPlan(each)}
          role="button"
        >
          {each}
        </p>
      ))}
    </div>
  );
}

const getAllPricings = async (setPricings: (arg: any) => void, setIsLoading: (arg: boolean) => void, setError: (arg: string) => void) => {
  const data = await getPricings();

  if (data?.data?.isSuccessful) {
    setPricings(data?.data?.data);
  } else if (data?.data?.error) {
    setError(data?.data?.error);
    notify({
      title: 'Error!',
      text: data?.data?.error,
      type: 'error',
    });
  }
  setIsLoading(false);
};

export default function PricingComponent() {
  const [pricings, setPricings] = useState<any>(null);
  const [plan, setPlan] = useState<string>('monthly');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    getAllPricings(setPricings, setIsLoading, setError);
  }, []);

  if (isLoading) return <PricingLoading />;

  if (error) return null;

  const starterArray = pricings ? Object.entries(pricings?.Starter).map(([key, value]) => ({ key, value })) : [];
  const professionalArray = pricings ? Object.entries(pricings?.Professional).map(([key, value]) => ({ key, value })) : [];
  const premiumArray = pricings ? Object.entries(pricings?.Premium).map(([key, value]) => ({ key, value })) : [];

  const starterFee = plan === 'monthly' ? pricings?.Starter?.monthlyFee : pricings?.Starter?.yearlyFee;
  const professionalFee = plan === 'monthly' ? pricings?.Professional?.monthlyFee : pricings?.Professional?.yearlyFee;
  const premiumFee = plan === 'monthly' ? pricings?.Premium?.monthlyFee : pricings?.Premium?.yearlyFee;

  return (
    <div className="w-full space-y-16">
      <SwitchPlan plan={plan} setPlan={setPlan} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div
          className="border relative border-[#C4C4C4] bg-[#FFFFFF] p-8 rounded-[10px] space-y-8 
        min-h-[900px]"
        >
          <Transition>
            <div className="space-y-2.5">
              <h4 className="text-left text-[#FF9900] text-base lg:text-[20px]">Basic Plan</h4>
              <div className="flex items-baseline space-x-2">
                <p className="text-[24px] lg:text-[42px] text-[#161618] font-medium font-sans">₦{formatNumber(starterFee)}</p>
                {/* <p className="text-white/65 lg:text-base text-sm">per {pricings?.Starter?.maxUsers} Users |</p> */}
                <p className="text-[#ACB5BB] lg:text-base text-sm">per month</p>
              </div>
              <p className="text-[#000000] text-left lg:text-base text-sm h-[70px]">
                Recommended for small businesses, looking to streamline their menu & order management process
              </p>
            </div>
          </Transition>
          <Transition>
            <div className="flex items-center space-x-2 justify-center">
              <div className="w-[25%] lg:w-[35%] border-[#00000040] border" />
              <p className="uppercase w-[45%] font-medium text-[10px] text-[#00000040] text-center">WHAT YOU WILL GET</p>
              <div className="w-[25%] lg:w-[35%] border-[#00000040] border" />
            </div>
          </Transition>

          <div className="space-y-4">
            <Transition>
              <div className="flex items-start space-x-2">
                <TickIcon className="w-[10%]" />
                <p className="text-left text-[#000000] text-sm w-[90%]">Up to {pricings?.Starter?.maxUsers} users</p>
              </div>
            </Transition>
            {starterArray?.splice(3)?.map((each) => (
              <React.Fragment>
                {each?.value ? (
                  <Transition key={each + 'basic'}>
                    <div className="flex items-start space-x-2">
                      <TickIcon className="w-[10%]" />
                      <p className="text-left text-[#000000] text-sm w-[90%]">{formatKey(each?.key)}</p>
                    </div>
                  </Transition>
                ) : (
                  <p></p>
                )}
              </React.Fragment>
            ))}
          </div>

          <div className="mt-2 absolute bottom-10 w-[85%]">
            <Link href={SIGN_UP_URL}>
              <CustomButton className="w-full text-white font-medium mt-20">Get Started</CustomButton>
            </Link>
          </div>
        </div>

        <div
          className="border border-[#C4C4C4] bg-white p-8 rounded-[10px] space-y-8 
        min-h-[900px] relative"
        >
          <Transition>
            <div className="space-y-2.5">
              <h4 className="text-left text-[#FF9900] text-base lg:text-[20px]">Professional Plan (Recommended)</h4>
              <div className="flex items-baseline space-x-2">
                <p className="text-[24px] lg:text-[42px] text-[#161618] font-medium font-sans">₦{formatNumber(professionalFee)}</p>
                <p className="text-[#ACB5BB] lg:text-base text-sm">/month</p>
                {/* <p className="text-[#ACB5BB] lg:text-base text-sm">/{pricings?.Professional?.maxUsers} Users</p> */}
              </div>
              <p className="text-[#161618] text-left lg:text-base text-sm">
                Suitable for medium size businesses looking to manage booking, process order & menu while leveraging the campaign feature also
              </p>
            </div>
          </Transition>
          <Transition>
            <div className="flex items-center space-x-2 justify-center">
              <div className="w-[25%] lg:w-[35%] border-[#00000040] border" />
              <p className="uppercase w-[45%] font-medium text-[10px] text-[#00000040] text-center">WHAT YOU WILL GET</p>
              <div className="w-[25%] lg:w-[35%] border-[#00000040] border" />
            </div>
          </Transition>

          <div className="space-y-4">
            <Transition>
              <div className="flex items-start space-x-2">
                <TickIcon className="w-[10%]" />
                <p className="text-left text-[#161618] text-sm w-[90%]">Up to {pricings?.Professional?.maxUsers} users</p>
              </div>
            </Transition>
            {professionalArray?.splice(3)?.map((each) => (
              <React.Fragment>
                {each?.value ? (
                  <Transition key={each + 'basic'}>
                    <div className="flex items-start space-x-2">
                      <TickIcon className="w-[10%]" />
                      <p className="text-left text-[#161618] text-sm w-[90%]">{formatKey(each?.key)}</p>
                    </div>
                  </Transition>
                ) : (
                  <p></p>
                )}
              </React.Fragment>
            ))}
          </div>
          <div className="mt-2 absolute bottom-10 w-[85%]">
            <Link href={SIGN_UP_URL}>
              <CustomButton className="text-white shadow-custom_inset_2 bg-[#5F35D2] w-full font-medium mt-20">Get Started</CustomButton>
            </Link>
          </div>
        </div>

        <div
          className="border border-[#C4C4C4] bg-white p-8 rounded-[10px] space-y-8 
        min-h-[900px] relative"
        >
          <Transition>
            <div className="space-y-2.5">
              <h4 className="text-left text-[#FF9900] text-base lg:text-[20px]">Premium Plan</h4>
              <div className="flex items-baseline space-x-2">
                <p className="text-[24px] lg:text-[42px] text-[#000000] font-medium font-sans">₦{formatNumber(premiumFee)}</p>
                <p className="text-[#ACB5BB] lg:text-base text-sm">/month</p>
                {/* <p className="text-white/65 lg:text-base text-sm">/Unlimited</p> */}
              </div>
              <p className="text-[#161618] text-left lg:text-base text-sm">
                For large scale businesses operations, enabling businesses with multiple locations manage their operations effectively
              </p>
            </div>
          </Transition>
          <Transition>
            <div className="flex items-center space-x-2 justify-center">
              <div className="w-[25%] lg:w-[35%] border-[#00000040] border" />
              <p className="uppercase lg:w-[45%] text-center font-medium text-[10px] text-[#00000040]">WHAT YOU WILL GET</p>
              <div className="w-[25%] lg:w-[35%] border-[#00000040] border" />
            </div>
          </Transition>

          <div className="space-y-4">
            <Transition>
              <div className="flex items-start space-x-2">
                <TickIcon className="w-[10%]" />
                <p className="text-left text-[#000000] text-sm w-[90%]">Unlimited users</p>
              </div>
            </Transition>
            {premiumArray?.splice(3)?.map((each) => (
              <React.Fragment>
                {each?.value ? (
                  <Transition key={each + 'basic'}>
                    <div className="flex items-start space-x-2">
                      <TickIcon className="w-[10%]" />
                      <p className="text-left text-[#000000] text-sm w-[90%]">{formatKey(each?.key)}</p>
                    </div>
                  </Transition>
                ) : (
                  <p></p>
                )}
              </React.Fragment>
            ))}
            <Transition>
              <div className="flex items-start space-x-2">
                <TickIcon className="w-[10%]" />
                <p className="text-left text-[#000000] text-sm w-[90%]">Support and help center</p>
              </div>
            </Transition>
          </div>

          <div className="mt-2 absolute bottom-10 w-[85%]">
            <Link href={REQUEST_DEMO_URL}>
              <CustomButton className="w-full text-white font-medium mt-20">Contact Sales</CustomButton>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export function PricingExtended({ plan, setPlan }: { plan: string; setPlan: (arg: string) => void }) {
  const isDesktop = useMediaQuery('(min-width: 768px)');

  const [pricings, setPricings] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    getAllPricings(setPricings, setIsLoading, setError);
  }, []);

  if (isLoading) return <PricingLoading />;

  if (error) return null;

  const starterArray = pricings ? Object.entries(pricings?.Starter).map(([key, value]) => ({ key, value })) : [];
  const professionalArray = pricings ? Object.entries(pricings?.Professional).map(([key, value]) => ({ key, value })) : [];
  const premiumArray = pricings ? Object.entries(pricings?.Premium).map(([key, value]) => ({ key, value })) : [];
  const initialArray = pricings ? Object.entries(pricings?.Professional).map(([key, value]) => ({ key, value })) : [];

  const starterFee = plan === 'monthly' ? pricings?.Starter?.monthlyFee : pricings?.Starter?.yearlyFee;
  const professionalFee = plan === 'monthly' ? pricings?.Professional?.monthlyFee : pricings?.Professional?.yearlyFee;
  const premiumFee = plan === 'monthly' ? pricings?.Premium?.monthlyFee : pricings?.Premium?.yearlyFee;

  const btnClassName =
    'before:ease relative h-[40px] overflow-hidden w-fit lg:text-base text-xs border border-white lg:px-8 shadow-[inset_0_7.4px_18.5px_0px_rgba(255,255,255,0.11)] bg-primaryColor text-white shadow-2xl transition-all before:absolute before:right-0 before:top-0 before:h-[40px] before:w-6 before:translate-x-12 before:rotate-6 before:bg-white before:opacity-10 before:duration-700 hover:shadow-primaryColor-500 hover:before:-translate-x-40';
  return (
    <div className="border border-white bg-white rounded-xl font-satoshi">
      <div className="grid grid-cols-3 lg:grid-cols-4 bg-[#3A159F] py-4 px-4 gap-6 lg:gap-24 rounded-tr-xl rounded-tl-xl">
        <div className="space-y-4 col-span-1 hidden lg:block">
          <p className="font-bricolage_grotesque text-white text-[20px]">Select type of price</p>
          <SwitchPlan className="mx-0" plan={plan} setPlan={setPlan} />
        </div>
        <div className="space-y-6 col-span-1">
          <p className="text-white text-[10px] lg:text-base">Basic Plan</p>
          <div className="flex items-baseline space-x-2">
            <p className="text-[12px] lg:text-[28px] text-white font-medium font-sans">₦{formatNumber(starterFee)}</p>
            <p className="text-white/65 text-[10px] lg:text-sm">/month</p>
          </div>
        </div>
        <div className="space-y-6 col-span-1">
          <p className="text-white text-[10px] lg:text-base">Professional Plan</p>
          <div className="flex items-baseline space-x-2">
            <p className="text-[12px] lg:text-[28px] text-white font-medium font-sans">₦{formatNumber(professionalFee)}</p>
            <p className="text-white/65 text-[10px] lg:text-sm">/month</p>
          </div>
        </div>
        <div className="space-y-6 col-span-1">
          <p className="text-white text-[10px] lg:text-base">Enterprise Plan</p>
          <div className="flex items-baseline space-x-2">
            <p className="text-[12px] lg:text-[28px] text-white font-medium font-sans">₦{formatNumber(premiumFee)}</p>
            <p className="text-white/65 text-[10px] lg:text-sm">/month</p>
          </div>
        </div>
      </div>

      {isDesktop ? (
        <div className="bg-white">
          <div className="grid grid-cols-3 text-[#252525] lg:grid-cols-4 py-10 px-4 gap-24 border-b border-b-[#E5E5E5]">
            <div className="">
              {initialArray.splice(3).map((each, index) => (
                <p key={each.key + index} className="text-[9px] lg:text-sm h-12 flex items-center">
                  {formatKey(each.key)}
                </p>
              ))}
            </div>
            <div className="">
              {starterArray.splice(3).map((each, index) => (
                <div key={each.key + 'starter'} className="h-12 flex items-center">
                  {each.value ? <RoundedCheckIcon className="shadow-custom_shadow_3" /> : <div className="border w-4 border-[#CDD0D5]" />}
                </div>
              ))}
            </div>
            <div>
              {professionalArray.splice(3).map((each, index) => (
                <div key={each.key + 'professional'} className="h-12 flex items-center">
                  {each.value ? <RoundedCheckIcon className="shadow-custom_shadow_3" /> : <div className="border w-4 border-[#CDD0D5]" />}
                </div>
              ))}
            </div>
            <div>
              {premiumArray.splice(3).map((each, index) => (
                <div key={each.key + 'premium'} className="h-12 flex items-center">
                  {each.value ? <RoundedCheckIcon className="shadow-custom_shadow_3" /> : <div className="border w-4 border-[#CDD0D5]" />}
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white pb-10">
          <div className="grid grid-cols-3 text-[#252525] lg:grid-cols-4 px-4 gap-24">
            <div className="space-y-6">
              {starterArray.splice(3).map((each, index) => (
                <div key={each.key + 'starter'} className="h-16 items-center space-y-6">
                  <p className={cn('text-sm h-8 pb-12', index === 0 ? 'mt-4' : 'mt-20')}>{formatKey(each.key)}</p>
                  {each.value ? <RoundedCheckIcon className="shadow-custom_shadow_3 mt-1" /> : <div className="border w-4 border-[#CDD0D5]" />}
                </div>
              ))}
            </div>
            <div className="space-y-6">
              {professionalArray.splice(3).map((each, index) => (
                <div key={each.key + 'professional'} className="h-16 space-y-6 items-center">
                  <p className={cn('text-sm h-8 pb-12', index === 0 ? 'mt-4' : 'mt-20')}></p>
                  {each.value ? <RoundedCheckIcon className="shadow-custom_shadow_3 mt-1" /> : <div className="border w-4 border-[#CDD0D5]" />}
                </div>
              ))}
            </div>
            <div className="space-y-6">
              {premiumArray.splice(3).map((each, index) => (
                <div key={each.key + 'premium'} className="h-16 space-y-6 items-center">
                  <p className={cn('text-sm h-8 pb-12', index === 0 ? 'mt-4' : 'mt-20')}></p>
                  {each.value ? <RoundedCheckIcon className="shadow-custom_shadow_3 mt-1" /> : <div className="border w-4 border-[#CDD0D5]" />}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-3 lg:grid-cols-4 bg-[#3A159F] py-10 px-4 gap-3 lg:gap-24 rounded-br-xl rounded-bl-xl">
        {isDesktop && <p className="font-bricolage_grotesque text-white text-[20px]">Get Started now</p>}

        <Link href={SIGN_UP_URL}>
          <CustomButton className={btnClassName}>Get Started</CustomButton>
        </Link>

        <Link href={SIGN_UP_URL}>
          <CustomButton className={btnClassName}>Get Started</CustomButton>
        </Link>

        <Link href={SIGN_UP_URL}>
          <CustomButton className={btnClassName}>Get Started</CustomButton>
        </Link>
      </div>
    </div>
  );
}
