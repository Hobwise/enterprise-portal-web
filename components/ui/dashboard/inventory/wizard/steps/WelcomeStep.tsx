'use client';

import React from 'react';
import WizardHeader from '../WizardHeader';

interface WelcomeStepProps {
  onNext: () => void;
}

const WelcomeStep: React.FC<WelcomeStepProps> = ({ onNext }) => {
  return (
    <div className="min-h-[70vh] bg-[#EBE8F9] rounded-2xl p-6 sm:p-10 flex flex-col items-center">
      {/* Header: Hat left, Indicator right */}
      <WizardHeader currentStep={1} />

      {/* Title */}
      <h2 className="text-3xl sm:text-4xl font-medium text-gray-800 mb-3 text-center">
        Let&apos;s Set Up Your Inventory
      </h2>
      <p className="text-base text-gray-600 text-center max-w-xl mb-10">
        Track Stock, reduce wastage and calculate profit — all without interrupting daily sales
      </p>

      {/* Feature Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-3xl mb-10">
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="w-12 h-12 bg-[#5F35D2]/10 rounded-xl flex items-center justify-center mb-3">
            <svg className="w-6 h-6 text-[#5F35D2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h3 className="font-semibold text-gray-800 mb-1">Track Stock Level</h3>
          <p className="text-sm text-gray-500">
            Know exactly what you have on hand and when to reorder
          </p>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mb-3">
            <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="font-semibold text-gray-800 mb-1">Reduce Wastage</h3>
          <p className="text-sm text-gray-500">
            Identify discrepancies and prevent unnecessary losses
          </p>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-3">
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <h3 className="font-semibold text-gray-800 mb-1">Safe & Progressive</h3>
          <p className="text-sm text-gray-500">
            Setup at your own pace. Your POS keeps running smoothly
          </p>
        </div>
      </div>

      {/* Repeated subtitle */}
      <p className="text-base text-gray-600 text-center max-w-xl mb-8">
        Track Stock, reduce wastage and calculate profit — all without interrupting daily sales
      </p>

      {/* CTA Button */}
      <button
        onClick={onNext}
        className="flex items-center gap-2 px-8 py-3 bg-[#5F35D2] text-white rounded-xl hover:bg-[#5F35D2]/90 font-semibold transition-all duration-200"
      >
        <span>Start Setup</span>
        <span>&rarr;</span>
      </button>
    </div>
  );
};

export default WelcomeStep;
