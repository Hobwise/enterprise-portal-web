'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Modal, ModalContent, ModalBody, Spinner, Switch } from '@nextui-org/react';
import { X, BookOpen, Pencil, Save, Plus, Trash2, FlaskConical, History } from 'lucide-react';
import toast from 'react-hot-toast';
import { getRecipeByItem, updateRecipe, CreateRecipePayload } from '@/app/api/controllers/dashboard/inventory';
import type { Recipe } from '@/app/api/controllers/dashboard/inventory';
import { getJsonItemFromLocalStorage } from '@/lib/utils';
import { useIngredients, useUnitsByBusiness } from '@/hooks/cachedEndpoints/useInventoryItems';

interface ViewRecipeModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  itemId: string;
  itemName: string;
  onSuccess?: () => void;
}

type LocalRecipeDetail = {
  inventoryItemID: string;
  inventoryItemName: string;
  quantityUsed: number;
};

type ViewTab = 'ingredients' | 'history';

const ViewRecipeModal: React.FC<ViewRecipeModalProps> = ({
  isOpen,
  onOpenChange,
  itemId,
  itemName,
  onSuccess,
}) => {
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<ViewTab>('ingredients');

  // Edit mode state
  const [isEditMode, setIsEditMode] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form state for edit mode
  const [editName, setEditName] = useState('');
  const [editOutputQuantity, setEditOutputQuantity] = useState('');
  const [editOutputQuantityUnitId, setEditOutputQuantityUnitId] = useState('');
  const [editRecipeType, setEditRecipeType] = useState<number>(0);
  const [editIsActive, setEditIsActive] = useState(true);
  const [editDetails, setEditDetails] = useState<LocalRecipeDetail[]>([]);

  // Ingredient input state
  const [newIngredientId, setNewIngredientId] = useState('');
  const [newIngredientSearch, setNewIngredientSearch] = useState('');
  const [newQuantityUsed, setNewQuantityUsed] = useState('');
  const [showIngredientDropdown, setShowIngredientDropdown] = useState(false);

  const ingredientDropdownRef = useRef<HTMLDivElement>(null);

  const { data: availableIngredients } = useIngredients();
  const { data: units, isLoading: unitsLoading } = useUnitsByBusiness();

  const fetchRecipe = async () => {
    setLoading(true);
    const business = getJsonItemFromLocalStorage('business');
    try {
      const response = await getRecipeByItem(business[0]?.businessId, itemId);
      if (response?.data?.isSuccessful) {
        const recipeData: Recipe = response.data.data;
        setRecipe(recipeData);
      }
    } catch {
      setRecipe(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && itemId) {
      fetchRecipe();
      setActiveTab('ingredients');
    } else {
      setRecipe(null);
      setIsEditMode(false);
    }
  }, [isOpen, itemId]);

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

  const enterEditMode = () => {
    if (!recipe) return;
    setEditName(recipe.name);
    setEditOutputQuantity(String(recipe.outputQuantity));
    setEditOutputQuantityUnitId(recipe.outputQuantityUnitId);
    setEditRecipeType(recipe.recipeType);
    setEditIsActive(recipe.isActive);
    setEditDetails(
      (recipe.details || []).map((d) => ({
        inventoryItemID: d.inventoryItemId || d.inventoryItemID || '',
        inventoryItemName: d.inventoryItemName || getIngredientName(d.inventoryItemId || d.inventoryItemID || ''),
        quantityUsed: d.quantityUsed,
      }))
    );
    setNewIngredientId('');
    setNewIngredientSearch('');
    setNewQuantityUsed('');
    setShowIngredientDropdown(false);
    setIsEditMode(true);
  };

  const exitEditMode = () => {
    setIsEditMode(false);
    setNewIngredientId('');
    setNewIngredientSearch('');
    setNewQuantityUsed('');
    setShowIngredientDropdown(false);
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

    if (editDetails.some((d) => d.inventoryItemID === newIngredientId)) {
      toast.error('This item is already added');
      return;
    }

    const ingredient = Array.isArray(availableIngredients) && availableIngredients.find((i) => i.id === newIngredientId);
    if (!ingredient) return;

    setEditDetails([
      ...editDetails,
      {
        inventoryItemID: newIngredientId,
        inventoryItemName: ingredient.name,
        quantityUsed: parseFloat(newQuantityUsed),
      },
    ]);

    setNewIngredientId('');
    setNewIngredientSearch('');
    setShowIngredientDropdown(false);
    setNewQuantityUsed('');
  };

  const handleRemoveDetail = (inventoryItemID: string) => {
    setEditDetails(editDetails.filter((d) => d.inventoryItemID !== inventoryItemID));
  };

  const handleUpdateDetailQuantity = (inventoryItemID: string, newQuantity: number) => {
    setEditDetails(editDetails.map((d) =>
      d.inventoryItemID === inventoryItemID
        ? { ...d, quantityUsed: newQuantity }
        : d
    ));
  };

  const handleSave = async () => {
    setShowIngredientDropdown(false);

    if (!recipe) {
      toast.error('Recipe data not found. Please close and try again.');
      return;
    }

    const producedItemId = recipe.producedInventoryItemID || (recipe as any).producedInventoryItemId;
    if (!producedItemId) {
      toast.error('Invalid recipe configuration. Please close and try again.');
      return;
    }

    if (!editName.trim()) {
      toast.error('Recipe name is required');
      return;
    }
    if (!editOutputQuantity || parseFloat(editOutputQuantity) <= 0) {
      toast.error('Please enter a valid output quantity');
      return;
    }
    if (!editOutputQuantityUnitId) {
      toast.error('Please select an output unit');
      return;
    }
    if (editDetails.length === 0) {
      toast.error('Please add at least one ingredient');
      return;
    }

    const invalidIngredient = editDetails.find((d) => d.quantityUsed <= 0);
    if (invalidIngredient) {
      toast.error(`Invalid quantity for ingredient: ${invalidIngredient.inventoryItemName}. Quantity must be greater than 0.`);
      return;
    }

    setSaving(true);
    try {
      const business = getJsonItemFromLocalStorage('business');
      const payload: CreateRecipePayload = {
        name: editName.trim(),
        producedInventoryItemID: producedItemId,
        outputQuantity: parseFloat(editOutputQuantity),
        outputQuantityUnitId: editOutputQuantityUnitId,
        recipeType: editRecipeType,
        isActive: editIsActive,
        details: editDetails.map((d) => ({
          recipeID: recipe.id,
          inventoryItemID: d.inventoryItemID,
          quantityUsed: d.quantityUsed,
        })),
      };

      const response = await updateRecipe(business[0]?.businessId, recipe.id, payload);

      if (!response) {
        toast.error('Failed to update recipe. Please try again.');
        return;
      }

      if (response && 'errors' in response) {
        const errors = response.errors as Record<string, string[]>;
        const errorMessage = Object.values(errors).flat().join(', ');
        toast.error(errorMessage || 'Please check your input values');
        return;
      }

      if (response?.data?.isSuccessful) {
        toast.success('Recipe updated successfully');
        exitEditMode();
        await fetchRecipe();
        onSuccess?.();
      } else {
        toast.error(response?.data?.error || 'Failed to update recipe');
      }
    } catch (error) {
      console.error('Error updating recipe:', error);
      toast.error('Failed to update recipe');
    } finally {
      setSaving(false);
    }
  };

  const getIngredientName = (inventoryItemID: string) => {
    const ingredient = Array.isArray(availableIngredients) ? availableIngredients.find((i) => i.id === inventoryItemID) : undefined;
    return ingredient?.name || inventoryItemID;
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 2,
    }).format(value);
  };

  const productionHistory = recipe?.productionHistory || [];

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
                    <BookOpen className="w-5 h-5 text-[#5F35D2]" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-800">
                      {isEditMode ? 'Edit Recipe' : 'Recipe'}
                    </h2>
                    <p className="text-sm text-gray-500">{itemName}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {recipe && !isEditMode && !loading && (
                    <button
                      onClick={enterEditMode}
                      className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-[#5F35D2] bg-[#5F35D2]/10 hover:bg-[#5F35D2]/20 rounded-lg transition-colors"
                    >
                      <Pencil className="w-4 h-4" />
                      Edit
                    </button>
                  )}
                  <button
                    onClick={() => onOpenChange(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <Spinner size="lg" color="secondary" />
                  </div>
                ) : recipe ? (
                  isEditMode ? (
                    /* EDIT MODE */
                    <div className="space-y-4">
                      {/* Basic Info */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {/* Recipe Name */}
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                            Recipe Name
                          </label>
                          <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            placeholder="Enter recipe name"
                            className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5F35D2]/20 focus:border-[#5F35D2] text-gray-700 bg-gray-50 hover:bg-white transition-colors duration-200"
                          />
                        </div>

                        {/* Output Quantity */}
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                            Output Quantity
                          </label>
                          <input
                            type="number"
                            value={editOutputQuantity}
                            onChange={(e) => setEditOutputQuantity(e.target.value)}
                            placeholder="0"
                            min="0.001"
                            step="0.001"
                            className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5F35D2]/20 focus:border-[#5F35D2] text-gray-700 bg-gray-50 hover:bg-white transition-colors duration-200"
                          />
                        </div>

                        {/* Output Unit */}
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                            Output Unit
                          </label>
                          <div className="relative">
                            <select
                              value={editOutputQuantityUnitId}
                              onChange={(e) => setEditOutputQuantityUnitId(e.target.value)}
                              disabled={unitsLoading}
                              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5F35D2]/20 focus:border-[#5F35D2] text-gray-700 bg-gray-50 hover:bg-white transition-colors duration-200 appearance-none"
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
                        </div>
                      </div>

                      {/* Active Toggle */}
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                        <div>
                          <p className="font-medium text-gray-700 text-sm">Active</p>
                          <p className="text-xs text-gray-500">
                            Enable or disable this recipe
                          </p>
                        </div>
                        <Switch
                          isSelected={editIsActive}
                          onValueChange={setEditIsActive}
                          classNames={{
                            wrapper: 'group-data-[selected=true]:bg-green-500',
                          }}
                        />
                      </div>

                      {/* Ingredients Section */}
                      <div className="border-t border-gray-100 pt-4">
                        <h3 className="text-base font-semibold text-gray-800 mb-3">
                          Ingredients
                        </h3>

                        {/* Details table */}
                        {editDetails.length > 0 && (
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
                                {editDetails.map((detail) => (
                                  <tr key={detail.inventoryItemID} className="border-b border-gray-100">
                                    <td className="py-3 px-2 text-gray-700">{detail.inventoryItemName}</td>
                                    <td className="py-3 px-2 text-right text-gray-700">
                                      <input
                                        type="number"
                                        value={detail.quantityUsed}
                                        onChange={(e) => handleUpdateDetailQuantity(detail.inventoryItemID, parseFloat(e.target.value) || 0)}
                                        min="0.001"
                                        step="0.001"
                                        className="w-20 px-2 py-1 text-right border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5F35D2]/20 focus:border-[#5F35D2]"
                                      />
                                    </td>
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

                        {/* Add ingredient input row */}
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
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5F35D2]/20 focus:border-[#5F35D2] text-gray-700 bg-gray-50 hover:bg-white transition-colors duration-200"
                              />
                              {/* Dropdown suggestions */}
                              {showIngredientDropdown && (
                                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                                  {Array.isArray(availableIngredients) && availableIngredients
                                    .filter(
                                      (i) =>
                                        !editDetails.some((d) => d.inventoryItemID === i.id) &&
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
                                      !editDetails.some((d) => d.inventoryItemID === i.id) &&
                                      i.name.toLowerCase().includes(newIngredientSearch.toLowerCase())
                                  ).length === 0) && (
                                    <div className="px-4 py-3 text-sm text-gray-500">
                                      No matching ingredients found
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

                      {/* Action Buttons */}
                      <div className="flex justify-center gap-3 pt-4">
                        <button
                          type="button"
                          onClick={exitEditMode}
                          disabled={saving}
                          className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-semibold transition-all duration-200 disabled:opacity-50"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={handleSave}
                          disabled={saving}
                          className="flex items-center gap-2 px-8 py-3 bg-[#5F35D2] text-white rounded-xl hover:bg-[#5F35D2]/90 active:scale-[0.97] active:bg-[#4A2AAF] font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 shadow-lg hover:shadow-xl"
                        >
                          {saving ? (
                            <>
                              <Spinner size="sm" color="current" />
                              <span>Saving...</span>
                            </>
                          ) : (
                            <>
                              <Save className="w-4 h-4" />
                              <span>Save Changes</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* VIEW MODE */
                    <div className="space-y-6">
                      {/* Recipe Info Card */}
                      <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                              Name
                            </p>
                            <p className="font-semibold text-gray-800">
                              {recipe.name}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                              Produces
                            </p>
                            <p className="font-semibold text-gray-800">
                              {recipe.producedInventoryItemName || itemName}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                              Output
                            </p>
                            <p className="font-semibold text-gray-800">
                              {recipe.outputQuantity}{' '}
                              {recipe.outputQuantityUnitName ||
                                recipe.outputQuantityUnitCode ||
                                ''}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                              Status
                            </p>
                            <div className="flex items-center gap-2">
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  recipe.isActive
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-gray-100 text-gray-600'
                                }`}
                              >
                                {recipe.isActive ? 'Active' : 'Inactive'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Tabs */}
                      <div className="border-b border-gray-200">
                        <div className="flex gap-1">
                          <button
                            onClick={() => setActiveTab('ingredients')}
                            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors ${
                              activeTab === 'ingredients'
                                ? 'border-[#5F35D2] text-[#5F35D2]'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                          >
                            <FlaskConical className="w-4 h-4" />
                            Ingredients
                            {recipe.details && recipe.details.length > 0 && (
                              <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                                activeTab === 'ingredients'
                                  ? 'bg-[#5F35D2]/10 text-[#5F35D2]'
                                  : 'bg-gray-100 text-gray-500'
                              }`}>
                                {recipe.details.length}
                              </span>
                            )}
                          </button>
                          <button
                            onClick={() => setActiveTab('history')}
                            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors ${
                              activeTab === 'history'
                                ? 'border-[#5F35D2] text-[#5F35D2]'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                          >
                            <History className="w-4 h-4" />
                            Production History
                            {productionHistory.length > 0 && (
                              <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                                activeTab === 'history'
                                  ? 'bg-[#5F35D2]/10 text-[#5F35D2]'
                                  : 'bg-gray-100 text-gray-500'
                              }`}>
                                {productionHistory.length}
                              </span>
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Tab Content */}
                      {activeTab === 'ingredients' && (
                        <div>
                          {recipe.details && recipe.details.length > 0 ? (
                            <div className="border border-gray-200 rounded-xl overflow-hidden">
                              <table className="w-full text-sm">
                                <thead className="bg-gray-50">
                                  <tr className="border-b border-gray-200">
                                    <th className="text-left py-3 px-4 font-semibold text-gray-600 text-xs uppercase tracking-wide">
                                      Ingredient
                                    </th>
                                    <th className="text-right py-3 px-4 font-semibold text-gray-600 text-xs uppercase tracking-wide">
                                      Quantity Used
                                    </th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {recipe.details.map((detail) => (
                                    <tr
                                      key={detail.id || detail.inventoryItemId || detail.inventoryItemID}
                                      className="border-b border-gray-100 last:border-b-0"
                                    >
                                      <td className="py-3 px-4 text-gray-700">
                                        {detail.inventoryItemName || getIngredientName(detail.inventoryItemId || detail.inventoryItemID || '')}
                                      </td>
                                      <td className="py-3 px-4 text-right text-gray-700 font-medium">
                                        {detail.quantityUsed}{' '}
                                        <span className="text-gray-400 text-xs">
                                          {recipe.outputQuantityUnitName || recipe.outputQuantityUnitCode || ''}
                                        </span>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          ) : (
                            <div className="border border-gray-200 rounded-xl p-8 text-center">
                              <FlaskConical className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                              <p className="text-sm text-gray-500">
                                No ingredients listed
                              </p>
                            </div>
                          )}
                        </div>
                      )}

                      {activeTab === 'history' && (
                        <div>
                          {productionHistory.length > 0 ? (
                            <div className="border border-gray-200 rounded-xl overflow-hidden">
                              <table className="w-full text-sm">
                                <thead className="bg-gray-50">
                                  <tr className="border-b border-gray-200">
                                    <th className="text-left py-3 px-4 font-semibold text-gray-600 text-xs uppercase tracking-wide">
                                      Date
                                    </th>
                                    <th className="text-right py-3 px-4 font-semibold text-gray-600 text-xs uppercase tracking-wide">
                                      Quantity Produced
                                    </th>
                                    <th className="text-right py-3 px-4 font-semibold text-gray-600 text-xs uppercase tracking-wide">
                                      Total Cost
                                    </th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {productionHistory.map((record) => (
                                    <tr
                                      key={record.id}
                                      className="border-b border-gray-100 last:border-b-0"
                                    >
                                      <td className="py-3 px-4 text-gray-700">
                                        {formatDateTime(record.dateCreated || record.dateProduced || '')}
                                      </td>
                                      <td className="py-3 px-4 text-right text-gray-700 font-medium">
                                        {record.quantityProduced ?? record.quantity ?? '-'}
                                      </td>
                                      <td className="py-3 px-4 text-right text-gray-700 font-medium">
                                        {record.totalCost != null ? formatCurrency(record.totalCost) : '-'}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          ) : (
                            <div className="border border-gray-200 rounded-xl p-8 text-center">
                              <History className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                              <p className="text-sm text-gray-500">
                                No production history yet
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )
                ) : (
                  <div className="text-center py-12">
                    <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">
                      No recipe found for this item
                    </p>
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

export default ViewRecipeModal;
