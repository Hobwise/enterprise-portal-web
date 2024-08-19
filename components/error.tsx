import { Spacer } from '@nextui-org/react';
import Image from 'next/image';
import { IoReload } from 'react-icons/io5';
import noImage from '../public/assets/images/no-image.svg';
import { CustomButton } from './customButton';

const Error = ({
  onClick,
  imageWidth = 'w-32',
  imageHeight = 'h-full',
}: any) => {
  return (
    <div className='flex flex-col justify-center items-center text-black flex-grow'>
      <Image
        src={noImage}
        width={20}
        height={20}
        className={`object-cover rounded-lg ${imageHeight}  ${imageWidth}`}
        aria-label='uploaded image'
        alt='uploaded image(s)'
      />
      <Spacer y={4} />
      <p className='font-[600]'>Oops! Something went wrong</p>
      <Spacer y={4} />
      <CustomButton
        onClick={onClick}
        className='bg-white border px-10 py-4 border-primaryColor rounded-full text-primaryColor'
      >
        <div className='flex items-center gap-2'>
          <p>Retry</p>
          <IoReload />
        </div>
      </CustomButton>
    </div>
  );
};

export default Error;
