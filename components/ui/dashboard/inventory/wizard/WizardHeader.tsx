'use client';

import React from 'react';
import WizardStepIndicator from './WizardStepIndicator';

interface WizardHeaderProps {
  currentStep: number;
  totalSteps?: number;
}

const WizardHeader: React.FC<WizardHeaderProps> = ({
  currentStep,
  totalSteps = 6,
}) => {
  return (
    <div className="flex justify-between items-center w-full mb-8">
      {/* Left: Hat + Title */}
      <div className="flex items-center gap-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/assets/images/witch-hat.png"
          alt="Hobwise Wizard"
          width={48}
          height={48}
          className="object-contain"
        />
        <span className="text-lg font-bold text-gray-900">Hobwise Wizard</span>
      </div>

      {/* Right: Step Indicator */}
      <WizardStepIndicator currentStep={currentStep} totalSteps={totalSteps} />
    </div>
  );
};

export default WizardHeader;
