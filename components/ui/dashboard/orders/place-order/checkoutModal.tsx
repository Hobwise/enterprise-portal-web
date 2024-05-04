'use client';
import { CustomButton } from '@/components/customButton';
import {
  Button,
  Divider,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  Spacer,
} from '@nextui-org/react';
import React, { useEffect, useState } from 'react';
import { HiArrowLongLeft } from 'react-icons/hi2';
import { FaPlus } from 'react-icons/fa6';
import { FaMinus } from 'react-icons/fa6';
import noImage from '../../../../../public/assets/images/no-image.png';
import Image from 'next/image';
import { CustomInput } from '@/components/CustomInput';
import { CustomTextArea } from '@/components/customTextArea';
import SelectInput from '@/components/selectInput';
import { getQR } from '@/app/api/controllers/dashboard/quickResponse';
import { formatPrice, getJsonItemFromLocalStorage, notify } from '@/lib/utils';
import {
  completeOrder,
  createOrder,
  editOrder,
  orderSchema,
} from '@/app/api/controllers/dashboard/orders';
import { useRouter } from 'next/navigation';
import { MdKeyboardArrowRight } from 'react-icons/md';

interface Order {
  placedByName: string;
  placedByPhoneNumber: string;
  quickResponseID: string;
  comment: string;
  orderDetails?: OrderDetail[];
}

interface OrderDetail {
  itemID: string;
  quantity: number;
  unitPrice: number;
}

