import { CustomInput } from '@/components/CustomInput';
import { CustomButton } from '@/components/customButton';
import Container from '@/components/dashboardContainer';
import MenuList from '@/components/ui/dashboard/orders/place-order/menuList';
import React from 'react';
import { HiArrowLongLeft } from 'react-icons/hi2';
import { IoSearchOutline } from 'react-icons/io5';

export const metadata = {
  title: 'Hobink | Place Order',
  description: ' Select items from the menu to place order',
};

const PlaceOrder = () => {
  return (
    <Container>
      <div className='flex flex-row flex-wrap  justify-between'>
        <div>
          <div className='text-[24px] leading-8 font-semibold'>
            <span>Place an order</span>
          </div>
          <p className='text-sm  text-grey600 xl:mb-8 w-full mb-4'>
            Select items from the menu to place order
          </p>
        </div>
        <div className='flex items-center justify-center gap-3'>
          <div>
            <CustomInput
              classnames={'w-[242px]'}
              label=''
              size='md'
              isRequired={false}
              startContent={<IoSearchOutline />}
              type='text'
              placeholder='Search here...'
            />
          </div>
          <CustomButton
            // onClick={() => router.push('/dashboard/orders/place-order')}
            className='py-2 px-4 mb-0 text-white'
            backgroundColor='bg-primaryColor'
          >
            <div className='flex gap-2 items-center justify-center'>
              <p>{'Proceed'} </p>
              <HiArrowLongLeft className='text-[22px] rotate-180' />
            </div>
          </CustomButton>
        </div>
      </div>
      <MenuList />
    </Container>
  );
};

export default PlaceOrder;
