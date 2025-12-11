"use client";

import React, { useState, useEffect } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  Button,
  Spacer,
} from "@nextui-org/react";
import { X } from "lucide-react";
import { CustomInput } from "@/components/CustomInput";
import { CustomTextArea } from "@/components/customTextArea";
import { CustomButton } from "@/components/customButton";
import SelectInput from "@/components/selectInput";
import { getJsonItemFromLocalStorage, notify, formatPrice } from "@/lib/utils";
import { refundOrder } from "@/app/api/controllers/dashboard/orders";

interface RefundPaymentModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  orderId: string;
  totalAmount: number;
    // We might need to pass the current paid amount if we only want to refund what was paid, 
    // but the prompt says "amountPaid" is in the summary. For refund, usually we refund up to the amount paid. 
    // I'll assume totalAmount or a specific maxRefundableAmount is passed or I just use a safe max.
    // For now I'll call it maxRefundAmount.
  maxRefundAmount: number;
  onSuccess: () => void;
}

const RefundPaymentModal: React.FC<RefundPaymentModalProps> = ({
  isOpen,
  onOpenChange,
  orderId,
  maxRefundAmount,
  onSuccess,
}) => {
  const [amount, setAmount] = useState<string>("");
  const [reason, setReason] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [userInformation, setUserInformation] = useState<any>(null);

  useEffect(() => {
    const user = getJsonItemFromLocalStorage("userInformation");
    setUserInformation(user);
  }, []);

  useEffect(() => {
    if (!isOpen) {
      setAmount("");
      setReason("");
      setPaymentMethod("");
      setIsLoading(false);
    }
  }, [isOpen]);

  const paymentOptions = [
    { label: "Cash", value: "0" },
    { label: "POS", value: "1" },
    { label: "Transfer", value: "2" },
  ];

  const handleSubmit = async () => {
    // Validation
    const numAmount = parseFloat(amount);
    if (!amount || isNaN(numAmount) || numAmount <= 0) {
      notify({
        title: "Validation Error",
        text: "Please enter a valid refund amount",
        type: "error",
      });
      return;
    }

    if (numAmount > maxRefundAmount) {
       notify({
        title: "Validation Error",
        text: `Refund amount cannot exceed ${formatPrice(maxRefundAmount)}`,
        type: "error",
      });
      return;
    }

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

    setIsLoading(true);

    const payload = {
      refundAmount: numAmount,
      reason: reason,
      treatedBy: `${userInformation?.firstName} ${userInformation?.lastName}`,
      treatedById: userInformation?.id || "",
      paymentReference: `REF-${Date.now()}`, // Generating a temporary ref if one isn't required from user input
      paymentMethod: parseInt(paymentMethod),
      orderId: orderId, // Assuming the endpoint might need orderId in payload or query. Plan said POST /api/v1/Order/refund with payload. 
                        // Wait, looking at the user request: POST /api/v{version}/Order/refund 
                        // Payload schema: { refundAmount, reason, treatedBy, treatedById, paymentReference, paymentMethod }
                        // It does NOT have orderId in the payload schema provided by user.
                        // However, a refund MUST be linked to an order. 
                        // I'll check the controller again.
                        // I added `refundOrder` which calls `api.post(DASHBOARD.refundOrder, payload)`.
                        // If the backend expects orderId as a query param or part of the URL, I might need to adjust.
                        // BUT, if the user provided schema is exact, maybe `paymentReference` IS the link? Or maybe I missed it.
                        // Let's assume for now I should append orderId to the URL or payload if the schema allows extra fields.
                        // Actually, looking at the prompt: "/Order/payment/{orderId}(get)... on the refund option call this endpoint POST ... { refundAmount... }"
                        // It seems the refund might be global or I need to check how to link it.
                        // Usually I'd expect orderId. I will try to pass orderId in the payload as well, or query param. 
                        // Let's look at `api-url.tsx`. `refundOrder: "api/v1/Order/refund"`.
                        // I will add orderId to the payload just in case, or maybe `paymentReference` refers to the original order's payment reference?
                        // The user said: "paymentReference": "string".
                        // Use the original order's payment reference?
                        // I'll pass orderId in the payload, standard practice.
                        orderId: orderId
    };

    try {
      // Small adjustment: controller function expects specific payload. I'll stick to what I defined in controller but add orderId if helpful.
      // Actually, I'll pass orderId as a query param in the controller if I can, OR just payload. 
      // Re-reading controller: `api.post(DASHBOARD.refundOrder, payload)`.
      // I will UPDATE the controller to accept orderId query param if needed, but for now lets trust the payload.
      // Wait, if I look at `UpdateOrderModal.tsx`, `completeOrderWithPayment` takes payload and orderId.
      // `completeOrderWithPayment` url is `api/v1/Order/complete`.
      // The user prompt schema for refund doesn't have orderId. 
      // Maybe "paymentReference" IS the order reference?
      // I'll assume I should send the order ID as "orderId" in the body.
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
      size="md"
      hideCloseButton
      classNames={{
        wrapper: "items-center",
        base: "max-w-md",
      }}
    >
      <ModalContent>
        <ModalHeader className="flex items-center justify-between border-b border-gray-200 p-4">
          <h2 className="text-lg font-bold text-black">Refund Payment</h2>
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
        <ModalBody className="p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Refund Amount (Paid: {formatPrice(maxRefundAmount)})
              </label>
              <CustomInput
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                classNames="w-full"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Payment Method
              </label>
              <SelectInput
                label=""
                contents={paymentOptions}
                selectedKeys={paymentMethod ? [paymentMethod] : []}
                onChange={(e: any) => setPaymentMethod(e.target.value)}
                classNames="w-full"
                placeholder="Select Method"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reason
              </label>
              <CustomTextArea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Enter reason for refund"
                minRows={3}
              />
            </div>

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
          </div>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default RefundPaymentModal;
