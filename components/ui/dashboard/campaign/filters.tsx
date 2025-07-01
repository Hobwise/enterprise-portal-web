'use client';
import { Chip, Tab, Tabs } from '@nextui-org/react';

const Filters = ({ campaigns, handleTabChange, handleTabClick }: any) => {


  
  return (
    <>
      <div className='flex  relative w-full top-4 px-3  border-b border-primaryGrey justify-between'>
        <Tabs
          classNames={{
            tabList:
              'gap-4  relative rounded-none p-0 w-[100%] text-[#344054] overflow-scroll',
            cursor: 'w-full bg-primaryColor h-[1px]',
            tab: 'max-w-fit px-0 py-0 h-10 px-4',
            tabContent:
              'group-data-[selected=true]:text-primaryColor group-data-[selected=true]:font-semibold',
          }}
          variant={'underlined'}
          aria-label='payment filter'
          onChange={handleTabChange}
        >
          {campaigns?.campaignCategories?.map((campaign: any) => {
            return (
              <Tab
                key={campaign.name}
                title={
                  <div
                    onClick={() => handleTabClick(campaign.name)}
                    className='flex items-center h-10 space-x-2 capitalize'
                  >
                    <span>{campaign.name}</span>

                    <Chip
                      classNames={{
                        base: `text-xs h-5 w-3 text-white group-data-[selected=true]:bg-primaryColor`,
                      }}
                    >
                      {campaign?.totalCount}
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