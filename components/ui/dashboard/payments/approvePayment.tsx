import React, { useEffect, useState } from "react";
import { getOrder } from "@/app/api/controllers/dashboard/orders";
import { confirmPayment } from "@/app/api/controllers/dashboard/payment";
import { CustomButton } from "@/components/customButton";
import usePermission from "@/hooks/cachedEndpoints/usePermission";
import { formatPrice, getJsonItemFromLocalStorage, notify } from "@/lib/utils";
import {
  Divider,
  Modal,
  ModalBody,
  ModalContent,
  Spinner,
} from "@nextui-org/react";
import Image from "next/image";
import { HiArrowLongRight } from "react-icons/hi2";
import noImage from "../../../../public/assets/images/no-image.svg";
import { paymentMethodMap, paymentTypeMap } from "./data";
import { useQueryClient } from "@tanstack/react-query";
import { paymentsCacheUtils } from "@/hooks/cachedEndpoints/usePayment";
import { ordersCacheUtils } from "@/hooks/cachedEndpoints/useOrder";
import { IoReload, IoChevronDown } from "react-icons/io5";
import moment from "moment";

interface OrderDetail {
  id: string;
  itemName: string;
  menuName: string;
  quantity: number;
  packingCost: number;
  unitPrice: number;
  unit: string;
  orderID: string;
  itemID: string;
  image: string;
  totalPrice: number;
  isVariety: boolean;
  isPacked: boolean;
}

interface OrderData {
  reference: string;
  placedByName: string;
  placedByPhoneNumber: string;
  treatedBy: string;
  additionalCostName: string;
  additionalCost: number;
  subTotalAmount: number;
  vatAmount: number;
  isVatApplied: boolean;
  totalAmount: number;
  paymentMethod: number;
  status: number;
  dateCreated: string;
  comment: string;
  quickResponseID: string;
  estimatedCompletionTime: string;
  amountPaid: number;
  amountRemaining: number;
  orderDetails: OrderDetail[];
}

