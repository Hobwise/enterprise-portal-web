'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Modal, ModalContent, ModalBody, Spinner, Switch } from '@nextui-org/react';
import { X, Package, Trash2, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import { getJsonItemFromLocalStorage } from '@/lib/utils';
import {
  createRecipe,
  updateRecipe,
  CreateRecipePayload,
  RecipeDetail,
  PendingRecipeTracking,
  Recipe,
} from '@/app/api/controllers/dashboard/inventory';
import { useUnitsByBusiness, useIngredients } from '@/hooks/cachedEndpoints/useInventoryItems';

interface AddRecipeModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSuccess: () => void;
  producedInventoryItemID?: string;
  trackingId?: string;
  itemName?: string;
  onCloseWithoutCompletion?: (tracking: PendingRecipeTracking) => void;
  existingRecipe?: Recipe;
}

type LocalRecipeDetail = {
  id?: string;
  recipeID?: string;
  inventoryItemID: string;
  inventoryItemName: string;
  quantityUsed: number;
};

const AddRecipeModal: React.FC<AddRecipeModalProps> = ({
  isOpen,
  onOpenChange,
  onSuccess,
  producedInventoryItemID,
  trackingId,
  itemName,
  onCloseWithoutCompletion,
  existingRecipe,
}) => {
  // Detect edit mode
  const isEditMode = !!existingRecipe;
  // Form state
  const [name, setName] = useState('');
  const [outputQuantity, setOutputQuantity] = useState('');
  const [outputQuantityUnitId, setOutputQuantityUnitId] = useState('');
  const [recipeType, setRecipeType] = useState<number>(0);
  const [isActive, setIsActive] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{
    name?: string;
    outputQuantity?: string;
    outputQuantityUnitId?: string;
    details?: string;
  }>({});

  // Use ref to track submitted state to avoid stale closure in useEffect
  const submittedRef = useRef(false);
  const ingredientDropdownRef = useRef<HTMLDivElement>(null);

  // Recipe details state
  const [details, setDetails] = useState<LocalRecipeDetail[]>([]);
  const [newIngredientId, setNewIngredientId] = useState('');
  const [newIngredientSearch, setNewIngredientSearch] = useState('');
  const [showIngredientDropdown, setShowIngredientDropdown] = useState(false);
  const [newQuantityUsed, setNewQuantityUsed] = useState('');

  // Hooks
  const { data: units, isLoading: unitsLoading } = useUnitsByBusiness();
  const { data: availableIngredients, isLoading: ingredientsLoading } = useIngredients();

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      if (!submittedRef.current && producedInventoryItemID && trackingId && onCloseWithoutCompletion) {
        const tracking: PendingRecipeTracking = {
          trackingId,
          inventoryItemId: producedInventoryItemID,
          itemName: itemName || '',
          createdAt: new Date().toISOString(),
        };
        onCloseWithoutCompletion(tracking);
      }
      resetForm();
    }
  }, [isOpen, producedInventoryItemID, trackingId, itemName, onCloseWithoutCompletion]);

  // Populate form when editing an existing recipe
  useEffect(() => {
    if (isOpen && existingRecipe && Array.isArray(availableIngredients) && availableIngredients.length > 0) {
      setName(existingRecipe.name);
      setOutputQuantity(String(existingRecipe.outputQuantity));
      setOutputQuantityUnitId(existingRecipe.outputQuantityUnitId);
      setRecipeType(existingRecipe.recipeType);
      setIsActive(existingRecipe.isActive);
      // Map details with ingredient names from availableIngredients
      const mappedDetails = (existingRecipe.details || []).map((d) => {
        const ingredient = Array.isArray(availableIngredients) && availableIngredients.find((i) => i.id === d.inventoryItemID);
        return {
          id: d.id,
          recipeID: d.recipeID,
          inventoryItemID: d.inventoryItemID,
          inventoryItemName: ingredient?.name || 'Unknown',
          quantityUsed: d.quantityUsed,
        };
      });
      setDetails(mappedDetails);
    }
  }, [isOpen, existingRecipe, availableIngredients]);

  // Handle click outside ingredient dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        ingredientDropdownRef.current &&
        !ingredientDropdownRef.current.contains(event.target as Node)
      ) {
        setShowIngredientDropdown(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const resetForm = () => {
    setName('');
    setOutputQuantity('');
    setOutputQuantityUnitId('');
    setRecipeType(0);
    setIsActive(true);
    submittedRef.current = false;
    setDetails([]);
    setNewIngredientId('');
    setNewIngredientSearch('');
    setShowIngredientDropdown(false);
    setNewQuantityUsed('');
    setErrors({});
  };

  const validate = () => {
    const newErrors: typeof errors = {};

    if (!name.trim()) {
      newErrors.name = 'Recipe name is required';
    }
    if (!outputQuantity || parseFloat(outputQuantity) <= 0) {
      newErrors.outputQuantity = 'Please enter a valid output quantity';
    }
    if (!outputQuantityUnitId) {
      newErrors.outputQuantityUnitId = 'Please select an output unit';
    }
    if (details.length === 0) {
      newErrors.details = 'Please add at least one ingredient';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

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

    const ingredient = Array.isArray(availableIngredients) && availableIngredients.find((i) => i.id === newIngredientId);
    if (!ingredient) return;

    setDetails([
      ...details,
      {
        inventoryItemID: newIngredientId,
        inventoryItemName: ingredient.name,
        quantityUsed: parseFloat(newQuantityUsed),
      },
    ]);
    setErrors(prev => ({ ...prev, details: undefined }));

    setNewIngredientId('');
    setNewIngredientSearch('');
    setShowIngredientDropdown(false);
    setNewQuantityUsed('');
  };

  const handleRemoveDetail = (inventoryItemID: string) => {
    setDetails(details.filter((d) => d.inventoryItemID !== inventoryItemID));
  };

  const handleSubmit = async () => {
    if (!validate()) {
      return;
    }

    setLoading(true);
    try {
      const business = getJsonItemFromLocalStorage('business');
      const payload: CreateRecipePayload = {
        name: name.trim(),
        producedInventoryItemID: producedInventoryItemID || existingRecipe?.producedInventoryItemID || '',
        outputQuantity: parseFloat(outputQuantity),
        outputQuantityUnitId,
        recipeType,
        isActive,
        details: details.map((d) => ({
          id: d.id || '',
          recipeID: isEditMode && existingRecipe ? existingRecipe.id : '',
          inventoryItemID: d.inventoryItemID,
          quantityUsed: d.quantityUsed,
        })),
      };

      let response;
      if (isEditMode && existingRecipe) {
        response = await updateRecipe(business[0]?.businessId, existingRecipe.id, payload);
      } else {
        response = await createRecipe(business[0]?.businessId, payload);
      }

      if (response && 'errors' in response) {
        const errors = response.errors as Record<string, string[]>;
        const errorMessage = Object.values(errors).flat().join(', ');
        toast.error(errorMessage || 'Please check your input values');
        return;
      }

      if (response?.data?.isSuccessful) {
        toast.success(isEditMode ? 'Recipe updated successfully' : 'Recipe created successfully');
        submittedRef.current = true;
        localStorage.removeItem('pendingRecipeTracking');
        onSuccess();
        onOpenChange(false);
      } else {
        toast.error(response?.data?.error || (isEditMode ? 'Failed to update recipe' : 'Failed to create recipe'));
      }
    } catch (error) {
      console.error(isEditMode ? 'Error updating recipe:' : 'Error creating recipe:', error);
      toast.error(isEditMode ? 'Failed to update recipe' : 'Failed to create recipe');
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
                      {isEditMode ? 'Edit Recipe' : 'Add Recipe'}
                    </h2>
                    <p className="text-sm text-gray-500">
                      {isEditMode ? 'Update the recipe for the produced item' : 'Create a recipe for the produced item'}
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
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Recipe Name
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value);
                        setErrors(prev => ({ ...prev, name: undefined }));
                      }}
                      placeholder="Enter recipe name"
                      className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5F35D2]/20 focus:border-[#5F35D2] text-gray-700 bg-gray-50 hover:bg-white transition-colors duration-200 ${errors.name ? 'border-red-500' : 'border-gray-200'}`}
                    />
                    {errors.name && (
                      <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                    )}
                  </div>

                  {/* Output Quantity */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Output Quantity
                    </label>
                    <input
                      type="number"
                      value={outputQuantity}
                      onChange={(e) => {
                        setOutputQuantity(e.target.value);
                        setErrors(prev => ({ ...prev, outputQuantity: undefined }));
                      }}
                      placeholder="0"
                      min="0.001"
                      step="0.001"
                      className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5F35D2]/20 focus:border-[#5F35D2] text-gray-700 bg-gray-50 hover:bg-white transition-colors duration-200 ${errors.outputQuantity ? 'border-red-500' : 'border-gray-200'}`}
                    />
                    {errors.outputQuantity && (
                      <p className="text-red-500 text-sm mt-1">{errors.outputQuantity}</p>
                    )}
                  </div>

                  {/* Output Unit */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Output Unit
                    </label>
                    <div className="relative">
                      <select
                        value={outputQuantityUnitId}
                        onChange={(e) => {
                          setOutputQuantityUnitId(e.target.value);
                          setErrors(prev => ({ ...prev, outputQuantityUnitId: undefined }));
                        }}
                        disabled={unitsLoading}
                        className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5F35D2]/20 focus:border-[#5F35D2] text-gray-700 bg-gray-50 hover:bg-white transition-colors duration-200 appearance-none ${errors.outputQuantityUnitId ? 'border-red-500' : 'border-gray-200'}`}
                      >
                        <option value="">Select unit</option>
                        {Array.isArray(units) && units.map((unit) => (
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
                    {errors.outputQuantityUnitId && (
                      <p className="text-red-500 text-sm mt-1">{errors.outputQuantityUnitId}</p>
                    )}
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
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    Recipe Details
                  </h3>
                  {errors.details && (
                    <p className="text-red-500 text-sm mb-4">{errors.details}</p>
                  )}

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
                        Search ingredient
                      </span>
                      <span className="w-28 text-sm font-medium text-gray-600">
                        Quantity
                      </span>
                    </div>

                    <div className="flex gap-3">
                      <div className="flex-1 relative" ref={ingredientDropdownRef}>
                        <input
                          type="text"
                          value={newIngredientSearch}
                          onChange={(e) => {
                            setNewIngredientSearch(e.target.value);
                            setNewIngredientId('');
                            setShowIngredientDropdown(true);
                          }}
                          onFocus={() => setShowIngredientDropdown(true)}
                          placeholder="Type to search ingredients..."
                          disabled={ingredientsLoading}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5F35D2]/20 focus:border-[#5F35D2] text-gray-700 bg-gray-50 hover:bg-white transition-colors duration-200"
                        />
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                          {ingredientsLoading && (
                            <Spinner size="sm" color="secondary" />
                          )}
                        </div>
                        {/* Dropdown suggestions */}
                        {showIngredientDropdown && !ingredientsLoading && (
                          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                            {Array.isArray(availableIngredients) && availableIngredients
                              .filter(
                                (i) =>
                                  !details.some((d) => d.inventoryItemID === i.id) &&
                                  i.name.toLowerCase().includes(newIngredientSearch.toLowerCase())
                              )
                              .map((ingredient) => (
                                <button
                                  key={ingredient.id}
                                  type="button"
                                  onMouseDown={(e) => e.stopPropagation()}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setNewIngredientId(ingredient.id);
                                    setNewIngredientSearch(ingredient.name);
                                    setShowIngredientDropdown(false);
                                  }}
                                  className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-[#5F35D2]/10 hover:text-[#5F35D2] transition-colors"
                                >
                                  {ingredient.name}
                                </button>
                              ))}
                            {(!Array.isArray(availableIngredients) || availableIngredients.filter(
                              (i) =>
                                !details.some((d) => d.inventoryItemID === i.id) &&
                                i.name.toLowerCase().includes(newIngredientSearch.toLowerCase())
                            ).length === 0) && !newIngredientSearch.trim() && (
                              <div className="px-4 py-3 text-sm text-gray-500">
                                Type to search or create ingredient
                              </div>
                            )}
                          </div>
                        )}
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
                        <span>{isEditMode ? 'Saving...' : 'Creating Recipe...'}</span>
                      </>
                    ) : (
                      <>
                        <span>{isEditMode ? 'Save Changes' : 'Create Recipe'}</span>
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
                            d="M14 5l7 7m0 0l-7 7m7-7H3"
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

export default AddRecipeModal;
