"use client";
import { CustomButton } from "@/components/customButton";
import { formatPrice } from "@/lib/utils";
import { IoArrowBack } from "react-icons/io5";
import ProgressSteps from "./ProgressSteps";

interface ConfirmOrderModalProps {
  isOpen: boolean;
  onOpenChange: () => void;
  selectedItems: any[];
  onProceedToServingInfo: () => void;
  onBack?: () => void;
}

const ConfirmOrderModal = ({
  isOpen,
  onOpenChange,
  selectedItems,
  onProceedToServingInfo,
  onBack,
}: ConfirmOrderModalProps) => {
  // Don't render if not open
  if (!isOpen) return null;

  const calculateSubtotal = () => {
    return selectedItems.reduce((acc, item) => {
      return acc + item.price * item.count;
    }, 0);
  };

  const calculatePackingCost = () => {
    return selectedItems.reduce((acc, item) => {
      if (item.isPacked && item.packingCost) {
        return acc + item.packingCost * item.count;
      }
      return acc;
    }, 0);
  };

  const subtotal = calculateSubtotal();
  const packingCost = calculatePackingCost();
  const vat = (subtotal + packingCost) * 0.075;
  const total = subtotal + packingCost + vat;

  return (
    <div className="fixed inset-0 z-50 bg-white overflow-hidden flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-gray-200">
        <button
          onClick={() => {
            if (onBack) {
              onBack();
            } else {
              onOpenChange();
            }
          }}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label="Go back"
        >
          <IoArrowBack className="w-6 h-6 text-gray-700" />
        </button>
        <div className="flex-1 text-center">
          <h2 className="text-xl font-bold text-black">Confirm order</h2>
          <p className="text-sm font-normal text-gray-600">
            Confirm order before checkout
          </p>
        </div>
        <div className="w-10" /> {/* Spacer for alignment */}
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        {/* Order Items Table */}
        <div className="space-y-3">
          {/* Table Header */}
          <div className="grid grid-cols-12 gap-2 text-xs font-semibold text-gray-600 pb-2 border-b">
            <div className="col-span-6">ITEM</div>
            <div className="col-span-2 text-center">QTY</div>
            <div className="col-span-4 text-right">PRICE</div>
          </div>

          {/* Table Rows */}
          {selectedItems.map((item, index) => (
            <div
              key={item.id}
              className="grid grid-cols-12 gap-2 text-sm py-3 border-b border-gray-100 last:border-0"
            >
              <div className="col-span-6">
                <p className="font-semibold text-black line-clamp-1">
                  {item.itemName}
                </p>
                <p className="text-xs text-gray-500 line-clamp-1">
                  {item.menuName}
                </p>
                {item.isPacked && (
                  <p className="text-xs text-gray-500">+ Packing</p>
                )}
              </div>
              <div className="col-span-2 text-center font-semibold text-black">
                {item.count}
              </div>
              <div className="col-span-4 text-right font-semibold text-black">
                {formatPrice(item.price * item.count)}
              </div>
            </div>
          ))}
        </div>

        {/* Price Breakdown */}
        <div className="space-y-3 pt-6 border-t-2 border-gray-200 mb-20">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Subtotal</span>
            <span className="font-semibold text-black">
              {formatPrice(subtotal)}
            </span>
          </div>
          {packingCost > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Packing Cost</span>
              <span className="font-semibold text-black">
                {formatPrice(packingCost)}
              </span>
            </div>
          )}
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">VAT 7.5%</span>
            <span className="font-semibold text-black">{formatPrice(vat)}</span>
          </div>
          <div className="flex justify-between text-base font-bold pt-2 border-t">
            <span className="text-black">Total</span>
            <span className="text-black">{formatPrice(total)}</span>
          </div>
          <div className="flex justify-between text-lg font-bold pt-2 border-t-2 border-black">
            <span className="text-black">Grand Total</span>
            <span className="text-primaryColor">{formatPrice(total)}</span>
          </div>
        </div>
      </div>

      {/* Fixed Bottom Section */}
      <div className="border-t border-gray-200 bg-white px-4 py-4">
        <div className="space-y-3">
          <CustomButton
            onClick={() => {
              onOpenChange();
              onProceedToServingInfo();
            }}
            className="w-full h-12 text-white font-semibold flex items-center justify-center gap-2"
            backgroundColor="bg-primaryColor"
          >
            <span>Continue to Details</span>
          </CustomButton>
          <button
            onClick={() => {
              if (onBack) {
                onBack();
              } else {
                onOpenChange();
              }
            }}
            className="w-full text-center text-sm text-gray-600 hover:text-gray-800 py-2"
          >
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmOrderModal;
