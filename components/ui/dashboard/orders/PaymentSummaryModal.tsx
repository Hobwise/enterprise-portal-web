"use client";

import React, { useEffect, useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  Button,
  Chip,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Spinner,
} from "@nextui-org/react";
import { X } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import moment from "moment";
import { getPaymentSummary } from "@/app/api/controllers/dashboard/orders";
import CustomPagination from "./CustomPagination";

interface PaymentSummaryModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  orderId: string | null;
}

interface Payment {
  paymentMethod: string;
  amount: number;
  paymentStatus: string;
  paymentType: string;
  paymentDirection?: string;
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

const PaymentSummaryModal: React.FC<PaymentSummaryModalProps> = ({
  isOpen,
  onOpenChange,
  orderId,
}) => {
  const [data, setData] = useState<PaymentSummaryData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    const fetchData = async () => {
      if (isOpen && orderId) {
        setIsLoading(true);
        setError(null);
        try {
          const response = await getPaymentSummary(orderId);
          if (response?.isSuccessful && response.data) {
            setData(response.data);
          } else {
            setError(response?.error || "Failed to fetch payment summary");
          }
        } catch (err) {
          setError("An error occurred while fetching data");
        } finally {
          setIsLoading(false);
        }
      } else if (!isOpen) {
        setData(null);
      }
    };

    fetchData();
  }, [isOpen, orderId]);

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      size="2xl"
      hideCloseButton
      classNames={{
        wrapper: "items-center",
        base: "max-w-2xl",
      }}
    >
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1 border-b border-gray-200">
          <div className="flex items-center justify-between w-full">
            <h2 className="text-lg font-bold text-black">Payment Summary</h2>
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
          {data && (
            <div className="flex items-center gap-2 mt-2 text-sm text-gray-600">
              <span>
                Reference:{" "}
                <span className="font-semibold text-black">
                  {data.reference}
                </span>
              </span>
              <span>•</span>
              <Chip
                size="sm"
                color={data.status === "Full Payment" ? "success" : "warning"}
                variant="flat"
              >
                {data.status}
              </Chip>
            </div>
          )}
        </ModalHeader>
        <ModalBody className="p-6">
          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <Spinner size="lg" />
            </div>
          ) : error ? (
            <div className="flex justify-center items-center h-40 text-red-500">
              {error}
            </div>
          ) : data ? (
            <div className="space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 uppercase">
                    Total Amount
                  </p>
                  <p className="text-lg font-bold text-black">
                    {formatPrice(data.totalAmount)}
                  </p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <p className="text-xs text-green-600 uppercase">
                    Amount Paid
                  </p>
                  <p className="text-lg font-bold text-green-700">
                    {formatPrice(data.amountPaid)}
                  </p>
                </div>
                <div className="p-4 bg-red-50 rounded-lg">
                  <p className="text-xs text-red-600 uppercase">Remaining</p>
                  <p className="text-lg font-bold text-red-700">
                    {formatPrice(data.amountRemaining)}
                  </p>
                </div>
              </div>

              {/* Payments Table */}
              <div>
                <h3 className="text-sm font-semibold text-black mb-3">
                  Payment History
                </h3>
                <Table
                  aria-label="Payment history table"
                  shadow="none"
                  classNames={{
                    wrapper:
                      "p-0 border border-gray-200 rounded-lg shadow-none",
                  }}
                >
                  <TableHeader>
                    <TableColumn>DATE</TableColumn>
                    <TableColumn>METHOD</TableColumn>
                    <TableColumn>TYPE</TableColumn>
                    <TableColumn>AMOUNT</TableColumn>
                    <TableColumn>STATUS</TableColumn>
                  </TableHeader>
                  <TableBody>
                    {data.payments
                      .slice((page - 1) * 5, page * 5)
                      .map((payment, index) => {
                        const isDebit = payment.paymentDirection === "Debit";
                        return (
                          <TableRow className="text-black" key={index}>
                            <TableCell>
                              {moment(payment.dateCreated).format(
                                "MMM DD, YYYY h:mm A"
                              )}
                            </TableCell>
                            <TableCell>{payment.paymentMethod}</TableCell>
                            <TableCell>
                              <span
                                className={
                                  isDebit ? "text-red-600" : "text-green-600"
                                }
                              >
                                {payment.paymentDirection || "-"}
                              </span>
                            </TableCell>
                            <TableCell
                              className={isDebit ? "text-red-600" : ""}
                            >
                              {isDebit ? "-" : ""}
                              {formatPrice(payment.amount)}
                            </TableCell>
                            <TableCell>
                              <Chip size="sm" color="success" variant="flat">
                                {payment.paymentStatus}
                              </Chip>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                  </TableBody>
                </Table>
                {Math.ceil(data.payments.length / 10) > 1 && (
                  <div className="flex w-full justify-center mt-4 border-t border-gray-200">
                    <CustomPagination
                      currentPage={page}
                      totalPages={Math.ceil(data.payments.length / 10)}
                      hasNext={page < Math.ceil(data.payments.length / 10)}
                      hasPrevious={page > 1}
                      totalCount={data.payments.length}
                      pageSize={10}
                      onPageChange={(page: number) => setPage(page)}
                      onNext={() => setPage(page + 1)}
                      onPrevious={() => setPage(page - 1)}
                    />
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default PaymentSummaryModal;
