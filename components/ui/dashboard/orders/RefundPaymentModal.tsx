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
  packingCost: number;
  isVariety: boolean;
  isPacked: boolean;
}

interface RefundPaymentModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  orderId: string;
  totalAmount: number;
  maxRefundAmount: number;
  isVatApplied: boolean;
  vatPercentage: number;
  onSuccess: () => void;
}

const RefundPaymentModal: React.FC<RefundPaymentModalProps> = ({
  isOpen,
  onOpenChange,
  orderId,
  totalAmount,
  maxRefundAmount,
  isVatApplied: orderIsVatApplied,
  vatPercentage: orderVatPercentage,
  onSuccess,
}) => {
  // Step state: 1 = item selection, 2 = confirmation
  const [step, setStep] = useState<1 | 2>(1);
  const [refundItems, setRefundItems] = useState<RefundItem[]>([]);
  const [reason, setReason] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [userInformation, setUserInformation] = useState<any>(null);
  const [isVatApplied, setIsVatApplied] = useState<boolean>(false);
  const [vatRate, setVatRate] = useState<number>(0);

  // Fetch full order details
  const { orderDetails: fullOrderData, isLoading: isLoadingOrder } = useOrderDetails(orderId, {
    enabled: !!orderId && isOpen,
  });

  useEffect(() => {
    const user = getJsonItemFromLocalStorage("userInformation");
    setUserInformation(user);
  }, []);

  // Initialize items when order data loads (don't wait for config)
  useEffect(() => {
    if (fullOrderData?.orderDetails && isOpen) {
      setRefundItems(
        fullOrderData.orderDetails.map((item: any) => ({
          itemID: item.itemID,
          itemName: item.itemName || "Unknown Item",
          originalQuantity: item.quantity,
          refundQuantity: 0,
          unitPrice: item.unitPrice,
          packingCost: item.isPacked ? (item.packingCost || 0) : 0,
          isVariety: item.isVariety || false,
          isPacked: item.isPacked || false,
        }))
      );
    }
  }, [fullOrderData, isOpen]);

  // Set VAT values from props (passed from order table)
  useEffect(() => {
    if (isOpen) {
      console.log("VAT Debug:", {
        orderIsVatApplied,
        orderVatPercentage,
      });

      if (orderIsVatApplied && orderVatPercentage > 0) {
        setIsVatApplied(true);
        setVatRate(orderVatPercentage);
      } else {
        setIsVatApplied(false);
        setVatRate(0);
      }
    }
  }, [isOpen, orderIsVatApplied, orderVatPercentage]);

  // Reset state on close
  useEffect(() => {
    if (!isOpen) {
      setStep(1);
      setRefundItems([]);
      setReason("");
      setPaymentMethod("");
      setIsLoading(false);
      setIsVatApplied(false);
      setVatRate(0);
    }
  }, [isOpen]);

  // Calculate original subtotal (before VAT) from all items - includes packing costs
  const originalSubtotal = useMemo(() => {
    return refundItems.reduce(
      (sum, item) => {
        const itemTotal = item.originalQuantity * item.unitPrice;
        const packingTotal = item.isPacked ? item.originalQuantity * item.packingCost : 0;
        return sum + itemTotal + packingTotal;
      },
      0
    );
  }, [refundItems]);

  // Calculate original VAT (if applicable)
  const originalVatAmount = useMemo(() => {
    if (!isVatApplied || vatRate <= 0) return 0;
    return Math.round(originalSubtotal * (vatRate / 100) * 100) / 100;
  }, [originalSubtotal, isVatApplied, vatRate]);

  // Original grand total (subtotal + VAT)
  const originalGrandTotal = useMemo(() => {
    return originalSubtotal + originalVatAmount;
  }, [originalSubtotal, originalVatAmount]);

  // Calculate items refund amount (before VAT) - includes packing costs
  // This is the base amount of items being refunded
  const itemsRefundAmount = useMemo(() => {
    return refundItems.reduce(
      (sum, item) => {
        const itemTotal = item.refundQuantity * item.unitPrice;
        const packingTotal = item.isPacked ? item.refundQuantity * item.packingCost : 0;
        return sum + itemTotal + packingTotal;
      },
      0
    );
  }, [refundItems]);

  // Calculate VAT refund amount - VAT that was charged on the refunded items
  // KEY RULE: VAT was charged on the refunded items, so VAT on them must also be refunded
  // Formula: VAT Refund = Items Refund Amount × VAT Rate
  // Example: If refunding ₦50,000 item with 7.5% VAT:
  //   VAT Refund = ₦50,000 × 7.5% = ₦3,750
  // Use same precision as checkout: round to 2 decimal places
  const vatRefundAmount = useMemo(() => {
    if (!isVatApplied || vatRate <= 0) return 0;
    return Math.round(itemsRefundAmount * (vatRate / 100) * 100) / 100;
  }, [itemsRefundAmount, isVatApplied, vatRate]);

  // Calculate total refund amount (items + VAT)
  // This is what the customer will receive back
  // Formula: Total Refund = Item Price × (1 + VAT Rate)
  // Example: Total Refund = ₦50,000 + ₦3,750 = ₦53,750
  const totalRefundAmount = useMemo(() => {
    return itemsRefundAmount + vatRefundAmount;
  }, [itemsRefundAmount, vatRefundAmount]);

  // Calculate subtotal of remaining items (after refund) - includes packing costs
  // Formula: New Subtotal = Original Subtotal - Items Refund Amount
  // Example: ₦147,800 - ₦50,000 = ₦97,800
  const remainingSubtotal = useMemo(() => {
    return refundItems.reduce(
      (sum, item) => {
        const remainingQty = item.originalQuantity - item.refundQuantity;
        const itemTotal = remainingQty * item.unitPrice;
        const packingTotal = item.isPacked ? remainingQty * item.packingCost : 0;
        return sum + itemTotal + packingTotal;
      },
      0
    );
  }, [refundItems]);

  // Calculate new VAT on remaining items
  // Formula: New VAT = New Subtotal × VAT Rate
  // Example: ₦97,800 × 7.5% = ₦7,335
  // IMPORTANT: Recalculate VAT on the new subtotal, don't guess or estimate
  const newVatAmount = useMemo(() => {
    if (!isVatApplied || vatRate <= 0) return 0;
    return Math.round(remainingSubtotal * (vatRate / 100) * 100) / 100;
  }, [remainingSubtotal, isVatApplied, vatRate]);

  // Calculate new grand total = remaining subtotal + VAT on remaining items
  // Formula: New Grand Total = New Subtotal + New VAT
  // Example: ₦97,800 + ₦7,335 = ₦105,135
  // This must match what backend calculates from orderDetails
  // Use same precision as checkout: round to 2 decimal places
  const newTotalAmount = useMemo(() => {
    return remainingSubtotal + newVatAmount;
  }, [remainingSubtotal, newVatAmount]);

  // Balance check: Original Grand Total - Total Refund = New Grand Total
  // This verifies the math is correct: ₦158,885 - ₦53,750 = ₦105,135 ✓
  const balanceCheck = useMemo(() => {
    const calculated = originalGrandTotal - totalRefundAmount;
    return Math.abs(calculated - newTotalAmount) < 0.01; // Allow small floating point differences
  }, [originalGrandTotal, totalRefundAmount, newTotalAmount]);

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
    if (itemsRefundAmount <= 0) {
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

    if (totalRefundAmount > maxRefundAmount) {
      notify({
        title: "Validation Error",
        text: `Refund amount cannot exceed ${formatPrice(maxRefundAmount, "NGN")}`,
        type: "error",
      });
      return;
    }

    setIsLoading(true);

    const systemReference = (): number => Math.floor(1e9 + Math.random() * 9e9);

    // CRITICAL: Ensure refundAmount includes both items AND VAT
    // Formula: refundAmount = itemsRefundAmount + vatRefundAmount
    // This is what the customer should receive back
    
    // Recalculate to ensure accuracy (even though totalRefundAmount should already be correct)
    const itemsRefund = refundItems.reduce(
      (sum, item) => {
        const itemTotal = item.refundQuantity * item.unitPrice;
        const packingTotal = item.isPacked ? item.refundQuantity * item.packingCost : 0;
        return sum + itemTotal + packingTotal;
      },
      0
    );
    
    const vatRefund = isVatApplied && vatRate > 0
      ? Math.round(itemsRefund * (vatRate / 100) * 100) / 100
      : 0;
    
    // Final refund amount MUST include VAT
    const finalRefundAmount = itemsRefund + vatRefund;
    
    console.log("Refund Calculation Breakdown:", {
      itemsRefundAmount: itemsRefund,
      vatRefundAmount: vatRefund,
      totalRefundAmount: finalRefundAmount,
      isVatApplied,
      vatRate,
      calculation: `${itemsRefund} + ${vatRefund} = ${finalRefundAmount}`,
      note: "refundAmount MUST include both items and VAT"
    });

    const payload = {
      reason: reason,
      treatedBy: `${userInformation?.firstName} ${userInformation?.lastName}`,
      treatedById: userInformation?.id || "",
      paymentReference: `REF-${Date.now()}`,
      systemReference: systemReference(),
      paymentMethod: parseInt(paymentMethod),
      orderDetails: remainingOrderDetails,
      totalAmount: newTotalAmount,
      refundAmount: finalRefundAmount, // This MUST include items + VAT
      isVatApplied: isVatApplied,
      vatPercentage: vatRate,
    };
    console.log("Refund Payload (refundAmount includes items + VAT):", payload);
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
                              {formatPrice(item.unitPrice, "NGN")} each
                            </p>
                          </div>
                          <p className="font-semibold text-black text-sm">
                            {formatPrice(item.unitPrice * item.originalQuantity, "NGN")}
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
                              -{formatPrice(
                                (item.unitPrice * item.refundQuantity) +
                                (item.isPacked ? item.packingCost * item.refundQuantity : 0),
                                "NGN"
                              )}
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Simple Refund Summary for Step 1 */}
                  {itemsRefundAmount > 0 && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-700">
                          Total Refund Amount
                        </span>
                        <span className="text-lg font-bold text-red-600">
                          {formatPrice(totalRefundAmount, "NGN")}
                        </span>
                      </div>
                      {isVatApplied && vatRefundAmount > 0 && (
                        <p className="text-xs text-gray-500 mt-1">
                          Includes {formatPrice(itemsRefundAmount, "NGN")} items + {formatPrice(vatRefundAmount, "NGN")} VAT ({vatRate}%)
                        </p>
                      )}
                    </div>
                  )}

                  {maxRefundAmount < totalRefundAmount && (
                    <p className="text-xs text-red-500 mt-2">
                      Refund amount ({formatPrice(totalRefundAmount, "NGN")}) exceeds paid amount ({formatPrice(maxRefundAmount, "NGN")})
                    </p>
                  )}

                  <Spacer y={4} />

                  <CustomButton
                    onClick={handleContinue}
                    disabled={itemsRefundAmount <= 0}
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
              {/* Refund Summary */}
              <div className="mb-4 space-y-4">
                {/* Original Bill */}
                <div>
                  <p className="text-xs font-semibold text-gray-700 mb-2">
                    Original Bill (Before Refund)
                  </p>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 space-y-1">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">Subtotal (before VAT)</span>
                      <span className="text-gray-600">{formatPrice(originalSubtotal, "NGN")}</span>
                    </div>
                    {isVatApplied && originalVatAmount > 0 && (
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">VAT ({vatRate}%)</span>
                        <span className="text-gray-600">{formatPrice(originalVatAmount, "NGN")}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center pt-2 border-t border-gray-300">
                      <span className="font-semibold text-gray-700">Grand Total Paid</span>
                      <span className="font-semibold text-gray-700">{formatPrice(originalGrandTotal, "NGN")}</span>
                    </div>
                  </div>
                </div>

                {/* Items to Refund */}
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    Item(s) Being Refunded
                  </p>
                  <div className="bg-red-50 border border-red-100 rounded-lg p-3 space-y-2">
                    {itemsToRefund.map((item) => {
                      const itemRefundAmount = (item.unitPrice * item.refundQuantity) +
                        (item.isPacked ? item.packingCost * item.refundQuantity : 0);
                      const itemVatAmount = isVatApplied && vatRate > 0
                        ? Math.round(itemRefundAmount * (vatRate / 100) * 100) / 100
                        : 0;
                      const itemTotalWithVat = itemRefundAmount + itemVatAmount;
                      
                      return (
                        <div key={item.itemID} className="space-y-1">
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-700">
                              {item.itemName} x{item.refundQuantity}
                            </span>
                            <span className="font-medium text-red-600">
                              -{formatPrice(itemRefundAmount, "NGN")}
                            </span>
                          </div>
                          {isVatApplied && itemVatAmount > 0 && (
                            <div className="flex justify-between items-center text-xs pl-4 text-red-500">
                              <span>VAT ({vatRate}%)</span>
                              <span>-{formatPrice(itemVatAmount, "NGN")}</span>
                            </div>
                          )}
                          <div className="flex justify-between items-center text-sm font-semibold pl-4 border-t border-red-200 pt-1">
                            <span className="text-red-700">Item Total (with VAT)</span>
                            <span className="text-red-700">-{formatPrice(itemTotalWithVat, "NGN")}</span>
                          </div>
                        </div>
                      );
                    })}
                    <div className="pt-2 border-t-2 border-red-300 space-y-1">
                      <div className="flex justify-between">
                        <span className="font-medium text-red-600">
                          Items Subtotal (before VAT)
                        </span>
                        <span className="font-medium text-red-600">
                          -{formatPrice(itemsRefundAmount, "NGN")}
                        </span>
                      </div>
                      {isVatApplied && vatRefundAmount > 0 && (
                        <div className="flex justify-between">
                          <span className="font-medium text-red-600">
                            VAT on Refunded Items ({vatRate}%)
                          </span>
                          <span className="font-medium text-red-600">
                            -{formatPrice(vatRefundAmount, "NGN")}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between pt-1 border-t border-red-200">
                        <span className="font-bold text-red-700 text-base">
                          Total Refund to Customer (Items + VAT)
                        </span>
                        <span className="font-bold text-red-700 text-base">
                          -{formatPrice(totalRefundAmount, "NGN")}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* New Bill After Refund */}
                <div>
                  <p className="text-xs font-semibold text-gray-700 mb-2">
                    New Bill After Refund
                  </p>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 space-y-1">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">New Subtotal</span>
                      <span className="text-gray-600">{formatPrice(remainingSubtotal, "NGN")}</span>
                    </div>
                    {isVatApplied && newVatAmount > 0 && (
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">New VAT ({vatRate}%)</span>
                        <span className="text-gray-600">{formatPrice(newVatAmount, "NGN")}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center pt-2 border-t border-gray-300">
                      <span className="font-semibold text-black">New Grand Total</span>
                      <span className="font-semibold text-black">{formatPrice(newTotalAmount, "NGN")}</span>
                    </div>
                  </div>
                </div>

                {/* Balance Check */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <div className="flex justify-between items-center text-xs text-gray-600 mb-1">
                    <span>Balance Check:</span>
                    <span>
                      {formatPrice(originalGrandTotal, "NGN")} - {formatPrice(totalRefundAmount, "NGN")} = {formatPrice(originalGrandTotal - totalRefundAmount, "NGN")}
                    </span>
                  </div>
                  {balanceCheck ? (
                    <div className="text-xs text-green-700 font-medium flex items-center gap-1">
                      ✓ Matches new grand total exactly - Math is correct and balanced
                    </div>
                  ) : (
                    <div className="text-xs text-red-600 font-medium">
                      ⚠ Calculation mismatch detected
                    </div>
                  )}
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
                />
              </div>

              {/* Max Refund Warning */}
              {maxRefundAmount > 0 && (
                <p className="text-xs text-gray-500 mb-2">
                  Maximum refundable amount: {formatPrice(maxRefundAmount, "NGN")}
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
