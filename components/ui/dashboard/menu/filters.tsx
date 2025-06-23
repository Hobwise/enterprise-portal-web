'use client';
import usePermission from '@/hooks/cachedEndpoints/usePermission';
import { Chip, Tab, Tabs } from '@nextui-org/react';
import { useRouter } from 'next/navigation';

import { GoPlus } from 'react-icons/go';
import { LuEye } from 'react-icons/lu';

const Filters = ({
  onOpen,
  onOpenViewMenu,
  menus,
  handleTabChange,
  handleTabClick,
}: any) => {
  const { userRolePermissions, role } = usePermission();
  const router = useRouter();

  return (
    <>
      <div className='flex xl:flex-row flex-col-reverse relative top-3 flex-wrap  w-full border-b border-divider justify-between'>
        <Tabs
          classNames={{
            base: 'xl:w-[70%] w-full',
            tabList:
              'gap-4  relative rounded-none p-0 w-[100%] text-[#344054] overflow-scroll',
            cursor: 'w-full bg-primaryColor h-[1px]',
            tab: 'max-w-fit px-0 py-0 h-10 px-4',
            tabContent:
              'group-data-[selected=true]:text-primaryColor group-data-[selected=true]:font-semibold',
          }}
          variant={'underlined'}
          aria-label='menu filter'
        >
          {menus?.map((menu: any) => {
            return (
              <Tab
                key={menu.name}
                title={
                  <div
                    onClick={() => handleTabClick(menu.name)}
                    className='flex items-center h-10 space-x-2 capitalize'
                  >
                    <span>{menu.name}</span>

                    <Chip
                      classNames={{
                        base: `text-xs h-5  w-3 text-white group-data-[selected=true]:bg-primaryColor`,
                      }}
                    >
                      {menu?.totalCount}
                    </Chip>
                  </div>
                }
              />
            );
          })}
        </Tabs>
        <div className='flex gap-3'>
          <span
            onClick={onOpenViewMenu}
            className='bg-white text-primaryColor font-semibold justify-center items-center text-sm cursor-pointer flex gap-1'
          >
            <LuEye />
            <span>View menus</span>
          </span>
          {(role === 0 || userRolePermissions?.canCreateMenu === true) && (
            <span
             
              onClick={() => router.push("/dashboard/menu/add-menu-item")}
              className='bg-white font-semibold text-primaryColor items-center text-sm cursor-pointer flex gap-1'
            >
              <GoPlus className='text-[20px]' />
              <span>Add menu items</span>
            </span>
          )}
        </div>
      </div>
    </>
  );
};

export default Filters;