const CheckoutModal = ({
  isOpen,
  onOpenChange,
  selectedItems,
  totalPrice,
  handleDecrement,
  handleIncrement,
  orderDetails,
  id,
}: any) => {
  const businessInformation = getJsonItemFromLocalStorage('business');

  const router = useRouter();
  const [response, setResponse] = useState(null);
  const [orderId, setOrderId] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [reference, setReference] = useState('');
  const [screen, setScreen] = useState(1);

  const [qr, setQr] = useState([]);
  const [order, setOrder] = useState<Order>({
    placedByName: orderDetails?.placedByName || '',
    placedByPhoneNumber: orderDetails?.placedByPhoneNumber || '',
    quickResponseID: orderDetails?.quickResponseID || '',
    comment: orderDetails?.comment || '',
  });

  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(0);

  const handleClick = (methodId: number) => {
    setSelectedPaymentMethod(methodId);
    setScreen(3);
  };

  const paymentMethods = [
    { text: 'Pay with cash', id: 0 },
    { text: 'Pay with Pos', id: 1 },
    { text: 'Pay with bank transfer', id: 2 },
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setResponse(null);
    const { name, value } = e.target;
    setOrder((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };

  const placeOrder = async () => {
    setLoading(true);
    const transformedArray = selectedItems.map((item) => ({
      itemId: item.id,
      quantity: item.count,
      unitPrice: item.price,
      isVariety: item.isVariety,
    }));
    const payload = {
      status: 0,
      placedByName: order.placedByName,
      placedByPhoneNumber: order.placedByPhoneNumber,
      quickResponseID: order.quickResponseID,
      comment: order.comment,
      orderDetails: transformedArray,
    };
    const data = await createOrder(businessInformation[0]?.businessId, payload);
    setResponse(data);
    setLoading(false);
    if (data?.data?.isSuccessful) {
      setOrderId(data.data.data.id);
      notify({
        title: 'Success!',
        text: 'Order placed',
        type: 'success',
      });
      setScreen(2);
    } else if (data?.data?.error) {
      notify({
        title: 'Error!',
        text: data?.data?.error,
        type: 'error',
      });
    }
  };
  const updateOrder = async () => {
    setLoading(true);
    const transformedArray = selectedItems.map((item) => ({
      itemId: item.id,
      quantity: item.count,
      unitPrice: item.price,
      isVariety: item.isVariety,
    }));
    const payload = {
      status: 0,
      placedByName: order.placedByName,
      placedByPhoneNumber: order.placedByPhoneNumber,
      quickResponseID: order.quickResponseID,
      comment: order.comment,
      orderDetails: transformedArray,
    };
    const data = await editOrder(id, payload);
    setResponse(data);
    setLoading(false);
    if (data?.data?.isSuccessful) {
      setOrderId(data.data.data.id);
      notify({
        title: 'Success!',
        text: 'Order placed',
        type: 'success',
      });
      setScreen(2);
    } else if (data?.data?.error) {
      notify({
        title: 'Error!',
        text: data?.data?.error,
        type: 'error',
      });
    }
  };

  const finalizeOrder = async () => {
    setIsLoading(true);
    const payload = {
      treatedBy: order.placedByName,
      paymentMethod: selectedPaymentMethod,
      paymentReference: reference,
      status: 1,
    };

    const data = await completeOrder(payload, orderId);
    setIsLoading(false);

    if (data?.data?.isSuccessful) {
      notify({
        title: 'Payment made!',
        text: 'Payment has been made, awaiting confirmation',
        type: 'success',
      });

      router.push('/dashboard/orders');
    } else if (data?.data?.error) {
      notify({
        title: 'Error!',
        text: data?.data?.error,
        type: 'error',
      });
    }
  };

  const getQrID = async () => {
    const data = await getQR(businessInformation[0]?.businessId);

    if (data?.data?.isSuccessful) {
      let response = data?.data?.data;
      const newData = response.map((item) => ({
        ...item,
        label: item.name,
        value: item.id,
      }));

      setQr(newData);
    } else if (data?.data?.error) {
    }
  };

  useEffect(() => {
    setOrder({
      placedByName: orderDetails?.placedByName || '',
      placedByPhoneNumber: orderDetails?.placedByPhoneNumber || '',
      quickResponseID: orderDetails?.quickResponseID || '',
      comment: orderDetails?.comment || '',
    });
  }, [orderDetails]);

  useEffect(() => {
    getQrID();
  }, []);

  return (
    <Modal
      size={screen === 1 ? '5xl' : 'md'}
      isOpen={isOpen}
      onOpenChange={() => {
        setScreen(1);
        onOpenChange();
        setReference('');

        setOrder({
          placedByName: orderDetails?.placedByName || '',
          placedByPhoneNumber: orderDetails?.placedByPhoneNumber || '',
          quickResponseID: orderDetails?.quickResponseID || '',
          comment: orderDetails?.comment || '',
        });
      }}
    >
      <ModalContent>
        {(onClose) => (
          <>
            {screen === 1 && (
              <>
                <ModalHeader className='flex flex-col gap-1'>
                  <div className='flex flex-row flex-wrap  justify-between'>
                    <div>
                      <div className='text-[24px] leading-8 font-semibold'>
                        <span className='text-black'>Confirm order</span>
                      </div>
                      <p className='text-sm  text-grey600 xl:mb-8 w-full mb-4'>
                        Confirm order before checkout
                      </p>
                    </div>
                    <div className='flex items-center justify-center gap-3'>
                      <CustomButton
                        onClick={onOpenChange}
                        className='py-2 px-4 mb-0 bg-white border border-primaryGrey'
                      >
                        Update order
                      </CustomButton>

                      <CustomButton
                        loading={loading}
                        disabled={loading}
                        onClick={id ? updateOrder : placeOrder}
                        className='py-2 px-4 mb-0 text-white'
                        backgroundColor='bg-primaryColor'
                      >
                        <div className='flex gap-2 items-center justify-center'>
                          <p>Checkout {formatPrice(totalPrice)} </p>
                          <HiArrowLongLeft className='text-[22px] rotate-180' />
                        </div>
                      </CustomButton>
                    </div>
                  </div>
                  <Divider className='bg-primaryGrey' />
                </ModalHeader>
                <ModalBody>
                  <div className='flex lg:flex-row flex-col gap-3 mb-4'>
                    <div className='lg:w-[60%] max-h-[300px] overflow-y-scroll w-full rounded-lg border border-[#E4E7EC80] p-2 '>
                      {selectedItems?.map((item, index) => {
                        return (
                          <>
                            <div key={item.id} className='flex justify-between'>
                              <div className='py-3 w-[250px] rounded-lg text-black  flex'>
                                <Image
                                  src={
                                    item?.image
                                      ? `data:image/jpeg;base64,${item?.image}`
                                      : noImage
                                  }
                                  width={20}
                                  height={20}
                                  className='object-cover rounded-lg w-20 h-15'
                                  aria-label='uploaded image'
                                  alt='uploaded image(s)'
                                />

                                <div className='p-3 flex  flex-col text-sm justify-center'>
                                  <p className='font-[600]'>{item.menuName}</p>
                                  <Spacer y={2} />
                                  <p className='text-grey600'>
                                    {item.itemName}
                                  </p>
                                </div>
                              </div>
                              <div className='flex items-center'>
                                <Button
                                  onClick={() => handleDecrement(item.id)}
                                  isIconOnly
                                  radius='sm'
                                  variant='faded'
                                  className='border h-[35px] w-[30px] border-grey400'
                                  aria-label='minus'
                                >
                                  <FaMinus />
                                </Button>
                                <span className='font-bold  text-black py-2 px-4'>
                                  {item.count}
                                </span>
                                <Button
                                  onClick={() => handleIncrement(item.id)}
                                  isIconOnly
                                  radius='sm'
                                  variant='faded'
                                  className='border h-[35px] w-[30px] border-grey400'
                                  aria-label='plus'
                                >
                                  <FaPlus />
                                </Button>
                              </div>
                              <div className='text-black w-[150px] grid place-content-center'>
                                <h3 className='font-[600]'>
                                  {formatPrice(item?.price)}
                                </h3>
                              </div>
                            </div>
                            {index !== selectedItems?.length - 1 && (
                              <Divider className='bg-[#E4E7EC80]' />
                            )}
                          </>
                        );
                      })}
                    </div>
                    <div className='flex-grow bg-[#F7F6FA] z-10 rounded-lg p-4'>
                      <CustomInput
                        type='text'
                        onChange={handleInputChange}
                        errorMessage={response?.errors?.placedByName?.[0]}
                        value={order.placedByName}
                        name='placedByName'
                        label='Name'
                        placeholder='Enter name'
                      />
                      <Spacer y={2} />
                      <CustomInput
                        type='text'
                        errorMessage={
                          response?.errors?.placedByPhoneNumber?.[0]
                        }
                        onChange={handleInputChange}
                        value={order.placedByPhoneNumber}
                        name='placedByPhoneNumber'
                        label='Phone number'
                        placeholder='Enter phone number'
                      />
                      <Spacer y={2} />

                      <SelectInput
                        errorMessage={response?.errors?.quickResponseID?.[0]}
                        label='Select a table'
                        placeholder='Enter table'
                        name='quickResponseID'
                        selectedKeys={[order?.quickResponseID]}
                        onChange={handleInputChange}
                        value={order.quickResponseID}
                        contents={qr}
                      />
                      <Spacer y={2} />
                      <CustomTextArea
                        // defaultValue={menuItem?.itemDescription}
                        value={order.comment}
                        name='comment'
                        onChange={handleInputChange}
                        label='Add comment'
                        placeholder='Add a comment to this order. (optional)'
                      />
                    </div>
                  </div>
                </ModalBody>
              </>
            )}
            {screen === 2 && (
              <div className='p-5'>
                <div className='flex justify-between mt-3'>
                  <div>
                    <div className=' text-[18px] leading-8 font-semibold'>
                      <span className='text-black'>Select payment method</span>
                    </div>
                    <p className='text-sm  text-primaryColor xl:mb-8 w-full mb-4'>
                      {formatPrice(totalPrice)}
                    </p>
                  </div>
                  <CustomButton
                    onClick={() => router.push('/dashboard/orders')}
                    className='border border-primaryGrey text-grey500 bg-transparent'
                  >
                    Complete later
                  </CustomButton>
                </div>
                <div className='flex flex-col gap-1 text-black'>
                  {paymentMethods.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => handleClick(item.id)}
                      className={`flex  cursor-pointer items-center gap-2 p-4 rounded-lg justify-between  ${
                        selectedPaymentMethod === item.id
                          ? 'bg-[#EAE5FF80]'
                          : ''
                      } `}
                    >
                      <div>
                        <p className='font-semibold'>{item.text}</p>
                        <p className='text-sm text-grey500'>
                          Accept payment using cash
                        </p>
                      </div>
                      <MdKeyboardArrowRight />
                    </div>
                  ))}
                </div>
              </div>
            )}
            {screen === 3 && (
              <div className='p-5'>
                <div>
                  <div className=' text-[18px] leading-8 font-semibold'>
                    <span className='text-black'>Confirm payment</span>
                  </div>
                  <p className='text-sm  text-grey500 xl:mb-8 w-full mb-4'>
                    confirm that customer has paid for order
                  </p>
                </div>
                <div
                  className={`flex items-center gap-2 p-4 rounded-lg justify-between bg-[#EAE5FF80]`}
                >
                  <div>
                    <p className='text-sm text-grey500'>TOTAL ORDER</p>
                    <p className='font-bold text-black text-[20px]'>
                      {' '}
                      {formatPrice(totalPrice)}
                    </p>
                  </div>
                  <MdKeyboardArrowRight />
                </div>
                <Spacer y={4} />
                <CustomInput
                  type='text'
                  // defaultValue={menuItem?.itemName}
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  name='itemName'
                  label='Enter ref'
                  placeholder='Provide payment reference'
                />
                <Spacer y={5} />
                <div className='flex gap-5'>
                  <CustomButton
                    onClick={onOpenChange}
                    className='bg-white h-[50px] w-full border border-primaryGrey'
                  >
                    Cancel
                  </CustomButton>
                  <CustomButton
                    loading={isLoading}
                    disabled={isLoading}
                    onClick={finalizeOrder}
                    className='text-white w-full h-[50px]'
                  >
                    <div className='flex gap-2 items-center justify-center'>
                      <p>{'Confirm payment'} </p>
                      <HiArrowLongLeft className='text-[22px] rotate-180' />
                    </div>
                  </CustomButton>
                </div>
              </div>
            )}
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default CheckoutModal;
