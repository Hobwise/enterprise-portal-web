'use client';

import React, { useState, useEffect } from 'react';
import { Modal, ModalContent, ModalBody, Spinner, Switch } from '@nextui-org/react';
import { X, Plus, Package, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { getJsonItemFromLocalStorage } from '@/lib/utils';
import {
  updateRecipe,
  CreateRecipePayload,
  Recipe,
} from '@/app/api/controllers/dashboard/inventory';
import { useUnitsByBusiness, useIngredients } from '@/hooks/cachedEndpoints/useInventoryItems';

interface EditRecipeModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSuccess: () => void;
  producedInventoryItemID: string;
  existingRecipe: Recipe;
}

type LocalRecipeDetail = {
  id: string;
  recipeID: string;
  inventoryItemID: string;
  inventoryItemName: string;
  quantityUsed: number;
};

const EditRecipeModal: React.FC<EditRecipeModalProps> = ({
  isOpen,
  onOpenChange,
  onSuccess,
  producedInventoryItemID,
  existingRecipe,
}) => {
  // Form state
  const [name, setName] = useState('');
  const [outputQuantity, setOutputQuantity] = useState('');
  const [outputQuantityUnitId, setOutputQuantityUnitId] = useState('');
  const [recipeType, setRecipeType] = useState<number>(0);
  const [isActive, setIsActive] = useState(true);
  const [loading, setLoading] = useState(false);

  // Recipe details state
  const [details, setDetails] = useState<LocalRecipeDetail[]>([]);
  const [newIngredientId, setNewIngredientId] = useState('');
  const [newQuantityUsed, setNewQuantityUsed] = useState('');

  // Hooks
  const { data: units, isLoading: unitsLoading } = useUnitsByBusiness();
  const { data: availableIngredients, isLoading: ingredientsLoading } = useIngredients();

  // Pre-fill form when modal opens
  useEffect(() => {
    if (isOpen && existingRecipe) {
      setName(existingRecipe.name || '');
      setOutputQuantity(String(existingRecipe.outputQuantity || ''));
      setOutputQuantityUnitId(existingRecipe.outputQuantityUnitId || '');
      setRecipeType(existingRecipe.recipeType ?? 0);
      setIsActive(existingRecipe.isActive);

      if (existingRecipe.details && existingRecipe.details.length > 0) {
        setDetails(
          existingRecipe.details.map((d) => {
            const ingredient = availableIngredients.find(
              (i) => i.id === d.inventoryItemID
            );
            return {
              id: d.id,
              recipeID: d.recipeID,
              inventoryItemID: d.inventoryItemID,
              inventoryItemName: ingredient?.name || d.inventoryItemID,
              quantityUsed: d.quantityUsed,
            };
          })
        );
      } else {
        setDetails([]);
      }

      setNewIngredientId('');
      setNewQuantityUsed('');
    }
  }, [isOpen, existingRecipe, availableIngredients]);

  const handleAddDetail = () => {
    if (!newIngredientId) {
      toast.error('Please select an inventory item');
      return;
    }
    if (!newQuantityUsed || parseFloat(newQuantityUsed) <= 0) {
      toast.error('Please enter a valid quantity');
      return;
    }

    if (details.some((d) => d.inventoryItemID === newIngredientId)) {
      toast.error('This item is already added');
      return;
    }

    const ingredient = availableIngredients.find((i) => i.id === newIngredientId);
    if (!ingredient) return;

    setDetails([
      ...details,
      {
        id: '',
        recipeID: '',
        inventoryItemID: newIngredientId,
        inventoryItemName: ingredient.name,
        quantityUsed: parseFloat(newQuantityUsed),
      },
    ]);

    setNewIngredientId('');
    setNewQuantityUsed('');
  };

  const handleRemoveDetail = (inventoryItemID: string) => {
    setDetails(details.filter((d) => d.inventoryItemID !== inventoryItemID));
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast.error('Recipe name is required');
      return;
    }
    if (!outputQuantity || parseFloat(outputQuantity) <= 0) {
      toast.error('Please enter a valid output quantity');
      return;
    }
    if (!outputQuantityUnitId) {
      toast.error('Please select an output unit');
      return;
    }
    if (details.length === 0) {
      toast.error('Please add at least one detail row');
      return;
    }

    setLoading(true);
    try {
      const business = getJsonItemFromLocalStorage('business');
      const payload: CreateRecipePayload = {
        name: name.trim(),
        producedInventoryItemID: producedInventoryItemID || '',
        outputQuantity: parseFloat(outputQuantity),
        outputQuantityUnitId,
        recipeType,
        isActive,
        details: details.map((d) => ({
          id: d.id || '',
          recipeID: d.recipeID || '',
          inventoryItemID: d.inventoryItemID,
          quantityUsed: d.quantityUsed,
        })),
      };

      const response = await updateRecipe(
        business[0]?.businessId,
        existingRecipe.id,
        payload
      );

      if (response && 'errors' in response) {
        const errors = response.errors as Record<string, string[]>;
        const errorMessage = Object.values(errors).flat().join(', ');
        toast.error(errorMessage || 'Please check your input values');
        return;
      }

      if (response?.data?.isSuccessful) {
        toast.success('Recipe updated successfully');
        onSuccess();
      } else {
        toast.error(response?.data?.error || 'Failed to update recipe');
      }
    } catch (error) {
      console.error('Error updating recipe:', error);
      toast.error('Failed to update recipe');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      size="3xl"
      onOpenChange={onOpenChange}
      hideCloseButton
      scrollBehavior="inside"
    >
      <ModalContent className="bg-white rounded-2xl shadow-2xl border border-gray-200">
        {() => (
          <ModalBody className="p-0">
            <div className="bg-white rounded-2xl w-full max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#5F35D2]/10 rounded-xl flex items-center justify-center">
                    <Package className="w-5 h-5 text-[#5F35D2]" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-800">
                      Edit Recipe
                    </h2>
                    <p className="text-sm text-gray-500">
                      Update the recipe details
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => onOpenChange(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Recipe Name */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Recipe Name
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter recipe name"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5F35D2]/20 focus:border-[#5F35D2] text-gray-700 bg-gray-50 hover:bg-white transition-colors duration-200"
                    />
                  </div>

                  {/* Output Quantity */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Output Quantity
                    </label>
                    <input
                      type="number"
                      value={outputQuantity}
                      onChange={(e) => setOutputQuantity(e.target.value)}
                      placeholder="0"
                      min="0.001"
                      step="0.001"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5F35D2]/20 focus:border-[#5F35D2] text-gray-700 bg-gray-50 hover:bg-white transition-colors duration-200"
                    />
                  </div>

                  {/* Output Unit */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Output Unit
                    </label>
                    <div className="relative">
                      <select
                        value={outputQuantityUnitId}
                        onChange={(e) => setOutputQuantityUnitId(e.target.value)}
                        disabled={unitsLoading}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5F35D2]/20 focus:border-[#5F35D2] text-gray-700 bg-gray-50 hover:bg-white transition-colors duration-200 appearance-none"
                      >
                        <option value="">Select unit</option>
                        {units.map((unit) => (
                          <option key={unit.id} value={unit.id}>
                            {unit.name}
                          </option>
                        ))}
                      </select>
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                        {unitsLoading ? (
                          <Spinner size="sm" color="secondary" />
                        ) : (
                          <svg
                            className="w-5 h-5 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 9l-7 7-7-7"
                            />
                          </svg>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Recipe Type */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Recipe Type
                    </label>
                    <div className="relative">
                      <select
                        value={recipeType}
                        onChange={(e) => setRecipeType(Number(e.target.value))}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5F35D2]/20 focus:border-[#5F35D2] text-gray-700 bg-gray-50 hover:bg-white transition-colors duration-200 appearance-none"
                      >
                        <option value={0}>Standard</option>
                        <option value={1}>Custom</option>
                      </select>
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                        <svg
                          className="w-5 h-5 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Active Toggle */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div>
                    <p className="font-medium text-gray-700">Active</p>
                    <p className="text-sm text-gray-500">
                      Enable or disable this recipe
                    </p>
                  </div>
                  <Switch
                    isSelected={isActive}
                    onValueChange={setIsActive}
                    classNames={{
                      wrapper: 'group-data-[selected=true]:bg-green-500',
                    }}
                  />
                </div>

                {/* Recipe Details Section */}
                <div className="border-t border-gray-100 pt-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    Recipe Details
                  </h3>

                  {/* Details table */}
                  {details.length > 0 && (
                    <div className="overflow-x-auto mb-4">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-gray-200">
                            <th className="text-left py-3 px-2 font-semibold text-gray-700">Inventory Item</th>
                            <th className="text-right py-3 px-2 font-semibold text-gray-700">Quantity Used</th>
                            <th className="text-right py-3 px-2 font-semibold text-gray-700">Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {details.map((detail) => (
                            <tr key={detail.inventoryItemID} className="border-b border-gray-100">
                              <td className="py-3 px-2 text-gray-700">{detail.inventoryItemName}</td>
                              <td className="py-3 px-2 text-right text-gray-700">{detail.quantityUsed}</td>
                              <td className="py-3 px-2 text-right">
                                <button
                                  onClick={() => handleRemoveDetail(detail.inventoryItemID)}
                                  className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* Add detail input row */}
                  <div className="space-y-3">
                    <div className="flex gap-3 mb-2">
                      <span className="flex-1 text-sm font-medium text-gray-600">
                        Select ingredient
                      </span>
                      <span className="w-28 text-sm font-medium text-gray-600">
                        Quantity
                      </span>
                    </div>

                    <div className="flex gap-3">
                      <div className="flex-1 relative">
                        <select
                          value={newIngredientId}
                          onChange={(e) => setNewIngredientId(e.target.value)}
                          disabled={ingredientsLoading}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5F35D2]/20 focus:border-[#5F35D2] text-gray-700 bg-gray-50 hover:bg-white transition-colors duration-200 appearance-none"
                        >
                          <option value="">Select item</option>
                          {availableIngredients
                            .filter(
                              (i) =>
                                !details.some(
                                  (d) => d.inventoryItemID === i.id
                                )
                            )
                            .map((ingredient) => (
                              <option key={ingredient.id} value={ingredient.id}>
                                {ingredient.name}
                              </option>
                            ))}
                        </select>
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                          {ingredientsLoading ? (
                            <Spinner size="sm" color="secondary" />
                          ) : (
                            <svg
                              className="w-5 h-5 text-gray-400"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 9l-7 7-7-7"
                              />
                            </svg>
                          )}
                        </div>
                      </div>
                      <div className="w-28">
                        <input
                          type="number"
                          value={newQuantityUsed}
                          onChange={(e) => setNewQuantityUsed(e.target.value)}
                          placeholder="Qty"
                          min="0.001"
                          step="0.001"
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5F35D2]/20 focus:border-[#5F35D2] text-gray-700 bg-gray-50 hover:bg-white transition-colors duration-200"
                        />
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleAddDetail}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#5B5B5B] text-white rounded-xl hover:bg-[#4A4A4A] font-semibold transition-all duration-200"
                    >
                      <span>Add Ingredient</span>
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-center pt-4">
                  <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="flex items-center gap-2 px-8 py-3 bg-[#5F35D2] text-white rounded-xl hover:bg-[#5F35D2]/90 font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    {loading ? (
                      <>
                        <Spinner size="sm" color="current" />
                        <span>Updating...</span>
                      </>
                    ) : (
                      <>
                        <span>Update Recipe</span>
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </>
                    )}
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

export default EditRecipeModal;
