import React, { useEffect, useState } from "react";
import { getOrder, getPaymentSummary } from "@/app/api/controllers/dashboard/orders";
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
import { IoReload } from "react-icons/io5";
import moment from "moment";

interface Payment {
  paymentMethod: string;
  amount: number;
  paymentStatus: string;
  paymentType: string;
  dateCreated: string;
  customer: string;
}

interface PaymentSummaryData {
  reference: string;
  status: string;
  totalAmount: number;
  amountPaid: number;
  amountRemaining: number;
  payments: Payment[];
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
  const [order, setOrder] = useState<PaymentSummaryData | null>(null);
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
      if (!singlePayment?.id) {
        setOrderError("No Payment ID provided");
        return;
      }
      // Use getPaymentSummary which calls /Order/payment/{orderId}
      const data = await getPaymentSummary(singlePayment.id);

      // getPaymentSummary returns response.data directly (based on orders.tsx implementation)
      if (data?.isSuccessful && data?.data) {
        setOrder(data.data);
        setOrderError(null);
      } else if (data?.error) {
        const message = data?.error || "Failed to fetch order details";
        setOrder(null);
        setOrderError(message);
      } else {
        setOrder(null);
        setOrderError("Failed to fetch order details");
      }
    } catch (err: any) {
      setOrder(null);
      setOrderError(
        err?.message ||
          "An unexpected error occurred while fetching order details."
      );
    }
  };

  useEffect(() => {
    if (showOrderDetails && !order) {
        // Only fetch if we haven't fetched yet (order is null) and details are requested
        getOrderDetails();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showOrderDetails, singlePayment?.id]); 

  useEffect(() => {
     if (singlePayment?.id) {
        getOrderDetails();
     } else {
        setOrderError("No Payment ID associated with this payment.");
        setOrder(null);
     }
  }, [singlePayment?.id]);


  const InfoRow = ({ label, value, valueClassName = "text-textGrey" }: { label: string, value: string | React.ReactNode, valueClassName?: string }) => (
    <div className="flex justify-between items-center py-1.5 text-sm">
      <span className="text-grey600 font-normal">{label}</span>
      <span className={`font-semibold ${valueClassName}`}>{value}</span>
    </div>
  );

  const isOrderLoading = !order && !orderError && isLoading; // Simplify loading check if needed

  return (
    <Modal
      isDismissable={false}
      size="md"
      isOpen={isOpen}
      onOpenChange={() => {
        setOrder(null);
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
                  {showOrderDetails ? "Hide order details" : "View order details"}
                </button>

                {showOrderDetails ? (
                  <div className="overflow-y-auto max-h-[400px] border border-gray-200 rounded-lg p-4 mb-4">
                    {orderError ? (
                      <div className="flex flex-col justify-center items-center text-black py-4">
                        <Image
                          src={noImage}
                          width={40}
                          height={40}
                          className="object-cover rounded-lg opacity-50 mb-2"
                          alt="error"
                        />
                        <p className="text-sm font-semibold mb-2">Something went wrong!</p>
                        <p className="text-xs text-gray-500 mb-4">{orderError}</p>
                        <button
                          onClick={getOrderDetails}
                          className="flex items-center gap-2 px-4 py-2 text-primaryColor border border-primaryColor rounded-full text-xs hover:bg-gray-50 transition-colors"
                        >
                          <span>Retry</span>
                          <IoReload />
                        </button>
                      </div>
                    ) : !order ? ( // Loading state
                      <div className="flex flex-col items-center justify-center py-8">
                        <Spinner size="lg" color="primary" />
                        <p className="text-sm text-gray-400 mt-4">Fetching payment details...</p>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {/* Summary Cards */}
                        <div className="grid grid-cols-1 gap-3">
                          <div className="p-3 bg-gray-50 rounded-lg flex justify-between items-center">
                            <p className="text-xs text-gray-500 uppercase">Total Amount</p>
                            <p className="text-md font-bold text-black">{formatPrice(order.totalAmount)}</p>
                          </div>
                          <div className="p-3 bg-green-50 rounded-lg flex justify-between items-center">
                            <p className="text-xs text-green-600 uppercase">Amount Paid</p>
                            <p className="text-md font-bold text-green-700">{formatPrice(order.amountPaid)}</p>
                          </div>
                          <div className="p-3 bg-red-50 rounded-lg flex justify-between items-center">
                            <p className="text-xs text-red-600 uppercase">Remaining</p>
                            <p className="text-md font-bold text-red-700">{formatPrice(order.amountRemaining)}</p>
                          </div>
                        </div>

                        {/* Payments Table - Simplified for compact view */}
                        <div>
                           <h3 className="text-xs font-bold text-black mb-2 uppercase">Payment History</h3>
                           {order.payments && order.payments.length > 0 ? (
                             <div className="space-y-3">
                               {order.payments.map((payment, index) => (
                                 <div key={index} className="flex justify-between items-center border-b border-gray-100 pb-2 last:border-0 last:pb-0">
                                   <div className="flex flex-col">
                                     <span className="text-xs font-semibold text-gray-900">{formatPrice(payment.amount)}</span>
                                     <span className="text-[10px] text-gray-500">{moment(payment.dateCreated).format('MMM DD, h:mm A')}</span>
                                   </div>
                                   <div className="flex flex-col items-end gap-1">
                                      <span className="text-[10px] text-gray-600">{payment.paymentMethod}</span>
                                      {/* Using a simpler text badge or keep Chip if imported? keeping it simple for now or using small badge logic */}
                                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${payment.paymentStatus === 'Successful' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                        {payment.paymentStatus}
                                      </span>
                                   </div>
                                 </div>
                               ))}
                             </div>
                           ) : (
                              <p className="text-xs text-gray-400 text-center py-2">No payments recorded</p>
                           )}
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
                      value={paymentMethodMap[singlePayment.paymentMethod] || "Unknown"}
                    />
                    <InfoRow 
                      label="Payment type:" 
                      value={paymentTypeMap[singlePayment.paymentType] || "Unknown"} 
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
                      value={moment(singlePayment.dateCreated).format("DD/MM/YYYY")} 
                    />
                    <InfoRow 
                      label="Customer name" 
                      value={singlePayment.customerName || singlePayment.customer || "N/A"} 
                    />
                  </div>
                )}

                {(true) && ( // Always show confirm button if it's open, relying on permission check below
                   (role === 0 || userRolePermissions?.canEditPayment === true) && singlePayment.status === 0 ? (
                    <CustomButton
                      loading={isLoading}
                      disabled={isLoading}
                      onClick={finalizeOrder}
                      className="w-full py-6 bg-primaryColor text-white rounded-xl shadow-lg hover:bg-primaryColor/90 transition-all font-semibold"
                    >
                      <div className="flex items-center justify-between w-full px-4">
                        <span className="text-base text-center w-full">Confirm Payment</span>
                        <HiArrowLongRight className="text-2xl" />
                      </div>
                    </CustomButton>
                   ) : null
                )}
              </div>
            </div>
          </ModalBody>
        )}
      </ModalContent>
    </Modal>
  );
};

export default ApprovePayment;
