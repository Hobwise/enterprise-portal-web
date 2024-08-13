'use client';
import usePermission from '@/hooks/cachedEndpoints/usePermission';
import { Chip, Tab, Tabs } from '@nextui-org/react';

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

  return (
    <>
      <div className='flex relative top-3  w-full border-b border-divider justify-between'>
        <Tabs
          classNames={{
            tabList:
              'gap-6  relative rounded-none py-0 w-[100%]  overflow-scroll',
            cursor: 'w-full bg-primaryColor',
            tab: 'max-w-fit px-0 py-0 h-10',
            tabContent: 'group-data-[selected=true]:text-primaryColor m-0',
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
            className='bg-white text-primaryColor justify-center items-center text-sm cursor-pointer flex gap-1'
          >
            <LuEye />
            <span>View menus</span>
          </span>
          {(role === 0 || userRolePermissions?.canCreateMenu === true) && (
            <span
              onClick={onOpen}
              className='bg-white text-primaryColor items-center text-sm cursor-pointer flex gap-1'
            >
              <GoPlus className='text-[20px]' />
              <span>Create new menu</span>
            </span>
          )}
        </div>
      </div>
    </>
  );
};

export default Filters;
