'use client';

import React from 'react';

interface WizardStepIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

const WizardStepIndicator: React.FC<WizardStepIndicatorProps> = ({
  currentStep,
  totalSteps,
}) => {
  return (
    <div className="flex items-center gap-0">
      {Array.from({ length: totalSteps }, (_, i) => {
        const stepNum = i + 1;
        const isCompleted = stepNum < currentStep;
        const isActive = stepNum === currentStep;
        const isUpcoming = stepNum > currentStep;

        return (
          <React.Fragment key={stepNum}>
            {/* Circle */}
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center text-base font-semibold shrink-0 ${
                isCompleted || isActive
                  ? 'bg-[#5F35D2] text-white'
                  : 'bg-gray-200 text-gray-400'
              }`}
            >
              {stepNum}
            </div>

            {/* Connecting line */}
            {stepNum < totalSteps && (
              <div
                className={`w-12 h-0.5 ${
                  isUpcoming ? 'bg-gray-300' : 'bg-[#5F35D2]'
                }`}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default WizardStepIndicator;
