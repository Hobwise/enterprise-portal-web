import { CustomButton } from "@/components/customButton";
import {  SupplierIcon } from "@/public/assets/svg";
import { Spacer } from "@nextui-org/react";
import React from "react";
import { FaArrowRight } from "react-icons/fa6";

interface NoSuppliersProps {
  onRegister: () => void;
}

const NoSuppliers: React.FC<NoSuppliersProps> = ({ onRegister }) => {
  return (
    <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)] w-full bg-white rounded-lg p-8">
      <div className="flex flex-col items-center max-w-md text-center">
        {/* Placeholder Icon */}
        <div className="p-3 bg-[#EAE5FF] rounded-lg flex items-center justify-center mb-6">
           <SupplierIcon className="text-primaryColor" />
        </div>

        <h2 className="text-2xl font-bold text-[#3D424A] mb-2">
          No Suppliers Registered
        </h2>
        <p className="text-[#98A2B3] mb-8">
          Register your suppliers here. Your can easily assign inventory items to
          suppliers to ensure fast purchase order generation.
        </p>

        <CustomButton
            onClick={onRegister}
            className="text-white h-[48px] px-8"
            backgroundColor="bg-primaryColor"
        >
            <div className="flex items-center gap-2">
                <span>Register Supplier</span>
                <FaArrowRight />
            </div>
        </CustomButton>

      </div>
    </div>
  );
};

export default NoSuppliers;
