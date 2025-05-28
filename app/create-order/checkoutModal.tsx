'use client';
import {
  createUserOrder,
  editUserOrder,
  getOrderByRef,
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
import React, { useEffect, useState } from 'react';
import { FaMinus, FaPlus, FaClock, FaGift } from "react-icons/fa6";
import { HiArrowLongLeft } from "react-icons/hi2";
import { toast } from "sonner";
import noImage from "../../public/assets/images/no-image.svg";
import { FaCheckCircle } from "react-icons/fa";

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

const CountdownTimer = ({
  targetTime,
  placedByName,
}: {
  targetTime: string;
  placedByName: string;
}) => {
  const [timeLeft, setTimeLeft] = useState<string>("");
  const [hasPlayedSound, setHasPlayedSound] = useState(false);
  const [hasRequestedPermission, setHasRequestedPermission] = useState(false);

  useEffect(() => {
    if (!hasRequestedPermission) {
      if ("Notification" in window) {
        Notification.requestPermission().then((permission) => {
          if (permission === "granted") {
            if ("serviceWorker" in navigator) {
              navigator.serviceWorker
                .register("../../lib/sw.js")
                .then((registration) => {
                  console.log("Service Worker registered");
                })
                .catch((error) => {
                  console.log("Service Worker registration failed:", error);
                });
            }
          }
        });
        setHasRequestedPermission(true);
      }
    }
  }, [hasRequestedPermission]);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const target = new Date(targetTime).getTime();
      const now = new Date().getTime();
      const difference = target - now;

      if (difference <= 0) {
        if (!hasPlayedSound) {
          const audio = new Audio("/assets/sounds/notification-sound.wav");
          audio.play().catch((error) => {
            console.log("Error playing sound:", error);
          });

          if (
            "Notification" in window &&
            Notification.permission === "granted"
          ) {
            const notification = new Notification(`Order Ready!`, {
              body: `${placedByName}, your order should be ready. Please check with our staff`,
              requireInteraction: true,
            });

            notification.onclick = function () {
              window.focus();
              this.close();
            };
          }

          setHasPlayedSound(true);
        }
        setTimeLeft("Your order should be ready. Please check with our staff");
        return;
      }

      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      const timeDisplay =
        minutes > 0 ? `${minutes} mins ${seconds} secs` : `${seconds} secs`;

      setTimeLeft(`We are preparing your order, ready in ${timeDisplay}`);
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [targetTime, hasPlayedSound]);

  return <div>{timeLeft}</div>;
};

const OrderStepper = ({
  status,
  countdown,
  placedByName,
}: {
  status: "placed" | "processing" | "ready";
  countdown?: string;
  placedByName: string;
}) => {
  // Step data for easier mapping
  const steps = [
    {
      key: "placed",
      icon: <FaCheckCircle className="text-white" />,
      label: "Order Placed",
      desc: "We have received your order.",
    },
    {
      key: "processing",
      icon: <FaClock className="text-white" />,
      label: "Order Processing",
      desc:
        status === "processing" && countdown ? (
          <CountdownTimer targetTime={countdown} placedByName={placedByName} />
        ) : (
          "We are preparing your order."
        ),
    },
    {
      key: "ready",
      icon: <FaGift className="text-white" />,
      label: "Ready to Pickup",
      desc: "Your order is ready for pickup.",
    },
  ];

  return (
    <div className="flex flex-col gap-0 my-6 px-4 relative">
      {steps.map((step, idx) => (
        <div
          key={step.key}
          className="flex items-center gap-4 relative min-h-[56px]"
        >
          {/* Vertical line: only show for all but last step */}
          {idx < steps.length - 1 && (
            <div className="absolute left-2.5 top-7 h-full flex justify-center z-0">
              <div
                className="w-1 h-full bg-gray-300 mx-auto"
                style={{ minHeight: 32 }}
              />
            </div>
          )}
          {/* Step icon */}
          <div
            className={`rounded-full w-6 h-6 flex items-center justify-center z-10 ${
              status === step.key ? "bg-success-700" : "bg-gray-300"
            }`}
          >
            {step.icon}
          </div>
          {/* Step label and description */}
          <div
            className={
              status === step.key ? "text-success-700" : "text-gray-500"
            }
          >
            <div className="font-bold text-md">{step.label}</div>
            <div className="text-xs">{step.desc}</div>
          </div>
        </div>
      ))}
    </div>
  );
};

