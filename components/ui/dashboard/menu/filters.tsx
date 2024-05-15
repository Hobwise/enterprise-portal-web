'use client';
import { CustomButton } from '@/components/customButton';
import { Chip, Tab, Tabs } from '@nextui-org/react';

import { GoPlus } from 'react-icons/go';

const Filters = ({ onOpen, menus, handleTabChange, handleTabClick }: any) => {
  return (
    <>
      <div className='flex relative top-3  w-full border-b border-divider justify-between'>
        <div>
          <Tabs
            classNames={{
              tabList:
                'gap-6  relative rounded-none py-0 w-[70%] xl:w-[100%]  overflow-scroll',
              cursor: 'w-full bg-primaryColor',
              tab: 'max-w-fit px-0 py-0 h-10',
              tabContent: 'group-data-[selected=true]:text-primaryColor m-0',
            }}
            variant={'underlined'}
            aria-label='menu filter'
            // onChange={handleTabChange}
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
                        {menu?.items?.length}
                      </Chip>
                    </div>
                  }
                />
              );
            })}
          </Tabs>
        </div>
        <CustomButton
          onClick={onOpen}
          className='bg-white text-primaryColor  flex gap-1'
        >
          <GoPlus className='text-[20px]' />
          <span>Create new menu</span>
        </CustomButton>
      </div>
    </>
  );
};

export default Filters;
