'use client';
import Container from '../../../components/dashboardContainer';

import React, { useEffect, useState } from 'react';

import { CustomLoading, getJsonItemFromLocalStorage } from '@/lib/utils';

import { CustomButton } from '@/components/customButton';
import {
  Button,
  ButtonGroup,
  Chip,
  Modal,
  ModalContent,
  useDisclosure,
} from '@nextui-org/react';
import { IoAddCircleOutline } from 'react-icons/io5';
import { MdOutlineFileDownload } from 'react-icons/md';

import { getOrderByBusiness } from '@/app/api/controllers/dashboard/orders';
import Error from '@/components/error';
import CreateOrder from '@/components/ui/dashboard/orders/createOrder';
import OrdersList from '@/components/ui/dashboard/orders/order';
import { downloadCSV } from '@/lib/downloadToExcel';
import { useRouter } from 'next/navigation';

type OrderItem = {
  name: string;
  orders: Array<{
    id: string;
    placedByName: string;
    placedByPhoneNumber: string;
    reference: string;
    treatedBy: string;
    totalAmount: number;
    qrReference: string;
    paymentMethod: number;
    paymentReference: string;
    status: 0 | 1 | 2 | 3;
  }>;
};

type OrderData = Array<OrderItem>;
const Orders: React.FC = () => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const [orders, setOrders] = useState<OrderData>([]);

  const [isLoading, setIsLoading] = useState<Boolean>(true);
  const [error, setError] = useState<Boolean>(false);
  const businessInformation = getJsonItemFromLocalStorage('business');

  const router = useRouter();

  const getAllOrders = async (checkLoading = true) => {
    setIsLoading(checkLoading);
    setError(false);
    const data = await getOrderByBusiness(businessInformation[0]?.businessId);
    setIsLoading(false);
    if (data?.data?.isSuccessful) {
      let response = data?.data?.data;
      setOrders(response);
    } else if (data?.data?.error) {
      setError(true);
    }
  };

  useEffect(() => {
    getAllOrders();
  }, []);

  const getScreens = () => {
    if (orders?.length > 0) {
      return (
        <OrdersList
          orders={orders}
          onOpen={onOpen}
          getAllOrders={getAllOrders}
        />
      );
    } else if (error) {
      return <Error onClick={() => getAllOrders()} />;
    } else {
      return <CreateOrder />;
    }
  };

  const newArray = orders?.flatMap((item) =>
    item.orders.map((order) => ({
      placedByName: order.placedByName,
      reference: order.reference,
      totalAmount: order.totalAmount,
      dateCreated: order.dateCreated,
      paymentReference: order.paymentReference,
      placedByPhoneNumber: order.placedByPhoneNumber,
    }))
  );
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
            <ButtonGroup className='border-2 border-primaryGrey divide-x-2 divide-primaryGrey rounded-lg'>
              <Button
                onClick={() => downloadCSV(newArray)}
                className='flex text-grey600 bg-white'
              >
                <MdOutlineFileDownload className='text-[22px]' />
                <p>Export csv</p>
              </Button>
            </ButtonGroup>
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

      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              {/* <ModalBody>
                <h2 className='text-[24px] leading-3 mt-8 text-black font-semibold'>
                  Create Menu
                </h2>
                <p className='text-sm  text-grey600  xl:w-[231px]  w-full mb-4'>
                  Create a menu to add item
                </p>
                <CustomInput
                  type='text'
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setName(e.target.value)
                  }
                  value={name}
                  label='Name of menu'
                  placeholder='E.g Drinks'
                />
                <Spacer y={2} />

                <CustomButton
                  loading={loading}
                  onClick={handleCreateMenu}
                  disabled={!name || loading}
                  type='submit'
                >
                  {loading ? 'Loading' : 'Proceed'}
                </CustomButton>

                <Spacer y={4} />
              </ModalBody> */}
            </>
          )}
        </ModalContent>
      </Modal>
    </Container>
  );
};

export default Orders;
