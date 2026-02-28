import React from "react";
import { SupplierIcon } from "@/public/assets/svg";

interface NoSupplierItemsProps {
  hasSupplier?: boolean;
}

const NoSupplierItems: React.FC<NoSupplierItemsProps> = ({ hasSupplier = false }) => {
  return (
    <div className="flex flex-col items-center justify-center w-full bg-white rounded-lg min-h-[250px]">
      <div className="flex flex-col items-center max-w-md text-center">
        <div className="p-3 bg-[#EAE5FF] rounded-lg flex items-center justify-center">
          <SupplierIcon className="text-primaryColor" />
        </div>

        {hasSupplier ? (
          <>
            <h2 className="text-xl font-bold text-[#3D424A] mb-2">
              No Items Found
            </h2>
            <p className="text-[#424242]">
              This supplier has no inventory items registered. Please add items to this supplier first.
            </p>
          </>
        ) : (
          <>
            <h2 className="text-xl font-bold text-[#3D424A] mb-2">
              Select a Supplier
            </h2>
            <p className="text-[#424242]">
              Select a supplier to view their inventory items. You can then select items to include in your purchase order.
            </p>
          </>
        )}
      </div>
    </div>
  );
};











export default NoSupplierItems;
