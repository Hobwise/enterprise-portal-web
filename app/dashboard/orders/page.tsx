'use client';
import Container from '../../../components/dashboardContainer';

import React, { useEffect, useState } from 'react';

import CreateMenu from '@/components/ui/dashboard/menu/createMenu';
import MenuList from '@/components/ui/dashboard/menu/menu';

import { getJsonItemFromLocalStorage, notify } from '@/lib/utils';
import {
  createMenu,
  getMenuByBusiness,
} from '@/app/api/controllers/dashboard/menu';
import { IoAddCircleOutline } from 'react-icons/io5';
import { MdOutlineFileDownload } from 'react-icons/md';
import { CustomButton } from '@/components/customButton';
import { IoPhonePortraitOutline } from 'react-icons/io5';
import {
  Modal,
  ModalContent,
  ModalBody,
  useDisclosure,
  Spacer,
  Chip,
  Button,
  ButtonGroup,
} from '@nextui-org/react';
import { CustomInput } from '@/components/CustomInput';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import hobink from '../../../public/assets/images/hobink.png';
import OrdersList from '@/components/ui/dashboard/orders/order';
import { getOrderByBusiness } from '@/app/api/controllers/dashboard/orders';
import CreateOrder from '@/components/ui/dashboard/orders/createOrder';

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
    status: 0 | 1 | 2;
  }>;
};

type OrderData = Array<OrderItem>;
const Orders: React.FC = () => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const [orders, setOrders] = useState<OrderData>([]);

  const [isLoading, setIsLoading] = useState<Boolean>(false);
  const businessInformation = getJsonItemFromLocalStorage('business');

  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const getAllOrders = async () => {
    setIsLoading(true);

    const data = await getOrderByBusiness(businessInformation[0]?.businessId);
    setIsLoading(false);

    if (data?.data?.isSuccessful) {
      let response = data?.data?.data;
      console.log(response, 'response');

      setOrders(response);
    } else if (data?.data?.error) {
      notify({
        title: 'Error!',
        text: data?.data?.error,
        type: 'error',
      });
    }
  };

  useEffect(() => {
    getAllOrders();
  }, []);

  if (isLoading) {
    return (
      <Container>
        <div
          className={`loadingContainer bg-white flex flex-col justify-center items-center`}
        >
          <div className='animate-bounce'>
            <Image
              src={hobink}
              style={{ objectFit: 'cover' }}
              alt='hobink logo'
            />
          </div>
          <p className='text-center text-primaryColor'>Loading...</p>
        </div>
      </Container>
    );
  }

  const getScreens = () => {
    if (orders.length > 0) {
      return <OrdersList orders={orders} onOpen={onOpen} />;
    } else {
      return <CreateOrder />;
    }
  };

  return (
    <Container>
      <div className='flex flex-row flex-wrap  justify-between'>
        <div>
          <div className='text-[24px] leading-8 font-semibold'>
            {orders.length > 0 ? (
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
          {orders.length > 0 && (
            <ButtonGroup className='border-2 border-primaryGrey divide-x-2 divide-primaryGrey rounded-lg'>
              <Button
                // onClick={toggleModalDelete}
                className='flex text-grey600 bg-white'
              >
                <MdOutlineFileDownload className='text-[22px]' />
                <p>Export csv</p>
              </Button>
            </ButtonGroup>
          )}
          {/* <CustomButton
            // onClick={openAddRoleModal}
            className='py-2 px-4 md:mb-0 text-black border border-[#D0D5DD] mb-4 '
            backgroundColor='bg-white'
          >
            <div className='flex gap-2 items-center justify-center'>
              <MdOutlineFileDownload className='text-[22px]' />
              <p>Export csv</p>
            </div>
          </CustomButton> */}

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
      {getScreens()}
      {/* <Modal isOpen={openModal} onOpenChange={toggleModal}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalBody>Hello world</ModalBody>
            </>
          )}
        </ModalContent>
      </Modal> */}
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