const ApprovePayment = ({
  singlePayment,
  isOpen,
  toggleApproveModal,
  refetch,
}: any) => {
  const { userRolePermissions, role } = usePermission();
  const queryClient = useQueryClient();

  const [isLoading, setIsLoading] = useState(false);
  const [order, setOrder] = useState<any>([]);
  const [orderError, setOrderError] = useState<string | null>(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);

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

      // Close modal immediately for better UX
      toggleApproveModal();

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

      // Refetch current page data
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
      if (!singlePayment?.orderID) {
        setOrderError("No Order ID provided");
        return;
      }

      const businessId = businessInformation?.[0]?.businessId;
      const cooperateId = businessInformation?.[0]?.cooperateID;

      // Use getOrder which calls /api/v1/Order (DASHBOARD.order)
      // Passing businessId and cooperateId as requested
      const data = await getOrder(
        singlePayment.orderID,
        businessId,
        cooperateId
      );

      if (data?.data?.isSuccessful) {
        const orderData = data?.data?.data || {};

        // Calculate amountPaid and amountRemaining if API returns 0 or undefined
        const calculatedAmountPaid = orderData.amountPaid || 0;
        const calculatedAmountRemaining =
          orderData.amountRemaining ?? orderData.totalAmount - calculatedAmountPaid;

        setOrder({
          ...orderData,
          amountPaid: calculatedAmountPaid,
          amountRemaining: calculatedAmountRemaining,
        });
        setOrderError(null);
      } else if (data?.data?.error) {
        const message = data?.data?.error || "Failed to fetch order details";
        setOrder({});
        setOrderError(message);
      } else {
        setOrder({});
        setOrderError("Failed to fetch order details");
      }
    } catch (err: any) {
      setOrder({});
      setOrderError(
        err?.message ||
          "An unexpected error occurred while fetching order details."
      );
    }
  };

  useEffect(() => {
    if (showOrderDetails && Array.isArray(order) && order.length === 0) {
      getOrderDetails();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showOrderDetails, singlePayment?.orderID]);

  // Scroll detection logic
  const [canScrollDown, setCanScrollDown] = useState(false);
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);

  const checkScroll = () => {
    const container = scrollContainerRef.current;
    if (container) {
      const { scrollTop, scrollHeight, clientHeight } = container;
      // Show indicator if there's more content below (with a small buffer)
      setCanScrollDown(scrollTop + clientHeight < scrollHeight - 5);
    }
  };

  useEffect(() => {
    if (showOrderDetails && order?.orderDetails?.length > 0) {
      // Small timeout to allow DOM to settle
      setTimeout(checkScroll, 100);
      // Also check on window resize just in case
      window.addEventListener("resize", checkScroll);
      return () => window.removeEventListener("resize", checkScroll);
    }
  }, [showOrderDetails, order]);

  useEffect(() => {
    if (singlePayment?.orderID) {
      getOrderDetails();
    } else {
      setOrderError("No Order ID associated with this payment.");
      setOrder({});
    }
  }, [singlePayment?.orderID]);

  const InfoRow = ({
    label,
    value,
    valueClassName = "text-textGrey",
  }: {
    label: string;
    value: string | React.ReactNode;
    valueClassName?: string;
  }) => (
    <div className="flex justify-between items-center py-1.5 text-sm">
      <span className="text-grey600 font-normal">{label}</span>
      <span className={`font-semibold ${valueClassName}`}>{value}</span>
    </div>
  );

  const isOrderLoading =
    Array.isArray(order) && order.length === 0 && !orderError;

  return (
    <Modal
      isDismissable={false}
      size="md"
      isOpen={isOpen}
      onOpenChange={() => {
        setOrder([]);
        setShowOrderDetails(false);
        setOrderError(null);
        toggleApproveModal();
      }}
    >
      <ModalContent className="p-4">
        {() => (
          <ModalBody>
            <div className="flex flex-col items-center w-full max-w-lg mx-auto">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Payment Summary
              </h2>

              <div className="w-full">
                <button
                  onClick={() => setShowOrderDetails(!showOrderDetails)}
                  className="text-primaryColor text-sm font-medium hover:underline mb-4 focus:outline-none"
                >
                  {showOrderDetails
                    ? "Hide order details"
                    : "View order details"}
                </button>

                {showOrderDetails ? (
                  <div className="relative">
                    <div
                      ref={scrollContainerRef}
                      onScroll={checkScroll}
                      className="overflow-y-auto max-h-[400px] border border-gray-200 rounded-lg p-4 mb-4 scroll-smooth"
                    >
                      {orderError ? (
                        <div className="flex flex-col justify-center items-center text-black py-4">
                          <Image
                            src={noImage}
                            width={40}
                            height={40}
                            className="object-cover rounded-lg opacity-50 mb-2"
                            alt="error"
                          />
                          <p className="text-sm font-semibold mb-2">
                            Something went wrong!
                          </p>
                          <p className="text-xs text-gray-500 mb-4">
                            {orderError}
                          </p>
                          <button
                            onClick={getOrderDetails}
                            className="flex items-center gap-2 px-4 py-2 text-primaryColor border border-primaryColor rounded-full text-xs hover:bg-gray-50 transition-colors"
                          >
                            <span>Retry</span>
                            <IoReload />
                          </button>
                        </div>
                      ) : isOrderLoading ? (
                        <div className="flex flex-col items-center justify-center py-8">
                          <Spinner size="lg" color="primary" />
                          <p className="text-sm text-gray-400 mt-4">
                            Fetching order details...
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-4 pb-2">
                          {order?.orderDetails?.map(
                            (item: any, index: number) => (
                              <React.Fragment key={item.id || index}>
                                <div className="flex justify-between items-start">
                                  <div className="flex gap-3">
                                    <div className="relative w-[50px] h-[50px] rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                                      <Image
                                        src={
                                          item?.image
                                            ? `data:image/jpeg;base64,${item?.image}`
                                            : noImage
                                        }
                                        fill
                                        className="object-cover"
                                        alt={item.itemName || "Item"}
                                      />
                                    </div>
                                    <div className="flex flex-col justify-center">
                                      <p className="text-sm font-semibold text-gray-900">
                                        {item.menuName}
                                      </p>
                                      <p className="text-xs text-gray-500">
                                        {item.itemName}
                                        {item.unit && (
                                          <span className="text-black ml-1">
                                            ({item.unit})
                                          </span>
                                        )}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-sm font-bold text-gray-900">
                                      {formatPrice(
                                        item.unitPrice * item.quantity +
                                          (item.isPacked
                                            ? item.packingCost * item.quantity
                                            : 0)
                                      )}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">
                                      {item.quantity} x{" "}
                                      {formatPrice(item.unitPrice)}
                                    </p>
                                    {item.packingCost > 0 && item.isPacked && (
                                      <p className="text-xs text-gray-500">
                                        + Pack: {formatPrice(item.packingCost)}
                                      </p>
                                    )}
                                  </div>
                                </div>
                                {index !== order?.orderDetails?.length - 1 && (
                                  <Divider className="bg-gray-100" />
                                )}
                              </React.Fragment>
                            )
                          )}

                          <div className="bg-gray-50 p-3 rounded-lg mt-4 space-y-2">
                            <div className="flex justify-between text-xs font-semibold text-gray-700">
                              <span>Subtotal</span>
                              <span>{formatPrice(order.subTotalAmount)}</span>
                            </div>
                            <div className="flex justify-between text-xs font-semibold text-gray-700">
                              <span>
                                VAT (
                                {(
                                  (order.vatAmount /
                                    (order.subTotalAmount || 1)) *
                                  100
                                ).toFixed(2)}
                                %)
                              </span>
                              <span>{formatPrice(order.vatAmount)}</span>
                            </div>
                            {order.additionalCost > 0 && (
                              <div className="flex justify-between text-xs font-semibold text-gray-700">
                                <span>
                                  {order.additionalCostName ||
                                    "Additional Cost"}
                                </span>
                                <span>{formatPrice(order.additionalCost)}</span>
                              </div>
                            )}
                            <Divider className="my-1" />
                            <div className="flex justify-between text-sm font-bold text-gray-900">
                              <span>Total</span>
                              <span>{formatPrice(order.totalAmount)}</span>
                            </div>
                            <div className="flex justify-between text-xs font-semibold text-green-700 mt-1">
                              <span>Amount Paid</span>
                              <span>{formatPrice(order.amountPaid)}</span>
                            </div>
                            <div className="flex justify-between text-xs font-semibold text-red-600">
                              <span>Amount Remaining</span>
                              <span>{formatPrice(order.amountRemaining)}</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    {canScrollDown && (
                      <div className="absolute bottom-5 left-0 right-0 flex justify-center pointer-events-none z-10 transition-opacity duration-300">
                        <div className="bg-primaryColor/90 backdrop-blur-sm text-white text-[10px] uppercase tracking-wider font-semibold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1 animate-bounce">
                          <span>Scroll for more</span>
                          <IoChevronDown className="text-sm" />
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4 mb-8">
                    <InfoRow
                      label="Order ID"
                      value={singlePayment.reference}
                      valueClassName="text-gray-900 font-bold text-base"
                    />
                    <InfoRow
                      label="Amount Paid:"
                      value={formatPrice(singlePayment.totalAmount)}
                      valueClassName="text-gray-900 font-bold text-base"
                    />
                    <InfoRow
                      label="Payment method:"
                      value={
                        paymentMethodMap[singlePayment.paymentMethod] ||
                        "Unknown"
                      }
                    />
                    <InfoRow
                      label="Payment type:"
                      value={
                        paymentTypeMap[singlePayment.paymentType] || "Unknown"
                      }
                    />
                    <InfoRow
                      label="Staff:"
                      value={singlePayment.treatedBy || "N/A"}
                    />
                    <InfoRow
                      label="Time:"
                      value={moment(singlePayment.dateCreated).format("hh:mma")}
                    />
                    <InfoRow
                      label="Date:"
                      value={moment(singlePayment.dateCreated).format(
                        "DD/MM/YYYY"
                      )}
                    />
                    <InfoRow
                      label="Customer name"
                      value={
                        singlePayment.customerName ||
                        singlePayment.customer ||
                        "N/A"
                      }
                    />
                  </div>
                )}

                {true && // Always show confirm button if it's open, relying on permission check below
                  ((role === 0 ||
                    userRolePermissions?.canEditPayment === true) &&
                  singlePayment.status === 0 ? (
                    <CustomButton
                      loading={isLoading}
                      disabled={isLoading}
                      onClick={finalizeOrder}
                      className="w-full py-6 bg-primaryColor text-white rounded-xl shadow-lg hover:bg-primaryColor/90 transition-all font-semibold"
                    >
                      <div className="flex items-center justify-between w-full px-4">
                        <span className="text-base text-center w-full">
                          Confirm Payment
                        </span>
                        <HiArrowLongRight className="text-2xl" />
                      </div>
                    </CustomButton>
                  ) : null)}
              </div>
            </div>
          </ModalBody>
        )}
      </ModalContent>
    </Modal>
  );
};

export default ApprovePayment;
