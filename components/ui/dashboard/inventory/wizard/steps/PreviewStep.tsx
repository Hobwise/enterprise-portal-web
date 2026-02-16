'use client';

import React from 'react';
import { Switch } from '@nextui-org/react';
import { InventoryItemType } from '@/app/api/controllers/dashboard/inventory';
import WizardHeader from '../WizardHeader';

type LocalRecipeDetail = {
  inventoryItemID: string;
  inventoryItemName: string;
  quantityUsed: number;
};

interface PreviewStepProps {
  itemName: string;
  unitId: string;
  unitName: string;
  costPerUnit: string;
  itemType: InventoryItemType | null;
  strictnessLevel: number;
  inventorySyncEnabled: boolean;
  recipeDetails: LocalRecipeDetail[];
  onNext: () => void;
  onBack: () => void;
}

const getItemTypeLabel = (itemType: InventoryItemType | null): string => {
  switch (itemType) {
    case InventoryItemType.Direct:
      return 'Direct Sale';
    case InventoryItemType.Ingredient:
      return 'Ingredient';
    case InventoryItemType.Produced:
      return 'Prepared / Produced';
    default:
      return '—';
  }
};

const PreviewStep: React.FC<PreviewStepProps> = ({
  itemName,
  unitName,
  costPerUnit,
  itemType,
  strictnessLevel,
  inventorySyncEnabled,
  recipeDetails,
  onNext,
  onBack,
}) => {
  return (
    <div className="min-h-[70vh] bg-[#EBE8F9] rounded-2xl p-6 sm:p-10 flex flex-col">
      {/* Header: Hat left, Indicator right */}
      <WizardHeader currentStep={6} />

      {/* Title */}
      <div className="flex flex-col items-center">
        <h2 className="text-3xl sm:text-4xl font-medium text-gray-800 mb-3 text-center">
          Preview
        </h2>
        <p className="text-base text-gray-600 text-center max-w-lg mb-8">
          See details of item you just created before you add to inventory list.
        </p>
      </div>

      <div className="w-full max-w-3xl mx-auto space-y-4">
        {/* Item Details Card */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          {/* Row 1: Item Name, Units, Cost/Unit */}
          <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_auto] gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Item Name</label>
              <p className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-700 bg-gray-50">
                {itemName || '—'}
              </p>
            </div>
            <div className="sm:w-32">
              <label className="block text-sm font-medium text-gray-500 mb-1">Units</label>
              <p className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-700 bg-gray-50">
                {unitName || '—'}
              </p>
            </div>
            <div className="sm:w-32">
              <label className="block text-sm font-medium text-gray-500 mb-1">Cost/Unit</label>
              <p className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-700 bg-gray-50">
                {costPerUnit ? `${parseFloat(costPerUnit).toLocaleString()}` : '—'}
              </p>
            </div>
          </div>

          {/* Row 2: Item Type, Item Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Item Type</label>
              <p className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-700 bg-gray-50">
                {getItemTypeLabel(itemType)}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Item Category</label>
              <p className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-700 bg-gray-50">
                {getItemTypeLabel(itemType)}
              </p>
            </div>
          </div>
        </div>

        {/* Bottom two-column layout: Recipe + Settings */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* LEFT: Recipe Card */}
          <div className="bg-white rounded-xl border border-gray-200 border-l-4 border-l-[#5F35D2] p-5">
            <h3 className="font-semibold text-gray-800 mb-3">Recipe</h3>
            {recipeDetails.length > 0 ? (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {recipeDetails.map((detail) => (
                  <div
                    key={detail.inventoryItemID}
                    className="flex items-center gap-3"
                  >
                    <div className="flex-1">
                      <p className="px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 bg-gray-50">
                        {detail.inventoryItemName}
                      </p>
                    </div>
                    <div className="w-20">
                      <p className="px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 bg-gray-50">
                        {detail.quantityUsed}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400">No recipe added</p>
            )}
          </div>

          {/* RIGHT: Settings Cards */}
          <div className="space-y-4">
            {/* Inventory Sync Card */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center shrink-0">
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-800 text-sm">Inventory Sync</p>
                <p className="text-xs text-gray-500">Click to enable</p>
              </div>
              <Switch
                isSelected={inventorySyncEnabled}
                isDisabled
                size="sm"
                classNames={{
                  wrapper: 'group-data-[selected=true]:bg-[#5F35D2]',
                }}
              />
            </div>

            {/* Mode Badge Card */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                strictnessLevel === 0 ? 'bg-[#5F35D2]/10' : 'bg-orange-100'
              }`}>
                <svg className={`w-5 h-5 ${strictnessLevel === 0 ? 'text-[#5F35D2]' : 'text-orange-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-gray-800 text-sm">
                  {strictnessLevel === 0 ? 'Safe Mode' : 'Strict Mode'}
                </p>
                <p className="text-xs text-gray-500">
                  {strictnessLevel === 0
                    ? 'Never block sales. Allow negative stock. Best for first time users'
                    : 'Block sales of out of stock item. Enforce Availability rule.'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between items-center w-full mt-auto pt-8">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
        >
          <span>&larr;</span>
          <span>Back</span>
        </button>
        <button
          onClick={onNext}
          className="flex items-center gap-2 px-8 py-3 bg-[#5F35D2] text-white rounded-xl hover:bg-[#5F35D2]/90 font-semibold transition-all duration-200"
        >
          <span>Save to Item List</span>
          <span>&rarr;</span>
        </button>
      </div>
    </div>
  );
};

export default PreviewStep;
