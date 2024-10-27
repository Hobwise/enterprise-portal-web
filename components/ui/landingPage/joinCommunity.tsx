'use client';
import { CustomButton } from '@/components/customButton';
import { StarIcon } from '@/public/assets/svg';
import Image from 'next/image';
import PricePlan from '@/public/assets/images/price-bg.png';
import ReportsImage from '@/public/assets/images/reports-image.png';
import { cn } from '@/lib/utils';

export default function JoinCommunity({ className }: { className?: string }) {
  return (
    <section className={cn('bg-[#5F35D2] shadow-custom_shadow_2 pt-16 font-satoshi space-y-12 px-12 relative mt-12', className)}>
      <Image src={PricePlan} alt="" className="absolute top-[20%] h-[500px] w-[90%]" priority />
      <div className="flex items-center w-fit space-x-2 text-white bg-[#9F7CFE] border-[#DCE4E8] shadow-custom_shadow_2 border px-4 py-1.5 rounded-full text-xs mx-auto">
        <StarIcon />
        <p className="font-normal">Get Started</p>
      </div>
      <div className="w-[45%] mx-auto">
        <h2 className="text-[40px] leading-[54px] font-bricolage_grotesque text-white">Join Our Community of Hospitality Innovators</h2>
        <p className="text-[#DCE4E8]">
          Come be a part of a warm and supportive network of restaurant, hotel, and bar owners who are simplifying their day-to-day with Hobink. Share your
          experiences, exchange valuable tips, stay in the loop with the latest industry trends, and watch your business flourish.
        </p>
      </div>

      <div>
        <div className="w-[35%] mx-auto flex items-center space-x-4 mb-20">
          <input
            type="email"
            placeholder="Input your email"
            onChange={({ target }) => console.log(target.value)}
            className="border border-white bg-[#FFFFFF1A] py-2 px-4 h-10 w-[100%] rounded-lg placeholder:text-[#DCE4E8] placeholder:text-sm"
            name="email"
            id="email"
          />
          <CustomButton className="bg-white ">Submit</CustomButton>
        </div>
      </div>

      <Image src={ReportsImage} alt="reports" />
    </section>
  );
}
