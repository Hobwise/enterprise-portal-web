"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  Button,
  Spacer,
  Spinner,
} from "@nextui-org/react";
import { X, ArrowLeft, Minus, Plus, RotateCcw } from "lucide-react";
import { CustomTextArea } from "@/components/customTextArea";
import { CustomButton } from "@/components/customButton";
import SelectInput from "@/components/selectInput";
import { getJsonItemFromLocalStorage, notify, formatPrice } from "@/lib/utils";
import { refundOrder } from "@/app/api/controllers/dashboard/orders";
import useOrderDetails from "@/hooks/cachedEndpoints/useOrderDetails";

interface RefundItem {
  itemID: string;
  itemName: string;
  originalQuantity: number;
  refundQuantity: number;
  unitPrice: number;
  isVariety: boolean;
  isPacked: boolean;
}

interface RefundPaymentModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  orderId: string;
  totalAmount: number;
  maxRefundAmount: number;
  onSuccess: () => void;
}

const RefundPaymentModal: React.FC<RefundPaymentModalProps> = ({
  isOpen,
  onOpenChange,
  orderId,
  totalAmount,
  maxRefundAmount,
  onSuccess,
}) => {
  // Step state: 1 = item selection, 2 = confirmation
  const [step, setStep] = useState<1 | 2>(1);
  const [refundItems, setRefundItems] = useState<RefundItem[]>([]);
  const [reason, setReason] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [userInformation, setUserInformation] = useState<any>(null);

  // Fetch full order details
  const { orderDetails: fullOrderData, isLoading: isLoadingOrder } = useOrderDetails(orderId, {
    enabled: !!orderId && isOpen,
  });

  useEffect(() => {
    const user = getJsonItemFromLocalStorage("userInformation");
    setUserInformation(user);
  }, []);

  // Initialize items when order data loads
  useEffect(() => {
    if (fullOrderData?.orderDetails && isOpen) {
      setRefundItems(
        fullOrderData.orderDetails.map((item: any) => ({
          itemID: item.itemID,
          itemName: item.itemName || "Unknown Item",
          originalQuantity: item.quantity,
          refundQuantity: 0,
          unitPrice: item.unitPrice,
          isVariety: item.isVariety || false,
          isPacked: item.isPacked || false,
        }))
      );
    }
  }, [fullOrderData, isOpen]);

  // Reset state on close
  useEffect(() => {
    if (!isOpen) {
      setStep(1);
      setRefundItems([]);
      setReason("");
      setPaymentMethod("");
      setIsLoading(false);
    }
  }, [isOpen]);

  // Calculate refund amount from selected items
  const refundAmount = useMemo(() => {
    return refundItems.reduce(
      (sum, item) => sum + item.refundQuantity * item.unitPrice,
      0
    );
  }, [refundItems]);

  // Calculate new total after refund
  const newTotalAmount = useMemo(() => {
    return totalAmount - refundAmount;
  }, [totalAmount, refundAmount]);

  // Build orderDetails payload (remaining items)
  const remainingOrderDetails = useMemo(() => {
    return refundItems
      .filter(item => item.originalQuantity - item.refundQuantity > 0)
      .map(item => ({
        itemID: item.itemID,
        quantity: item.originalQuantity - item.refundQuantity,
        unitPrice: item.unitPrice,
        isVariety: item.isVariety,
        isPacked: item.isPacked,
      }));
  }, [refundItems]);

  // Get items selected for refund (for display in step 2)
  const itemsToRefund = useMemo(() => {
    return refundItems.filter(item => item.refundQuantity > 0);
  }, [refundItems]);

  const paymentOptions = [
    { label: "Cash", value: "0" },
    { label: "POS", value: "1" },
    { label: "Transfer", value: "2" },
  ];

  // Quantity handlers
  const incrementRefund = (itemID: string) => {
    setRefundItems(prev =>
      prev.map(item =>
        item.itemID === itemID && item.refundQuantity < item.originalQuantity
          ? { ...item, refundQuantity: item.refundQuantity + 1 }
          : item
      )
    );
  };

  const decrementRefund = (itemID: string) => {
    setRefundItems(prev =>
      prev.map(item =>
        item.itemID === itemID && item.refundQuantity > 0
          ? { ...item, refundQuantity: item.refundQuantity - 1 }
          : item
      )
    );
  };

  const refundAll = (itemID: string) => {
    setRefundItems(prev =>
      prev.map(item =>
        item.itemID === itemID
          ? { ...item, refundQuantity: item.originalQuantity }
          : item
      )
    );
  };

  const handleContinue = () => {
    if (refundAmount <= 0) {
      notify({
        title: "Validation Error",
        text: "Please select at least one item to refund",
        type: "error",
      });
      return;
    }
    setStep(2);
  };

  const handleSubmit = async () => {
    // Validation
    if (!paymentMethod) {
      notify({
        title: "Validation Error",
        text: "Please select a payment method",
        type: "error",
      });
      return;
    }

    if (!reason.trim()) {
      notify({
        title: "Validation Error",
        text: "Please provide a reason for the refund",
        type: "error",
      });
      return;
    }

    if (refundAmount > maxRefundAmount) {
      notify({
        title: "Validation Error",
        text: `Refund amount cannot exceed ${formatPrice(maxRefundAmount)}`,
        type: "error",
      });
      return;
    }

    setIsLoading(true);

    const systemReference = (): number => Math.floor(1e9 + Math.random() * 9e9);

    const payload = {
      reason: reason,
      treatedBy: `${userInformation?.firstName} ${userInformation?.lastName}`,
      treatedById: userInformation?.id || "",
      paymentReference: `REF-${Date.now()}`,
      systemReference: systemReference(),
      paymentMethod: parseInt(paymentMethod),
      orderDetails: remainingOrderDetails,
      totalAmount: newTotalAmount,
      refundAmount: refundAmount,
    };

    try {
      const response = await refundOrder(payload as any, orderId);

      if (response?.isSuccessful) {
        notify({
          title: "Success",
          text: "Refund processed successfully",
          type: "success",
        });
        onSuccess();
        onOpenChange(false);
      } else {
        notify({
          title: "Error",
          text: response?.error || "Failed to process refund",
          type: "error",
        });
      }
    } catch (error) {
      notify({
        title: "Error",
        text: "An error occurred",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      size="lg"
      hideCloseButton
      scrollBehavior="inside"
      classNames={{
        wrapper: "items-center",
        base: "max-w-lg max-h-[85vh]",
      }}
    >
      <ModalContent>
        {/* Step 1: Item Selection */}
        {step === 1 && (
          <>
            <ModalHeader className="flex items-center justify-between border-b border-gray-200 p-4">
              <div className="flex items-center gap-2">
                <RotateCcw className="w-5 h-5 text-primaryColor" />
                <h2 className="text-lg font-bold text-black">Refund Order</h2>
              </div>
              <Button
                isIconOnly
                variant="light"
                onPress={() => onOpenChange(false)}
                className="text-gray-500 hover:text-gray-700"
                aria-label="Close modal"
              >
                <X size={20} />
              </Button>
            </ModalHeader>
            <ModalBody className="p-4">
              {isLoadingOrder ? (
                <div className="flex justify-center items-center py-10">
                  <Spinner size="lg" />
                </div>
              ) : refundItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-gray-500">
                  <RotateCcw className="w-12 h-12 mb-2 opacity-50" />
                  <p>No items found in this order</p>
                </div>
              ) : (
                <>
                  <p className="text-sm text-gray-600 mb-4">
                    Select the items and quantities you want to refund
                  </p>

                  {/* Items List */}
                  <div className="space-y-3 max-h-[350px] overflow-y-auto">
                    {refundItems.map((item) => (
                      <div
                        key={item.itemID}
                        className={`border rounded-lg p-3 ${
                          item.refundQuantity > 0
                            ? "border-primaryColor bg-purple-50"
                            : "border-gray-200"
                        }`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1">
                            <p className="font-medium text-black text-sm">
                              {item.itemName}
                            </p>
                            <p className="text-xs text-gray-500">
                              {formatPrice(item.unitPrice)} each
                            </p>
                          </div>
                          <p className="font-semibold text-black text-sm">
                            {formatPrice(item.unitPrice * item.originalQuantity)}
                          </p>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="text-xs text-gray-500">
                            Qty: {item.originalQuantity}
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-600 mr-1">
                              Refund:
                            </span>
                            <Button
                              isIconOnly
                              size="sm"
                              variant="flat"
                              onPress={() => decrementRefund(item.itemID)}
                              isDisabled={item.refundQuantity === 0}
                              className="min-w-8 w-8 h-8"
                            >
                              <Minus size={14} />
                            </Button>
                            <span className="w-8 text-center font-semibold text-black">
                              {item.refundQuantity}
                            </span>
                            <Button
                              isIconOnly
                              size="sm"
                              variant="flat"
                              onPress={() => incrementRefund(item.itemID)}
                              isDisabled={item.refundQuantity >= item.originalQuantity}
                              className="min-w-8 w-8 h-8"
                            >
                              <Plus size={14} />
                            </Button>
                            <Button
                              size="sm"
                              variant="flat"
                              color="primary"
                              onPress={() => refundAll(item.itemID)}
                              isDisabled={item.refundQuantity === item.originalQuantity}
                              className="text-xs ml-1"
                            >
                              All
                            </Button>
                          </div>
                        </div>

                        {item.refundQuantity > 0 && (
                          <div className="mt-2 pt-2 border-t border-gray-100 flex justify-between">
                            <span className="text-xs text-primaryColor">
                              Refunding {item.refundQuantity} item(s)
                            </span>
                            <span className="text-xs font-medium text-primaryColor">
                              -{formatPrice(item.unitPrice * item.refundQuantity)}
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Refund Summary */}
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-600">
                        Original Total
                      </span>
                      <span className="text-sm text-gray-600">
                        {formatPrice(totalAmount)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-red-600">
                        Refund Amount
                      </span>
                      <span className="text-sm font-medium text-red-600">
                        -{formatPrice(refundAmount)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                      <span className="font-semibold text-black">New Total</span>
                      <span className="font-semibold text-black">
                        {formatPrice(newTotalAmount)}
                      </span>
                    </div>
                  </div>

                  {maxRefundAmount < refundAmount && (
                    <p className="text-xs text-red-500 mt-2">
                      Refund amount ({formatPrice(refundAmount)}) exceeds paid amount ({formatPrice(maxRefundAmount)})
                    </p>
                  )}

                  <Spacer y={4} />

                  <CustomButton
                    onClick={handleContinue}
                    disabled={refundAmount <= 0}
                    className="w-full bg-primaryColor py-6 text-white"
                    backgroundColor="bg-primaryColor"
                  >
                    Continue
                  </CustomButton>
                </>
              )}
            </ModalBody>
          </>
        )}

        {/* Step 2: Confirmation */}
        {step === 2 && (
          <>
            <ModalHeader className="flex items-center justify-between border-b border-gray-200 p-4">
              <div className="flex items-center gap-2">
                <Button
                  isIconOnly
                  variant="light"
                  onPress={() => setStep(1)}
                  className="text-gray-500 hover:text-gray-700"
                  aria-label="Go back"
                >
                  <ArrowLeft size={20} />
                </Button>
                <h2 className="text-lg font-bold text-black">Confirm Refund</h2>
              </div>
              <Button
                isIconOnly
                variant="light"
                onPress={() => onOpenChange(false)}
                className="text-gray-500 hover:text-gray-700"
                aria-label="Close modal"
              >
                <X size={20} />
              </Button>
            </ModalHeader>
            <ModalBody className="p-4">
              {/* Items to Refund Summary */}
              <div className="mb-4">
                <p className="text-sm font-medium text-gray-700 mb-2">
                  Items to Refund
                </p>
                <div className="bg-red-50 border border-red-100 rounded-lg p-3 space-y-2">
                  {itemsToRefund.map((item) => (
                    <div
                      key={item.itemID}
                      className="flex justify-between items-center text-sm"
                    >
                      <span className="text-gray-700">
                        {item.itemName} x{item.refundQuantity}
                      </span>
                      <span className="font-medium text-red-600">
                        -{formatPrice(item.unitPrice * item.refundQuantity)}
                      </span>
                    </div>
                  ))}
                  <div className="pt-2 border-t border-red-200 flex justify-between">
                    <span className="font-semibold text-red-700">
                      Total Refund
                    </span>
                    <span className="font-semibold text-red-700">
                      -{formatPrice(refundAmount)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Refund Method
                </label>
                <SelectInput
                  label=""
                  contents={paymentOptions}
                  selectedKeys={paymentMethod ? [paymentMethod] : []}
                  onChange={(e: any) => setPaymentMethod(e.target.value)}
                  classNames="w-full"
                  placeholder="Select refund method"
                />
              </div>

              {/* Reason */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reason for Refund
                </label>
                <CustomTextArea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Enter reason for refund"
                  minRows={3}
                />
              </div>

              {/* Max Refund Warning */}
              {maxRefundAmount > 0 && (
                <p className="text-xs text-gray-500 mb-2">
                  Maximum refundable amount: {formatPrice(maxRefundAmount)}
                </p>
              )}

              <Spacer y={4} />

              <div className="flex gap-3">
                <CustomButton
                  onClick={() => onOpenChange(false)}
                  className="flex-1 bg-white text-black border border-gray-300"
                >
                  Cancel
                </CustomButton>
                <CustomButton
                  onClick={handleSubmit}
                  loading={isLoading}
                  className="flex-1 bg-primaryColor text-white"
                  backgroundColor="bg-primaryColor"
                >
                  Process Refund
                </CustomButton>
              </div>
            </ModalBody>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default RefundPaymentModal;
