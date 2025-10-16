import Link from 'next/link';

import React from 'react';
import { IoIosArrowRoundBack } from 'react-icons/io';

interface BackButtonProps {
  url: string;
  color?: string;
}

const BackButton: React.FC<BackButtonProps> = ({
  url,
  color = 'text-black',
}) => {
  return (
    <Link
      prefetch={true}
      href={url}
      className={`p-4 cursor-pointer ${color} flex items-center`}
    >
      <IoIosArrowRoundBack className='text-2xl' />
      <span className='md:text-lg text-sm'>Back</span>
    </Link>
  );
};

export default BackButton;
