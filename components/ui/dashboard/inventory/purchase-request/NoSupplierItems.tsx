import React from "react";
import { SupplierIcon } from "@/public/assets/svg";

const NoSupplierItems: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center w-full bg-white rounded-lg p-8 min-h-[300px]">
      <div className="flex flex-col items-center max-w-md text-center">
        <div className="p-3 bg-[#EAE5FF] rounded-lg flex items-center justify-center mb-6">
          <SupplierIcon className="text-primaryColor" />
        </div>

        <h2 className="text-xl font-bold text-[#3D424A] mb-2">
          No Supplier Items Registered
        </h2>
        <p className="text-[#424242]">
          Select a supplier to view their inventory items. You can then select items to include in your purchase order.
        </p>
      </div>
    </div>
  );
};

export default NoSupplierItems;
