'use client';

import React from 'react';

import { SlBell } from 'react-icons/sl';
import {
  usePathname,
  useRouter,
  useSelectedLayoutSegment,
} from 'next/navigation';
import { IoChatbubblesOutline } from 'react-icons/io5';
import useScroll from '@/hooks/use-scroll';
import { clearItemLocalStorage, cn, removeCookie } from '@/lib/utils';
import { IoSearchOutline } from 'react-icons/io5';
import Image from 'next/image';
import { SIDENAV_ITEMS } from './constants';
import { CustomInput } from '@/components/CustomInput';
import { IoIosArrowDown } from 'react-icons/io';
import { FiLogOut } from 'react-icons/fi';
import { IoIosSettings } from 'react-icons/io';
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  Avatar,
  Tooltip,
} from '@nextui-org/react';
import { MdPerson } from 'react-icons/md';
import Link from 'next/link';
import Menu from '../../../public/assets/icons/menu.png';

const Header = () => {
  const pathname = usePathname();
  const scrolled = useScroll(5);
  const selectedLayout = useSelectedLayoutSegment();
  const navItem = SIDENAV_ITEMS.filter((item) => item.path === pathname)[0];
  const router = useRouter();

  const routeOutsideSidebar = () => {
    if (pathname.includes('settings')) {
      return {
        title: 'Settings',
        icon: <IoIosSettings className='text-[20px] dashboardLogo' />,
      };
    } else if (
      pathname.includes('add-menu-item') ||
      pathname.includes('menu/')
    ) {
      return {
        title: 'Menu',
        icon: (
          <Image
            src={Menu}
            className={'dashboardLogo'}
            alt='add item to menu'
          />
        ),
      };
    }
  };

  return (
    <div
      className={cn(
        `sticky inset-x-0 top-0 z-20 w-full transition-all border-b  border-primaryGrey`,
        {
          'border-b  border-primaryGrey bg-white/75 backdrop-blur-lg': scrolled,
          'border-b  border-primaryGrey bg-white': selectedLayout,
        }
      )}
    >
      <div className='flex h-[64px] bg-white text-black border-b border-primaryGrey items-center justify-between px-6'>
        <div className='flex items-center space-x-4'>
          <div className='flex items-center gap-2'>
            {navItem ? (
              <>
                <Image
                  className={'dashboardLogo'}
                  src={navItem?.icon}
                  alt={navItem?.title}
                />
                <span className='text-[#494E58] font-[600]'>
                  {navItem?.title}
                </span>
              </>
            ) : (
              <>
                {routeOutsideSidebar()?.icon}
                <span className='text-[#494E58] font-[600]'>
                  {routeOutsideSidebar()?.title}
                </span>
              </>
            )}
          </div>
        </div>

        <div className='hidden md:flex items-center space-x-8'>
          {/* <CustomInput
            classnames={'w-[450px]'}
            label=''
            size='md'
            isRequired={false}
            startContent={<IoSearchOutline />}
            type='text'
            placeholder='Search here...'
          /> */}
          <div className='flex items-center space-x-4'>
            <Tooltip
              placement='bottom'
              color='foreground'
              showArrow={true}
              content='Notification'
            >
              <span>
                <SlBell className='text-[#494E58] h-5 w-5 cursor-pointer' />
              </span>
            </Tooltip>
            <Tooltip
              color='foreground'
              placement='bottom'
              showArrow={true}
              content='Messages'
            >
              <span>
                <IoChatbubblesOutline className='text-[#494E58]  h-5 w-5 cursor-pointer' />
              </span>
            </Tooltip>
            <Popover placement='bottom'>
              <PopoverTrigger>
                <div className='flex items-center gap-1 cursor-pointer'>
                  <Avatar
                    size='sm'
                    // src='https://i.pravatar.cc/150?u=a042581f4e29026024d'
                  />
                  <IoIosArrowDown />
                </div>
              </PopoverTrigger>
              <PopoverContent>
                <div className='flex items-center w-[218px] p-1 gap-2'>
                  <div className='flex flex-col   w-full'>
                    <div className='flex cursor-pointer text-[#475367] transition-all hover:rounded-md  hover:bg-[#F9FAFB] px-2 py-3 items-center gap-2'>
                      <MdPerson className='text-[20px]' />
                      <span className='  text-sm font-md'>Profile</span>
                    </div>
                    <Link
                      href={'/dashboard/settings'}
                      className='flex cursor-pointer text-[#475367] transition-all hover:rounded-md  hover:bg-[#F9FAFB] px-2 py-3 items-center gap-2'
                    >
                      <IoIosSettings className='text-[20px]' />
                      <span className='  text-sm font-md'>
                        Account Settings
                      </span>
                    </Link>
                    <div
                      onClick={() => {
                        clearItemLocalStorage('userInformation');
                        removeCookie('token');
                        router.push('/auth/login');
                      }}
                      className='flex cursor-pointer text-[#475367] transition-all hover:rounded-md  hover:bg-[#F9FAFB] px-2 py-3 items-center gap-2'
                    >
                      <FiLogOut className='text-[20px]' />
                      <span className='  text-sm font-md'> Log out</span>
                    </div>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;
