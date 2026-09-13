import React from "react";

const PurchaseRequestHeader: React.FC = () => {
  return (
    <div className="flex flex-col items-center text-center mb-8">
      <h1 className="text-2xl font-bold text-[#313131] mb-2">
        Create Purchase Order
      </h1>
      <p className="text-[#424242] max-w-lg">
        Search for a supplier to view their inventory items and create a purchase order request.
      </p>
    </div>
  );
};

export default PurchaseRequestHeader;
