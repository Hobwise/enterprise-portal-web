'use client';
import { Chip, Tab, Tabs } from '@nextui-org/react';

const Filters = ({ bookings, handleTabChange, handleTabClick }: any) => {

  console.log(bookings);
  
  return (
    <>
      {/* <div className='flex relative w-full top-4 px-3  border-b border-primaryGrey justify-between'> */}
      <Tabs
        classNames={{
          base: 'flex relative overflow-x-auto top-4 px-3  w-full  border-b border-primaryGrey justify-between',
          tabList:
            'gap-4  relative rounded-none p-0 w-[100%] text-[#344054] overflow-scroll',
          cursor: 'w-full bg-primaryColor h-[1px]',
          tab: 'max-w-fit px-0 py-0 h-10 px-4 ',
          tabContent:
            'group-data-[selected=true]:text-primaryColor group-data-[selected=true]:font-semibold',
        }}
        variant={'underlined'}
        aria-label='booking filter'
        onChange={handleTabChange}
      >
        {bookings?.map((booking: any, index: number) => {
          return (
            <Tab
              key={booking.id || booking.name || `booking-filter-${index}`}
              title={
                <div
                  onClick={() => handleTabClick(booking.name)}
                  className='flex items-center h-10 space-x-2 capitalize'
                >
                  <span>{booking.name}</span>

                  <Chip
                    classNames={{
                      base: `text-xs h-5 w-3 text-white group-data-[selected=true]:bg-primaryColor`,
                    }}
                  >
                    {booking?.totalCount}
                  </Chip>
                </div>
              }
            />
          );
        })}
      </Tabs>
      {/* </div> */}
    </>
  );
};

export default Filters;
