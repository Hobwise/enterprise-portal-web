'use client';
import { ArrowRight } from '@/public/assets/svg';
import { CustomButton } from '@/components/customButton';
import { CustomInput } from '@/components/CustomInput';
import { IoSearchOutline } from 'react-icons/io5';
import BusinessCard from '@/components/ui/landingPage/businessCard';
import { companies } from './data';
import JoinCommunity from '@/components/ui/landingPage/joinCommunity';
import Footer from '@/components/ui/landingPage/footer';

export default function Businesses() {
  const sectionHeaderClass: string =
    'flex items-center w-fit space-x-2 text-primaryColor bg-[#6840D50D] border-[#5F35D24D] border px-4 py-1.5 rounded-full text-xs mx-auto shadow_custom-inset';
  return (
    <div className="w-full bg-white h-full">
      <main className="gap-3 relative text-center bg-white overflow-x-hidden main-section">
        <section className="w-[50%] mx-auto space-y-6 font-satoshi pt-32">
          <div className={sectionHeaderClass}>
            <p className="font-normal">Businesses Trust Us</p>
            <ArrowRight />
          </div>
          <h1 className="text-[50px] leading-[64px] text-[#161618] font-bricolage_grotesque">Meet some of the Businesses That Trust Us</h1>
          <p className="font-normal text-dark">
            Explore the restaurants, bars, and lounges elevating their operations with our platform. Enhance guest experiences, and drive growth all in one
            place.
          </p>

          <div className="flex space-x-4 justify-center mx-36">
            <CustomInput
              classnames={'w-full'}
              label=""
              size="md"
              isRequired={false}
              startContent={<IoSearchOutline />}
              type="text"
              placeholder="Search here..."
            />
            <CustomButton className="before:ease relative h-[40px] overflow-hidden border border-[#FFFFFF26] px-8 border-white bg-primaryColor text-white shadow-2xl transition-all before:absolute before:right-0 before:top-0 before:h-[40px] before:w-6 before:translate-x-12 before:rotate-6 before:bg-white before:opacity-10 before:duration-700 hover:shadow-primaryColor-500 hover:before:-translate-x-40">
              Search
            </CustomButton>
          </div>
        </section>
      </main>
      <section className="grid grid-cols-3 gap-6 px-36 py-20">
        {companies.map((each, index) => (
          <BusinessCard key={each.name + index} {...each} />
        ))}
      </section>
      <JoinCommunity className="text-center" />
      <Footer />
    </div>
  );
}
