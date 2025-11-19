"use client";
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  Spinner,
  Chip,
  Divider,
} from "@nextui-org/react";
import { useEffect, useState } from "react";
import { getOrderProgress } from "@/app/api/controllers/dashboard/orders";
import { CheckCircle2, Circle, Loader2 } from "lucide-react";

interface ProgressItem {
  itemName: string;
  categoryName: string;
  statusDescription: string;
}

interface OrderProgressModalProps {
  isOpen: boolean;
  onOpenChange: () => void;
  orderId: string;
  orderReference?: string;
  qrReference?: string;
}

const OrderProgressModal = ({
  isOpen,
  onOpenChange,
  orderId,
  orderReference,
  qrReference,
}: OrderProgressModalProps) => {
  const [progressData, setProgressData] = useState<ProgressItem[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && orderId) {
      fetchProgress();
    }
  }, [isOpen, orderId]);

  const fetchProgress = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await getOrderProgress(orderId);

      if (response?.isSuccessful) {
        setProgressData(response.data);
      } else {
        setError(response?.error || "Failed to load progress");
      }
    } catch (err) {
      setError("Failed to load progress data");
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (statusDescription: string) => {
    const status = statusDescription.toLowerCase();

    if (status.includes("completed") || status.includes("ready")) {
      return <CheckCircle2 className="w-5 h-5 text-green-600" />;
    }
    else {
      return <Circle className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (statusDescription: string) => {
    const status = statusDescription.toLowerCase();

    if (status.includes("completed") || status.includes("ready")) {
      return "success";
    } else if (status.includes("preparing") || status.includes("progress")) {
      return "primary";
    } else {
      return "default";
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      size="lg"
      scrollBehavior="inside"
      classNames={{
        base: "max-h-[90vh]",
      }}
    >
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1 border-b border-primaryGrey px-6 pt-6 pb-4">
          <h3 className="text-lg font-semibold text-black">Order Progress</h3>
          <div className="flex flex-col gap-1">
            {orderReference && (
              <p className="text-sm text-grey500">
                Order: <span className="font-medium">{orderReference}</span>
              </p>
            )}
            {qrReference && (
              <p className="text-sm text-grey500">
                Table: <span className="font-medium">{qrReference}</span>
              </p>
            )}
          </div>
        </ModalHeader>
        <ModalBody className="px-6 py-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-10">
              <Spinner size="lg" color="secondary" />
              <p className="text-center mt-3 text-sm text-grey500">
                Loading progress...
              </p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-10 px-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 w-full max-w-md">
                <p className="text-center text-red-600 font-medium">
                  {error}
                </p>
              </div>
            </div>
          ) : progressData && progressData.length > 0 ? (
            <div className="space-y-3">
              {progressData.map((item, index) => (
                <div key={index}>
                  <div className="flex items-start gap-3 p-4 bg-grey300 rounded-lg hover:bg-primaryGrey transition-colors">
                    <div className="flex-shrink-0 mt-0.5">
                      {getStatusIcon(item.statusDescription)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold text-black mb-1">
                        {item.itemName}
                      </h4>
                      <div className="flex flex-wrap items-center gap-2">
                        <Chip
                          size="sm"
                          variant="flat"
                          className="text-xs"
                        >
                          {item.categoryName}
                        </Chip>
                        <Chip
                          size="sm"
                          color={getStatusColor(item.statusDescription) as any}
                          variant="flat"
                          className="text-xs"
                        >
                          {item.statusDescription}
                        </Chip>
                      </div>
                    </div>
                  </div>
                  {index < progressData.length - 1 && (
                    <Divider className="my-2" />
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-10">
              <Circle className="w-12 h-12 text-gray-300 mb-3" />
              <p className="text-center text-grey500">
                No progress data available
              </p>
            </div>
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default OrderProgressModal;
