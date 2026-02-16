"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Modal,
  ModalContent,
  ModalBody,
  ModalFooter,
  Button,
  Spinner,
} from "@nextui-org/react";
import { IoClose } from "react-icons/io5";
import { Paperclip, FileText, X } from "lucide-react";

interface SendEmailModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  supplierEmail: string;
  businessName: string;
  onSend: (to: string, cc: string, subject: string, message: string, attachment: File | null) => void;
  isLoading?: boolean;
}

const SendEmailModal: React.FC<SendEmailModalProps> = ({
  isOpen,
  onOpenChange,
  supplierEmail,
  businessName,
  onSend,
  isLoading,
}) => {
  const [to, setTo] = useState("");
  const [cc, setCc] = useState("");
  const [subject, setSubject] = useState("Purchase Request");
  const [message, setMessage] = useState("");
  const [attachment, setAttachment] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTo(supplierEmail);
      setCc("");
      setSubject("Purchase Request");
      setMessage("");
      setAttachment(null);
    }
  }, [isOpen, supplierEmail]);

  const handleSend = () => {
    onSend(to, cc, subject, message, attachment);
  };

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="lg" hideCloseButton>
      <ModalContent>
        {(onClose) => (
          <>
            <ModalBody className="px-6 pt-6 pb-4">
        

              {/* Field rows */}
              <div className="divide-y divide-gray-200">
                <div className="flex items-center gap-4 py-3">
                  <label className="text-sm text-gray-500 w-16 shrink-0">Send to:</label>
                  <input
                    type="email"
                    value={to}
                    onChange={(e) => setTo(e.target.value)}
                    className="flex-1 text-sm text-gray-800 bg-transparent focus:outline-none"
                  />
                </div>
                <div className="flex items-center gap-4 py-3">
                  <label className="text-sm text-gray-500 w-16 shrink-0">CC:</label>
                  <input
                    type="email"
                    value={cc}
                    onChange={(e) => setCc(e.target.value)}
                    placeholder=""
                    className="flex-1 text-sm text-gray-800 bg-transparent focus:outline-none"
                  />
                </div>
                <div className="flex items-center gap-4 py-3">
                  <label className="text-sm text-gray-500 w-16 shrink-0">Subject:</label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="flex-1 text-sm text-gray-800 bg-transparent focus:outline-none"
                  />
                </div>
              </div>

              {/* Attachment card — only shown when a file is attached */}
              {attachment && (
                <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 mt-4">
                  <FileText size={20} className="text-gray-400 shrink-0" />
                  <span className="text-sm text-gray-700 flex-1 truncate">
                    {attachment.name}
                  </span>
                  <button
                    onClick={() => setAttachment(null)}
                    className="p-1 hover:bg-gray-200 rounded-full transition-colors shrink-0"
                  >
                    <X size={16} className="text-gray-400" />
                  </button>
                </div>
              )}

              {/* Message textarea */}
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={5}
                placeholder="Add a message"
                className="w-full px-4 py-3 mt-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5F35D2]/20 focus:border-[#5F35D2] text-sm text-gray-700 bg-white resize-none"
              />
            </ModalBody>

            <ModalFooter className="px-6 pb-6 pt-2 flex items-center justify-between">
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) setAttachment(file);
                  e.target.value = "";
                }}
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Paperclip size={22} className="text-gray-400 hover:text-gray-600" />
              </button>
              <Button
                className="bg-primaryColor text-white font-medium rounded-xl px-8"
                onPress={handleSend}
                isDisabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Spinner size="sm" color="white" />
                    Sending...
                  </>
                ) : (
                  <>Send &rarr;</>
                )}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default SendEmailModal;
