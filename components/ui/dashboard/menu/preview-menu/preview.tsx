'use client';
import * as React from 'react';
import { Chip, Divider, Tab, Tabs } from '@nextui-org/react';
import Image from 'next/image';

import { useGlobalContext } from '@/hooks/globalProvider';
import Champagne from '../../../../../public/assets/images/champage.webp';
import { menus, togglePreview } from './data';
import useAllMenus from '@/hooks/cachedEndpoints/useAllMenus';
import useMenu from '@/hooks/cachedEndpoints/useMenu';
import { formatPrice } from '@/lib/utils';

const Preview = () => {
  const {
    activeTile,
    isSelectedPreview,
    selectedImage,
    backgroundColor,
    imageReference,
    selectedTextColor,
  } = useGlobalContext();

  const { data } = useMenu();

  const baseString = 'data:image/jpeg;base64,';

  const items = data?.flatMap((obj) => obj.items);

  return (
    <article
      style={{
        backgroundColor: backgroundColor || 'white',
      }}
      className="xl:block relative  hidden w-[320px] border-[8px] overflow-scroll  border-black rounded-[40px] h-[684px] shadow-lg"
    >
      {selectedImage.length > baseString.length && (
        <Image
          fill
          className="absolute backdrop-brightness-125 bg-cover opacity-25"
          src={selectedImage}
          alt="background"
        />
      )}

      <h1 className="text-[28px] font-[700] relative p-4 pt-6">Menu</h1>
      {/* <div className="overflow-scroll w-full px-4">
        <Tabs
          classNames={{
            tabList:
              'gap-3 w-full relative rounded-none p-0 border-b border-divider',
            cursor: 'w-full bg-primaryColor',
            tab: 'max-w-fit px-0 h-10',
            tabContent: 'group-data-[selected=true]:text-primaryColor',
          }}
          variant={'underlined'}
          aria-label="menu filter"
          // isDisabled
          disabledKeys={['Drinks', 'Dessert', 'Breakfast']}
        >
          {menus.map((menu) => {
            return (
              <Tab
                key={menu.name}
                title={
                  <div className="flex items-center space-x-2">
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
      </div> */}

      <div className={`${togglePreview(activeTile)?.main} relative  px-4`}>
        {items?.map((item) => {
          return (
            <React.Fragment key={item.menuID}>
              <div
                className={`${togglePreview(activeTile)?.container} ${
                  activeTile === 'List Right' &&
                  isSelectedPreview &&
                  'flex-row-reverse'
                } flex  my-4 `}
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
                      alt="menu"
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
                  <p>{item.menuName}</p>
                  <p className="font-[700]">{item.itemName}</p>
                  <p className="text-[13px]">{formatPrice(item.price)}</p>
                  {activeTile && activeTile !== 'Single column 1' && (
                    <p className="text-[13px]">
                      {/* {togglePreview(activeTile)?.text3} */}
                      {item.itemDescription}
                    </p>
                  )}
                </div>
              </div>
              {togglePreview(activeTile)?.divider && (
                <Divider className="text-[#E4E7EC] h-[1px]" />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </article>
  );
};

export default Preview;
