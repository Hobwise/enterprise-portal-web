'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import WizardHeader from '../WizardHeader';

interface SuccessStepProps {
  createdItemId: string | null;
  onAddMoreItems: () => void;
  onViewInventoryList: () => void;
}

const SuccessStep: React.FC<SuccessStepProps> = ({
  createdItemId,
  onAddMoreItems,
  onViewInventoryList,
}) => {
  const router = useRouter();

  const handleFineTuneRecipe = () => {
    if (createdItemId) {
      router.push(`/dashboard/inventory/items/${createdItemId}`);
    }
  };

  return (
    <div className="min-h-[70vh] bg-[#EBE8F9] rounded-2xl p-6 sm:p-10 flex flex-col items-center">
      {/* Header: Hat left, Indicator right — all steps completed (step 7 = all 6 filled) */}
      <WizardHeader currentStep={7} />

      {/* Title */}
      <h2 className="text-3xl sm:text-4xl font-medium text-gray-800 mb-3 text-center">
        Your Item Is All Set
      </h2>
      <p className="text-base text-gray-600 text-center max-w-md mb-10">
        Your item is now active in the inventory. Stock will be tracked and deducted automatically
      </p>

      {/* Option Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-3xl mb-10">
        {/* Add More Items */}
        <button
          onClick={onAddMoreItems}
          className="bg-white rounded-xl p-6 text-left border border-gray-200 hover:border-[#5F35D2]/30 transition-all duration-200"
        >
          <div className="w-12 h-12 bg-[#5F35D2]/10 rounded-xl flex items-center justify-center mb-3">
            <svg className="w-6 h-6 text-[#5F35D2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
          <h3 className="font-semibold text-gray-800 mb-1">Add More Items</h3>
          <p className="text-sm text-gray-500">
            Continue building your inventory with more ingredients, menu items and other items in stock
          </p>
        </button>

        {/* View Inventory List */}
        <button
          onClick={onViewInventoryList}
          className="bg-white rounded-xl p-6 text-left border border-gray-200 hover:border-[#5F35D2]/30 transition-all duration-200"
        >
          <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mb-3">
            <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h3 className="font-semibold text-gray-800 mb-1">View Inventory list</h3>
          <p className="text-sm text-gray-500">
            View and edit details of all items in your inventory. Track usage and minimize wastage
          </p>
        </button>

        {/* Fine Tune Recipe */}
        <button
          onClick={handleFineTuneRecipe}
          disabled={!createdItemId}
          className="bg-white rounded-xl p-6 text-left border border-gray-200 hover:border-[#5F35D2]/30 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-3">
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
          </div>
          <h3 className="font-semibold text-gray-800 mb-1">Fine Tune Recipe</h3>
          <p className="text-sm text-gray-500">
            Customize recipe and measurement to ensure accurate deduction in stock when items are used or sold.
          </p>
        </button>
      </div>

      {/* Wide CTA Button */}
      <button
        onClick={onViewInventoryList}
        className="flex items-center justify-center gap-3 w-full max-w-md py-3 bg-[#5F35D2] text-white rounded-xl hover:bg-[#5F35D2]/90 font-semibold transition-all duration-200"
      >
        <span>Go to Inventory Item List</span>
        <span>&rarr;</span>
      </button>
    </div>
  );
};

export default SuccessStep;
