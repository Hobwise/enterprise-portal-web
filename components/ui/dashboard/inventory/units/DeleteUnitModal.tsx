'use client';

import React from 'react';
import {
  Modal,
  ModalContent,
  ModalBody,
  Spinner,
} from '@nextui-org/react';
import { X, Trash2 } from 'lucide-react';
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
      size="lg"
      hideCloseButton
    >
      <ModalContent className="bg-white rounded-2xl shadow-2xl border border-gray-200">
        {(onClose) => (
          <ModalBody className="p-0">
            <div className="bg-white rounded-2xl w-full">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center">
                    <Trash2 className="w-5 h-5 text-red-500" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-800">
                      Delete Unit
                    </h2>
                    <p className="text-sm text-gray-500">
                      This action cannot be undone
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  disabled={isLoading}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Body */}
              <div className="p-6">
                <p className="text-gray-600">
                  Are you sure you want to delete{' '}
                  <span className="font-semibold text-gray-900">
                    {unit.name}
                  </span>
                  ? This action cannot be undone.
                </p>
              </div>

              {/* Footer */}
              <div className="flex justify-end gap-3 px-6 pb-6">
                <button
                  onClick={onClose}
                  disabled={isLoading}
                  className="px-6 py-2.5 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 font-semibold transition-all duration-200 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={onConfirm}
                  disabled={isLoading}
                  className="flex items-center gap-2 px-6 py-2.5 bg-red-500 text-white rounded-xl hover:bg-red-600 font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  {isLoading ? (
                    <>
                      <Spinner size="sm" color="current" />
                      <span>Deleting...</span>
                    </>
                  ) : (
                    <span>Delete</span>
                  )}
                </button>
              </div>
            </div>
          </ModalBody>
        )}
      </ModalContent>
    </Modal>
  );
};

export default DeleteUnitModal;
