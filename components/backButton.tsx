"use client";
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React from 'react';
import { IoIosArrowRoundBack } from 'react-icons/io';

interface BackButtonProps {
  url?: string;
  color?: string;
  useHistory?: boolean;
}

const BackButton: React.FC<BackButtonProps> = ({
  url,
  color = 'text-black',
  useHistory = false,
}) => {
  const router = useRouter();

  const handleClick = (e: React.MouseEvent) => {
    if (useHistory) {
      e.preventDefault();
      router.back();
    }
  };

  // If using history navigation, render a button-styled div
  if (useHistory) {
    return (
      <div
        onClick={handleClick}
        className={`p-4 cursor-pointer ${color} flex items-center`}
      >
        <IoIosArrowRoundBack className='text-2xl' />
        <span className='md:text-lg text-sm'>Back</span>
      </div>
    );
  }

  // Otherwise, render the traditional Link component
  return (
    <Link
      prefetch={true}
      href={url || '/dashboard'}
      className={`p-4 cursor-pointer ${color} flex items-center`}
    >
      <IoIosArrowRoundBack className='text-2xl' />
      <span className='md:text-lg text-sm'>Back</span>
    </Link>
  );
};

export default BackButton;
