'use client';
import Container from '../../../components/dashboardContainer';

import React, { useMemo, useState } from 'react';

import { CustomLoading } from '@/lib/utils';

import { CustomInput } from '@/components/CustomInput';
import { CustomButton } from '@/components/customButton';
import Error from '@/components/error';
import CreateOrder from '@/components/ui/dashboard/orders/createOrder';
import OrdersList from '@/components/ui/dashboard/orders/order';
import useOrder from '@/hooks/useOrder';
import { downloadCSV } from '@/lib/downloadToExcel';
import { Button, ButtonGroup, Chip } from '@nextui-org/react';
import { useRouter } from 'next/navigation';
import { IoAddCircleOutline, IoSearchOutline } from 'react-icons/io5';
import { MdOutlineFileDownload } from 'react-icons/md';

const Orders: React.FC = () => {
  const router = useRouter();

  const { orders, isLoading, error, getAllOrders } = useOrder();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value.toLowerCase());
  };

  const filteredItems = useMemo(() => {
    return orders
      ?.map((order) => ({
        ...order,
        orders: order?.orders?.filter(
          (item) =>
            item?.placedByName?.toLowerCase().includes(searchQuery) ||
            String(item?.totalAmount)?.toLowerCase().includes(searchQuery) ||
            item?.dateCreated?.toLowerCase().includes(searchQuery) ||
            item?.reference?.toLowerCase().includes(searchQuery) ||
            item?.placedByPhoneNumber?.toLowerCase().includes(searchQuery) ||
            item?.paymentReference?.toLowerCase().includes(searchQuery)
        ),
      }))
      .filter((order) => order?.orders?.length > 0);
  }, [orders, searchQuery]);

  const getScreens = () => {
    if (orders?.length > 0) {
      return (
        <OrdersList
          orders={filteredItems}
          searchQuery={searchQuery}
          getAllOrders={getAllOrders}
        />
      );
    } else if (error) {
      return <Error onClick={() => getAllOrders()} />;
    } else {
      return <CreateOrder />;
    }
  };

  const newArray = useMemo(() => {
    return orders?.flatMap((item) =>
      item.orders.map((order) => ({
        placedByName: order.placedByName,
        reference: order.reference,
        totalAmount: order.totalAmount,
        dateCreated: order.dateCreated,
        paymentReference: order.paymentReference,
        placedByPhoneNumber: order.placedByPhoneNumber,
      }))
    );
  }, [orders]);
  return (
    <Container>
      <div className='flex flex-row flex-wrap  justify-between'>
        <div>
          <div className='text-[24px] leading-8 font-semibold'>
            {orders?.length > 0 ? (
              <div className='flex items-center'>
                <span>All orders</span>
                <Chip
                  classNames={{
                    base: ` ml-2 text-xs h-7 font-[600] w-5 bg-[#EAE5FF] text-primaryColor`,
                  }}
                >
                  {orders[0].orders?.length}
                </Chip>
              </div>
            ) : (
              <span>Orders</span>
            )}
          </div>
          <p className='text-sm  text-grey600  xl:w-[231px] xl:mb-8 w-full mb-4'>
            Showing all orders
          </p>
        </div>
        <div className='flex items-center gap-3'>
          {orders?.length > 0 && (
            <>
              <div>
                <CustomInput
                  classnames={'w-[242px]'}
                  label=''
                  size='md'
                  value={searchQuery}
                  onChange={handleSearchChange}
                  isRequired={false}
                  startContent={<IoSearchOutline />}
                  type='text'
                  placeholder='Search here...'
                />
              </div>
              <ButtonGroup className='border-2 border-primaryGrey divide-x-2 divide-primaryGrey rounded-lg'>
                <Button
                  onClick={() => downloadCSV(newArray)}
                  className='flex text-grey600 bg-white'
                >
                  <MdOutlineFileDownload className='text-[22px]' />
                  <p>Export csv</p>
                </Button>
              </ButtonGroup>
            </>
          )}

          <CustomButton
            onClick={() => router.push('/dashboard/orders/place-order')}
            className='py-2 px-4 mb-0 text-white'
            backgroundColor='bg-primaryColor'
          >
            <div className='flex gap-2 items-center justify-center'>
              <IoAddCircleOutline className='text-[22px]' />
              <p>{'Create order'} </p>
            </div>
          </CustomButton>
        </div>
      </div>
      {isLoading ? <CustomLoading /> : <>{getScreens()}</>}
    </Container>
  );
};

export default Orders;
