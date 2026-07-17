"use client";

import React, { useEffect, useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Spinner,
  Chip,
  Divider,
} from "@nextui-org/react";
import { formatPrice, getJsonItemFromLocalStorage } from "@/lib/utils";
import moment from "moment";
import { verifyQrPayment } from "@/app/api/controllers/dashboard/qrPayment";
import { CustomButton } from "@/components/customButton";

interface PaymentStatusModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  reference: string | null;
}

const PaymentStatusModal: React.FC<PaymentStatusModalProps> = ({
  isOpen,
  onOpenChange,
  reference,
}) => {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const businessInformation = getJsonItemFromLocalStorage("business");
  const businessId = businessInformation?.[0]?.businessId;

  useEffect(() => {
    const fetchData = async () => {
      if (isOpen && reference && businessId) {
        setIsLoading(true);
        setError(null);
        try {
          const response = await verifyQrPayment(businessId, reference);
          // Assuming response has data, error, isSuccessful wrapper
          const resultData = response?.data?.data || response?.data || response;
          if (response?.data?.isSuccessful !== false && resultData) {
            setData(resultData);
          } else {
            setError(response?.data?.error || "Failed to fetch payment status");
          }
        } catch (err: any) {
          setError(err?.response?.data?.error || "An error occurred while fetching payment status.");
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchData();
  }, [isOpen, reference, businessId]);

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="md">
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1 text-black">
              Payment Status
            </ModalHeader>
            <ModalBody>
              {isLoading ? (
                <div className="flex justify-center items-center py-10">
                  <Spinner size="lg" color="primary" />
                </div>
              ) : error ? (
                <div className="flex flex-col justify-center items-center py-10 text-red-500 gap-2">
                  <p>{error}</p>
                  <p className="text-xs text-gray-400">Reference: {reference}</p>
                </div>
              ) : data ? (
                <div className="flex flex-col gap-4 text-sm text-black">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">Status</span>
                    <Chip
                      color={
                        data.status?.toLowerCase() === "successful"
                          ? "success"
                          : data.status?.toLowerCase() === "pending"
                          ? "warning"
                          : "danger"
                      }
                      variant="flat"
                    >
                      {data.status || "Unknown"}
                    </Chip>
                  </div>
                  <Divider />
                  <div className="flex justify-between">
                    <span className="text-gray-500">Reference</span>
                    <span className="font-medium text-right truncate w-48" title={data.hobwiseReference || data.paystackReference}>{data.hobwiseReference || data.paystackReference || reference}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Amount</span>
                    <span className="font-semibold text-lg">{formatPrice(data.amountNaira || 0, "NGN")}</span>
                  </div>
                  {data.merchantAmountNaira !== undefined && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Merchant Amount</span>
                      <span className="font-medium">{formatPrice(data.merchantAmountNaira, "NGN")}</span>
                    </div>
                  )}
                  {data.paymentChannel && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Channel</span>
                      <span className="font-medium capitalize">{data.paymentChannel}</span>
                    </div>
                  )}
                  {data.paidAt && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Paid At</span>
                      <span className="font-medium">
                        {moment(data.paidAt).format("MMM Do YYYY, h:mm:ss a")}
                      </span>
                    </div>
                  )}
                  {data.dateCreated && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Created At</span>
                      <span className="font-medium">
                        {moment(data.dateCreated).format("MMM Do YYYY, h:mm:ss a")}
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col justify-center items-center py-10 text-gray-500">
                  <p>No data available.</p>
                  <p className="text-xs text-gray-400 mt-2">Reference: {reference}</p>
                </div>
              )}
            </ModalBody>
            <ModalFooter>
              <CustomButton onClick={onClose} className="w-full bg-primaryColor text-white">
                Close
              </CustomButton>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default PaymentStatusModal;
