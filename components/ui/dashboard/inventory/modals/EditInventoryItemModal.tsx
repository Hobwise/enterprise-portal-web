'use client';

import React, { useState, useEffect } from 'react';
import { Modal, ModalContent, ModalBody, Spinner, Switch } from '@nextui-org/react';
import { X, Package, Plus, Pencil, BookOpen } from 'lucide-react';
import { getJsonItemFromLocalStorage, notify } from '@/lib/utils';
import {
  updateInventoryItem,
  CreateInventoryPayload,
  InventoryItemType,
  getRecipesByBusiness,
} from '@/app/api/controllers/dashboard/inventory';
import type { InventoryItem, Recipe } from '@/app/api/controllers/dashboard/inventory';
import { useSuppliers, useUnitsByBusiness, useInventoryItem } from '@/hooks/cachedEndpoints/useInventoryItems';
import AddRecipeModal from './AddRecipeModal';
import EditRecipeModal from './EditRecipeModal';

interface EditInventoryItemModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  item: InventoryItem | null;
  onSuccess: () => void;
}

type EditStep = 'edit-item' | 'manage-recipes';

const EditInventoryItemModal: React.FC<EditInventoryItemModalProps> = ({
  isOpen,
  onOpenChange,
  item,
  onSuccess,
}) => {
  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [itemType, setItemType] = useState<InventoryItemType | null>(null);
  const [strictnessLevel, setStrictnessLevel] = useState<number>(0);
  const [reorderLevel, setReorderLevel] = useState('');
  const [openingStock, setOpeningStock] = useState('');
  const [averageCostPerBaseUnit, setAverageCostPerBaseUnit] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [allowTracking, setAllowTracking] = useState(true);
  const [unitId, setUnitId] = useState('');
  const [supplierId, setSupplierId] = useState('');
  const [loading, setLoading] = useState(false);

  // Step state
  const [step, setStep] = useState<EditStep>('edit-item');

  // Recipe list state
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loadingRecipes, setLoadingRecipes] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);
  const [isEditRecipeOpen, setIsEditRecipeOpen] = useState(false);
  const [isAddRecipeOpen, setIsAddRecipeOpen] = useState(false);

  // Hooks
  const { data: suppliers, isLoading: suppliersLoading } = useSuppliers();
  const { data: unitsByBusiness, isLoading: unitsByBusinessLoading } = useUnitsByBusiness();

  // Fetch full item details for editing
  const { data: fullItemData, isLoading: itemLoading } = useInventoryItem(
    isOpen && item ? item.id : null
  );

  // Pre-fill form when item changes
  useEffect(() => {
    const sourceItem = fullItemData || item;
    if (sourceItem && isOpen) {
      setName(sourceItem.name || '');
      setDescription(sourceItem.description || '');
      setItemType(sourceItem.itemType);
      setStrictnessLevel(sourceItem.strictnessLevel);
      setReorderLevel(String(sourceItem.reorderLevel || 0));
      setOpeningStock(String(sourceItem.openingStock || 0));
      setAverageCostPerBaseUnit(String(sourceItem.averageCostPerUnit || 0));
      setIsActive(sourceItem.isActive);
      setAllowTracking(sourceItem.allowTracking ?? true);
      setUnitId(sourceItem.unitId || '');
      setSupplierId(sourceItem.supplierId || '');
    }
  }, [fullItemData, item, isOpen]);

  // Reset step when modal closes
  useEffect(() => {
    if (!isOpen) {
      setStep('edit-item');
      setRecipes([]);
      setEditingRecipe(null);
      setIsEditRecipeOpen(false);
      setIsAddRecipeOpen(false);
    }
  }, [isOpen]);

  const fetchRecipesForItem = async (itemId: string) => {
    setLoadingRecipes(true);
    try {
      const business = getJsonItemFromLocalStorage('business');
      const response = await getRecipesByBusiness(business[0]?.businessId);
      if (response?.data?.isSuccessful) {
        const allRecipes: Recipe[] = response.data.data || [];
        setRecipes(allRecipes.filter((r) => r.producedInventoryItemID === itemId));
      }
    } catch {
      // keep recipes as []
    } finally {
      setLoadingRecipes(false);
    }
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      notify({ title: 'Error!', text: 'Item name is required', type: 'error' });
      return;
    }
    if (!unitId) {
      notify({ title: 'Error!', text: 'Please select a unit', type: 'error' });
      return;
    }
    if (!averageCostPerBaseUnit || parseFloat(averageCostPerBaseUnit) < 0) {
      notify({ title: 'Error!', text: 'Please enter a valid average cost per base unit', type: 'error' });
      return;
    }
    if (itemType === null) {
      notify({ title: 'Error!', text: 'Please select an item type', type: 'error' });
      return;
    }

    setLoading(true);
    try {
      const business = getJsonItemFromLocalStorage('business');
      const payload: CreateInventoryPayload = {
        name: name.trim(),
        description: description.trim(),
        itemType,
        strictnessLevel,
        openingStock: openingStock ? parseFloat(openingStock) : 0,
        reorderLevel: reorderLevel ? parseFloat(reorderLevel) : 0,
        reorderQuantity: 0,
        averageCostPerBaseUnit: parseFloat(averageCostPerBaseUnit),
        isActive,
        allowTracking,
        unitId,
        ...(supplierId ? { supplierId } : {}),
      };

      const response = await updateInventoryItem(
        business[0]?.businessId,
        item!.id,
        payload
      );

      if (!response) return;

      if (response && 'errors' in response) {
        const errors = response.errors as Record<string, string[]>;
        const errorMessage = Object.values(errors).flat().join(', ');
        notify({ title: 'Error!', text: errorMessage || 'Please check your input values', type: 'error' });
        return;
      }

      if (response?.data?.isSuccessful) {
        notify({ title: 'Success!', text: 'Item updated successfully', type: 'success' });

        if (itemType === InventoryItemType.Produced) {
          setStep('manage-recipes');
          fetchRecipesForItem(item!.id);
        } else {
          onOpenChange(false);
          onSuccess();
        }
      } else {
        notify({ title: 'Error!', text: response?.data?.error || 'Failed to update item', type: 'error' });
      }
    } catch (error) {
      console.error('Error updating inventory item:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDone = () => {
    onOpenChange(false);
    onSuccess();
  };

  const renderEditItemStep = () => (
    <>
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#5F35D2]/10 rounded-xl flex items-center justify-center">
            <Package className="w-5 h-5 text-[#5F35D2]" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">
              Edit Inventory Item
            </h2>
            <p className="text-sm text-gray-500">
              Update item details
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

      {/* Form */}
      {itemLoading ? (
        <div className="flex items-center justify-center py-12">
          <Spinner size="lg" color="secondary" />
        </div>
      ) : (
      <div className="p-6 space-y-6">
        {/* Basic Information */}
        <div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Item Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Item Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter item name"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5F35D2]/20 focus:border-[#5F35D2] text-gray-700 bg-gray-50 hover:bg-white transition-colors duration-200"
              />
            </div>

            {/* Unit */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Unit
              </label>
              <div className="relative">
                <select
                  value={unitId}
                  onChange={(e) => setUnitId(e.target.value)}
                  disabled={unitsByBusinessLoading}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5F35D2]/20 focus:border-[#5F35D2] text-gray-700 bg-gray-50 hover:bg-white transition-colors duration-200 appearance-none"
                >
                  <option value="">Select unit</option>
                  {Array.isArray(unitsByBusiness) && unitsByBusiness.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name}
                    </option>
                  ))}
                </select>
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  {unitsByBusinessLoading ? (
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

            {/* Description - full width */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter item description"
                rows={3}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5F35D2]/20 focus:border-[#5F35D2] text-gray-700 bg-gray-50 hover:bg-white transition-colors duration-200 resize-none"
              />
            </div>
          </div>
        </div>

        {/* Pricing & Stock */}
        <div className="border-t border-gray-100 pt-4 mt-2">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Average Cost Per Base Unit */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Average Cost Per Base Unit
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#5F35D2] font-bold">
                  &#x20A6;
                </span>
                <input
                  type="number"
                  value={averageCostPerBaseUnit}
                  onChange={(e) => setAverageCostPerBaseUnit(e.target.value)}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5F35D2]/20 focus:border-[#5F35D2] text-gray-700 bg-gray-50 hover:bg-white transition-colors duration-200"
                />
              </div>
            </div>

            {/* Reorder Level */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Reorder Level
              </label>
              <input
                type="number"
                value={reorderLevel}
                onChange={(e) => setReorderLevel(e.target.value)}
                placeholder="0"
                min="0"
                step="1"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5F35D2]/20 focus:border-[#5F35D2] text-gray-700 bg-gray-50 hover:bg-white transition-colors duration-200"
              />
            </div>

            {/* Opening Stock */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Opening Stock
              </label>
              <input
                type="number"
                value={openingStock}
                onChange={(e) => setOpeningStock(e.target.value)}
                placeholder="0"
                min="0"
                step="1"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5F35D2]/20 focus:border-[#5F35D2] text-gray-700 bg-gray-50 hover:bg-white transition-colors duration-200"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            {/* Stock Level (disabled) */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Stock Level
              </label>
              <input
                type="number"
                value={(fullItemData || item)?.stockLevel ?? ''}
                disabled
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-700 bg-gray-100 cursor-not-allowed opacity-70"
              />
            </div>

            {/* Stock Status (disabled) */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Stock Status
              </label>
              <input
                type="text"
                value={(fullItemData || item)?.stockStatus ?? ''}
                disabled
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-700 bg-gray-100 cursor-not-allowed opacity-70"
              />
            </div>
          </div>
        </div>

        {/* Classification */}
        <div className="border-t border-gray-100 pt-4 mt-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Supplier Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Supplier Name
                <span className="text-gray-400 font-normal ml-1">(optional)</span>
              </label>
              <div className="relative">
                <select
                  value={supplierId}
                  onChange={(e) => setSupplierId(e.target.value)}
                  disabled={suppliersLoading}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5F35D2]/20 focus:border-[#5F35D2] text-gray-700 bg-gray-50 hover:bg-white transition-colors duration-200 appearance-none"
                >
                  <option value="">Select supplier</option>
                  {Array.isArray(suppliers) && suppliers.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  {suppliersLoading ? (
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

            {/* Item Type */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Item Type
              </label>
              <div className="relative">
                <select
                  value={itemType === null ? '' : itemType}
                  onChange={(e) => {
                    const val = e.target.value;
                    setItemType(val === '' ? null : Number(val) as InventoryItemType);
                  }}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5F35D2]/20 focus:border-[#5F35D2] text-gray-700 bg-gray-50 hover:bg-white transition-colors duration-200 appearance-none"
                >
                  <option value="">Select item type</option>
                  <option value={InventoryItemType.Direct}>Direct</option>
                  <option value={InventoryItemType.Ingredient}>Ingredient</option>
                  <option value={InventoryItemType.Produced}>Produced</option>
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
        </div>

        {/* Settings Section */}
        <div className="border-t border-gray-100 pt-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Inventory Settings
          </h3>

          {/* Active Toggle */}
          <div className="flex items-center justify-between mb-6 p-4 bg-gray-50 rounded-xl">
            <div>
              <p className="font-medium text-gray-700">Active</p>
              <p className="text-sm text-gray-500">
                Enable or disable this inventory item
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

          {/* Allow Tracking Toggle */}
          <div className="flex items-center justify-between mb-6 p-4 bg-gray-50 rounded-xl">
            <div>
              <p className="font-medium text-gray-700">Allow Tracking</p>
              <p className="text-sm text-gray-500">
                Track stock levels and movements for this item
              </p>
            </div>
            <Switch
              isSelected={allowTracking}
              onValueChange={setAllowTracking}
              classNames={{
                wrapper: 'group-data-[selected=true]:bg-green-500',
              }}
            />
          </div>

          {/* Strictness Level */}
          <div className="space-y-3">
            <p className="font-medium text-gray-700">
              Strictness Level
            </p>

            {/* Safe Mode */}
            <label className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
              <input
                type="radio"
                name="editStrictnessLevel"
                value={0}
                checked={strictnessLevel === 0}
                onChange={() => setStrictnessLevel(0)}
                className="mt-1 w-4 h-4 text-[#5F35D2] focus:ring-[#5F35D2]"
              />
              <div>
                <p className="font-medium text-gray-700">Safe Mode</p>
                <p className="text-sm text-gray-500">
                  Never block sales. Allow negative stock. Best for
                  first-time users.
                </p>
              </div>
            </label>

            {/* Strict Mode */}
            <label className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
              <input
                type="radio"
                name="editStrictnessLevel"
                value={1}
                checked={strictnessLevel === 1}
                onChange={() => setStrictnessLevel(1)}
                className="mt-1 w-4 h-4 text-[#5F35D2] focus:ring-[#5F35D2]"
              />
              <div>
                <p className="font-medium text-gray-700">Strict Mode</p>
                <p className="text-sm text-gray-500">
                  Prevent selling out-of-stock items. Enforce availability
                  rules.
                </p>
              </div>
            </label>
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
                <span>Update Item</span>
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
      )}
    </>
  );

  const renderManageRecipesStep = () => (
    <>
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#5F35D2]/10 rounded-xl flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-[#5F35D2]" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">
              Manage Recipes
            </h2>
            <p className="text-sm text-gray-500">
              Add and edit recipes for this item
            </p>
          </div>
        </div>
        <button
          onClick={handleDone}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      {/* Recipe List */}
      <div className="p-6 space-y-6">
        {loadingRecipes ? (
          <div className="flex items-center justify-center py-12">
            <Spinner size="lg" color="secondary" />
          </div>
        ) : recipes.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-3 font-semibold text-gray-700">Name</th>
                  <th className="text-right py-3 px-3 font-semibold text-gray-700">Output Qty</th>
                  <th className="text-center py-3 px-3 font-semibold text-gray-700">Type</th>
                  <th className="text-center py-3 px-3 font-semibold text-gray-700">Status</th>
                  <th className="text-right py-3 px-3 font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {recipes.map((recipe) => (
                  <tr key={recipe.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-3 text-gray-700 font-medium">{recipe.name}</td>
                    <td className="py-3 px-3 text-right text-gray-700">{recipe.outputQuantity}</td>
                    <td className="py-3 px-3 text-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        recipe.recipeType === 0
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-purple-100 text-purple-800'
                      }`}>
                        {recipe.recipeType === 0 ? 'Standard' : 'Custom'}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        recipe.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {recipe.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => {
                          setEditingRecipe(recipe);
                          setIsEditRecipeOpen(true);
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-[#5F35D2] bg-[#5F35D2]/10 rounded-lg hover:bg-[#5F35D2]/20 transition-colors"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8">
            <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">No recipes found for this item</p>
          </div>
        )}

        {/* Add Recipe Button */}
        <button
          onClick={() => setIsAddRecipeOpen(true)}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 text-gray-600 rounded-xl hover:border-[#5F35D2] hover:text-[#5F35D2] font-semibold transition-all duration-200"
        >
          <Plus className="w-5 h-5" />
          Add Recipe
        </button>

        {/* Done Button */}
        <div className="flex justify-center pt-4">
          <button
            onClick={handleDone}
            className="flex items-center gap-2 px-8 py-3 bg-[#5F35D2] text-white rounded-xl hover:bg-[#5F35D2]/90 font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <span>Done</span>
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
          </button>
        </div>
      </div>
    </>
  );

  return (
    <>
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
                {step === 'edit-item' ? renderEditItemStep() : renderManageRecipesStep()}
              </div>
            </ModalBody>
          )}
        </ModalContent>
      </Modal>

      <AddRecipeModal
        isOpen={isAddRecipeOpen}
        onOpenChange={setIsAddRecipeOpen}
        onSuccess={() => {
          setIsAddRecipeOpen(false);
          fetchRecipesForItem(item!.id);
        }}
        producedInventoryItemID={item?.id}
      />

      {editingRecipe && (
        <EditRecipeModal
          isOpen={isEditRecipeOpen}
          onOpenChange={(open) => {
            setIsEditRecipeOpen(open);
            if (!open) setEditingRecipe(null);
          }}
          onSuccess={() => {
            setIsEditRecipeOpen(false);
            setEditingRecipe(null);
            fetchRecipesForItem(item!.id);
          }}
          producedInventoryItemID={item?.id || ''}
          existingRecipe={editingRecipe}
        />
      )}
    </>
  );
};

export default EditInventoryItemModal;
