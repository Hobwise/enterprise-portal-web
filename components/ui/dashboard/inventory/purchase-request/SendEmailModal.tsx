"use client";

import React, { useState, useEffect } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from "@nextui-org/react";
import { IoClose } from "react-icons/io5";
import { HiOutlineDocumentDownload } from "react-icons/hi";

interface SendEmailModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  supplierEmail: string;
  businessName: string;
  onSend: (to: string, cc: string, subject: string, message: string) => void;
}

const SendEmailModal: React.FC<SendEmailModalProps> = ({
  isOpen,
  onOpenChange,
  supplierEmail,
  businessName,
  onSend,
}) => {
  const [to, setTo] = useState("");
  const [cc, setCc] = useState("");
  const [subject, setSubject] = useState("Purchase Request");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (isOpen) {
      setTo(supplierEmail);
      setCc("");
      setSubject("Purchase Request");
      setMessage("");
    }
  }, [isOpen, supplierEmail]);

  const handleSend = () => {
    onSend(to, cc, subject, message);
  };

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="lg" hideCloseButton>
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex items-center justify-between border-b border-gray-100 pb-4">
              <h2 className="text-lg font-bold text-[#3D424A]">Send Purchase Request</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <IoClose size={20} className="text-gray-500" />
              </button>
            </ModalHeader>

            <ModalBody className="py-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Send to</label>
                  <input
                    type="email"
                    value={to}
                    onChange={(e) => setTo(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5F35D2]/20 focus:border-[#5F35D2] text-gray-700 bg-gray-50 hover:bg-white text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">CC</label>
                  <input
                    type="email"
                    value={cc}
                    onChange={(e) => setCc(e.target.value)}
                    placeholder="Add CC email"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5F35D2]/20 focus:border-[#5F35D2] text-gray-700 bg-gray-50 hover:bg-white text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5F35D2]/20 focus:border-[#5F35D2] text-gray-700 bg-gray-50 hover:bg-white text-sm"
                  />
                </div>

                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <HiOutlineDocumentDownload size={20} className="text-primaryColor" />
                  <span className="text-sm text-gray-700 flex-1">
                    Purchase Request ({businessName})
                  </span>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={4}
                    placeholder="Add a message to your supplier..."
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5F35D2]/20 focus:border-[#5F35D2] text-gray-700 bg-gray-50 hover:bg-white text-sm resize-none"
                  />
                </div>
              </div>
            </ModalBody>

            <ModalFooter className="border-t border-gray-100 pt-4">
              <Button
                className="bg-primaryColor text-white font-medium rounded-lg w-full"
                onPress={handleSend}
              >
                Send Email
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default SendEmailModal;
