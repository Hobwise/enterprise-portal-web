'use client';

import React from 'react';

import { SlBell } from 'react-icons/sl';
import { usePathname, useSelectedLayoutSegment } from 'next/navigation';
import { IoChatbubblesOutline } from 'react-icons/io5';
import useScroll from '@/hooks/use-scroll';
import { cn } from '@/lib/utils';
import { IoSearchOutline } from 'react-icons/io5';
import Image from 'next/image';
import { SIDENAV_ITEMS } from './constants';
import { CustomInput } from '@/components/CustomInput';
import { Avatar } from '@nextui-org/react';

const Header = () => {
  const pathname = usePathname();
  const scrolled = useScroll(5);
  const selectedLayout = useSelectedLayoutSegment();
  const navItem = SIDENAV_ITEMS.filter((item) => item.path === pathname)[0];

  return (
    <div
      className={cn(
        `sticky inset-x-0 top-0 z-30 w-full transition-all border-b  border-primaryGrey`,
        {
          'border-b  border-primaryGrey bg-white/75 backdrop-blur-lg': scrolled,
          'border-b  border-primaryGrey bg-white': selectedLayout,
        }
      )}
    >
      <div className='flex h-[64px] bg-white text-black border-b border-primaryGrey items-center justify-between px-6'>
        <div className='flex items-center space-x-4'>
          <div className='flex items-center gap-2'>
            <Image
              className={'dashboardLogo'}
              src={navItem.icon}
              alt={navItem.title}
            />
            <span className='text-[#494E58] font-[600]'>{navItem.title}</span>
          </div>
        </div>

        <div className='hidden md:flex items-center space-x-8'>
          <CustomInput
            classnames={'w-[450px]'}
            label=''
            size='md'
            isRequired={false}
            startContent={<IoSearchOutline />}
            type='text'
            placeholder='Search here...'
          />
          <div className='flex items-center space-x-4'>
            <SlBell className='text-[#494E58] h-5 w-5 cursor-pointer' />
            <IoChatbubblesOutline className='text-[#494E58]  h-5 w-5 cursor-pointer' />
            <Avatar
              size='sm'
              src='https://i.pravatar.cc/150?u=a042581f4e29026024d'
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;