const CheckoutModal = ({
  isOpen,
  onOpenChange,
  selectedItems,
  totalPrice,
  handleDecrement,
  handleIncrement,
  selectedMenu,
  closeModal = false,
  setSelectedItems,
  businessId,
  cooperateID,
  qrId,
  handlePackingCost,
}: any) => {
  const businessInformation = getJsonItemFromLocalStorage("business");
  const [costInfo, setCostInfo] = useState<any>({});
  // const additionalCost = 0;

  const [response, setResponse] = useState(null);
  const [orderId, setOrderId] = useState<string>("");
  const [orderReference, setOrderReference] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [order, setOrder] = useState<Order>({
    placedByName: "",
    placedByPhoneNumber: "",
    comment: "",
  });

  const [originalOrderDetails, setOriginalOrderDetails] = useState<any[]>([]);

  const [estimatedCompletionTime, setEstimatedCompletionTime] =
    useState<string>("");

  const [orderStatus, setOrderStatus] = useState<
    "placed" | "processing" | "ready"
  >("placed");

  const hasOrderChanged = () => {
    if (originalOrderDetails.length === 0) return false;

    if (selectedItems.length !== originalOrderDetails.length) return true;

    return selectedItems.some((item: any) => {
      const originalItem = originalOrderDetails.find(
        (orig: any) => orig.id === item.id
      );
      if (!originalItem) return true;

      return (
        item.count !== originalItem.count ||
        item.isPacked !== originalItem.isPacked ||
        item.price !== originalItem.price
      );
    });
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setResponse(null);
    const { name, value } = event.target;
    if (name === "placedByPhoneNumber") {
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
  const [loadingCostInfo, setLoadingCostInfo] = useState(false);
  const getOrderDetails = async () => {
    const id = businessId ? businessId : businessInformation[0]?.businessId;
    setLoadingCostInfo(true);

    const data = await getOrderByRef(orderReference, id, cooperateID);
    setLoadingCostInfo(false);

    if (data?.data?.isSuccessful) {
      setCostInfo(data?.data?.data);
      setEstimatedCompletionTime(data?.data?.data?.estimatedCompletionTime);
    }
  };

  const [changeTitle, setChangeTitle] = useState(false);
  const finalTotal =
    totalPrice + totalPrice * (7.5 / 100) + (costInfo?.additionalCost || 0);

  const placeOrder = async () => {
    setLoading(true);
    const transformedArray = selectedItems.map((item: any) => ({
      itemId: item.id,
      quantity: item.count,
      unitPrice: item.price,
      isVariety: item.isVariety,
      isPacked: item.isPacked,
    }));
    const payload = {
      status: 0,
      placedByName: order.placedByName,
      placedByPhoneNumber: order.placedByPhoneNumber,
      quickResponseID: qrId,
      comment: order.comment,
      totalAmount: Math.round(finalTotal * 100) / 100,
      orderDetails: transformedArray,
    };
    console.log(qrId, "qrId");
    const id = businessId ? businessId : businessInformation[0]?.businessId;
    const data = await createUserOrder(id, payload, cooperateID);
    setResponse(data);
    setLoading(false);
    if (data?.data?.isSuccessful) {
      setOrderId(data.data.data.id);
      setCostInfo(data.data.data);
      setOrderReference(data.data.data.reference);
      setEstimatedCompletionTime(data.data.data.estimatedCompletionTime);
      getOrderDetails();
      toast.success("Order placed");
      closeModal === true && setChangeTitle(true);
      setOriginalOrderDetails([...selectedItems]);

      setOrder({
        ...order,
        comment: "",
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
      isPacked: item.isPacked,
    }));
    const payload = {
      status: 0,
      placedByName: order.placedByName,
      placedByPhoneNumber: order.placedByPhoneNumber,
      quickResponseID: qrId,
      comment: order.comment,
      totalAmount: Math.round(finalTotal * 100) / 100,
      orderDetails: transformedArray,
    };

    const data = await editUserOrder(orderId, payload);
    setResponse(data);

    setLoading(false);
    if (data?.data?.isSuccessful) {
      setOrderId(data.data.data.id);
      setOrderReference(data.data.data.reference);
      setEstimatedCompletionTime(data.data.data.estimatedCompletionTime);
      getOrderDetails();
      setCostInfo(data.data.data);
      toast.success("Order updated");
    } else if (data?.data?.error) {
      toast.error(data?.data?.error);
    }
  };

  useEffect(() => {
    if (changeTitle && estimatedCompletionTime) {
      const now = new Date().getTime();
      const target = new Date(estimatedCompletionTime).getTime();
      if (target - now > 0) {
        setOrderStatus("processing");
      } else {
        setOrderStatus("ready");
      }
    }
  }, [changeTitle, estimatedCompletionTime]);

  useEffect(() => {
    if (orderStatus === "processing" && estimatedCompletionTime) {
      const interval = setInterval(() => {
        const now = new Date().getTime();
        const target = new Date(estimatedCompletionTime).getTime();
        if (target - now <= 0) {
          setOrderStatus("ready");
          clearInterval(interval);
        }
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [orderStatus, estimatedCompletionTime]);
  const itemIsPacked = (itemId: string) =>
    selectedItems.find((item: any) => item.id === itemId)?.isPacked;
  return (
    <div className="">
      <Modal
        hideCloseButton={true}
        isKeyboardDismissDisabled={true}
        classNames={{
          base: `${changeTitle ? "h-full" : "max-h-full"} overflow-scroll`,
          // base: `md:overflow-none overflow-scroll ${
          //   changeTitle ? 'h-full' : 'h-screen'
          // }`,
          body: "px-1 md:px-6",
          header: "px-3 md:px-6",
        }}
        isDismissable={false}
        size={"4xl"}
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
                      <div className="flex justify-between w-full items-center">
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
                        <div className="flex flex-col items-end gap-2">
                          <CustomButton
                            loading={loadingCostInfo}
                            disabled={loadingCostInfo}
                            onClick={getOrderDetails}
                            className="py-2 px-4 h-[50px] mb-0 bg-gray-100 border border-primaryGrey"
                          >
                            Refresh Cost
                          </CustomButton>
                        </div>
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
                        className={`flex flex-col lg:w-[60%]   w-full  px-2`}
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
                                      {item.itemName}{" "}
                                      <span className="text-black">
                                        {item.unit && `(${item.unit})`}
                                      </span>
                                    </p>

                                    <Spacer y={1} />
                                    <p className="text-grey600">
                                      {item.menuName}
                                    </p>
                                    <Checkbox
                                      size="sm"
                                      defaultSelected={item.isPacked}
                                      isSelected={item.isPacked}
                                      onValueChange={(isSelected) =>
                                        handlePackingCost(item.id, isSelected)
                                      }
                                    >
                                      <span className="text-grey600 text-sm">
                                        Pack In
                                      </span>
                                    </Checkbox>
                                    <span
                                      className={cn(
                                        "text-xs text-gray-200",
                                        itemIsPacked(item.id) &&
                                          "font-bold text-black"
                                      )}
                                    >
                                      {formatPrice(selectedMenu.packingCost)}
                                    </span>
                                    <Spacer y={1} />
                                    <div className="text-black md:w-[150px] md:hidden w-auto grid">
                                      <h3 className="font-[600]">
                                        Price: {formatPrice(item?.price)}
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
                                        "text-xs text-gray-200",
                                        item.isPacked && "font-bold text-black"
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
                            <div className="flex gap-2 justify-between">
                              <p className="text-black font-bold">Subtotal: </p>
                              <p className="text-black">
                                {formatPrice(totalPrice)}
                              </p>
                            </div>
                            <div className="flex justify-between gap-2">
                              <p className="text-black font-bold">Vat(7.5%):</p>

                              <p className="text-black">
                                {formatPrice(totalPrice * (7.5 / 100))}
                              </p>
                            </div>
                            {costInfo?.additionalCost && (
                              <>
                                <div className="flex gap-2 justify-between">
                                  <p className="text-black font-bold">
                                    {costInfo?.additionalCostName}:{" "}
                                  </p>
                                  <p className="text-black">
                                    {formatPrice(costInfo?.additionalCost || 0)}
                                  </p>
                                </div>
                                <div className="flex gap-2 justify-between">
                                  <p className="text-black font-bold">
                                    Total Amount:
                                  </p>
                                  <p className="text-black">
                                    {formatPrice(finalTotal)}
                                  </p>
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      {changeTitle && (
                        <OrderStepper
                          status={orderStatus}
                          countdown={estimatedCompletionTime}
                          placedByName={order.placedByName}
                        />
                      )}
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
                            disabled={loading || !hasOrderChanged()}
                            onClick={updateOrder}
                            className={`py-2 px-4 h-[50px] ${
                              !hasOrderChanged()
                                ? "text-gray-300"
                                : "text-white"
                            } mb-0 bg-primaryColor`}
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
                                  {" "}
                                  {formatPrice(finalTotal)}{" "}
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
      </Modal>{" "}
    </div>
  );
};

export default CheckoutModal;
