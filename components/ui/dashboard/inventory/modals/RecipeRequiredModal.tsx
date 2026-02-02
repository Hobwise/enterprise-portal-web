'use client';

import React from 'react';
import { Modal, ModalContent, ModalBody } from '@nextui-org/react';
import { AlertTriangle, ChefHat, X } from 'lucide-react';

interface RecipeRequiredModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onAddRecipe: () => void;
  itemName: string;
}

const RecipeRequiredModal: React.FC<RecipeRequiredModalProps> = ({
  isOpen,
  onOpenChange,
  onAddRecipe,
  itemName,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      size="md"
      onOpenChange={onOpenChange}
      hideCloseButton
    >
      <ModalContent className="bg-white rounded-2xl shadow-2xl border border-gray-200">
        {() => (
          <ModalBody className="p-0">
            <div className="bg-white rounded-2xl w-full">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-800">
                      Recipe Required
                    </h2>
                  </div>
                </div>
                <button
                  onClick={() => onOpenChange(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="p-6 space-y-5">
                {/* Warning Message */}
                <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
                  <p className="text-sm text-amber-800">
                    The produced item{' '}
                    <span className="font-semibold">"{itemName}"</span> requires
                    a recipe before you can track inventory or produce batches.
                  </p>
                </div>

                {/* Info */}
                <div className="flex items-start gap-3 text-gray-600">
                  <ChefHat className="w-5 h-5 mt-0.5 flex-shrink-0" />
                  <p className="text-sm">
                    A recipe defines the ingredients and quantities needed to
                    produce this item. Once added, you can track inventory
                    consumption and produce batches.
                  </p>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => onOpenChange(false)}
                    className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 font-semibold transition-all duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={onAddRecipe}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-[#5F35D2] text-white rounded-xl hover:bg-[#5F35D2]/90 font-semibold transition-all duration-200"
                  >
                    <ChefHat className="w-4 h-4" />
                    Add Recipe
                  </button>
                </div>
              </div>
            </div>
          </ModalBody>
        )}
      </ModalContent>
    </Modal>
  );
};

export default RecipeRequiredModal;
