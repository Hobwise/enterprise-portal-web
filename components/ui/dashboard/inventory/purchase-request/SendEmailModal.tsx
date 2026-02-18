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
import { LuMail } from "react-icons/lu";
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
  onSend,
  isLoading,
}) => {
  const [to, setTo] = useState("");
  const [cc, setCc] = useState("");
  const [subject, setSubject] = useState("Purchase Order");
  const [message, setMessage] = useState("");
  const [attachment, setAttachment] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTo(supplierEmail);
      setCc("");
      setSubject("Purchase Order");
      setMessage("");
      setAttachment(null);
    }
  }, [isOpen, supplierEmail]);

  const handleSend = () => {
    onSend(to, cc, subject, message, attachment);
  };

  const inputClassName =
    "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#5F35D2]/20 focus:border-[#5F35D2]";

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="lg" hideCloseButton>
      <ModalContent>
        {(onClose) => (
          <>
            <ModalBody className="px-4 py-4">
              {/* Header */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 bg-[#5F35D2]/10 rounded-lg flex items-center justify-center">
                    <LuMail size={16} className="text-[#5F35D2]" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-[#3D424A]">
                      Send Email to Supplier
                    </h2>
                    <p className="text-xs text-gray-400 font-normal">
                      Notify the supplier about this purchase order
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <IoClose size={18} className="text-gray-500" />
                </button>
              </div>

              {/* Form fields */}
              <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                <div>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-1">
                    Send To
                  </p>
                  <input
                    type="email"
                    value={to}
                    onChange={(e) => setTo(e.target.value)}
                    placeholder="supplier@email.com"
                    className={inputClassName}
                  />
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-1">
                    CC
                  </p>
                  <input
                    type="email"
                    value={cc}
                    onChange={(e) => setCc(e.target.value)}
                    placeholder="Optional"
                    className={inputClassName}
                  />
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-1">
                    Subject
                  </p>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className={inputClassName}
                  />
                </div>
              </div>

              {/* Attachment card */}
              {attachment && (
                <div className="flex items-center gap-3 px-3 py-2 bg-gray-50 rounded-xl border border-gray-200 mt-1">
                  <FileText size={16} className="text-gray-400 shrink-0" />
                  <span className="text-xs text-gray-700 flex-1 truncate">
                    {attachment.name}
                  </span>
                  <button
                    onClick={() => setAttachment(null)}
                    className="p-0.5 hover:bg-gray-200 rounded-full transition-colors shrink-0"
                  >
                    <X size={14} className="text-gray-400" />
                  </button>
                </div>
              )}

              {/* Message textarea */}
              <div className="mt-1">
                <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-1">
                  Message
                </p>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={5}
                  placeholder="Add a message to the supplier..."
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5F35D2]/20 focus:border-[#5F35D2] text-sm text-gray-700 bg-white resize-none"
                />
              </div>
            </ModalBody>

            <ModalFooter className="px-4 pb-3 pt-3 border-t border-gray-100 flex items-center justify-between">
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
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Paperclip size={16} />
                <span>Attach file</span>
              </button>
              <Button
                className="bg-primaryColor text-white font-medium rounded-lg px-6"
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
