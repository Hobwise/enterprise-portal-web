import React, { useEffect, useState } from "react";
import { getOrder } from "@/app/api/controllers/dashboard/orders";
import { confirmPayment } from "@/app/api/controllers/dashboard/payment";
import { CustomInput } from "@/components/CustomInput";
import { CustomButton } from "@/components/customButton";
import Error from "@/components/error";
import usePermission from "@/hooks/cachedEndpoints/usePermission";
import { formatPrice, getJsonItemFromLocalStorage, notify } from "@/lib/utils";
import {
  Chip,
  Divider,
  Modal,
  ModalBody,
  ModalContent,
  Spacer,
  Spinner,
} from "@nextui-org/react";
import Image from "next/image";
import { HiArrowLongLeft } from "react-icons/hi2";
import noImage from "../../../../public/assets/images/no-image.svg";
import { paymentMethodMap } from "./data";
import { useQueryClient } from "@tanstack/react-query";
import { paymentsCacheUtils } from "@/hooks/cachedEndpoints/usePayment";
import { ordersCacheUtils } from "@/hooks/cachedEndpoints/useOrder";
import { IoReload } from "react-icons/io5";

const ApprovePayment = ({
  singlePayment,
  isOpen,
  toggleApproveModal,
  refetch,
}: any) => {
  const { userRolePermissions, role } = usePermission();
  const queryClient = useQueryClient();

  const [reference, setReference] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [order, setOrder] = useState([]);
  const [orderError, setOrderError] = useState<string | null>(null);
  const userData = getJsonItemFromLocalStorage("userInformation");
  const businessInformation = getJsonItemFromLocalStorage("business");

  const finalizeOrder = async () => {
    setIsLoading(true);

    const payload = {
      id: singlePayment.id,
      paymentReference: singlePayment.paymentReference,
      confirmedBy: `${userData.firstName} ${userData.lastName}`,
    };

    const data = await confirmPayment(
      businessInformation[0]?.businessId,
      payload
    );
    setIsLoading(false);

    if (data?.data?.isSuccessful) {
      // Show success notification
      notify({
        title: "Payment Confirmed!",
        text: "Payment has been successfully confirmed",
        type: "success",
      });

      // Clear all payment AND order caches to prevent stale data
      paymentsCacheUtils.clearAll(queryClient);
      ordersCacheUtils.clearAll(); // Clear globalOrdersCache Map

      // Invalidate all payment and order-related React Query caches with aggressive refetch
      await Promise.all([
        // Payment queries
        queryClient.invalidateQueries({
          queryKey: ["payments"],
          refetchType: "active",
        }),
        queryClient.invalidateQueries({
          queryKey: ["paymentCategories"],
          refetchType: "active",
        }),
        queryClient.invalidateQueries({
          queryKey: ["paymentDetails"],
          refetchType: "active",
        }),
        // Order queries - payment confirmation affects order status
        queryClient.invalidateQueries({
          queryKey: ["orders"],
          refetchType: "active",
        }),
        queryClient.invalidateQueries({
          queryKey: ["orderCategories"],
          refetchType: "active",
        }),
        queryClient.invalidateQueries({
          queryKey: ["orderDetails"],
          refetchType: "active",
        }),
      ]);

      // Force immediate refetch of all active queries
      await Promise.all([
        queryClient.refetchQueries({
          queryKey: ["payments"],
          type: "active",
        }),
        queryClient.refetchQueries({
          queryKey: ["paymentCategories"],
          type: "active",
        }),
        queryClient.refetchQueries({
          queryKey: ["paymentDetails"],
          type: "active",
        }),
        queryClient.refetchQueries({
          queryKey: ["orders"],
          type: "active",
        }),
        queryClient.refetchQueries({
          queryKey: ["orderCategories"],
          type: "active",
        }),
        queryClient.refetchQueries({
          queryKey: ["orderDetails"],
          type: "active",
        }),
      ]);

      // Close modal and refetch current page data
      toggleApproveModal();
      refetch();
    } else if (data?.data?.error) {
      notify({
        title: "Error!",
        text: data?.data?.error,
        type: "error",
      });
    }
  };

  const getOrderDetails = async () => {
    try {
      setOrderError(null);
      const data = await getOrder(singlePayment.orderID);

      if (data?.data?.isSuccessful) {
        setOrder(data?.data?.data);
        setOrderError(null);
      } else if (data?.data?.error) {
        const message = data?.data?.error || "Failed to fetch order details";
        setOrder([]);
        setOrderError(message);
      } else {
        setOrder([]);
        setOrderError("Failed to fetch order details");
      }
    } catch (err: any) {
      setOrder([]);
      setOrderError(
        err?.message ||
          "An unexpected error occurred while fetching order details."
      );
    }
  };

  useEffect(() => {
    if (singlePayment?.orderID) {
      getOrderDetails();
    }
  }, [singlePayment?.orderID]);

  return (
    <>
      <Modal
        isDismissable={false}
        size="5xl"
        isOpen={isOpen}
        onOpenChange={() => {
          setOrder([]);
          toggleApproveModal();
        }}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalBody className="flex justify-center">
                <div className="p-5">
                  <div className="flex flex-row flex-wrap  justify-between">
                    <div>
                      <h2 className="text-[18px] text-black leading-8 font-semibold">
                        Order ID: {singlePayment.reference}
                      </h2>

                      <Chip
                        classNames={{
                          base: ` text-xs h-7 font-[600] w-5 bg-[#EAE5FF] text-primaryColor`,
                        }}
                      >
                        {singlePayment.qrName}
                      </Chip>
                    </div>
                    <div
                      className={`${
                        order?.length === 0 ? "hidden" : "block"
                      } md:w-[15rem] w-full`}
                    >
                      <div className="flex item-center  text-xs text-black font-bold justify-between">
                        <p>Subtotal</p>
                        <h2>{formatPrice(order.subTotalAmount)}</h2>
                      </div>
                      <div className="flex item-center  text-xs text-black font-bold justify-between">
                        <p>
                          VAT (
                          {(
                            (order.vatAmount /
                              (order.totalAmount - order.vatAmount)) *
                            100
                          ).toFixed(2)}
                          %)
                        </p>
                        <h2>{formatPrice(order.vatAmount)}</h2>
                      </div>

                      <div
                        className={`
                          ${order.additionalCost ? "flex" : "hidden"} 
                        flex item-center justify-between  text-xs text-black font-bold`}
                      >
                        <p>{order.additionalCostName || "Additional Cost"}</p>
                        <h2>{formatPrice(order.additionalCost)}</h2>
                      </div>
                      <div className="flex item-center font-bold   text-black justify-between">
                        <p>Total</p>
                        <h2>{formatPrice(order.totalAmount)}</h2>
                      </div>
                    </div>
                  </div>

                  <Spacer y={5} />
                  <div className="flex gap-6">
                    <div className="overflow-y-scroll grid place-content-center max-h-[305px] w-[60%] rounded-lg border border-[#E4E7EC80] p-2 ">
                      {orderError ? (
                        <div className="flex flex-col  justify-center items-center text-black  max-w-md mx-auto">
                          <Image
                            src={noImage}
                            width={20}
                            height={20}
                            className={`object-cover rounded-lg w-12  h-12`}
                            aria-label="uploaded image"
                            alt="uploaded image(s)"
                          />
                          <Spacer y={2} />
                          <p className="font-[600] text-sm text-center">
                            Something went wrong!
                          </p>
                          <Spacer y={2} />
                          <p className="text-xs text-gray-600 text-center">
                            {orderError}
                          </p>
                          <Spacer y={2} />
                          <button
                            onClick={getOrderDetails}
                            className="bg-white border px-4 py-2 border-primaryColor rounded-full text-primaryColor"
                          >
                            <div className="flex text-xs items-center gap-2">
                              <p>Retry</p>
                              <IoReload />
                            </div>
                          </button>
                        </div>
                      ) : order?.length === 0 ? (
                        <div className={`grid h-full place-content-center`}>
                          <Spinner />
                          <p className="text-center mt-1 text-[14px] text-grey400">
                            Fetching order details...
                          </p>
                        </div>
                      ) : (
                        <>
                          {order?.orderDetails?.map((item, index) => {
                            return (
                              <React.Fragment key={item.id}>
                                <div className="flex justify-between">
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

                                      <p className="text-sm">
                                        {item.iquantity}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="text-black flex items-center text-[12px]">
                                    <span>QTY: </span>
                                    <span className="font-[600]">
                                      {"  "}
                                      {item.quantity}
                                    </span>
                                  </div>
                                  <div className="text-black w-[150px] grid place-content-center">
                                    <div className="font-bold  text-end">
                                      <p>{formatPrice(item.unitPrice)}</p>

                                      <p
                                        className={` ${
                                          item.packingCost ? "block" : "hidden"
                                        } text-xs text-grey500 font-normal`}
                                      >
                                        Pack cost:{" "}
                                        {formatPrice(item.packingCost)}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                                {index !== order?.orderDetails?.length - 1 && (
                                  <Divider className="bg-primaryGrey" />
                                )}
                              </React.Fragment>
                            );
                          })}
                        </>
                      )}
                    </div>
                    <div className="flex-grow">
                      <CustomInput
                        type="text"
                        value={paymentMethodMap[singlePayment.paymentMethod]}
                        disabled={true}
                        label="Channel"
                        placeholder="Channel"
                      />

                      <Spacer y={3} />
                      <CustomInput
                        type="text"
                        value={singlePayment.treatedBy}
                        disabled={true}
                        label="Staff"
                        placeholder="Staff"
                      />

                      <Spacer y={3} />
                      {(role === 0 ||
                        userRolePermissions?.canEditPayment === true) &&
                        singlePayment.status === 0 && (
                          <>
                            <CustomInput
                              type="text"
                              disabled={singlePayment.reference ? true : false}
                              value={singlePayment?.reference || reference}
                              onChange={(e) => setReference(e.target.value)}
                              name="itemName"
                              label="Enter ref"
                              placeholder="Provide payment reference"
                            />

                            <Spacer y={5} />

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
                          </>
                        )}
                    </div>
                  </div>
                </div>
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};

export default ApprovePayment;
