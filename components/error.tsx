import React from 'react';
import { CustomButton } from './customButton';
import { IoReload } from 'react-icons/io5';
import Image from 'next/image';
import noImage from '../../public/assets/images/no-image.png';

const Error = () => {
  return (
    <div className='grid place-content-center'>
      <Image
        src={noImage}
        width={20}
        height={20}
        className='object-cover rounded-lg w-32 h-full'
        aria-label='uploaded image'
        alt='uploaded image(s)'
      />
      <p className='font-[600]'>Oops! Something went wrong</p>
      <CustomButton className='bg-white border border-primaryColor rounded-full text-primaryColor'>
        <div className='flex items-center gap-3'>
          <p>Retry</p>
          <IoReload />
        </div>
      </CustomButton>
    </div>
  );
};

export default Error;
