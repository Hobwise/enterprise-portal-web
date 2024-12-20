'use client';

import useNotificationCount from '@/hooks/cachedEndpoints/useNotificationCount';
import useNotification from '@/hooks/cachedEndpoints/useNotifications';
import useUser from '@/hooks/cachedEndpoints/useUser';
import useScroll from '@/hooks/use-scroll';
import { cn } from '@/lib/utils';
import {
  Avatar,
  Badge,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Popover,
  PopoverContent,
  PopoverTrigger,
  useDisclosure,
} from '@nextui-org/react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useSelectedLayoutSegment } from 'next/navigation';
import { useState } from 'react';
import { FiLogOut } from 'react-icons/fi';
import { IoIosArrowDown, IoIosSettings } from 'react-icons/io';
import { IoChatbubblesOutline } from 'react-icons/io5';
import { PiBookOpenTextLight } from 'react-icons/pi';
import { SlBell } from 'react-icons/sl';
import LogoutModal from '../logoutModal';
import { SIDENAV_ITEMS, headerRouteMapping } from './constants';
import Notifications from './notifications/notifications';

const Header = () => {
  const page = 1;

  const [pageSize, setPageSize] = useState(10);

  const { isOpen, onOpenChange } = useDisclosure();
  const { data: notificationCount, refetch: refetchCount } =
    useNotificationCount();
  const {
    data: notifData,
    isLoading,
    isError,
    refetch,
  } = useNotification(page, pageSize);

  const { data } = useUser();
  const pathname = usePathname();
  const scrolled = useScroll(5);
  const selectedLayout = useSelectedLayoutSegment();
  const navItem = SIDENAV_ITEMS.filter((item) => item.path === pathname)[0];

  const routeOutsideSidebar = () => {
    for (const [key, value] of Object.entries(headerRouteMapping)) {
      if (pathname.includes(key)) {
        return value;
      }
    }
  };

  const loadMore = () => {
    if (notifData?.hasNext) {
      setPageSize((prevSize) => prevSize + 10);
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
                {navItem?.title === 'Menu' ? (
                  <PiBookOpenTextLight className='font-bold text-grey500 text-xl' />
                ) : (
                  <Image
                    className={'dashboardLogo'}
                    src={navItem?.icon}
                    alt={navItem?.title}
                  />
                )}
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
            <Popover placement='bottom'>
              <PopoverTrigger>
                <Badge
                  className='cursor-pointer'
                  content={notificationCount === 0 ? '' : notificationCount}
                  size='sm'
                  color='danger'
                >
                  <PopoverTrigger>
                    <SlBell className='text-[#494E58] h-5 w-5 cursor-pointer' />
                  </PopoverTrigger>
                </Badge>
              </PopoverTrigger>
              {notifData?.notifications?.length > 0 && (
                <PopoverContent className=''>
                  <Notifications
                    notifData={notifData}
                    refetch={refetch}
                    loadMore={loadMore}
                    isLoading={isLoading}
                    isError={isError}
                    refetchCount={refetchCount}
                  />
                </PopoverContent>
              )}
            </Popover>

            <span>
              <IoChatbubblesOutline className='text-[#494E58]  h-5 w-5 cursor-pointer' />
            </span>

            <Dropdown placement='bottom-end'>
              <DropdownTrigger>
                <div className='flex items-center gap-1 cursor-pointer'>
                  <Avatar
                    size='sm'
                    src={data?.image && `data:image/jpeg;base64,${data?.image}`}
                  />
                  <IoIosArrowDown />
                </div>
              </DropdownTrigger>
              <DropdownMenu aria-label='settings Actions' variant='flat'>
                <DropdownItem key=' Account settings'>
                  <Link
                    prefetch={true}
                    href={'/dashboard/settings/personal-information'}
                    className='flex cursor-pointer text-[#475367] transition-all hover:rounded-md px-2 py-2 items-center gap-2'
                  >
                    <IoIosSettings className='text-[20px]' />
                    <span className='  text-sm font-md'>Account settings</span>
                  </Link>
                </DropdownItem>
                <DropdownItem key='logout'>
                  <div
                    onClick={onOpenChange}
                    className='flex cursor-pointer text-danger-500 transition-all hover:rounded-md px-2 py-2 items-center gap-2'
                  >
                    <FiLogOut className='text-[20px]' />
                    <span className='  text-sm font-md'> Log out</span>
                  </div>
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </div>
        </div>
      </div>
      <LogoutModal onOpenChange={onOpenChange} isOpen={isOpen} />
    </div>
  );
};

export default Header;
