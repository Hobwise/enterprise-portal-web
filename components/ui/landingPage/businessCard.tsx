import { CustomButton } from '@/components/customButton';
import { LocationIcon, StarIcon2 } from '@/public/assets/svg';
import { RESERVATIONS_URL } from '@/utilities/routes';
import Link from 'next/link';
import { ReactNode } from 'react';
import { Transition } from './transition';

interface IBusinessCard {
  logo: ReactNode;
  rating: string;
  name: string;
  type: string;
  address: string;
}

export default function BusinessCard({ logo, rating, name, type, address }: IBusinessCard) {
  return (
    <Transition>
      <div role="contentinfo" className="bg-white rounded-xl p-6 border border-[#5F35D24D] font-satoshi space-y-4">
        <div className="flex justify-between items-center">
          {logo}
          <div className="flex items-center space-x-1">
            <StarIcon2 />
            <p className="text-[#000]">{rating}</p>
          </div>
        </div>
        <div className="">
          <p className="font-bold text-[24px] text-[#0A0A0A]">{name}</p>
          <p className="text-[#737373]">{type}</p>
        </div>

        <div className="flex items-start space-x-1">
          <LocationIcon />
          <p className="text-primaryColor underline multiline-truncate">{address}</p>
        </div>
        <div>
          <Link href={`${RESERVATIONS_URL}/${name}`}>
            <CustomButton className="bg-[#DDDCFE] border border-[#5F35D2] h-10 shadow-custom_double text-[#5F35D2] w-full">View Business</CustomButton>
          </Link>
        </div>
      </div>
    </Transition>
  );
}
