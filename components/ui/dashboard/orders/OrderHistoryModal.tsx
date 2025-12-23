"use client";

import React, { useEffect, useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  Button,
  Chip,
  Spinner,
  Accordion,
  AccordionItem,
} from "@nextui-org/react";
import { X, History, User, Clock, ChevronDown } from "lucide-react";
import moment from "moment";
import { getOrderHistory } from "@/app/api/controllers/dashboard/orders";

interface OrderHistoryModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  orderId: string | null;
  orderReference?: string;
}

interface HistoryItem {
  orderId: string;
  orderReference: string;
  action: string;
  performedById: string;
  performedByName: string;
  reason: string;
  details: any;
  dateCreated: string;
}

const getActionColor = (action: string) => {
  switch (action.toLowerCase()) {
    case "created":
      return "success";
    case "updated":
      return "primary";
    case "paymentconfirmed":
    case "paymentcompleted":
      return "success";
    case "paymentinitiated":
      return "warning";
    case "cancelled":
      return "danger";
    case "refunded":
      return "secondary";
    default:
      return "default";
  }
};

const formatActionLabel = (action: string) => {
  // Convert camelCase or PascalCase to readable format
  return action.replace(/([A-Z])/g, " $1").trim();
};

const OrderHistoryModal: React.FC<OrderHistoryModalProps> = ({
  isOpen,
  onOpenChange,
  orderId,
  orderReference,
}) => {
  const [data, setData] = useState<HistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (isOpen && orderId) {
        setIsLoading(true);
        setError(null);
        try {
          const response = await getOrderHistory(orderId);
          if (response?.isSuccessful && response.data) {
            setData(response.data);
          } else {
            setError(response?.error || "Failed to fetch order history");
          }
        } catch (err) {
          setError("An error occurred while fetching data");
        } finally {
          setIsLoading(false);
        }
      } else if (!isOpen) {
        setData([]);
      }
    };

    fetchData();
  }, [isOpen, orderId]);

  const renderItemsList = (items: any[]) => {
    if (!items || items.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-4 text-gray-400">
          <svg className="w-10 h-10 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
          <p className="text-xs">No items</p>
        </div>
      );
    }

    return (
      <div className="space-y-2">
        {items.map((item: any, idx: number) => (
          <div key={idx} className="flex justify-between items-center text-xs bg-white p-2 rounded border border-gray-100">
            <div className="flex-1">
              <p className="font-medium text-black">{item.ItemName}</p>
              <p className="text-gray-500">Qty: {item.Quantity}</p>
            </div>
            <div className="text-right">
              <p className="font-medium text-black">
                {Number(item.TotalPrice).toLocaleString("en-NG", {
                  style: "currency",
                  currency: "NGN",
                })}
              </p>
              {item.IsPacked && (
                <p className="text-gray-500">Pack: {Number(item.PackingCost).toLocaleString("en-NG", { style: "currency", currency: "NGN" })}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderEmptyState = () => (
    <div className="flex flex-col items-center justify-center py-6 text-gray-400 bg-gray-50 rounded-lg mt-2">
      <svg className="w-12 h-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      <p className="text-sm">No details available</p>
    </div>
  );

  const renderDetails = (details: any, action: string) => {
    if (!details || Object.keys(details).length === 0) {
      return renderEmptyState();
    }

    // Payment details
    if (action.toLowerCase().includes("payment")) {
      const hasPaymentData = details.PaidNow !== undefined || details.PaymentMethod || details.Status || details.RemainingAfter !== undefined || details.SystemReference;

      if (!hasPaymentData) {
        return renderEmptyState();
      }

      return (
        <div className="grid grid-cols-2 gap-2 text-sm mt-2 p-3 bg-gray-50 rounded-lg">
          {details.PaidNow !== undefined && (
            <div>
              <span className="text-gray-500">Amount:</span>{" "}
              <span className="font-medium text-black">
                {Number(details.PaidNow).toLocaleString("en-NG", {
                  style: "currency",
                  currency: "NGN",
                })}
              </span>
            </div>
          )}
          {details.PaymentMethod && (
            <div>
              <span className="text-gray-500">Method:</span>{" "}
              <span className="font-medium text-black">{details.PaymentMethod}</span>
            </div>
          )}
          {details.Status && (
            <div>
              <span className="text-gray-500">Status:</span>{" "}
              <Chip size="sm" color={details.Status === "Confirmed" ? "success" : "warning"} variant="flat">
                {details.Status}
              </Chip>
            </div>
          )}
          {details.RemainingAfter !== undefined && (
            <div>
              <span className="text-gray-500">Remaining:</span>{" "}
              <span className="font-medium text-black">
                {Number(details.RemainingAfter).toLocaleString("en-NG", {
                  style: "currency",
                  currency: "NGN",
                })}
              </span>
            </div>
          )}
          {details.SystemReference && (
            <div className="col-span-2">
              <span className="text-gray-500">Reference:</span>{" "}
              <span className="font-medium text-black">{details.SystemReference}</span>
            </div>
          )}
        </div>
      );
    }

    // Order update details (Before/After)
    if (details.Before && details.After) {
      return (
        <div className="mt-2 p-3 bg-gray-50 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex-1">
              <p className="text-xs text-gray-500 uppercase mb-2 font-semibold">Before</p>
              <p className="text-sm font-medium text-black mb-2">
                Total:{" "}
                {Number(details.Before.TotalAmount).toLocaleString("en-NG", {
                  style: "currency",
                  currency: "NGN",
                })}
              </p>
              {renderItemsList(details.Before.Items)}
            </div>
            <div className="flex-1">
              <p className="text-xs text-gray-500 uppercase mb-2 font-semibold">After</p>
              <p className="text-sm font-medium text-black mb-2">
                Total:{" "}
                {Number(details.After.TotalAmount).toLocaleString("en-NG", {
                  style: "currency",
                  currency: "NGN",
                })}
              </p>
              {renderItemsList(details.After.Items)}
            </div>
          </div>
        </div>
      );
    }

    // Created action with Items array directly
    if (details.Items && Array.isArray(details.Items)) {
      return (
        <div className="mt-2 p-3 bg-gray-50 rounded-lg">
          {details.TotalAmount !== undefined && (
            <p className="text-sm font-medium text-black mb-2">
              Total:{" "}
              {Number(details.TotalAmount).toLocaleString("en-NG", {
                style: "currency",
                currency: "NGN",
              })}
            </p>
          )}
          {renderItemsList(details.Items)}
        </div>
      );
    }

    // Generic details - show as key-value pairs
    const detailEntries = Object.entries(details).filter(([key, value]) =>
      value !== null && value !== undefined && value !== "" && typeof value !== "object"
    );

    if (detailEntries.length === 0) {
      return renderEmptyState();
    }

    return (
      <div className="grid grid-cols-2 gap-2 text-sm mt-2 p-3 bg-gray-50 rounded-lg">
        {detailEntries.map(([key, value]) => (
          <div key={key}>
            <span className="text-gray-500">{key}:</span>{" "}
            <span className="font-medium text-black">{String(value)}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      size="2xl"
      hideCloseButton
      scrollBehavior="inside"
      classNames={{
        wrapper: "items-center",
        base: "max-w-2xl max-h-[80vh]",
      }}
    >
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1 border-b border-gray-200">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <History className="w-5 h-5 text-primaryColor" />
              <h2 className="text-lg font-bold text-black">Order History</h2>
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
          </div>
          {orderReference && (
            <p className="text-sm text-gray-600 mt-1">
              Reference: <span className="font-semibold text-black">{orderReference}</span>
            </p>
          )}
        </ModalHeader>
        <ModalBody className="p-6">
          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <Spinner size="lg" />
            </div>
          ) : error ? (
            <div className="flex flex-col justify-center items-center h-40 text-gray-500">
              <History className="w-12 h-12 mb-2 opacity-50" />
              <p>{error}</p>
            </div>
          ) : data.length === 0 ? (
            <div className="flex flex-col justify-center items-center h-40 text-gray-500">
              <History className="w-12 h-12 mb-2 opacity-50" />
              <p>No history available for this order</p>
            </div>
          ) : (
            <div className="space-y-4">
              {data.map((item, index) => (
                <div
                  key={index}
                  className="relative pl-6 pb-4 border-l-2 border-gray-200 last:border-l-0 last:pb-0"
                >
                  {/* Timeline dot */}
                  <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-primaryColor border-2 border-white shadow" />

                  <div className="bg-white border border-gray-100 rounded-lg p-4 shadow-sm">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Chip
                          size="sm"
                          color={getActionColor(item.action)}
                          variant="flat"
                        >
                          {formatActionLabel(item.action)}
                        </Chip>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Clock className="w-3 h-3" />
                        {item.dateCreated && item.dateCreated !== "0001-01-01T00:00:00"
                          ? moment(item.dateCreated).format("MMM DD, YYYY h:mm A")
                          : "N/A"}
                      </div>
                    </div>

                    {/* Reason */}
                    <p className="text-sm text-gray-700 mb-2">{item.reason}</p>

                    {/* Performed by */}
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <User className="w-3 h-3" />
                      <span>By {item.performedByName}</span>
                    </div>

                    {/* Details (expandable) */}
                    {item.details && Object.keys(item.details).length > 0 && (
                      <Accordion isCompact className="mt-2 px-0">
                        <AccordionItem
                          key="details"
                          aria-label="View details"
                          title={
                            <span className="text-xs text-primaryColor">View details</span>
                          }
                          indicator={<ChevronDown className="w-4 h-4 text-primaryColor" />}
                          classNames={{
                            trigger: "py-1 px-0",
                            content: "pt-0 pb-2",
                          }}
                        >
                          {renderDetails(item.details, item.action)}
                        </AccordionItem>
                      </Accordion>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default OrderHistoryModal;
