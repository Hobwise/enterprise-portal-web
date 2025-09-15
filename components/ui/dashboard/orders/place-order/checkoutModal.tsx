"use client";
import {
  completeOrder,
  createOrder,
  editOrder,
} from "@/app/api/controllers/dashboard/orders";
import { getQRByBusiness } from "@/app/api/controllers/dashboard/quickResponse";
import { CustomInput } from "@/components/CustomInput";
import { CustomButton } from "@/components/customButton";
import { CustomTextArea } from "@/components/customTextArea";
import SelectInput from "@/components/selectInput";
import {
  cn,
  formatPrice,
  getJsonItemFromLocalStorage,
  notify,
} from "@/lib/utils";
import { useQueryClient } from '@tanstack/react-query';
import {
  Button,
  Checkbox,
  Divider,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  Spacer,
} from "@nextui-org/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { FaMinus, FaPlus } from "react-icons/fa6";
import { HiArrowLongLeft } from "react-icons/hi2";
import { IoIosArrowRoundBack } from "react-icons/io";
import { MdKeyboardArrowRight } from "react-icons/md";
import noImage from "../../../../../public/assets/images/no-image.svg";

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

interface ApiResponse {
  data?: {
    isSuccessful: boolean;
    data?: {
      id: string;
    };
    error?: string;
  };
  errors?: {
    placedByName?: string[];
    placedByPhoneNumber?: string[];
    quickResponseID?: string[];
  };
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

