'use client';

import React from 'react';
import WizardHeader from '../WizardHeader';

interface StrictnessStepProps {
  strictnessLevel: number;
  onUpdate: (level: number) => void;
  onNext: () => void;
  onBack: () => void;
}

const StrictnessStep: React.FC<StrictnessStepProps> = ({
  strictnessLevel,
  onUpdate,
  onNext,
  onBack,
}) => {
  return (
    <div className="min-h-[70vh] bg-[#EBE8F9] rounded-2xl p-6 sm:p-10 flex flex-col">
      {/* Header: Hat left, Indicator right */}
      <WizardHeader currentStep={3} />

      {/* Title */}
      <div className="flex flex-col items-center">
        <h2 className="text-3xl sm:text-4xl font-medium text-gray-800 mb-3 text-center">
          How Strict should inventory be?
        </h2>
        <p className="text-base text-gray-600 text-center max-w-lg mb-8">
          Choose how inventory affects your point of sale. You can change this anytime and on specific items
        </p>
      </div>

      {/* Mode Selection Cards */}
      <div className="w-full max-w-2xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
        {/* Safe Mode Card */}
        <button
          onClick={() => onUpdate(0)}
          className={`relative text-left p-5 rounded-xl bg-white transition-all duration-200 ${
            strictnessLevel === 0
              ? 'border-2 border-[#5F35D2]'
              : 'border border-gray-200 hover:border-gray-300'
          }`}
        >
          <div className="flex items-start justify-between mb-3">
            <div className="w-10 h-10 bg-[#5F35D2]/10 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-[#5F35D2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            {/* Recommended Badge */}
            <span className="px-2.5 py-0.5 bg-[#5F35D2]/10 text-[#5F35D2] text-xs font-semibold rounded-full">
              Recommended
            </span>
          </div>

          <h3 className="font-bold text-gray-900 mb-1">Safe Mode</h3>
          <p className="text-sm text-gray-500 mb-3">
            Never block sales. Allow negative stock. Best for first time users
          </p>
          <ul className="space-y-2">
            {[
              'Sales always go through regardless of stock level',
              'Negative stock is allowed',
              'Allows you to learn usage pattern',
              'Switch to strict later if needed',
            ].map((text, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-gray-500">
                <span className="text-[#5F35D2] mt-0.5 shrink-0">&#9675;</span>
                {text}
              </li>
            ))}
          </ul>
        </button>

        {/* Strict Mode Card */}
        <button
          onClick={() => onUpdate(1)}
          className={`relative text-left p-5 rounded-xl bg-white transition-all duration-200 ${
            strictnessLevel === 1
              ? 'border-2 border-[#5F35D2]'
              : 'border border-gray-200 hover:border-gray-300'
          }`}
        >
          <div className="mb-3">
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
          </div>

          <h3 className="font-bold text-gray-900 mb-1">Strict Mode</h3>
          <p className="text-sm text-gray-500 mb-3">
            Block sales of out of stock item. Enforce Availability rule.
          </p>
          <ul className="space-y-2">
            {[
              'Block sales when item stock is zero/empty',
              'Enforces real-time availability',
              'Accurate stock counts and units required',
              'Best for experienced users',
            ].map((text, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-gray-500">
                <span className="text-[#5F35D2] mt-0.5 shrink-0">&#9675;</span>
                {text}
              </li>
            ))}
          </ul>
        </button>
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
          className="flex items-center gap-2 px-8 py-3 bg-[#5F35D2] text-white rounded-xl hover:bg-[#5F35D2]/90 font-semibold transition-all duration-200"
        >
          <span>Save & Continue</span>
          <span>&rarr;</span>
        </button>
      </div>
    </div>
  );
};

export default StrictnessStep;
