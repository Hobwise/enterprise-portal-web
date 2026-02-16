"use client";

import React from "react";
import {
  Modal,
  ModalContent,
  ModalBody,
  ModalFooter,
  Button,
} from "@nextui-org/react";
import { CheckCircle, Send, X } from "lucide-react";

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
      classNames={{
        wrapper: "items-center justify-center",
        backdrop: "bg-black/60 backdrop-blur-sm",
        base: "border border-gray-200",
      }}
    >
      <ModalContent className="bg-white rounded-2xl shadow-2xl">
        {() => (
          <>
            <ModalBody className="p-0">
              {/* Header */}
              <div className="relative bg-gradient-to-br from-green-50 to-green-100/50 p-8 rounded-t-2xl border-b border-green-200/30">
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-white/50 rounded-full transition-all duration-200"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="flex flex-col items-center">
                  <div className="relative mb-6">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                      <div className="w-16 h-16 bg-green-200 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-10 h-10 text-green-600" />
                      </div>
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-green-600 rounded-full flex items-center justify-center animate-pulse">
                      <CheckCircle className="w-4 h-4 text-white" />
                    </div>
                  </div>

                  <h2 className="text-2xl font-bold text-gray-800 mb-2">
                    Request Sent Successfully!
                  </h2>

                  <div className="w-16 h-1 bg-gradient-to-r from-green-400 to-green-600 rounded-full"></div>
                </div>
              </div>

              {/* Content */}
              <div className="px-8 py-6">
                <div className="text-center">
                  <p className="text-gray-700 text-lg leading-relaxed max-w-md mx-auto">
                    Your purchase request has been saved. Would you like to
                    notify the supplier?
                  </p>
                </div>
              </div>
            </ModalBody>

            <ModalFooter className="px-8 pb-8 pt-0">
              <div className="flex justify-center w-full gap-4">
                <Button
                  onClick={onClose}
                  className="bg-gray-200 text-gray-700 font-semibold px-8 py-6 rounded-xl hover:bg-gray-300 transform hover:scale-105 transition-all duration-200"
                  size="lg"
                >
                  Close
                </Button>
                <Button
                  onClick={onNotifySupplier}
                  className="bg-gradient-to-r from-[#5F35D2] to-[#4A2AAF] text-white font-semibold px-8 py-6 rounded-xl hover:from-[#4A2AAF] hover:to-[#3D2291] transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
                  size="lg"
                >
                  <div className="flex items-center gap-2">
                    <Send className="w-5 h-5" />
                    <span>Notify Supplier</span>
                  </div>
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
