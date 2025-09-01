import { getMenu } from '@/app/api/controllers/dashboard/menu';
import { CustomButton } from '@/components/customButton';
import SelectInput from '@/components/selectInput';
import { useGlobalContext } from '@/hooks/globalProvider';
import { getJsonItemFromLocalStorage } from '@/lib/utils';
import { Spacer } from '@nextui-org/react';
import React, { useEffect, useState } from 'react';

const SelectMenu = ({
  setActiveScreen,
  setSelectedMenu,
  selectedMenu,
  toggleMultipleMenu,
}: any) => {
  const [menuArray, setMenuArray] = useState([]);

  const businessInformation = getJsonItemFromLocalStorage('business');
  const getMenuName = async () => {
    const data = await getMenu(businessInformation[0]?.businessId);

    if (data?.data?.isSuccessful) {
      const newData = data?.data?.data.map((item) => ({
        ...item,
        label: item.name,
        value: item.id,
      }));

      setMenuArray(newData);
    } else if (data?.data?.error) {
      //   notify({
      //     title: 'Error!',
      //     text: data?.data?.error,
      //     type: 'error',
      //   });
    }
  };

  useEffect(() => {
    getMenuName();
  }, []);
  return (
    <section>
      <div className='mb-6'>
        <h3 className='text-lg font-semibold text-gray-800 mb-2 font-satoshi'>
          Choose a Menu Section
        </h3>
        <p className='text-sm text-gray-600 font-satoshi'>
          Select the menu section where you want to add multiple items
        </p>
      </div>
      <Spacer y={4} />
      <SelectInput
        label={'Select a menu'}
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
