'use client';
import { CustomButton } from '@/components/customButton';
import { cn, pricingPlan } from '@/lib/utils';
import { RoundedCheckIcon, TickIcon } from '@/public/assets/svg';
import { Transition } from './transition';

export function SwitchPlan({ className }: { className?: string }) {
  return (
    <div className={cn('bg-white border border-[#44444A] shadow-shadow_2 w-fit mx-auto flex py-1 px-1 rounded-lg', className)} role="switch">
      <p className="px-10 py-2 rounded-lg text-[#949494] font-satoshi font-normal">Monthly</p>
      <p className="px-10 bg-[#5F35D2] py-2 rounded-lg font-satoshi font-normal text-white border border-[#FFFFFF26] z-20 shadow-custom_double">Annually</p>
    </div>
  );
}

export default function PricingComponent() {
  return (
    <div className="w-full space-y-16">
      <SwitchPlan />

      <div className="grid grid-cols-3 gap-6">
        <div className="border border-[#FFFFFF61] bg-[#FFFFFF1A] p-8 rounded-[10px] space-y-8">
          <Transition>
            <div className="space-y-2.5">
              <h4 className="text-left text-white text-[20px]">Basic Plan</h4>
              <div className="flex items-baseline space-x-2">
                <p className="text-[42px] text-white font-medium font-sans">$10</p>
                <p className="text-white/65">/month</p>
              </div>
              <p className="text-white text-left">
                Lorem ipsum dolor sit amet consectetur. Pellentesque purus odio nec purus lectus faucibus. Nulla leo ac egestas.
              </p>
            </div>
          </Transition>
          <Transition>
            <div className="flex items-center space-x-2">
              <div className="w-[35%] border-[#FFFFFF61] border" />
              <p className="uppercase w-[45%] font-medium text-[10px] text-white">WHAT YOU WILL GET</p>
              <div className="w-[35%] border-[#FFFFFF61] border" />
            </div>
          </Transition>

          <div className="space-y-4">
            {pricingPlan.map((each) => (
              <Transition key={each + 'basic'}>
                <div className="flex items-start space-x-2">
                  <TickIcon className="w-[10%]" />
                  <p className="text-left text-white text-sm w-[90%]">{each}</p>
                </div>
              </Transition>
            ))}
          </div>
          <Transition>
            <div className="mt-24">
              <CustomButton className="text-[#2020A6] bg-white w-full font-medium mt-20">Get Started</CustomButton>
            </div>
          </Transition>
        </div>

        <div className="border border-[#44444A] bg-white p-8 rounded-[10px] space-y-8">
          <Transition>
            <div className="space-y-2.5">
              <h4 className="text-left text-[#FF9900] text-[20px]">Premium Plan (Recommended)</h4>
              <div className="flex items-baseline space-x-2">
                <p className="text-[42px] text-[#161618] font-medium font-sans">$19.99</p>
                <p className="text-[#ACB5BB]">/month</p>
              </div>
              <p className="text-[#161618] text-left">
                Lorem ipsum dolor sit amet consectetur. Pellentesque purus odio nec purus lectus faucibus. Nulla leo ac egestas.
              </p>
            </div>
          </Transition>
          <Transition>
            <div className="flex items-center space-x-2">
              <div className="w-[35%] border-[#00000040] border" />
              <p className="uppercase w-[45%] font-medium text-[10px] text-[#00000040]">WHAT YOU WILL GET</p>
              <div className="w-[35%] border-[#00000040] border" />
            </div>
          </Transition>

          <div className="space-y-4">
            {pricingPlan.map((each) => (
              <Transition key={each + 'premium'}>
                <div className="flex items-start space-x-2">
                  <TickIcon className="w-[10%]" />
                  <p className="text-left text-[#161618] text-sm w-[90%]">{each}</p>
                </div>
              </Transition>
            ))}
          </div>
          <Transition>
            <div className="mt-24">
              <CustomButton className="text-white shadow-custom_inset_2 bg-[#5F35D2] w-full font-medium mt-20">Get Started</CustomButton>
            </div>
          </Transition>
        </div>

        <div className="border border-[#FFFFFF61] bg-[#FFFFFF1A] p-8 rounded-[10px] space-y-8">
          <Transition>
            <div className="space-y-2.5">
              <h4 className="text-left text-white text-[20px]">Professional Plan</h4>
              <div className="flex items-baseline space-x-2">
                <p className="text-[42px] text-white font-medium font-sans">$49.99</p>
                <p className="text-white/65">/month</p>
              </div>
              <p className="text-white text-left">
                Lorem ipsum dolor sit amet consectetur. Pellentesque purus odio nec purus lectus faucibus. Nulla leo ac egestas.
              </p>
            </div>
          </Transition>
          <Transition>
            <div className="flex items-center space-x-2">
              <div className="w-[35%] border-[#FFFFFF61] border" />
              <p className="uppercase w-[45%] font-medium text-[10px] text-white">WHAT YOU WILL GET</p>
              <div className="w-[35%] border-[#FFFFFF61] border" />
            </div>
          </Transition>

          <div className="space-y-4">
            {pricingPlan.map((each) => (
              <Transition key={each + 'basic'}>
                <div className="flex items-start space-x-2">
                  <TickIcon className="w-[10%]" />
                  <p className="text-left text-white text-sm w-[90%]">{each}</p>
                </div>
              </Transition>
            ))}
          </div>
          <Transition>
            <div className="mt-24">
              <CustomButton className="text-[#2020A6] bg-white w-full font-medium mt-20">Get Started</CustomButton>
            </div>
          </Transition>
        </div>
      </div>
    </div>
  );
}