  businessId,
  cooperateID,
  handlePackingCost,
}: any) => {
  
  const businessInformation = getJsonItemFromLocalStorage("business");
  const userInformation = getJsonItemFromLocalStorage("userInformation");
  const router = useRouter();
  const queryClient = useQueryClient();
  const [response, setResponse] = useState<ApiResponse | null>(null);
  const [orderId, setOrderId] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [reference, setReference] = useState("");
  const [screen, setScreen] = useState(1);

  const [qr, setQr] = useState([]);
  const [order, setOrder] = useState<Order>({
    placedByName: orderDetails?.placedByName || "",
    placedByPhoneNumber: orderDetails?.placedByPhoneNumber || "",
    quickResponseID: orderDetails?.quickResponseID || "",
    comment: orderDetails?.comment || "",
  });

  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(0);
  const [additionalCost, setAdditionalCost] = useState(0);
  const [additionalCostName, setAdditionalCostName] = useState("");

  useEffect(() => {
    if (orderDetails) {
      setAdditionalCost(orderDetails.additionalCost);
      setAdditionalCostName(orderDetails.additionalCostName);
    }
  }, [orderDetails]);

  const handleClick = (methodId: number) => {
    if (methodId === 3) {
      router.push("/dashboard/orders");
    } else if(screen === 3){
      router.push("/dashboard/orders");
    } 
    else {
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

  const finalTotalPrice =
    totalPrice + totalPrice * (7.5 / 100) + (additionalCost || 0);

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

  const placeOrder = async () => {
    setLoading(true);
    const transformedArray = selectedItems.map((item: any) => ({
      itemId: item.id,
      quantity: item.count,
      unitPrice: item.price,
      isVariety: item.isVariety,
      isPacked: item.isPacked,
      packingCost: item?.packingCost,
    }));
    const payload = {
      status: 0,
      placedByName: order.placedByName,
      placedByPhoneNumber: order.placedByPhoneNumber,
      quickResponseID: order.quickResponseID,
      comment: order.comment,
      additionalCost,
      additionalCostName,
      totalAmount: Math.round(finalTotalPrice * 100) / 100,
      orderDetails: transformedArray,
    };
    const id = businessId ? businessId : businessInformation[0]?.businessId;
    const data = await createOrder(id, payload, cooperateID);
    setResponse(data as ApiResponse);
    setLoading(false);
    if (data?.data?.isSuccessful) {
      setOrderId(data.data.data.id);
      notify({
        title: "Success!",
        text: "Order placed",
        type: "success",
      });
      await queryClient.invalidateQueries({ queryKey: ['orderCategories'] });
      await queryClient.invalidateQueries({ queryKey: ['orderDetails'] });
      setScreen(2);
    } else if (data?.data?.error) {
      notify({
        title: "Error!",
        text: data?.data?.error,
        type: "error",
      });
    }
  };
  const updateOrder = async () => {
    setLoading(true);
    const transformedArray = selectedItems.map((item: any) => ({
      itemId: item.id,
      quantity: item.count,
      unitPrice: item.price,
      isVariety: item.isVariety,
      isPacked: item.isPacked,
      packingCost: item.packingCost || 0,
    }));
    const payload = {
      status: 0,
      placedByName: order.placedByName,
      placedByPhoneNumber: order.placedByPhoneNumber,
      quickResponseID: order.quickResponseID,
      comment: order.comment,
      totalAmount: Math.round(finalTotalPrice * 100) / 100,
      additionalCost,
      additionalCostName,
      orderDetails: transformedArray,
    };
    const data = await editOrder(id, payload);
    setResponse(data as ApiResponse);
    setLoading(false);
    if (data?.data?.isSuccessful) {
      setOrderId(data.data.data.id);
      notify({
        title: "Success!",
        text: "Order placed",
        type: "success",
      });
      await queryClient.invalidateQueries({ queryKey: ['orderCategories'] });
      await queryClient.invalidateQueries({ queryKey: ['orderDetails'] });
      setScreen(2);
    } else if (data?.data?.error) {
      notify({
        title: "Error!",
        text: data?.data?.error,
        type: "error",
      });
    }
  };

  const finalizeOrder = async () => {
    setIsLoading(true);
    const payload = {
      treatedBy: `${userInformation?.firstName} ${userInformation?.lastName}`,
      treatedById: userInformation.id,
      paymentMethod: selectedPaymentMethod,
      paymentReference: reference,
      status: 1,
    };

    const data = await completeOrder(payload, orderId);
    setIsLoading(false);

    if (data?.data?.isSuccessful) {
      notify({
        title: "Payment made!",
        text: "Payment has been made, awaiting confirmation",
        type: "success",
      });
      await queryClient.invalidateQueries({ queryKey: ['orderCategories'] });
      await queryClient.invalidateQueries({ queryKey: ['orderDetails'] });
      router.push("/dashboard/orders");
    } else if (data?.data?.error) {
      notify({
        title: "Error!",
        text: data?.data?.error,
        type: "error",
      });
    }
  };

  const getQrID = async () => {
    const id = businessId ? businessId : businessInformation[0]?.businessId;

    const data = await getQRByBusiness(id, cooperateID);

    if (data?.data?.isSuccessful) {
      let response = data?.data?.data;
      const newData = response.map((item: any) => ({
        ...item,
        label: item.name,
        value: item.id,
      }));

      // Sort alphabetically by label/name
      const sortedData = newData.sort((a: any, b: any) => a.label.localeCompare(b.label));
      setQr(sortedData);
    } else if (data?.data?.error) {
    }
  };

  useEffect(() => {
    setOrder({
      placedByName: orderDetails?.placedByName || "",
      placedByPhoneNumber: orderDetails?.placedByPhoneNumber || "",
      quickResponseID: orderDetails?.quickResponseID || "",
      comment: orderDetails?.comment || "",
    });
  }, [orderDetails]);

  useEffect(() => {
    getQrID();
  }, []);

  return (
    <div className="">
      <Modal
        classNames={{
          base: screen === 1
            ? "md:overflow-none overflow-scroll h-full md:h-auto max-w-[90vw] lg:max-w-[80vw] xl:max-w-[1200px]"
            : "md:overflow-none overflow-scroll h-full md:h-auto max-w-[90vw] md:max-w-[500px]",
          body: "px-1 md:px-6",
          header: "px-3 md:px-6",
        }}
        isDismissable={false}
        hideCloseButton={true}
        size={screen === 1 ? "5xl" : "md"}
        isOpen={isOpen}
        onOpenChange={() => {
          setScreen(1);
          onOpenChange();
          setReference("");
          setIsLoading(false);
          setSelectedPaymentMethod(0);
          setOrder({
            placedByName: orderDetails?.placedByName || "",
            placedByPhoneNumber: orderDetails?.placedByPhoneNumber || "",
            quickResponseID: orderDetails?.quickResponseID || "",
            comment: orderDetails?.comment || "",
          });
          setAdditionalCost(orderDetails?.additionalCost || 0);
          setAdditionalCostName(orderDetails?.additionalCostName || "");
        }}
      >
        <ModalContent>
          {() => (
            <>
              {screen === 1 && (
                <>
                  <ModalHeader className="flex flex-col mt-5 gap-1">
                    <div className="flex flex-row flex-wrap  justify-between">
                      <div>
                        <div className="text-[24px] leading-8 font-semibold">
                          <span className="text-black">Confirm order</span>
                        </div>
                        <p className="text-sm  text-grey600 xl:mb-8 w-full mb-4">
                          Confirm order before checkout
                        </p>
                      </div>

                      <div className="gap-3 flex ">
                        <CustomButton
                          onClick={onOpenChange}
                          className="py-2 px-4 mb-0 bg-white border border-primaryGrey"
                        >
                          Close
                        </CustomButton>

                        <CustomButton
                          loading={loading}
                          disabled={loading}
                          onClick={id ? updateOrder : placeOrder}
                          className="py-2 px-4 mb-0 text-white"
                          backgroundColor="bg-primaryColor"
                        >
                          <div className="flex gap-2 items-center justify-center">
                            <p>Checkout {formatPrice(finalTotalPrice)} </p>
                            <HiArrowLongLeft className="text-[22px] rotate-180" />
                          </div>
                        </CustomButton>
                      </div>
                    </div>
                    <Divider className="bg-primaryGrey" />
                  </ModalHeader>
                  <ModalBody>
                    <div className="flex lg:flex-row flex-col gap-3 mb-4">
                      <div className="lg:w-[60%] max-h-[500px]  overflow-y-scroll w-full rounded-lg border border-[#E4E7EC80] p-2">
                        {selectedItems?.map((item: any, index: number) => {
                          return (
                            <>
                              <div
                                key={item.id}
                                className="flex justify-between gap-2"
                              >
                                <div className="py-3 w-[250px] rounded-lg  text-black  flex">
                                  <div className="h-[60px] w-[60px]">
                                    <Image
                                      src={
                                        item?.image
                                          ? `data:image/jpeg;base64,${item?.image}`
                                          : noImage
                                      }
                                      width={60}
                                      height={60}
                                      className="object-cover rounded-lg bg-cover h-[60px]"
                                      aria-label="uploaded image"
                                      alt="uploaded image(s)"
                                    />
                                  </div>

                                  <div className="px-3 flex  flex-col text-sm justify-center">
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
                                    <Spacer y={2} />
                                    <div className="text-black md:w-[150px] md:hidden w-auto grid place-content-end">
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
                                    size="sm"
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
                                    size="sm"
                                    variant="faded"
                                    className="border h-[35px] w-[30px] border-primaryGrey bg-white"
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
                            </>
                          );
                        })}
                        <div className="flex justify-end mt-auto">
                          <div className="flex flex-col gap-2">
                            <div className="flex justify-between">
                              <p className="text-black font-bold">Subtotal: </p>
                              <p className="text-black">
                                {formatPrice(totalPrice)}
                              </p>
                            </div>
                            <div className="flex justify-between">
                              <p className="text-black font-bold">
                                Vat (7.5%):{" "}
                              </p>
                              <p className="text-black">
                                {formatPrice(totalPrice * (7.5 / 100))}
                              </p>
                            </div>
                            <div className="flex items-center justify-between gap-2">
                              <p className="text-black font-bold">
                                Additional cost:{" "}
                              </p>
                              <div className="w-40">
                                <CustomInput
                                  type="number"
                                  size="sm"
                                  startContent={
                                    <span className="text-gray-500">₦</span>
                                  }
                                  onChange={(e: any) =>
                                    setAdditionalCost(+e.target.value)
                                  }
                                  value={String(additionalCost)}
                                  name="additionalCost"
                                  placeholder="Amount"
                                />
                              </div>
                            </div>
                            <div className="flex items-center justify-between  gap-2">
                              <p className="text-black font-bold">
                                Additional cost name:{" "}
                              </p>
                              <div className="w-40">
                                <CustomInput
                                  type="text"
                                  size="sm"
                                  onChange={(e: any) =>
                                    setAdditionalCostName(e.target.value)
                                  }
                                  value={additionalCostName}
                                  name="additionalCostName"
                                  placeholder="Enter cost name"
                                />
                              </div>
                            </div>
                            <div className="flex justify-between">
                              <p className="text-black font-bold">Total: </p>
                              <p className="text-black">
                                {formatPrice(finalTotalPrice)}
                              </p>
                            </div>
                            {/* <div className="flex gap-2">
                              <p className="text-black font-bold">
                                Additional cost:{' '}
                              </p>
                  
                            </div> */}
                          </div>
                        </div>
                      </div>
                      <div className="flex-grow bg-[#F7F6FA] z-10 rounded-lg p-4">
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

                        <SelectInput
                          errorMessage={response?.errors?.quickResponseID?.[0]}
                          label="Select a table"
                          placeholder="Select table"
                          name="quickResponseID"
                          selectedKeys={[order?.quickResponseID]}
                          onChange={handleInputChange}
                          value={order.quickResponseID}
                          contents={qr}
                        />
                        <Spacer y={2} />
                        <CustomTextArea
                          // defaultValue={menuItem?.itemDescription}
                          value={order.comment}
                          name="comment"
                          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                            setResponse(null);
                            setOrder((prevOrder) => ({
                              ...prevOrder,
                              comment: e.target.value,
                            }));
                          }}
                          label="Add comment"
                          placeholder="Add a comment to this order. (optional)"
                        />
                      </div>
                    </div>
                  </ModalBody>
                </>
              )}
              {screen === 2 && (
                <div className="p-5">
                  <div className="flex justify-between mt-3">
                    <div>
                      <div className=" text-[18px] leading-8 font-semibold">
                        <span className="text-black">
                          Select payment method
                        </span>
                      </div>
                      <p className="text-sm  text-primaryColor xl:mb-8 w-full mb-4">
                        {formatPrice(finalTotalPrice)}
                      </p>
                    </div>
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
                          {formatPrice(finalTotalPrice)}
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
                      label="Enter ref"
                      placeholder="Provide payment reference"
                    />
                    <Spacer y={5} />
                    <div className="flex md:flex-row flex-col gap-5">
                      <CustomButton
                        onClick={onOpenChange}
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
                  </div>
                </>
              )}
            </>
          )}
        </ModalContent>
      </Modal>{" "}
    </div>
  );
};

export default CheckoutModal;
