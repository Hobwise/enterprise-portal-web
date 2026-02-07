'use client';

import React from 'react';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from '@nextui-org/react';
import { X } from 'lucide-react';
import type { InventoryUnit } from '@/app/api/controllers/dashboard/inventory';

interface DeleteUnitModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onConfirm: () => void;
  unit: InventoryUnit | null;
  isLoading?: boolean;
}

const DeleteUnitModal: React.FC<DeleteUnitModalProps> = ({
  isOpen,
  onOpenChange,
  onConfirm,
  unit,
  isLoading = false,
}) => {
  if (!unit) return null;

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      size="md"
      hideCloseButton
      classNames={{ base: 'max-w-md' }}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex items-center justify-between">
              <div className="flex-1 text-center">
                <h2 className="text-xl font-bold text-[#3D424A]">
                  Delete Unit
                </h2>
              </div>
              <Button
                isIconOnly
                variant="light"
                onPress={onClose}
                className="text-gray-500 hover:text-gray-700"
                isDisabled={isLoading}
              >
                <X size={20} />
              </Button>
            </ModalHeader>
            <ModalBody className="px-6 py-6 text-center">
              <p className="text-gray-600">
                Are you sure you want to delete{' '}
                <span className="font-semibold text-gray-900">
                  {unit.name}
                </span>
                ?
                <br />
                This action cannot be undone.
              </p>
            </ModalBody>
            <ModalFooter className="flex justify-center gap-4 pb-6">
              <Button
                variant="bordered"
                onPress={onClose}
                isDisabled={isLoading}
                className="font-medium text-gray-700 border-gray-300 min-w-[100px]"
              >
                Cancel
              </Button>
              <Button
                color="danger"
                onPress={onConfirm}
                isLoading={isLoading}
                className="font-medium text-white min-w-[100px]"
              >
                Delete
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default DeleteUnitModal;
