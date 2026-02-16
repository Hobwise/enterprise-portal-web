'use client';

import React, { useState } from 'react';
import { Spinner } from '@nextui-org/react';
import {
  InventoryItemType,
} from '@/app/api/controllers/dashboard/inventory';
import { useUnitsByBusiness } from '@/hooks/cachedEndpoints/useInventoryItems';
import WizardHeader from '../WizardHeader';
import { notify } from '@/lib/utils';

interface AddItemStepProps {
  itemName: string;
  unitId: string;
  costPerUnit: string;
  itemType: InventoryItemType | null;
  createdItemId: string | null;
  strictnessLevel: number;
  onUpdate: (data: {
    itemName?: string;
    unitId?: string;
    costPerUnit?: string;
    itemType?: InventoryItemType | null;
    createdItemId?: string | null;
  }) => void;
  onNext: () => void;
  onBack: () => void;
  saveProgress: (currentStep: number, overrides?: Record<string, any>) => Promise<any>;
}

const AddItemStep: React.FC<AddItemStepProps> = ({
  itemName,
  unitId,
  costPerUnit,
  itemType,
  createdItemId,
  strictnessLevel,
  onUpdate,
  onNext,
  onBack,
  saveProgress,
}) => {
  const [loading, setLoading] = useState(false);
  const { data: unitsByBusiness, isLoading: unitsByBusinessLoading } = useUnitsByBusiness();

  const handleSubmit = async () => {
    if (!itemName.trim()) {
      notify({ title: 'Error!', text: 'Item name is required', type: 'error' });
      return;
    }
    if (!unitId) {
      notify({ title: 'Error!', text: 'Please select a unit', type: 'error' });
      return;
    }
    if (!costPerUnit || parseFloat(costPerUnit) < 0) {
      notify({ title: 'Error!', text: 'Please enter a valid cost per unit', type: 'error' });
      return;
    }
    if (itemType === null) {
      notify({ title: 'Error!', text: 'Please select an item type', type: 'error' });
      return;
    }

    setLoading(true);
    try {
      const response = await saveProgress(4, {
        itemName,
        unitId,
        costPerUnit,
        itemType,
      });

      if (response && 'errors' in response) {
        const errors = response.errors as Record<string, string[]>;
        const errorMessage = Object.values(errors).flat().join(', ');
        notify({ title: 'Error!', text: errorMessage || 'Please check your input values', type: 'error' });
        return;
      }

      if (response?.data?.isSuccessful) {
        const newItemId = createdItemId || response.data.data?.id;
        if (newItemId) {
          onUpdate({ createdItemId: newItemId });
        }
        onNext();
      } else {
        notify({ title: 'Error!', text: response?.data?.error || 'Failed to setup inventory', type: 'error' });
      }
    } catch (error) {
      console.error('Error setting up inventory wizard:', error);
      // Interceptor already shows error toast
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[70vh] bg-[#EBE8F9] rounded-2xl p-6 sm:p-10 flex flex-col">
      {/* Header: Hat left, Indicator right */}
      <WizardHeader currentStep={4} />

      {/* Title */}
      <div className="flex flex-col items-center">
        <h2 className="text-3xl sm:text-4xl font-medium text-gray-800 mb-3 text-center">
          What do you want to stock?
        </h2>
        <p className="text-base text-gray-600 text-center max-w-lg mb-8">
          Add raw ingredients, prepared items or other items to your inventory. You can add more later.
        </p>
      </div>

      <div className="w-full max-w-3xl mx-auto">
        {/* Form Card */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          {/* Row 1: Item Name, Units, Cost/Unit */}
          <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_auto] gap-4 mb-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Item Name
              </label>
              <input
                type="text"
                value={itemName}
                onChange={(e) => onUpdate({ itemName: e.target.value })}
                placeholder="Enter item name"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5F35D2]/20 focus:border-[#5F35D2] text-gray-700 bg-white transition-colors duration-200"
              />
            </div>

            <div className="sm:w-36">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Units
              </label>
              <div className="relative">
                <select
                  value={unitId}
                  onChange={(e) => onUpdate({ unitId: e.target.value })}
                  disabled={unitsByBusinessLoading}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5F35D2]/20 focus:border-[#5F35D2] text-gray-700 bg-white transition-colors duration-200 appearance-none"
                >
                  <option value="">Select unit</option>
                  {Array.isArray(unitsByBusiness) &&
                    unitsByBusiness.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name}
                      </option>
                    ))}
                </select>
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  {unitsByBusinessLoading ? (
                    <Spinner size="sm" color="secondary" />
                  ) : (
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  )}
                </div>
              </div>
            </div>

            <div className="sm:w-36">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Cost/Unit
              </label>
              <input
                type="number"
                value={costPerUnit}
                onChange={(e) => onUpdate({ costPerUnit: e.target.value })}
                placeholder="0.00"
                min="0"
                step="0.01"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5F35D2]/20 focus:border-[#5F35D2] text-gray-700 bg-white transition-colors duration-200"
              />
            </div>
          </div>

          {/* Row 2: Item Type */}
          <div className="mb-6">
            <div className="sm:w-1/2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Item Type
              </label>
              <div className="relative">
                <select
                  value={itemType === null ? '' : itemType}
                  onChange={(e) => {
                    const val = e.target.value;
                    onUpdate({
                      itemType: val === '' ? null : (Number(val) as InventoryItemType),
                    });
                  }}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5F35D2]/20 focus:border-[#5F35D2] text-gray-700 bg-white transition-colors duration-200 appearance-none"
                >
                  <option value="">Select item type</option>
                  <option value={InventoryItemType.Direct}>Direct Sale</option>
                  <option value={InventoryItemType.Ingredient}>Ingredient</option>
                  <option value={InventoryItemType.Produced}>Prepared / Produced</option>
                </select>
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Save Button inside card */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex items-center gap-2 px-8 py-3 bg-[#5F35D2] text-white rounded-xl hover:bg-[#5F35D2]/90 font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            {loading ? (
              <>
                <Spinner size="sm" color="current" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <span>Save & Continue</span>
                <span>&rarr;</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between items-center w-full mt-auto pt-8">
        <button
          onClick={onBack}
          disabled={loading}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
        >
          <span>&larr;</span>
          <span>Back</span>
        </button>
      </div>
    </div>
  );
};

export default AddItemStep;
