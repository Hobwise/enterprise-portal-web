'use client';
import { Chip, Tab, Tabs } from '@nextui-org/react';

const Filters = ({
  menus,

  handleTabClick,
}: any) => {
  return (
    <>
      <div className='flex   w-full  px-3 justify-between'>
        <Tabs
          classNames={{
            tabList:
              'gap-4  relative rounded-none p-0 w-[100%] text-[#344054] overflow-scroll',
            cursor: 'w-full bg-primaryColor h-[1px]',
            tab: 'max-w-fit px-0 py-0 h-10 px-4',
            tabContent:
              'group-data-[selected=true]:text-primaryColor group-data-[selected=true]:font-semibold',
          }}
          fullWidth={true}
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
      </div>
    </>
  );
};

export default Filters;
