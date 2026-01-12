import { CustomButton } from '@/components/customButton';
import SelectInput from '@/components/selectInput';
import { Spacer } from '@nextui-org/react';
import React, { useEffect, useState } from 'react';

const SelectMenu = ({
  setActiveScreen,
  setSelectedMenu,
  selectedMenu,
  toggleMultipleMenu,
  activeSubCategory,
  activeCategory,
  menuSections = [],
}: any) => {
  const [menuArray, setMenuArray] = useState([]);

  // Transform menuSections to the format expected by SelectInput
  useEffect(() => {
    if (menuSections && menuSections.length > 0) {
      const formattedSections = menuSections.map((section: any) => ({
        ...section,
        label: section.name,
        value: section.id,
      }));
      setMenuArray(formattedSections);
    }
  }, [menuSections]);

  // Pre-fill with active section if available
  useEffect(() => {
    if (activeSubCategory) {
      setSelectedMenu(activeSubCategory);
    }
  }, [activeSubCategory, setSelectedMenu]);
  return (
    <section>
      <div className='mb-8 text-center'>
        <div className="w-16 h-16 bg-gradient-to-br from-[#EAE5FF] to-[#C3ADFF] rounded-2xl flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-[#5F35D2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        </div>
        <h3 className='text-2xl font-bold text-gray-800 mb-3 font-satoshi'>
          Choose a Menu
        </h3>
        <p className='text-gray-600 font-satoshi leading-relaxed max-w-md mx-auto'>
          Select the menu where you want to add multiple items. This will help organize your menu items properly.
        </p>
      </div>
      <Spacer y={4} />
      <SelectInput
        label={'Select a Menu'}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          setSelectedMenu(e.target.value)
        }
        value={selectedMenu}
        placeholder={'E.g drinks'}
        contents={menuArray}
      />

      <Spacer y={4} />
      <CustomButton
        className='w-full h-[48px] text-white'
        disabled={!selectedMenu}
        onClick={() => {
          setActiveScreen(2);
        }}
        type='submit'
      >
        Continue to Upload
      </CustomButton>
      <Spacer y={4} />
      {/* <CustomButton
        className='w-full h-[55px] bg-[#F4F2FF] text-primaryColor'
        type='submit'
        onClick={() => {
          toggleMultipleMenu();
        }}
      >
        {'Or create a new menu'}
      </CustomButton>
      <Spacer y={8} /> */}
    </section>
  );
};

export default SelectMenu;
