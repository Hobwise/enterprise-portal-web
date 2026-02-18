'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Spinner } from '@nextui-org/react';
import { Plus } from 'lucide-react';

import { notify } from '@/lib/utils';
import { InventoryItemType } from '@/app/api/controllers/dashboard/inventory';
import { useUnitsByBusiness, useIngredients } from '@/hooks/cachedEndpoints/useInventoryItems';
import WizardHeader from '../WizardHeader';

type LocalRecipeDetail = {
  inventoryItemID: string;
  inventoryItemName: string;
  quantityUsed: number;
};

interface BuildRecipeStepProps {
  createdItemId: string;
  createdItemName: string;
  itemType: InventoryItemType | null;
  recipeDetails: LocalRecipeDetail[];
  recipeName: string;
  outputQuantity: string;
  outputQuantityUnitId: string;
  recipeType: number;
  onUpdateRecipeDetails: (details: LocalRecipeDetail[]) => void;
  onUpdateRecipeName: (val: string) => void;
  onUpdateOutputQuantity: (val: string) => void;
  onUpdateOutputQuantityUnitId: (val: string) => void;
  onUpdateRecipeType: (val: number) => void;
  onNext: () => void;
  onBack: () => void;
}

const BuildRecipeStep: React.FC<BuildRecipeStepProps> = ({
  createdItemId,
  createdItemName,
  itemType,
  recipeDetails,
  recipeName,
  outputQuantity,
  outputQuantityUnitId,
  recipeType,
  onUpdateRecipeDetails,
  onUpdateRecipeName,
  onUpdateOutputQuantity,
  onUpdateOutputQuantityUnitId,
  onUpdateRecipeType,
  onNext,
  onBack,
}) => {
  const [newIngredientId, setNewIngredientId] = useState('');
  const [newIngredientSearch, setNewIngredientSearch] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [newQty, setNewQty] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { data: units, isLoading: unitsLoading } = useUnitsByBusiness();
  const { data: availableIngredients, isLoading: ingredientsLoading } = useIngredients();

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handleAddIngredient = useCallback(() => {
    if (!newIngredientId) {
      notify({ title: 'Error!', text: 'Please select an ingredient', type: 'error' });
      return;
    }
    if (!newQty || parseFloat(newQty) <= 0) {
      notify({ title: 'Error!', text: 'Please enter a valid quantity', type: 'error' });
      return;
    }
    if (recipeDetails.some((d) => d.inventoryItemID === newIngredientId)) {
      notify({ title: 'Error!', text: 'This ingredient is already added', type: 'error' });
      return;
    }

    const ingredient = Array.isArray(availableIngredients) &&
      availableIngredients.find((i) => i.id === newIngredientId);
    if (!ingredient) return;

    onUpdateRecipeDetails([
      ...recipeDetails,
      {
        inventoryItemID: newIngredientId,
        inventoryItemName: ingredient.name,
        quantityUsed: parseFloat(newQty),
      },
    ]);

    setNewIngredientId('');
    setNewIngredientSearch('');
    setShowDropdown(false);
    setNewQty('');
  }, [newIngredientId, newQty, recipeDetails, availableIngredients, onUpdateRecipeDetails]);

  const handleSaveRecipe = () => {
    if (recipeDetails.length === 0) {
      notify({ title: 'Error!', text: 'Please add at least one ingredient', type: 'error' });
      return;
    }
    onNext();
  };

  const isNotProducedType = itemType !== InventoryItemType.Produced;

  return (
    <div className="min-h-[70vh] bg-[#EBE8F9] rounded-2xl p-6 sm:p-10 flex flex-col">
      {/* Header: Hat left, Indicator right */}
      <WizardHeader currentStep={5} />

      {/* Title */}
      <div className="flex flex-col items-center">
        <h2 className="text-3xl sm:text-4xl font-medium text-gray-800 mb-3 text-center">
          Build a Recipe
        </h2>
        <p className="text-base text-gray-600 text-center max-w-lg mb-8">
          Select and define ingredients and quantities to prepare a menu item. This helps track stock usage
        </p>
      </div>

      <div className="w-full max-w-3xl mx-auto">
        {/* Non-produced type message */}
        {isNotProducedType && (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl mb-6">
            <p className="text-sm text-amber-700">
              Recipes are typically used for <strong>Produced/Prepared</strong> items. Since your item is not a produced type, you may want to skip this step.
            </p>
          </div>
        )}

        {!isNotProducedType && (
        <>
        {/* Recipe Name */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 mb-4">
          <label className="block text-xs font-medium text-gray-500 mb-1">Recipe Name</label>
          <input
            type="text"
            value={recipeName}
            onChange={(e) => onUpdateRecipeName(e.target.value)}
            placeholder={`e.g. ${createdItemName} Recipe`}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5F35D2]/20 focus:border-[#5F35D2] text-sm text-gray-700 bg-white transition-colors duration-200"
          />
        </div>

        {/* Recipe Configuration */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 mb-4">
          <p className="text-sm font-semibold text-gray-700 mb-3">Recipe Configuration</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Output Quantity</label>
              <input
                type="number"
                value={outputQuantity}
                onChange={(e) => onUpdateOutputQuantity(e.target.value)}
                placeholder="1"
                min="0.001"
                step="0.001"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5F35D2]/20 focus:border-[#5F35D2] text-sm text-gray-700 bg-white transition-colors duration-200"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Output Unit</label>
              <div className="relative">
                <select
                  value={outputQuantityUnitId}
                  onChange={(e) => onUpdateOutputQuantityUnitId(e.target.value)}
                  disabled={unitsLoading}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5F35D2]/20 focus:border-[#5F35D2] text-sm text-gray-700 bg-white transition-colors duration-200 appearance-none"
                >
                  <option value="">Select unit</option>
                  {Array.isArray(units) &&
                    units.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name}
                      </option>
                    ))}
                </select>
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  {unitsLoading ? (
                    <Spinner size="sm" color="secondary" />
                  ) : (
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Two-column card layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          {/* LEFT: Menu Item Card */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-sm font-medium text-gray-600 mb-3">Menu Item</p>
            <span className="inline-block px-6 py-2.5 bg-[#5F35D2] text-white font-semibold rounded-lg text-sm mb-3">
              {createdItemName}
            </span>

            {/* Added ingredients list */}
            {recipeDetails.length > 0 && (
              <div className="space-y-2 mt-2">
                {recipeDetails.map((detail) => (
                  <div
                    key={detail.inventoryItemID}
                    className="flex items-center justify-between px-3 py-2 bg-gray-50 rounded-lg"
                  >
                    <span className="text-sm text-gray-700">{detail.inventoryItemName}</span>
                    <span className="text-sm text-gray-500">Qty: {detail.quantityUsed}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT: Ingredient Form Card */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            {/* New ingredient input row */}
            <div className="flex gap-3 items-end mb-3">
              <div className="flex-1 relative" ref={dropdownRef}>
                <label className="block text-xs font-medium text-gray-500 mb-1">Select ingredients</label>
                <input
                  type="text"
                  value={newIngredientSearch}
                  onChange={(e) => {
                    setNewIngredientSearch(e.target.value);
                    setNewIngredientId('');
                    setShowDropdown(true);
                  }}
                  onFocus={() => setShowDropdown(true)}
                  placeholder="Menu item"
                  disabled={ingredientsLoading}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5F35D2]/20 focus:border-[#5F35D2] text-sm text-gray-700 bg-white transition-colors duration-200"
                />
                <div className="absolute right-3 top-[calc(50%+8px)] transform -translate-y-1/2 pointer-events-none">
                  {ingredientsLoading ? (
                    <Spinner size="sm" color="secondary" />
                  ) : (
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  )}
                </div>

                {/* Dropdown */}
                {showDropdown && !ingredientsLoading && (
                  <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                    {Array.isArray(availableIngredients) &&
                      availableIngredients
                        .filter(
                          (i) =>
                            !recipeDetails.some((d) => d.inventoryItemID === i.id) &&
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
                              setShowDropdown(false);
                            }}
                            className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-[#5F35D2]/10 hover:text-[#5F35D2] transition-colors"
                          >
                            {ingredient.name}
                          </button>
                        ))}
                    {(!Array.isArray(availableIngredients) ||
                      availableIngredients.filter(
                        (i) =>
                          !recipeDetails.some((d) => d.inventoryItemID === i.id) &&
                          i.name.toLowerCase().includes(newIngredientSearch.toLowerCase())
                      ).length === 0) && (
                      <div className="px-4 py-3 text-sm text-gray-500">
                        No ingredients found
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="w-20">
                <label className="block text-xs font-medium text-gray-500 mb-1">Qty</label>
                <input
                  type="number"
                  value={newQty}
                  onChange={(e) => setNewQty(e.target.value)}
                  placeholder="Qty"
                  min="0.001"
                  step="0.001"
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5F35D2]/20 focus:border-[#5F35D2] text-sm text-gray-700 bg-white transition-colors duration-200"
                />
              </div>
            </div>

            {/* Add Ingredients Button */}
            <button
              type="button"
              onClick={handleAddIngredient}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#5F35D2]/80 text-white rounded-xl hover:bg-[#5F35D2] font-semibold text-sm transition-all duration-200"
            >
              <span>Add Ingredients</span>
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>
        </>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between items-center w-full mt-auto">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
        >
          <span>&larr;</span>
          <span>Back</span>
        </button>

        <button
          onClick={onNext}
          className="flex items-center gap-2 px-6 py-3 border border-gray-300 bg-white text-gray-700 rounded-xl hover:bg-gray-50 font-medium transition-all duration-200"
        >
          <span>Skip for now</span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
          </svg>
        </button>

        {!isNotProducedType && (
        <button
          onClick={handleSaveRecipe}
          disabled={recipeDetails.length === 0}
          className="flex items-center gap-2 px-8 py-3 bg-[#5F35D2] text-white rounded-xl hover:bg-[#5F35D2]/90 font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
        >
          <span>Save & Continue</span>
          <span>&rarr;</span>
        </button>
        )}
      </div>
    </div>
  );
};

export default BuildRecipeStep;
