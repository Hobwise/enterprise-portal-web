'use client';

import React from 'react';
import { CustomButton } from '@/components/customButton';
import { Ruler } from 'lucide-react';
import { FaArrowRight } from 'react-icons/fa6';

interface NoUnitsProps {
  onAddUnit: () => void;
}

const NoUnits: React.FC<NoUnitsProps> = ({ onAddUnit }) => {
  return (
    <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)] w-full bg-white rounded-lg p-8">
      <div className="flex flex-col items-center max-w-md text-center">
        <div className="p-3 bg-[#EAE5FF] rounded-lg flex items-center justify-center mb-6">
          <Ruler className="text-primaryColor w-6 h-6" />
        </div>

        <h2 className="text-2xl font-bold text-[#3D424A] mb-2">
          No Units Found
        </h2>
        <p className="text-[#98A2B3] mb-8">
          Create measurement units to use across your inventory items.
          Units define how items are measured, purchased, and consumed.
        </p>

        <CustomButton
          onClick={onAddUnit}
          className="text-white h-[48px] px-8"
          backgroundColor="bg-primaryColor"
        >
          <div className="flex items-center gap-2">
            <span>Add Unit</span>
            <FaArrowRight />
          </div>
        </CustomButton>
      </div>
    </div>
  );
};

export default NoUnits;
