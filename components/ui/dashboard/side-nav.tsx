'use client';

import React, { useState } from 'react';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { SideNavItem } from './types';
import { SIDENAV_ITEMS } from './constants';
import HobinkLogo from '@/components/logo';
import Image from 'next/image';
import { Avatar, Divider } from '@nextui-org/react';
import { FiLogOut } from 'react-icons/fi';
import {
  clearItemLocalStorage,
  getJsonItemFromLocalStorage,
  removeCookie,
} from '@/lib/utils';

const SideNav = () => {
  const router = useRouter();
  const userInformation = getJsonItemFromLocalStorage('userInformation');
  const { firstName, lastName, email } = userInformation;
  return (
    <div className='md:w-[272px] bg-black h-screen flex-1 fixed z-30 hidden md:flex'>
      <div className='flex flex-col  w-full'>
        <div className='h-[83%] scrollbarstyles overflow-y-scroll'>
          <Link
            href='/dashboard'
            className='flex flex-row  items-center justify-center md:justify-start md:px-8 md:py-10   w-full'
          >
            <HobinkLogo
              textColor='text-white font-lexend text-[28px] font-[600]'
              containerClass='flex gap-2 items-center '
            />
          </Link>

          <div className='flex flex-col space-y-2  md:px-2 '>
            {SIDENAV_ITEMS.map((item, idx) => {
              return <MenuItem key={idx} item={item} />;
            })}
          </div>
        </div>

        <Divider className='bg-[#27272A]  w-[80%] mx-auto h-[1px]' />

        <div className='flex justify-center items-center h-[17%]  gap-4 w-full'>
          <div>
            <Avatar
              isBordered
              showFallback={true}
              name={firstName}
              // src='https://i.pravatar.cc/150?u=a042581f4e29026024d'
            />
          </div>
          <div className='flex flex-col '>
            <span className='text-[14px] font-[600]'>
              {firstName} {lastName}
            </span>
            <span className='text-[12px] font-[400]'>{email}</span>
          </div>
          <div
            onClick={() => {
              clearItemLocalStorage('userInformation');
              removeCookie('token');
              router.push('/auth/login');
            }}
            className='cursor-pointer'
          >
            <FiLogOut className='text-[20px]' />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SideNav;

const MenuItem = ({ item }: { item: SideNavItem }) => {
  const pathname = usePathname();
  const [subMenuOpen, setSubMenuOpen] = useState(false);
  const toggleSubMenu = () => {
    setSubMenuOpen(!subMenuOpen);
  };

  function checkPathname(path = 'order') {
    // Lowercase both pathname and target string for case-insensitive comparison
    const lowerPathname = pathname.toLowerCase();
    const lowerTarget = path.toLowerCase();

    // Check for exact match or presence within the path (considering "dashboard/orders")
    return lowerPathname === lowerTarget || lowerPathname.includes(lowerTarget);
  }
  return (
    <div>
      {item.submenu ? (
        <>
          <button
            onClick={toggleSubMenu}
            className={`flex flex-row items-center p-2 rounded-lg  w-full justify-between  ${
              pathname.includes(item.path) ? 'bg-zinc-100' : ''
            }`}
          >
            <div className='flex flex-row space-x-4 items-center'>
              {item.icon}
              <span className='font-semibold text-xl  flex'>{item.title}</span>
            </div>

            <div className={`${subMenuOpen ? 'rotate-180' : ''} flex`}>
              {/* <Icon icon='lucide:chevron-down' width='24' height='24' /> */}
            </div>
          </button>

          {subMenuOpen && (
            <div className='my-2 ml-12 flex flex-col space-y-4'>
              {item.subMenuItems?.map((subItem, idx) => {
                return (
                  <Link
                    key={idx}
                    href={subItem.path}
                    className={`${
                      subItem.path === pathname ? 'font-bold' : ''
                    }`}
                  >
                    <span>{subItem.title}</span>
                  </Link>
                );
              })}
            </div>
          )}
        </>
      ) : (
        <Link
          href={item.path}
          className={`flex flex-row space-x-4 items-center py-[13px] px-6 rounded-[4px] transition hover:bg-[#2B3342] ${
            item.path === pathname ? 'bg-[#2B3342]' : ''
          }`}
        >
          <Image src={item.icon} alt={item.title} />

          <span className='font-[400] text-[14px] flex'>{item.title}</span>
        </Link>
      )}
    </div>
  );
};
