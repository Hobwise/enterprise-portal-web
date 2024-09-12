'use client';

import { useState } from 'react';

import HobinkLogo from '@/components/logo';
import useGetBusiness from '@/hooks/cachedEndpoints/useGetBusiness';
import useGetBusinessByCooperate from '@/hooks/cachedEndpoints/useGetBusinessByCooperate';
import usePermission from '@/hooks/cachedEndpoints/usePermission';
import {
  getJsonItemFromLocalStorage,
  saveJsonItemToLocalStorage,
} from '@/lib/utils';
import {
  Avatar,
  Divider,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Skeleton,
  useDisclosure,
} from '@nextui-org/react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FiLogOut } from 'react-icons/fi';
import { GoPlus } from 'react-icons/go';
import { IoIosArrowDown } from 'react-icons/io';
import LogoutModal from '../logoutModal';
import { SIDENAV_ITEMS } from './constants';
import { SideNavItem } from './types';

const SideNav = () => {
  const { isOpen, onOpenChange } = useDisclosure();

  const { data: businessDetails, isLoading } = useGetBusiness();
  const { data: businessDetailsList } = useGetBusinessByCooperate();

  const { userRolePermissions, role } = usePermission();

  const business = getJsonItemFromLocalStorage('business') || [];
  const userInformation = getJsonItemFromLocalStorage('userInformation');

  const toggleBtwBusiness = (businessInfo: any) => {
    const exists = businessDetailsList?.some(
      (comparisonItem: any) => comparisonItem.id === businessInfo.businessId
    );
    const transformedArray = [businessInfo].map((item) => ({
      businessId: item.id,
      businessAddress: item.address,
      state: item.state,
      city: item.city,
      businessName: item.name,
      primaryColor: item.primaryBrandColour,
      secondaryColor: item.secondaryBrandColour,
      businessContactEmail: item.contactEmailAddress,
      businessContactNumber: item.contactPhoneNumber,
    }));

    if (!exists) {
      saveJsonItemToLocalStorage('business', transformedArray);
      window.location.reload();
    }
  };

  const filteredItems = SIDENAV_ITEMS.filter((item) => {
    if (
      item.title === 'Menu' &&
      role === 1 &&
      userRolePermissions?.canViewMenu === false
    )
      return false;
    if (
      item.title === 'Campaigns' &&
      role === 1 &&
      userRolePermissions?.canViewCampaign === false
    )
      return false;
    if (
      item.title === 'Reservation' &&
      role === 1 &&
      userRolePermissions?.canViewReservation === false
    )
      return false;
    if (
      item.title === 'Payments' &&
      userRolePermissions?.canViewPayment === false &&
      role === 1
    )
      return false;
    return true;
  });

  return (
    <div className='md:w-[272px] bg-black h-screen flex-1 fixed z-30 hidden md:flex'>
      <div className='flex flex-col  w-full'>
        <div className='h-[83%] scrollbarstyles overflow-y-scroll'>
          <Link
            prefetch={true}
            href='/dashboard'
            className='flex flex-row  items-center justify-center md:justify-start md:px-8 md:py-10   w-full'
          >
            <HobinkLogo
              textColor='text-white font-lexend text-[28px] font-[600]'
              containerClass='flex gap-2 items-center '
            />
          </Link>

          <div className='flex flex-col space-y-2  md:px-2 '>
            {filteredItems.map((item, idx) => {
              return <MenuItem key={idx} item={item} />;
            })}
          </div>
        </div>

        <Divider className='bg-[#27272A]  w-[90%] mx-auto h-[1px]' />
        <Dropdown
          style={{
            width: '245px',
          }}
          classNames={{
            content: 'bg-[#2B3342] mb-3',
          }}
        >
          <DropdownTrigger>
            {isLoading ? (
              <div className='w-full flex items-center gap-3  mt-7 px-5'>
                <div>
                  <Skeleton className='animate-pulse flex rounded-full w-12 h-12' />
                </div>
                <div className='w-full flex flex-col gap-2 '>
                  <Skeleton className='animate-pulse h-2 w-3/5 rounded-lg' />
                  <Skeleton className='animate-pulse h-2 w-4/5 rounded-lg' />
                </div>
              </div>
            ) : (
              <div className='flex cursor-pointer justify-center items-center mt-7 gap-4 w-full '>
                <div>
                  <Avatar
                    isBordered
                    src={`data:image/jpeg;base64,${businessDetails?.logoImage}`}
                    showFallback={true}
                    name={business[0]?.businessName}
                  />
                </div>
                <div className='flex flex-col w-[45%]'>
                  <span className='text-[14px] font-[600]'>
                    {business[0]?.businessName}
                  </span>
                  <div className='text-[12px]  font-[400] pr-5'>
                    {business[0]?.city}
                    {business[0]?.city && ','} {business[0]?.state}
                  </div>
                </div>
                <div className='cursor-pointer'>
                  <IoIosArrowDown className='text-[20px]' />
                </div>
              </div>
            )}
          </DropdownTrigger>
          <DropdownMenu
            variant='light'
            aria-label='Dropdown menu to switch businesses'
          >
            {userInformation?.isOwner && (
              <>
                {businessDetailsList?.map((item: any) => {
                  return (
                    <DropdownItem
                      classNames={{
                        base: 'hover:bg-none max-h-[100px] overflow-scroll',
                      }}
                      key={item.businessId}
                      onClick={() => toggleBtwBusiness(item)}
                    >
                      <div className='flex items-center gap-3'>
                        <Avatar
                          showFallback={true}
                          src={`data:image/jpeg;base64,${item?.logoImage}`}
                          name={item?.name}
                        />
                        <div className='flex flex-col'>
                          <span className='font-[500] text-[14px]'>
                            {item?.name}
                          </span>

                          <span className=''>{item?.city}</span>
                        </div>
                      </div>
                    </DropdownItem>
                  );
                })}
              </>
            )}
            {userInformation?.isOwner && (
              <DropdownItem
                key='add another business'

                // onClick={onOpenChange}
              >
                <div className='flex items-center gap-3 '>
                  <div className='p-2 rounded-md bg-[#7182A3]'>
                    <GoPlus className='text-[20px] font-[700]' />
                  </div>
                  <span className='font-[500] text-[14px]'>
                    Add another business
                  </span>
                </div>
              </DropdownItem>
            )}
            <DropdownItem
              key='logout'
              className='text-danger'
              color='danger'
              onClick={onOpenChange}
            >
              <div className='flex items-center gap-3 '>
                <div className='p-2 rounded-md'>
                  <FiLogOut className='text-[20px]' />
                </div>
                <span className='font-[500] text-[14px]'>Logout</span>
              </div>
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </div>
      <LogoutModal onOpenChange={onOpenChange} isOpen={isOpen} />
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
                    prefetch={true}
                    key={idx}
                    href={subItem.path}
                    className={`text-white ${
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
          prefetch={true}
          href={item.path}
          className={`text-white flex flex-row space-x-4 items-center py-[13px] px-6 rounded-[4px] transition hover:bg-[#2B3342] ${
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
