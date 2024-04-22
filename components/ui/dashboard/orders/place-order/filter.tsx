'use client';
import { CustomButton } from '@/components/customButton';
import { Chip, Tab, Tabs } from '@nextui-org/react';
import React from 'react';

import { GoPlus } from 'react-icons/go';

const Filters = ({ menus, handleTabChange, handleTabClick }: any) => {
  return (
    <>
      <div className='flex relative top-3  w-full border-b border-divider justify-between'>
        <div>
          <Tabs
            classNames={{
              tabList:
                'gap-6 w-full relative rounded-none p-0  overflow-scroll',
              cursor: 'w-full bg-primaryColor',
              tab: 'max-w-fit px-0 h-10',
              tabContent: 'group-data-[selected=true]:text-primaryColor',
            }}
            variant={'underlined'}
            aria-label='menu filter'
            onChange={handleTabChange}
          >
            {menus.map((menu: any) => {
              return (
                <Tab
                  key={menu.name}
                  title={
                    <div
                      onClick={() => handleTabClick(menu.name)}
                      className='flex items-center space-x-2'
                    >
                      <span>{menu.name}</span>

                      <Chip
                        classNames={{
                          base: `text-xs h-5 w-3 text-white group-data-[selected=true]:bg-primaryColor`,
                        }}
                      >
                        {menu?.items?.length}
                      </Chip>
                    </div>
                  }
                />
              );
            })}
          </Tabs>
        </div>
      </div>
    </>
  );
};

export default Filters;
