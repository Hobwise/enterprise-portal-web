"use client";

import React from "react";
import {
  Modal,
  ModalContent,
  ModalBody,
  ModalFooter,
  Button,
} from "@nextui-org/react";
import { CheckCircle, Send } from "lucide-react";
import { IoClose } from "react-icons/io5";

interface PurchaseSuccessModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onNotifySupplier: () => void;
  onClose: () => void;
}

const PurchaseSuccessModal: React.FC<PurchaseSuccessModalProps> = ({
  isOpen,
  onOpenChange,
  onNotifySupplier,
  onClose,
}) => {
  return (
    <Modal
      isDismissable={false}
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      size="lg"
      hideCloseButton
    >
      <ModalContent>
        {() => (
          <>
            <ModalBody className="px-4 py-4">
              {/* Close button */}
              <div className="flex justify-end">
                <button
                  onClick={onClose}
                  className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <IoClose size={18} className="text-gray-500" />
                </button>
              </div>

              {/* Success icon & message */}
              <div className="flex flex-col items-center py-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>

                <h2 className="text-sm font-bold text-[#3D424A] mb-2">
                  Order Sent Successfully!
                </h2>

                <p className="text-xs text-gray-500 text-center max-w-sm">
                  Your purchase order has been saved. Would you like to
                  notify the supplier?
                </p>
              </div>
            </ModalBody>

            <ModalFooter className="flex px-4 pb-3 pt-3 border-t border-gray-100">
              <div className="flex justify-center w-full gap-3">
                <Button
                  variant="bordered"
                  className="border-primaryColor text-primaryColor font-medium rounded-lg px-6"
                  onPress={onClose}
                >
                  Close
                </Button>
                <Button
                  className="bg-primaryColor text-white font-medium rounded-lg px-6"
                  onPress={onNotifySupplier}
                  startContent={<Send size={14} />}
                >
                  Notify Supplier
                </Button>
              </div>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default PurchaseSuccessModal;