export function PricingExtended() {
  const btnClassName =
    'before:ease relative h-[40px] overflow-hidden border border-[#6C7278] px-8 shadow-[inset_0_7.4px_18.5px_0px_rgba(255,255,255,0.11)] border-[#6C7278] bg-primaryColor text-white shadow-2xl transition-all before:absolute before:right-0 before:top-0 before:h-[40px] before:w-6 before:translate-x-12 before:rotate-6 before:bg-white before:opacity-10 before:duration-700 hover:shadow-primaryColor-500 hover:before:-translate-x-40';
  return (
    <div className="border border-white bg-white rounded-xl font-satoshi">
      <div className="grid grid-cols-4 bg-[#3A159F] py-4 px-4 gap-24 rounded-tr-xl rounded-tl-xl">
        <div className="space-y-4 col-span-1">
          <p className="font-bricolage_grotesque text-white text-[20px]">Select type of price</p>
          <SwitchPlan className="mx-0" />
        </div>
        <div className="space-y-6 col-span-1">
          <p className="text-white">Basic Plan</p>
          <div className="flex items-baseline space-x-2">
            <p className="text-[28px] text-white font-medium font-sans">$29</p>
            <p className="text-white/65 text-sm">/month</p>
          </div>
        </div>
        <div className="space-y-6 col-span-1">
          <p className="text-white">Professional Plan</p>
          <div className="flex items-baseline space-x-2">
            <p className="text-[28px] text-white font-medium font-sans">$79</p>
            <p className="text-white/65 text-sm">/month</p>
          </div>
        </div>
        <div className="space-y-6 col-span-1">
          <p className="text-white">Enterprise Plan</p>
          <div className="flex items-baseline space-x-2">
            <p className="text-[28px] text-white font-medium font-sans">$199</p>
            <p className="text-white/65 text-sm">/month</p>
          </div>
        </div>
      </div>

      <div className="bg-white">
        {pricingLists.map((list, index) => (
          <Transition>
            <div className="grid grid-cols-4 py-10 px-4 gap-24 border-b border-b-[#E5E5E5]" key={list.type + index}>
              <p className="text-sm">{list.type}</p>
              <div>{list.basic ? <RoundedCheckIcon className="shadow-custom_shadow_3" /> : <div className="border w-4 border-[#CDD0D5]" />}</div>
              <div>{list.professional ? <RoundedCheckIcon className="shadow-custom_shadow_3" /> : <div className="border w-4 border-[#CDD0D5]" />}</div>
              <div>{list.enterprise ? <RoundedCheckIcon className="shadow-custom_shadow_3" /> : <div className="border w-4 border-[#CDD0D5]" />}</div>
            </div>
          </Transition>
        ))}
      </div>

      <div className="grid grid-cols-4 bg-[#3A159F] py-10 px-4 gap-24 rounded-br-xl rounded-bl-xl">
        <Transition>
          <p className="font-bricolage_grotesque text-white text-[20px]">Get Started now</p>
        </Transition>
        <Transition>
          <CustomButton className={btnClassName}>Get Started</CustomButton>
        </Transition>
        <Transition>
          <CustomButton className={btnClassName}>Get Started</CustomButton>
        </Transition>
        <Transition>
          <CustomButton className={btnClassName}>Get Started</CustomButton>
        </Transition>
      </div>
    </div>
  );
}

const pricingLists: { type: string; basic: boolean; professional: boolean | string; enterprise: boolean }[] = [
  {
    type: 'Lorem ipsum dolor sit',
    basic: true,
    professional: true,
    enterprise: true,
  },
  {
    type: 'Lorem ipsum dolor sit amet consectetur.',
    basic: true,
    professional: true,
    enterprise: true,
  },
  {
    type: 'Lorem ipsum dolor sit amet consectetur.',
    basic: false,
    professional: true,
    enterprise: true,
  },
  {
    type: 'Lorem ipsum dolor sit amet consectetur.',
    basic: false,
    professional: true,
    enterprise: true,
  },
];
