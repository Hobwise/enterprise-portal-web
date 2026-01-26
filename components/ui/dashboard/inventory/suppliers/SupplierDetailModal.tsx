import {
  Modal,
  ModalContent,
  ModalBody,
  Button,
} from "@nextui-org/react";
import React from "react";
import { X } from "lucide-react";
import { BiEdit } from "react-icons/bi";
import { Supplier } from "./types";

interface SupplierDetailModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  supplier: Supplier | null;
  onEdit?: () => void;
}

const SupplierDetailModal: React.FC<SupplierDetailModalProps> = ({
  isOpen,
  onOpenChange,
  supplier,
  onEdit,
}) => {
  if (!supplier) return null;

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      size="lg"
      hideCloseButton
      classNames={{
        base: "max-w-xl",
      }}
    >
      <ModalContent>
        {(onClose) => (
          <ModalBody className="p-6 relative">
            <div className="absolute top-4 right-4 flex gap-2">
                <Button
                    isIconOnly
                    variant="light"
                    className="text-gray-500"
                    onPress={onEdit}
                >
                    <BiEdit size={20} />
                </Button>
                <Button
                    isIconOnly
                    variant="light"
                    onPress={onClose}
                    className="text-gray-500"
                >
                    <X size={20} />
                </Button>
            </div>

            <div className="flex flex-col items-center mb-8 mt-2">
                <h2 className="text-xl font-bold text-[#344054] mb-1">{supplier.name}</h2>
                <p className="text-gray-500 text-sm">{supplier.companyName}</p>
            </div>

            <div className="space-y-4 px-4">
                <div className="grid grid-cols-3 gap-4">
                    <span className="text-gray-500 text-sm">Supplier ID</span>
                    <span className="col-span-2 font-medium text-[#344054]">{supplier.supplierId}</span>
                </div>
                <div className="grid grid-cols-3 gap-4">
                    <span className="text-gray-500 text-sm">Email Address</span>
                    <span className="col-span-2 font-medium text-[#344054]">{supplier.email}</span>
                </div>
                <div className="grid grid-cols-3 gap-4">
                    <span className="text-gray-500 text-sm">Phone Number</span>
                    <span className="col-span-2 font-medium text-[#344054]">{supplier.phoneNumber}</span>
                </div>
                <div className="grid grid-cols-3 gap-4">
                    <span className="text-gray-500 text-sm">Physical Address</span>
                    <span className="col-span-2 font-medium text-[#344054]">{supplier.address}</span>
                </div>

                <div className="mt-8">
                    <span className="text-gray-500 text-sm block mb-3">Suppliers Item</span>
                    <div className="flex flex-col gap-2 bg-[#5F35D221] p-4 rounded-lg max-h-[260px] overflow-y-auto">
                        {supplier.items && supplier.items.length > 0 ? (
                            supplier.items.map((item) => (
                                <div key={item.id} className="bg-white rounded-lg p-1 text-center text-[#344054] text-sm shrink-0">
                                    {item.name}
                                </div>
                            ))
                        ) : (
                             <div className="bg-white rounded-lg p-1 text-center text-[#344054] text-sm italic">
                                No items assigned
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <div className="h-4"></div>
          </ModalBody>
        )}
      </ModalContent>
    </Modal>
  );
};

export default SupplierDetailModal;
