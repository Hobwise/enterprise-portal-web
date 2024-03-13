import Image from 'next/image';
import React from 'react';
import hobink from '../public/assets/images/hobink.png';
import { lexend } from '@/utilities/ui-config/fonts';

const HobinkLogo = ({
  containerClass = 'flex gap-2 items-center mb-6',
  textColor = 'text-black',
}: any) => {
  return (
    <div className={containerClass}>
      <Image src={hobink} style={{ objectFit: 'cover' }} alt='hobink logo' />
      <h2 className={`text-2xl font-bold ${textColor} ${lexend.className}`}>
        Hobink
      </h2>
    </div>
  );
};

export default HobinkLogo;
