"use client";
import {
  completeOrderWithPayment,
  getOrder,
} from "@/app/api/controllers/dashboard/orders";
import { CustomInput } from "@/components/CustomInput";
import { CustomButton } from "@/components/customButton";
import { formatPrice, getJsonItemFromLocalStorage, notify } from "@/lib/utils";
import {
  Divider,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  Spacer,
  Spinner,
} from "@nextui-org/react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { HiArrowLongLeft } from "react-icons/hi2";
import { IoIosArrowRoundBack } from "react-icons/io";
import { MdKeyboardArrowRight } from "react-icons/md";
import noImage from "../../../../public/assets/images/no-image.svg";
import { ordersCacheUtils } from '@/hooks/cachedEndpoints/useOrder';
import { useQueryClient } from '@tanstack/react-query';

const ConfirmOrderModal = ({
  singleOrder,
  isOpenConfirmOrder,
  toggleConfirmModal,
  refetch,
}: any) => {
  const queryClient = useQueryClient();
  const userInformation = getJsonItemFromLocalStorage("userInformation");
  const [isLoading, setIsLoading] = useState(false);

  const [screen, setScreen] = useState(1);
  const [order, setOrder] = useState<any>([]);
  const [reference, setReference] = useState("");

  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(0);

  const handleClick = (methodId: number) => {
    if (methodId === 3) {
      // Pay Later - close modal without payment
      toggleConfirmModal();
      refetch();
    } else {
      setSelectedPaymentMethod(methodId);
      setScreen(3);
    }
  };

  const paymentMethods = [
    { text: "Pay with cash", subText: " Accept payment using cash", id: 0 },
    { text: "Pay with Pos", subText: " Accept payment using Pos", id: 1 },
    {
      text: "Pay with bank transfer",
      subText: "Accept payment via bank transfer",
      id: 2,
    },
    { text: "Pay Later", subText: "Keep this order open", id: 3 },
  ];

  const getOrderDetails = async () => {
    if (!singleOrder?.id) return;
    const data = await getOrder(singleOrder.id);

    if (data?.data?.isSuccessful) {
      setOrder(data?.data?.data);
    } else if (data?.data?.error) {
    }
  };

  const finalizeOrder = async () => {
    if (!singleOrder?.id) {
      notify({
        title: "Error!",
        text: "Order data not available",
        type: "error",
      });
      return;
    }

    setIsLoading(true);
    const payload = {
      treatedBy: `${userInformation?.firstName} ${userInformation?.lastName}`,
      treatedById: userInformation.id,
      paymentMethod: selectedPaymentMethod,
      paymentReference: reference,
      status: 1,
    };

    const data = await completeOrderWithPayment(payload, singleOrder.id);
    setIsLoading(false);

    if (data?.data?.isSuccessful) {
      notify({
        title: "Payment made!",
        text: "Payment has been made, awaiting confirmation",
        type: "success",
      });

      // Clear the global orders cache to force fresh data
      ordersCacheUtils.clearAll();

      // Invalidate all related order queries with aggressive refetch
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ['orderCategories'],
          refetchType: 'active'
        }),
        queryClient.invalidateQueries({
          queryKey: ['orderDetails'],
          refetchType: 'active'
        }),
        queryClient.invalidateQueries({
          queryKey: ['allOrdersData'],
          refetchType: 'active'
        }),
        queryClient.invalidateQueries({
          queryKey: ['orders'],
          refetchType: 'active'
        })
      ]);

      // Force immediate refetch of all active queries
      await Promise.all([
        queryClient.refetchQueries({
          queryKey: ['orderCategories'],
          type: 'active'
        }),
        queryClient.refetchQueries({
          queryKey: ['orderDetails'],
          type: 'active'
        }),
        queryClient.refetchQueries({
          queryKey: ['orders'],
          type: 'active'
        })
      ]);

      toggleConfirmModal();
      refetch();
    } else if (data?.data?.error) {
      notify({
        title: "Error!",
        text: data?.data?.error,
        type: "error",
      });
    }
  };

  useEffect(() => {
    if (singleOrder?.id) {
      getOrderDetails();
      // Prefill payment reference if order already has one
      if (singleOrder.paymentReference) {
        setReference(singleOrder.paymentReference);
      }
    }
  }, [singleOrder?.id]);
  return (
    <Modal
      isDismissable={false}
      size="4xl"
      isOpen={isOpenConfirmOrder}
      onOpenChange={() => {
        setScreen(1);
        setIsLoading(false);
        refetch();
        setSelectedPaymentMethod(0);
        toggleConfirmModal();
        setReference("");
        setOrder([]);
      }}
    >
      <ModalContent>
        {() => (
          <>
            {screen === 1 && (
              <>
                <ModalHeader className="flex flex-col mt-3 gap-1">
                  <div className="flex flex-row flex-wrap  justify-between">
                    <div>
                      <div className="text-[24px] leading-8 font-semibold">
                        <span className="text-black">
                          {singleOrder?.reference || 'Order'}
                        </span>
                      </div>
                      <p className="text-sm  text-grey600 xl:mb-8 w-full mb-4">
                        Confirm order before checkout
                      </p>
                    </div>
                    <div className="flex  gap-3">
                      <CustomButton
                        onClick={toggleConfirmModal}
                        className="py-2 px-4 mb-0 bg-white border border-primaryGrey"
                      >
                        Update order
                      </CustomButton>

                      <CustomButton
                        onClick={() => setScreen(2)}
                        className="py-2 px-4 mb-0 text-white"
                        backgroundColor="bg-primaryColor"
                      >
                        <div className="flex gap-2 items-center justify-center">
                          <p>
                            Checkout {formatPrice(singleOrder?.totalAmount || 0)}{" "}
                          </p>
                          <HiArrowLongLeft className="text-[22px] rotate-180" />
                        </div>
                      </CustomButton>
                    </div>
                  </div>
                  <Divider className="bg-primaryGrey" />
                </ModalHeader>
                <ModalBody>
                  <div className="flex lg:flex-row flex-col gap-3 mb-4">
                    <div className="lg:w-[60%] max-h-[300px] overflow-y-scroll  w-full rounded-lg border border-[#E4E7EC80] p-2 ">
                      {order.length === 0 ? (
                        <div className={`grid h-full place-content-center`}>
                          <Spinner />
                          <p className="text-center mt-1 text-[14px] text-grey400">
                            Fetching order details...
                          </p>
                        </div>
                      ) : (
                        <>
                          {order?.orderDetails?.map((item: any, index: number) => {
                            return (
                              <>
                                <div
                                  key={item.id}
                                  className="flex justify-between"
                                >
                                  <div className="w-[250px] rounded-lg text-black  flex">
                                    <div
                                      className={`grid place-content-center`}
                                    >
                                      <Image
                                        src={
                                          item?.image
                                            ? `data:image/jpeg;base64,${item?.image}`
                                            : noImage
                                        }
                                        width={60}
                                        height={60}
                                        className={
                                          "bg-cover h-[60px] rounded-lg w-[60px]"
                                        }
                                        aria-label="uploaded image"
                                        alt="uploaded image(s)"
                                      />
                                    </div>
                                    <div className="p-3 flex  flex-col text-sm justify-center">
                                      <p className="font-[600]">
                                        {item.menuName}
                                      </p>
                                      <Spacer y={2} />
                                      <p className="text-grey600">
                                        {item.itemName}{" "}
                                        <span className="text-black">
                                          {item.unit && `(${item.unit})`}
                                        </span>
                                      </p>

                                      <p className="">{item.iquantity}</p>
                                    </div>
                                  </div>
                                  <div className="text-black flex items-center text-[12px]">
                                    <span>QTY:</span>
                                    <span className="font-[600]">
                                      {" "}
                                      {item.quantity}
                                    </span>
                                  </div>
                                  <div className="text-black w-[150px] grid place-content-center">
                                    <h3 className="font-[600]">
                                      {formatPrice(item?.unitPrice)}
                                    </h3>
                                  </div>
                                </div>
                                {index !== order?.orderDetails?.length - 1 && (
                                  <Divider className="bg-primaryGrey" />
                                )}
                              </>
                            );
                          })}
                        </>
                      )}
                    </div>
                    <div className="flex-grow bg-[#F7F6FA] z-10 rounded-lg p-4">
                      <div className="flex justify-between items-center">
                        <div className="text-sm">
                          <p className="font-[600] text-black">
                            {singleOrder?.placedByName || 'Customer'}
                          </p>
                          <p className="text-grey500">
                            {singleOrder?.placedByPhoneNumber || ''}
                          </p>
                        </div>
                        <div>
                          <span className="rounded-full text-sm px-4 py-2 bg-[#EAE5FF] text-primaryColor">
                            {singleOrder?.qrReference || 'N/A'}
                          </span>
                        </div>
                      </div>
                      <Spacer y={5} />
                      <div className="text-sm">
                        <p className="font-[600] text-black">Comment</p>
                        <p className="text-grey500">
                          {singleOrder?.comment
                            ? singleOrder.comment
                            : "no comment"}
                        </p>
                      </div>
                    </div>
                  </div>
                </ModalBody>
              </>
            )}
            {screen === 2 && (
              <div className="p-5">
                <div>
                  <div className=" text-[18px] leading-8 font-semibold">
                    <span className="text-black">Select payment method</span>
                  </div>
                  <p className="text-sm  text-primaryColor xl:mb-8 w-full mb-4">
                    {formatPrice(singleOrder?.totalAmount || 0)}
                  </p>
                </div>
                <div className="flex flex-col gap-1 text-black">
                  {paymentMethods.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => handleClick(item.id)}
                      className={`flex  cursor-pointer items-center gap-2 p-4 rounded-lg justify-between  ${
                        selectedPaymentMethod === item.id
                          ? "bg-[#EAE5FF80]"
                          : ""
                      } `}
                    >
                      <div>
                        <p className="font-semibold">{item.text}</p>
                        <p className="text-sm text-grey500">{item.subText}</p>
                      </div>
                      <MdKeyboardArrowRight />
                    </div>
                  ))}
                </div>
              </div>
            )}
            {screen === 3 && (
              <>
                <div
                  onClick={() => setScreen(2)}
                  className={`p-4 cursor-pointer text-black flex items-center`}
                >
                  <IoIosArrowRoundBack className="text-2xl" />
                  <span className="text-sm ">Back</span>
                </div>
                <div className="px-5 pb-5">
                  <div>
                    <div className=" text-[18px] leading-8 font-semibold">
                      <span className="text-black">Confirm payment</span>
                    </div>
                    <p className="text-sm  text-grey500 xl:mb-8 w-full mb-4">
                      confirm that customer has paid for order
                    </p>
                  </div>
                  <div
                    className={`flex items-center gap-2 p-4 rounded-lg justify-between bg-[#EAE5FF80]`}
                  >
                    <div>
                      <p className="text-sm text-grey500">TOTAL ORDER</p>
                      <p className="font-bold text-black text-[20px]">
                        {" "}
                        {formatPrice(singleOrder?.totalAmount || 0)}
                      </p>
                    </div>
                    <MdKeyboardArrowRight />
                  </div>
                  <Spacer y={4} />
                  <CustomInput
                    type="text"
                    // defaultValue={menuItem?.itemName}
                    value={reference}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setReference(e.target.value)}
                    name="itemName"
                    label="Enter ref (optional)"
                    placeholder="Optional payment reference"
                  />
                  <Spacer y={5} />
                  <div className="flex gap-5">
                    <CustomButton
                      onClick={toggleConfirmModal}
                      className="bg-white h-[50px] w-full border border-primaryGrey"
                    >
                      Cancel
                    </CustomButton>
                    <CustomButton
                      loading={isLoading}
                      disabled={isLoading}
                      onClick={finalizeOrder}
                      className="text-white w-full h-[50px]"
                    >
                      <div className="flex gap-2 items-center justify-center">
                        <p>{"Confirm payment"} </p>
                        <HiArrowLongLeft className="text-[22px] rotate-180" />
                      </div>
                    </CustomButton>
                  </div>
                </div>{" "}
              </>
            )}
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default ConfirmOrderModal;
