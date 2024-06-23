'use client';
import { Chip, Tab, Tabs } from '@nextui-org/react';

const Filters = ({ menus, handleTabChange, handleTabClick }: any) => {
  return (
    <>
      {/* <ScrollShadow className='w-[300px]'> */}
      <div className='flex  relative top-3  border-b border-divider justify-between '>
        <Tabs
          classNames={{
            tabList: 'gap-6  relative rounded-none p-0  overflow-scroll',
            cursor: 'w-full bg-primaryColor',
            tab: 'max-w-fit px-0 h-10',
            tabContent: 'group-data-[selected=true]:text-primaryColor',
          }}
          variant={'underlined'}
          aria-label='menu filter'
          onChange={handleTabChange}
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
                        base: `text-xs h-5 w-3 text-white group-data-[selected=true]:bg-primaryColor`,
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
      </div>
      {/* </ScrollShadow> */}
    </>
  );
};

export default Filters;
