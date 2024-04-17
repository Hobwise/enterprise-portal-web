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
      <div className='mt-8'>
        <h1 className='text-[28px] text-black leading-8 font-bold'>
          Select a menu
        </h1>
        <p className='font-[500]  text-grey600 mb-4'>
          select a menu to add menu items
        </p>
      </div>
      <Spacer y={8} />
      <SelectInput
        label={'Select a menu'}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          setSelectedMenu(e.target.value)
        }
        value={selectedMenu}
        placeholder={'E.g drinks'}
        contents={menuArray}
      />

      <Spacer y={6} />
      <CustomButton
        className='w-full h-[55px] text-white'
        disabled={!selectedMenu}
        onClick={() => {
          setActiveScreen(2);
        }}
        type='submit'
      >
        {'Proceed'}
      </CustomButton>
      <Spacer y={8} />
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
