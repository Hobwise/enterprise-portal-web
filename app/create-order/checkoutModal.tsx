'use client';
import {
  createUserOrder,
  editUserOrder,
} from '@/app/api/controllers/dashboard/orders';
import { CustomInput } from '@/components/CustomInput';
import { CustomButton } from '@/components/customButton';
import { CustomTextArea } from '@/components/customTextArea';
import { formatPrice, getJsonItemFromLocalStorage } from '@/lib/utils';
import {
  Button,
  Checkbox,
  cn,
  Divider,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  Spacer,
} from '@nextui-org/react';
import Image from 'next/image';
import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { FaMinus, FaPlus } from 'react-icons/fa6';
import { HiArrowLongLeft } from 'react-icons/hi2';
import noImage from '../../public/assets/images/no-image.svg';

interface Order {
  placedByName: string;
  placedByPhoneNumber: string;
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

  closeModal = false,
  setSelectedItems,
  businessId,
  cooperateID,
  qrId,
  handlePackingCost,
}: any) => {
  const businessInformation = getJsonItemFromLocalStorage('business');
  const additionalCost = 0;

  const [response, setResponse] = useState(null);
  const [orderId, setOrderId] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [order, setOrder] = useState<Order>({
    placedByName: '',
    placedByPhoneNumber: '',

    comment: '',
  });

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setResponse(null);
    const { name, value } = event.target;
    if (name === 'placedByPhoneNumber') {
      if (/^\d{0,11}$/.test(value)) {
        setOrder((prevOrder) => ({
          ...prevOrder,
          [name]: value,
        }));
      }
    } else {
      setOrder((prevOrder) => ({
        ...prevOrder,
        [name]: value,
      }));
    }
  };

  const [changeTitle, setChangeTitle] = useState(false);
  const placeOrder = async () => {
    setLoading(true);
    const transformedArray = selectedItems.map((item) => ({
      itemId: item.id,
      quantity: item.count,
      unitPrice: item.price,
      isVariety: item.isVariety,
      isPacked: item.isPacking,
    }));
    const payload = {
      status: 0,
      placedByName: order.placedByName,
      placedByPhoneNumber: order.placedByPhoneNumber,
      quickResponseID: qrId,
      comment: order.comment,
      orderDetails: transformedArray,
    };
    const id = businessId ? businessId : businessInformation[0]?.businessId;
    const data = await createUserOrder(id, payload, cooperateID);
    setResponse(data);
    setLoading(false);
    if (data?.data?.isSuccessful) {
      setOrderId(data.data.data.id);

      toast.success('Order placed');
      closeModal === true && setChangeTitle(true);

      setOrder({
        ...order,
        comment: '',
      });
    } else {
      toast.error(data?.data?.error);
    }
  };
  const updateOrder = async () => {
    setLoading(true);
    const transformedArray = selectedItems.map((item) => ({
      itemId: item.id,
      quantity: item.count,
      unitPrice: item.price,
      isVariety: item.isVariety,
      isPacked: item.isPacking,
    }));
    const payload = {
      status: 0,
      placedByName: order.placedByName,
      placedByPhoneNumber: order.placedByPhoneNumber,
      quickResponseID: qrId,
      comment: order.comment,
      orderDetails: transformedArray,
    };

    const data = await editUserOrder(orderId, payload);
    setResponse(data);

    setLoading(false);
    if (data?.data?.isSuccessful) {
      setOrderId(data.data.data.id);

      toast.success('Order updated');
    } else if (data?.data?.error) {
      toast.error(data?.data?.error);
    }
  };

  const finalTotal = totalPrice + totalPrice * (7.5 / 100) + additionalCost;

  return (
    <div className="">
      <Modal
        hideCloseButton={true}
        isKeyboardDismissDisabled={true}
        classNames={{
          base: `${changeTitle ? 'h-full' : 'max-h-full'} overflow-scroll`,
          // base: `md:overflow-none overflow-scroll ${
          //   changeTitle ? 'h-full' : 'h-screen'
          // }`,
          body: 'px-1 md:px-6',
          header: 'px-3 md:px-6',
        }}
        isDismissable={false}
        size={'4xl'}
        isOpen={isOpen}
        onOpenChange={() => {
          onOpenChange();

          setIsLoading(false);
        }}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <>
                <ModalHeader className="flex flex-col mt-3 gap-1">
                  <div className="flex flex-row flex-wrap  justify-between">
                    {changeTitle ? (
                      <div>
                        <div className="text-[24px] leading-8 font-semibold">
                          <span className="text-black">
                            Hello, {order.placedByName}
                          </span>
                        </div>
                        <p className="text-sm  text-grey600 xl:mb-8 w-full mb-4">
                          Your orders
                        </p>
                      </div>
                    ) : (
                      <div>
                        <div className="text-[24px] leading-8 font-semibold">
                          <span className="text-black">Confirm order</span>
                        </div>
                        <p className="text-sm  text-grey600 xl:mb-8 w-full mb-4">
                          Confirm order before checkout
                        </p>
                      </div>
                    )}
                  </div>
                  <Divider className="bg-primaryGrey" />
                </ModalHeader>
                <ModalBody>
                  <div className="">
                    <div className="flex lg:flex-row flex-col gap-3 mb-4">
                      <div
                        className={`flex flex-col lg:w-[60%] ${
                          changeTitle ? 'h-full' : 'max-h-[300px]'
                        }   overflow-y-scroll w-full  px-2`}
                      >
                        {selectedItems?.map((item, index) => {
                          return (
                            <React.Fragment key={item.id}>
                              <div className="flex justify-between gap-2">
                                <div className="py-3 w-[250px] rounded-lg  text-black  flex">
                                  <Image
                                    src={
                                      item?.image
                                        ? `data:image/jpeg;base64,${item?.image}`
                                        : noImage
                                    }
                                    width={20}
                                    height={20}
                                    className="object-cover rounded-lg w-20 h-20"
                                    aria-label="uploaded image"
                                    alt="uploaded image(s)"
                                  />

                                  <div className="pl-2 flex  flex-col text-sm justify-center">
                                    <p className="font-[600]">
                                      {item.itemName}
                                    </p>

                                    <Spacer y={1} />
                                    <p className="text-grey600">
                                      {item.menuName}
                                    </p>
                                    <Checkbox
                                      size="sm"
                                      isSelected={item.isPacking}
                                      onValueChange={(isSelected) =>
                                        handlePackingCost(item.id, isSelected)
                                      }
                                    >
                                      <span className="text-grey600 text-sm">
                                        Pack In
                                      </span>
                                    </Checkbox>
                                    <Spacer y={1} />
                                    <div className="text-black md:w-[150px] md:hidden w-auto grid">
                                      <h3 className="font-[600]">
                                        {formatPrice(item?.price)}
                                      </h3>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex  items-center">
                                  <Button
                                    onClick={() => handleDecrement(item.id)}
                                    isIconOnly
                                    radius="sm"
                                    variant="faded"
                                    className="border h-[35px] w-[30px] border-primaryGrey bg-white"
                                    aria-label="minus"
                                  >
                                    <FaMinus />
                                  </Button>
                                  <span className="font-bold  text-black py-2 px-4">
                                    {item.count}
                                  </span>
                                  <Button
                                    onClick={() => handleIncrement(item.id)}
                                    isIconOnly
                                    radius="sm"
                                    variant="faded"
                                    className="border border-primaryGrey h-[35px] w-[30px] bg-white "
                                    aria-label="plus"
                                  >
                                    <FaPlus />
                                  </Button>
                                </div>
                                <div className=" md:w-[150px] hidden w-auto md:grid place-content-center">
                                  <div className="flex flex-col">
                                    <h3 className="font-semibold text-black">
                                      {formatPrice(item?.price)}
                                    </h3>
                                    <span
                                      className={cn(
                                        'text-xs text-gray-200',
                                        item.isPacking && 'font-bold text-black'
                                      )}
                                    >
                                      {formatPrice(item.packingCost)}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              {index !== selectedItems?.length - 1 && (
                                <Divider className="bg-[#E4E7EC80]" />
                              )}
                            </React.Fragment>
                          );
                        })}
                        <div className="flex justify-end mt-auto">
                          <div className="flex flex-col gap-2">
                            <div className="flex gap-2">
                              <p className="text-black font-bold">Subtotal: </p>
                              <p className="text-black">
                                {formatPrice(totalPrice)}
                              </p>
                            </div>
                            <div className="flex justify-between">
                              <p className="text-black font-bold">Vat(7.5%):</p>
                              <p className="text-black">
                                {totalPrice * (7.5 / 100)}
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <p className="text-black font-bold">
                                Additional cost:{' '}
                              </p>
                              <p className="text-black">
                                {formatPrice(additionalCost)}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex-grow bg-[#F7F6FA] z-10 rounded-lg p-4">
                        {changeTitle === false && (
                          <>
                            <CustomInput
                              type="text"
                              onChange={handleInputChange}
                              errorMessage={response?.errors?.placedByName?.[0]}
                              value={order.placedByName}
                              name="placedByName"
                              label="Name"
                              placeholder="Enter name"
                            />
                            <Spacer y={2} />
                            <CustomInput
                              type="text"
                              errorMessage={
                                response?.errors?.placedByPhoneNumber?.[0]
                              }
                              onChange={handleInputChange}
                              value={order.placedByPhoneNumber}
                              name="placedByPhoneNumber"
                              label="Phone number"
                              placeholder="Enter phone number"
                            />
                            <Spacer y={2} />
                          </>
                        )}

                        <CustomTextArea
                          // defaultValue={menuItem?.itemDescription}
                          value={order.comment}
                          name="comment"
                          onChange={handleInputChange}
                          label="Add comment"
                          placeholder="Add a comment to this order. (optional)"
                        />
                      </div>
                    </div>
                    <div className="gap-3 flex px-3 flex-col">
                      {changeTitle ? (
                        <div className="flex flex-col gap-3">
                          <CustomButton
                            loading={loading}
                            disabled={loading}
                            onClick={updateOrder}
                            className="py-2 px-4 h-[50px] mb-0 bg-white border border-primaryGrey"
                          >
                            Update order
                          </CustomButton>
                          <CustomButton
                            onClick={() => {
                              window.location.reload();
                            }}
                            className="py-2 px-4 h-[50px] mb-0 bg-primaryGrey border border-primaryGrey"
                          >
                            Close
                          </CustomButton>
                        </div>
                      ) : (
                        <>
                          <CustomButton
                            loading={loading}
                            disabled={loading}
                            onClick={placeOrder}
                            className="py-2 h-[50px] px-4 mb-0 text-white"
                            backgroundColor="bg-primaryColor"
                          >
                            <div className="flex gap-2  w-full items-center justify-between">
                              <p>Place order</p>
                              <div className="flex gap-2 items-center">
                                <span className="font-bold">
                                  {' '}
                                  {formatPrice(finalTotal)}{' '}
                                </span>
                                <HiArrowLongLeft className="text-[22px] rotate-180" />
                              </div>
                            </div>
                          </CustomButton>
                          <CustomButton
                            onClick={onOpenChange}
                            className="py-2 px-4 h-[50px] mb-0 bg-primaryGrey border border-primaryGrey"
                          >
                            Close
                          </CustomButton>
                        </>
                      )}
                    </div>
                  </div>
                </ModalBody>
              </>
            </>
          )}
        </ModalContent>
      </Modal>{' '}
    </div>
  );
};

export default CheckoutModal;
