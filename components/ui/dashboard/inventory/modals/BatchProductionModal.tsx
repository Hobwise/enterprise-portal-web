'use client';

import React, { useState, useEffect } from 'react';
import { Modal, ModalContent, ModalBody, Spinner } from '@nextui-org/react';
import { X, Factory, ChefHat } from 'lucide-react';
import toast from 'react-hot-toast';
import { getJsonItemFromLocalStorage } from '@/lib/utils';
import {
  produceBatch,
  getRecipeByItem,
  Recipe,
} from '@/app/api/controllers/dashboard/inventory';
import type { InventoryItem } from '@/app/api/controllers/dashboard/inventory';

interface BatchProductionModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSuccess: () => void;
  item: InventoryItem | null;
}

const BatchProductionModal: React.FC<BatchProductionModalProps> = ({
  isOpen,
  onOpenChange,
  onSuccess,
  item,
}) => {
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loadingRecipe, setLoadingRecipe] = useState(false);
  const [quantity, setQuantity] = useState('');
  const [producing, setProducing] = useState(false);

  // Fetch recipe when modal opens
  useEffect(() => {
    if (isOpen && item) {
      fetchRecipe();
    }
  }, [isOpen, item]);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setRecipe(null);
      setQuantity('');
    }
  }, [isOpen]);

  const fetchRecipe = async () => {
    if (!item) return;

    setLoadingRecipe(true);
    try {
      const business = getJsonItemFromLocalStorage('business');
      const response = await getRecipeByItem(business[0]?.businessId, item.id);

      if (response?.data?.isSuccessful && response.data.data) {
        setRecipe(response.data.data as Recipe);
      }
    } catch (error) {
      console.error('Error fetching recipe:', error);
    } finally {
      setLoadingRecipe(false);
    }
  };

  const handleProduce = async () => {
    if (!recipe) {
      toast.error('No recipe found for this item');
      return;
    }

    if (!quantity || parseFloat(quantity) <= 0) {
      toast.error('Please enter a valid quantity');
      return;
    }

    setProducing(true);
    try {
      const business = getJsonItemFromLocalStorage('business');
      const response = await produceBatch(business[0]?.businessId, {
        recipeId: recipe.id,
        producedQuantityMultiplier: parseFloat(quantity),
      });

      if (response?.data?.isSuccessful) {
        toast.success('Batch produced successfully');
        setQuantity('');
        onSuccess();
        onOpenChange(false);
      } else {
        toast.error(response?.data?.error || 'Failed to produce batch');
      }
    } catch (error) {
      console.error('Error producing batch:', error);
      toast.error('Failed to produce batch');
    } finally {
      setProducing(false);
    }
  };

  if (!item) return null;

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
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-[#5F35D2]/10 rounded-xl flex items-center justify-center">
                    <Factory className="w-6 h-6 text-[#5F35D2]" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-800">
                      Produce Batch
                    </h2>
                    <p className="text-sm text-gray-500">{item.name}</p>
                  </div>
                </div>
                <button
                  onClick={() => onOpenChange(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="p-6">
                {loadingRecipe ? (
                  <div className="flex items-center justify-center py-12">
                    <Spinner size="lg" color="secondary" />
                  </div>
                ) : !recipe ? (
                  <div className="text-center py-12">
                    <ChefHat className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg mb-2">No Recipe Found</p>
                    <p className="text-gray-400 text-sm">
                      Please add a recipe for this produced item first.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Quantity Input */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Quantity
                      </label>
                      <input
                        type="number"
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                        placeholder="Enter quantity to produce"
                        min="0.001"
                        step="0.001"
                        autoFocus
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5F35D2]/20 focus:border-[#5F35D2] text-gray-700 bg-gray-50 hover:bg-white transition-colors duration-200"
                      />
                    </div>

                    {/* Produce Button */}
                    <button
                      onClick={handleProduce}
                      disabled={producing || !quantity}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#5F35D2] text-white rounded-xl hover:bg-[#5F35D2]/90 font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                    >
                      {producing ? (
                        <>
                          <Spinner size="sm" color="current" />
                          <span>Producing...</span>
                        </>
                      ) : (
                        <>
                          <Factory className="w-5 h-5" />
                          <span>Produce Batch</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </ModalBody>
        )}
      </ModalContent>
    </Modal>
  );
};

export default BatchProductionModal;
