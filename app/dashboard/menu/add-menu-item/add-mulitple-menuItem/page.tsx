'use client';
import { useState } from 'react';
import Link from 'next/link';
import { IoIosArrowRoundBack } from 'react-icons/io';
import dynamic from 'next/dynamic';
import SelectMenu from './selectMenu';
import AddMultipleMenu from './addMultipleMenu';

const DynamicMetaTag = dynamic(() => import('@/components/dynamicMetaTag'), {
  ssr: false,
});

const AddMultipleMenuItems = () => {
  const [activeScreen, setActiveScreen] = useState(1);
  const [selectedMenu, setSelectedMenu] = useState('');

  const toggleMultipleMenu = () => {
    // Handle toggle functionality if needed
  };

  return (
    <>
      <Link
        prefetch={true}
        href={'/dashboard/menu'}
        className={`cursor-pointer text-primaryColor flex gap-2 mb-3 text-sm items-center`}
      >
        <IoIosArrowRoundBack className='text-[22px]' />
        <span className='text-sm'>Back to menu</span>
      </Link>

      <div className="min-h-screen bg-white">
        <div className="max-w-4xl mx-auto px-6 py-8">
          {activeScreen === 1 && (
            <SelectMenu
              setActiveScreen={setActiveScreen}
              setSelectedMenu={setSelectedMenu}
              selectedMenu={selectedMenu}
              toggleMultipleMenu={toggleMultipleMenu}
            />
          )}
          
          {activeScreen === 2 && (
            <AddMultipleMenu 
              selectedMenu={selectedMenu}
            />
          )}
        </div>
      </div>

      <DynamicMetaTag
        route='Add Multiple Menu Items'
        description='Bulk upload menu items using Excel spreadsheet'
      />
    </>
  );
};

export default AddMultipleMenuItems;