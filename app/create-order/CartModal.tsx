"use client";
import { CustomButton } from "@/components/customButton";
import { formatPrice } from "@/lib/utils";
import { Checkbox } from "@nextui-org/react";
import Image from "next/image";
import { useEffect } from "react";
import { FaMinus, FaPlus } from "react-icons/fa6";
import { IoAddCircleOutline, IoArrowBack } from "react-icons/io5";
import { MdDelete } from "react-icons/md";
import noMenu from "../../public/assets/images/no-menu-1.jpg";
import RestaurantBanner from "./RestaurantBanner";

interface CartModalProps {
  isOpen: boolean;
  onOpenChange: () => void;
  selectedItems: any[];
  handleDecrement: (id: string) => void;
  handleIncrement: (id: string) => void;
  handleRemoveItem: (id: string) => void;
  handlePackingCost: (id: string, isPacked: boolean) => void;
  onProceedToServingInfo: () => void;
  businessName?: string;
  menuConfig?: {
    image?: string;
    backgroundColour?: string;
    textColour?: string;
  };
  baseString?: string;
}

const CartModal = ({
  isOpen,
  onOpenChange,
  selectedItems,
  handleDecrement,
  handleIncrement,
  handleRemoveItem,
  handlePackingCost,
  onProceedToServingInfo,
  businessName,
  menuConfig,
  baseString,
}: CartModalProps) => {
  // Dynamic color from menu config
  const primaryColor = menuConfig?.backgroundColour || "#5F35D2";
  const primaryColorStyle = { backgroundColor: primaryColor };
  const textColorStyle = { color: primaryColor };
  const borderColorStyle = { borderColor: primaryColor };

  // Close when no items left
  useEffect(() => {
    if (isOpen && selectedItems.length === 0) {
      onOpenChange();
    }
  }, [selectedItems, isOpen, onOpenChange]);

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
  // Compute dynamic VAT using per-item settings
  let vat = 0;
  const enabledRates = Array.from(
    new Set(
      selectedItems
        .filter((i: any) => i.isVatEnabled && i.vatRate && i.vatRate > 0)
        .map((i: any) => Number(i.vatRate))
    )
  );
  selectedItems.forEach((item: any) => {
    const itemTotal = (Number(item.price) || 0) * (Number(item.count) || 0);
    const itemPacking =
      item.isPacked && item.packingCost
        ? (Number(item.packingCost) || 0) * (Number(item.count) || 0)
        : 0;
    const itemSubtotal = itemTotal + itemPacking;
    if (item.isVatEnabled && item.vatRate && item.vatRate > 0) {
      vat += itemSubtotal * item.vatRate;
    }
  });
  vat = Math.round(vat * 100) / 100;
  const total = Math.round((subtotal + packingCost + vat) * 100) / 100;

  return (
    <div className="fixed inset-0 z-50 bg-white overflow-hidden flex flex-col">
      {/* Back Button */}
      <button
        onClick={onOpenChange}
        className="absolute top-4 left-4 z-10 p-2 bg-white/90 hover:bg-white rounded-lg shadow-md transition-colors"
        aria-label="Go back"
      >
        <IoArrowBack className="w-6 h-6 text-gray-700" />
      </button>

      {/* Restaurant Banner */}
      <RestaurantBanner
        businessName={businessName}
        menuConfig={menuConfig}
        showMenuButton={false}
        baseString={baseString}
      />

      {/* Header */}
      <div className="max-w-4xl flex flex-col mx-auto w-full px-4 py-4 border-b border-gray-200">
        <h2 className="text-xl font-bold text-black">
          {selectedItems.length} Item{selectedItems.length !== 1 ? "s" : ""}
        </h2>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 max-w-4xl flex flex-col mx-auto w-full overflow-y-auto px-4 py-4 pb-28">
        {/* Cart Items List */}
        <div className="space-y-4 mb-4">
          {selectedItems.map((item) => (
            <div
              key={item.id}
              className="flex gap-3 p-3 bg-gray-50 rounded-xl relative"
            >
              {/* Item Image */}
              <div className="relative w-20 h-20 flex-shrink-0">
                <Image
                  src={
                    item.image ? `data:image/jpeg;base64,${item.image}` : noMenu
                  }
                  fill
                  className="object-cover rounded-lg"
                  alt={item.itemName}
                />
              </div>

              {/* Item Details */}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm text-black line-clamp-1">
                  {item.itemName}
                </h3>
                <p className="text-xs text-gray-600 line-clamp-1 mt-0.5">
                  {item.itemDescription || item.menuName}
                </p>
                <p className="text-sm font-bold mt-1" style={textColorStyle}>
                  {formatPrice(item.price)}
                </p>

                {/* Packing Cost Checkbox */}
                {item.packingCost > 0 && (
                  <div className="mt-2">
                    <Checkbox
                      size="sm"
                      isSelected={item.isPacked}
                      onValueChange={(isSelected) =>
                        handlePackingCost(item.id, isSelected)
                      }
                    >
                      <div className="flex flex-col">
                        <span className="text-xs text-gray-600">
                          Pack this item
                        </span>
                        <span className="text-xs font-medium text-black">
                          +{formatPrice(item.packingCost)}
                        </span>
                      </div>
                    </Checkbox>
                  </div>
                )}
              </div>

              {/* Right Side - Delete and Quantity Controls */}
              <div className="flex flex-col items-end gap-2">
                {/* Delete Button */}
                <button
                  onClick={() => handleRemoveItem(item.id)}
                  className="text-gray-400 hover:text-red-500 transition-colors"
                  aria-label="Remove item"
                >
                  <MdDelete className="w-5 h-5" />
                </button>

                {/* Quantity Controls */}
                <div className="flex items-center gap-2 mt-auto">
                  <button
                    aria-label="Decrease quantity"
                    onClick={() => handleDecrement(item.id)}
                    className="w-7 h-7 flex items-center justify-center border border-gray-300 rounded-md hover:bg-gray-100"
                  >
                    <FaMinus className="text-xs text-black" />
                  </button>
                  <span className="font-bold text-sm min-w-[20px] text-center text-black">
                    {item.count}
                  </span>
                  <button
                    aria-label="Increase quantity"
                    onClick={() => handleIncrement(item.id)}
                    className="w-7 h-7 flex items-center justify-center border border-gray-300 rounded-md hover:bg-gray-100"
                  >
                    <FaPlus className="text-xs text-black" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        {/* Price Breakdown */}
        <div className="space-y-2 py-4 border-t border-gray-200">
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
            <span className="text-gray-600">
              {enabledRates.length > 1
                ? `VAT (${enabledRates
                    .map((r) => `${Math.round(r * 100)}%`)
                    .join(", ")})`
                : `VAT ${
                    enabledRates[0] ? Math.round(enabledRates[0] * 100) : 0
                  }%`}
            </span>
            <span className="font-semibold text-black">{formatPrice(vat)}</span>
          </div>
          <div className="flex justify-between text-base font-bold border-t pt-2">
            <span className="text-black">Total</span>
            <span style={textColorStyle}>{formatPrice(total)}</span>
          </div>
        </div>

        {/* Clear Cart Button */}
        <button
          onClick={() => {
            if (confirm("Are you sure you want to clear the cart?")) {
              selectedItems.forEach((item) => handleRemoveItem(item.id));
              onOpenChange();
            }
          }}
          className="w-full text-center text-sm text-gray-500 hover:text-red-500 py-2 mt-4"
        >
          Clear Cart
        </button>

        <div
          className={`border-t max-w-4xl flex flex-col mx-auto w-full  border-gray-200 bg-white  py-4`}
        >
          {/* Action Buttons */}
          <div className="flex gap-3">
            <CustomButton
              onClick={onOpenChange}
              style={{
                ...borderColorStyle,
                ...textColorStyle,
                borderWidth: "2px",
              }}
              className="flex-1 h-12 bg-white font-semibold touch-manipulation"
            >
              <IoAddCircleOutline className="w-5 h-5 mr-2" />
              Add Items
            </CustomButton>
            <CustomButton
              onClick={() => {
                onOpenChange();
                onProceedToServingInfo();
              }}
              style={primaryColorStyle}
              className="flex-1 h-12 text-white font-semibold touch-manipulation"
            >
              <span>Checkout</span>
            </CustomButton>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartModal;
