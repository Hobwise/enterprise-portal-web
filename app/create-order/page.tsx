'use client';
import { Chip, Divider, Tab, Tabs } from '@nextui-org/react';
import Image from 'next/image';

import { CustomButton } from '@/components/customButton';
import {
  menus,
  togglePreview,
} from '@/components/ui/dashboard/menu/preview-menu/data';
import { useGlobalContext } from '@/hooks/globalProvider';
import Champagne from '../../public/assets/images/champage.webp';

const CreateOrder = () => {
  const {
    activeTile,
    isSelectedPreview,
    selectedImage,
    backgroundColor,
    imageReference,
    selectedTextColor,
  } = useGlobalContext();

  const baseString = 'data:image/jpeg;base64,';
  return (
    <main className='grid place-content-center h-screen'>
      <article className='xl:block relative bg-white   overflow-scroll  w-[320px] border-[8px]  border-black rounded-[40px]  shadow-lg'>
        {backgroundColor && (
          <div
            style={{ backgroundColor: backgroundColor }}
            className={`absolute h-full w-full`}
          />
        )}
        {selectedImage.length > baseString.length && (
          <Image
            fill
            className='absolute backdrop-brightness-125 bg-cover opacity-25'
            src={selectedImage}
            alt='background'
          />
        )}

        <h1 className='text-[28px] font-[700] text-black relative p-4 pt-6'>
          Menu
        </h1>
        <div className='overflow-scroll w-full px-4'>
          <Tabs
            classNames={{
              tabList:
                'gap-3 w-full relative rounded-none p-0 border-b border-divider',
              cursor: 'w-full bg-primaryColor',
              tab: 'max-w-fit px-0 h-10',
              tabContent: 'group-data-[selected=true]:text-primaryColor',
            }}
            variant={'underlined'}
            aria-label='menu filter'
          >
            {menus.map((menu) => {
              return (
                <Tab
                  key={menu.name}
                  title={
                    <div className='flex items-center space-x-2'>
                      <span>{menu.name}</span>

                      <Chip
                        classNames={{
                          base: `text-xs h-5 w-3 text-white group-data-[selected=true]:bg-primaryColor`,
                        }}
                      >
                        {menu.chip}
                      </Chip>
                    </div>
                  }
                />
              );
            })}
          </Tabs>
        </div>
        <div className={`${togglePreview(activeTile)?.main} relative  px-4`}>
          {[1, 2, 3, 4].map((item) => {
            return (
              <>
                <div
                  className={`${togglePreview(activeTile)?.container} ${
                    activeTile === 'List Right' &&
                    isSelectedPreview &&
                    'flex-row-reverse'
                  } flex  my-4`}
                >
                  {isSelectedPreview && (
                    <div className={togglePreview(activeTile)?.imageContainer}>
                      {/* {backgroundColor ? (
                      <div
                        style={{
                          backgroundColor: backgroundColor,
                        }}
                        className={`${
                          togglePreview(activeTile)?.imageClass
                        } rounded-lg`}
                      />
                    ) : (
                      <Image
                        className={`bg-cover rounded-lg ${
                          togglePreview(activeTile)?.imageClass
                        }`}
                        width={60}
                        height={60}
                        src={selectedImage || noImage}
                        alt='menu'
                      />
                    )} */}
                      <Image
                        className={`bg-cover rounded-lg ${
                          togglePreview(activeTile)?.imageClass
                        }`}
                        width={60}
                        height={60}
                        src={Champagne}
                        alt='menu'
                      />
                    </div>
                  )}
                  <div
                    style={{
                      color: selectedTextColor,
                    }}
                    className={`text-[14px]  ${
                      togglePreview(activeTile)?.textContainer
                    } flex flex-col justify-center`}
                  >
                    <p className='font-[700]'>Moet & Chandon</p>
                    <p className='text-[13px]'>₦2,500,000</p>
                    <p className='text-[13px]'>
                      {togglePreview(activeTile)?.text3}
                    </p>
                  </div>
                </div>
                {togglePreview(activeTile)?.divider && (
                  <Divider className='text-[#E4E7EC] h-[1px]' />
                )}
              </>
            );
          })}
        </div>
        <div className='flex mt-6 gap-3 px-4'>
          <CustomButton className='flex-grow w-full bg-white border border-[#E4E7EC] rounded-lg'>
            Previous
          </CustomButton>
          <CustomButton className='flex-grow w-full bg-white border border-[#E4E7EC] rounded-lg'>
            Next
          </CustomButton>
        </div>
      </article>
    </main>
  );
};

export default CreateOrder;
