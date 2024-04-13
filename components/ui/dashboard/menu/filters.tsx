'use client';
import { CustomButton } from '@/components/customButton';
import { Chip, Spacer, Tab, Tabs } from '@nextui-org/react';
import React, { useState } from 'react';
import { IoAddCircleOutline } from 'react-icons/io5';
import { MdOutlineFileDownload } from 'react-icons/md';
import { GoPlus } from 'react-icons/go';

const Filters = ({
  onOpen,
  menus,
  handleTabChange,
  value,
  handleTabClick,
}: any) => {
  return (
    <>
      <div className='flex absolute w-full justify-between top-0'>
        <Tabs
          classNames={{
            tabList:
              'gap-6 w-full relative rounded-none p-0 border-b border-divider',
            cursor: 'w-full bg-primaryColor',
            tab: 'max-w-fit px-0 h-10',
            tabContent: 'group-data-[selected=true]:text-primaryColor',
          }}
          variant={'underlined'}
          aria-label='menu filter'
          onChange={handleTabChange}
        >
          {menus.map((menu) => {
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

          {/* <Tab
            key='drinks'
            title={
              <div className='flex items-center space-x-2'>
                <span>Drinks</span>
                <Chip
                  classNames={{
                    base: ` text-xs h-5 w-3 text-white group-data-[selected=true]:bg-primaryColor`,
                  }}
                >
                  2
                </Chip>
              </div>
            }
          /> */}
        </Tabs>
        <CustomButton
          onClick={onOpen}
          className='bg-white text-primaryColor flex gap-1'
        >
          <GoPlus className='text-[20px]' />
          <span>Create new menu</span>
        </CustomButton>
      </div>
    </>
  );
};

export default Filters;
