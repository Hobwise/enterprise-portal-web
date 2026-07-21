"use client";

import React, { useEffect, useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Spinner,
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
                <div className="flex flex-col justify-center items-center py-8 gap-4">
                  {/* Error illustration */}
                  <svg
                    width="130"
                    height="130"
                    viewBox="0 0 130 130"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                  >
                    {/* Outer glow circle */}
                    <circle cx="65" cy="65" r="55" fill="#FEF2F2" />
                    <circle cx="65" cy="65" r="44" fill="#FEE2E2" />
                    {/* Receipt / document */}
                    <rect x="38" y="28" width="54" height="68" rx="6" fill="white" stroke="#FECACA" strokeWidth="2" />
                    {/* Zigzag bottom on receipt */}
                    <path d="M38 90 L43 84 L48 90 L53 84 L58 90 L63 84 L68 90 L73 84 L78 90 L83 84 L88 90 L92 84 L92 96 L38 96 Z" fill="white" stroke="#FECACA" strokeWidth="1.2" />
                    {/* Receipt content lines */}
                    <rect x="48" y="38" width="34" height="4" rx="2" fill="#FECACA" />
                    <rect x="48" y="48" width="26" height="3" rx="1.5" fill="#FEE2E2" />
                    <rect x="48" y="56" width="30" height="3" rx="1.5" fill="#FEE2E2" />
                    <rect x="48" y="64" width="22" height="3" rx="1.5" fill="#FEE2E2" />
                    {/* Warning circle */}
                    <circle cx="90" cy="88" r="20" fill="white" stroke="#FECACA" strokeWidth="2" />
                    <circle cx="90" cy="88" r="16" fill="#FEF2F2" />
                    {/* Exclamation mark body */}
                    <rect x="88" y="80" width="4" height="10" rx="2" fill="#EF4444" />
                    {/* Exclamation dot */}
                    <circle cx="90" cy="94" r="2.5" fill="#EF4444" />
                    {/* Small sparkles */}
                    <line x1="28" y1="30" x2="28" y2="38" stroke="#FCA5A5" strokeWidth="1.5" strokeLinecap="round" />
                    <line x1="24" y1="34" x2="32" y2="34" stroke="#FCA5A5" strokeWidth="1.5" strokeLinecap="round" />
                    <line x1="108" y1="42" x2="108" y2="48" stroke="#FCA5A5" strokeWidth="1.5" strokeLinecap="round" />
                    <line x1="105" y1="45" x2="111" y2="45" stroke="#FCA5A5" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                  <div className="text-center">
                    <p className="font-semibold text-gray-600 text-sm mt-1">No payment yet</p>
                    {reference && (
                      <p className="text-xs text-gray-300 mt-3 font-mono bg-gray-50 px-3 py-1 rounded-full border border-gray-100 inline-block">
                        {reference}
                      </p>
                    )}
                  </div>
                </div>
              ) : data ? (
                <div className="flex flex-col gap-4 text-sm text-black">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">Status</span>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        ["successful", "success"].includes(data.status?.toLowerCase())
                          ? "bg-green-100 text-green-700 border border-green-300"
                          : data.status?.toLowerCase() === "pending"
                          ? "bg-yellow-100 text-yellow-700 border border-yellow-300"
                          : "bg-red-100 text-red-700 border border-red-300"
                      }`}
                    >
                      {data.status || "Unknown"}
                    </span>
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
                <div className="flex flex-col justify-center items-center py-8 gap-4">
                  {/* No data illustration */}
                  <svg
                    width="130"
                    height="130"
                    viewBox="0 0 130 130"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                  >
                    {/* Outer glow circle */}
                    <circle cx="65" cy="65" r="55" fill="#F5F3FF" />
                    <circle cx="65" cy="65" r="44" fill="#EDE9FE" />
                    {/* Receipt / document */}
                    <rect x="36" y="25" width="58" height="74" rx="7" fill="white" stroke="#DDD6FE" strokeWidth="2" />
                    {/* Zigzag bottom */}
                    <path d="M36 93 L41 86 L46 93 L51 86 L56 93 L61 86 L66 93 L71 86 L76 93 L81 86 L86 93 L91 86 L94 90 L94 99 L36 99 Z" fill="white" stroke="#DDD6FE" strokeWidth="1.2" />
                    {/* Receipt title bar */}
                    <rect x="46" y="35" width="38" height="5" rx="2.5" fill="#C4B5FD" />
                    {/* Receipt lines */}
                    <rect x="46" y="48" width="30" height="3.5" rx="1.75" fill="#EDE9FE" />
                    <rect x="46" y="57" width="38" height="3.5" rx="1.75" fill="#EDE9FE" />
                    <rect x="46" y="66" width="24" height="3.5" rx="1.75" fill="#EDE9FE" />
                    <rect x="46" y="75" width="34" height="3.5" rx="1.75" fill="#EDE9FE" />
                    {/* Magnifying glass */}
                    <circle cx="88" cy="88" r="20" fill="white" stroke="#DDD6FE" strokeWidth="2" />
                    <circle cx="88" cy="88" r="13" fill="#F5F3FF" stroke="#A78BFA" strokeWidth="2" />
                    {/* Question mark */}
                    <text x="88" y="94" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#7C3AED">?</text>
                    {/* Handle */}
                    <line x1="97" y1="98" x2="108" y2="110" stroke="#A78BFA" strokeWidth="3.5" strokeLinecap="round" />
                    {/* Small sparkles */}
                    <line x1="26" y1="28" x2="26" y2="35" stroke="#C4B5FD" strokeWidth="1.5" strokeLinecap="round" />
                    <line x1="22.5" y1="31.5" x2="29.5" y2="31.5" stroke="#C4B5FD" strokeWidth="1.5" strokeLinecap="round" />
                    <line x1="110" y1="38" x2="110" y2="44" stroke="#C4B5FD" strokeWidth="1.5" strokeLinecap="round" />
                    <line x1="107" y1="41" x2="113" y2="41" stroke="#C4B5FD" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                  <div className="text-center">
                    <p className="font-semibold text-gray-700 text-sm">No Payment Data Found</p>
                    <p className="text-xs text-gray-400 mt-1 max-w-[220px] leading-relaxed">
                      We couldn&apos;t find any payment information for this reference.
                    </p>
                    {reference && (
                      <p className="text-xs text-gray-300 mt-3 font-mono bg-gray-50 px-3 py-1 rounded-full border border-gray-100 inline-block">
                        {reference}
                      </p>
                    )}
                  </div>
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
