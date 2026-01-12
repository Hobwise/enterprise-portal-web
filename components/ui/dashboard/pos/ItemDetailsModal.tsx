import React, { useState } from 'react';
import { X, Plus, Minus } from 'lucide-react';
import { Checkbox } from '@nextui-org/react';
import { formatPrice } from '@/lib/utils';
import { MenuItem, Variety } from '@/app/pos/types';
import { DEFAULT_PREP_TIME } from '@/app/pos/constants';

interface OrderItem {
  id: string;
  itemName: string;
  count: number;
  isPacked?: boolean;
  price: number;
  currency: string;
}

interface ItemDetailsModalProps {
  isOpen: boolean;
  item: MenuItem | null;
  orderItems: OrderItem[];
  onClose: () => void;
  onAddToCart: (item: MenuItem, variety?: Variety, includePacking?: boolean) => void;
  onRemoveFromCart: (itemId: string) => void;
}

export const 
ItemDetailsModal: React.FC<ItemDetailsModalProps> = ({
  isOpen,
  item,
  orderItems,
  onClose,
  onAddToCart,
  onRemoveFromCart,
}) => {
  const [includePacking, setIncludePacking] = useState(false);

  if (!isOpen || !item) return null;

  // Get quantity of item/variety in cart
  // For base items, we need to check using uniqueKey || id to match cart logic
  const getItemQuantity = (itemId: string, useUniqueKey?: boolean): number => {
    const searchId = useUniqueKey && item ? (item.uniqueKey || item.id) : itemId;
    const cartItem = orderItems.find((orderItem) => orderItem.id === searchId);
    return cartItem?.count || 0;
  };

  // Calculate total items added from this menu item (base + all varieties)
  const getTotalItemCount = (): number => {
    let total = getItemQuantity(item.id, true); // Base item count - use uniqueKey

    // Add all variety counts
    if (item.varieties && item.varieties.length > 0) {
      item.varieties.forEach((variety) => {
        total += getItemQuantity(variety.id);
      });
    }

    return total;
  };

  // For items without varieties
  const handleAddToCart = () => {
    onAddToCart(item, undefined, includePacking);
    setIncludePacking(false);
  };

  const hasVarieties = item.hasVariety && item.varieties && item.varieties.length > 0;
  const totalCount = getTotalItemCount();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative w-full max-w-md mx-4 bg-white rounded-2xl shadow-2xl transform transition-transform duration-300 ease-out animate-slideUp">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <h3 className="text-xl font-semibold text-gray-900">Menu Item Details</h3>
            {totalCount > 0 && (
              <span className="px-3 py-1 bg-purple-600 text-white text-sm font-bold rounded-full shadow-md">
                {totalCount} {totalCount === 1 ? 'item' : 'items'}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Close item details"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Modal Body - Scrollable */}
        <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
          {/* Item Name */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900">{item.itemName}</h4>
          </div>

          {/* Description */}
          <div>
            <label className="text-sm text-gray-600">Description</label>
            <p className="text-gray-900">
              {item.itemDescription || 'No description available'}
            </p>
          </div>

          {/* Price */}
          <div>
            <label className="text-sm text-gray-600">{hasVarieties ? 'Base Price' : 'Price'}</label>
            <p className="text-lg font-semibold text-purple-700">
              {formatPrice(item.price, item.currency)}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Category */}
            <div>
              <label className="text-sm text-gray-600">Category</label>
              <p className="text-gray-900">{item.sectionName}</p>
            </div>

            {/* Menu Section */}
            <div>
              <label className="text-sm text-gray-600">Menu</label>
              <p className="text-gray-900">{item.itemName}</p>
            </div>
          </div>

          {/* Preparation Time */}
          <div>
            <label className="text-sm text-gray-600">Preparation Time</label>
            <p className="text-gray-900">
              {item.waitingTimeMinutes || DEFAULT_PREP_TIME} minutes
            </p>
          </div>

          {/* Available Options Section - Show varieties inline */}
          {hasVarieties ? (
            <div className="pt-4 border-t border-gray-200 space-y-4">
              {/* Base Item Section */}
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <span className="w-1 h-4 bg-purple-600 rounded"></span>
                  Main Item
                </h4>
                <div className={`p-3 border-2 rounded-lg transition-all ${
                  getItemQuantity(item.id, true) > 0
                    ? 'bg-purple-50 border-purple-400'
                    : 'bg-gray-50 border-gray-300'
                }`}>
                  <div className="flex justify-between items-center">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{item.itemName}</p>
                      <p className="text-sm text-purple-700 font-semibold">
                        {formatPrice(item.price, item.currency)}
                      </p>
                    </div>
                    {!item.isAvailable ? (
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                        <span className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded-full font-semibold">
                          Out of Stock
                        </span>
                      </div>
                    ) : getItemQuantity(item.id, true) === 0 ? (
                      // Show "Add Item" button when quantity is 0
                      <button
                        onClick={() => onAddToCart(item, undefined, false)}
                        className="px-6 py-2 rounded-lg bg-gradient-to-t from-[#6D42E2] to-[#A07EFF] text-white hover:opacity-90 font-medium text-sm transition-all shadow-sm"
                      >
                        Add Item
                      </button>
                    ) : (
                      // Show increment/decrement buttons when quantity > 0
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onRemoveFromCart(item.uniqueKey || item.id)}
                          className="w-8 h-8 rounded-lg border text-gray-600 flex items-center justify-center transition-all shadow-sm"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="min-w-[28px] text-center font-bold text-gray-900 text-base">
                          {getItemQuantity(item.id, true)}
                        </span>
                        <button
                          onClick={() => onAddToCart(item, undefined, false)}
                          className="w-8 h-8 rounded-lg bg-gradient-to-r from-[#6D42E2] to-[#A07EFF] text-white hover:opacity-90 flex items-center justify-center transition-all shadow-sm"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Varieties Section */}
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <span className="w-1 h-4 bg-green-600 rounded"></span>
                  Available Varieties ({item.varieties!.length})
                </h4>
                <div className="space-y-2">
                {/* Variety Options */}
                {item.varieties!.map((variety: Variety) => {
                  const varietyQuantity = getItemQuantity(variety.id);
                  const isAvailable = variety.isAvailable !== false;

                  return (
                    <div
                      key={variety.id}
                      className={`p-3 border-2 rounded-lg transition-all ${
                        varietyQuantity > 0
                          ? ' '
                          : 'bg-white'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">
                            {variety.unit || variety.name || item.itemName}
                          </p>
                          {variety.description && (
                            <p className="text-xs text-gray-600 mt-1">
                              {variety.description}
                            </p>
                          )}
                          <p className="text-sm text-purple-700 font-semibold mt-1">
                            {formatPrice(variety.price, variety.currency || item.currency)}
                          </p>
                        </div>
                        {!isAvailable ? (
                          <div className="flex items-center gap-1">
                            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                            <span className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded-full font-semibold">
                              Out of Stock
                            </span>
                          </div>
                        ) : varietyQuantity === 0 ? (
                          // Show "Add Item" button when quantity is 0
                          <button
                            onClick={() => onAddToCart(item, variety, false)}
                            className="px-6 py-2 rounded-lg bg-gradient-to-t from-[#6D42E2] to-[#A07EFF] text-white hover:opacity-90 font-medium text-sm transition-all shadow-sm"
                          >
                            Add Item
                          </button>
                        ) : (
                          // Show increment/decrement buttons when quantity > 0
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => onRemoveFromCart(variety.id)}
                              className="w-8 h-8 rounded-lg border  text-gray-600 flex items-center justify-center transition-all shadow-sm"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="min-w-[28px] text-center font-bold text-gray-900 text-base">
                              {varietyQuantity}
                            </span>
                            <button
                              onClick={() => onAddToCart(item, variety, false)}
                              className="w-8 h-8 rounded-lg bg-gradient-to-t from-[#6D42E2] to-[#A07EFF] text-white hover:opacity-90 flex items-center justify-center transition-all shadow-sm"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
                </div>
              </div>
            </div>
          ) : (
            /* Packing Option - Only for items without varieties */
            <div className="p-4 bg-gray-50 rounded-lg">
              <Checkbox
                size="sm"
                isSelected={includePacking}
                onValueChange={setIncludePacking}
                className="text-sm font-medium text-gray-900"
              >
                <div>
                  <span className="text-sm font-medium text-gray-900">Include Packing</span>
                  <p className="text-xs text-gray-600">
                    Additional {formatPrice(item.packingCost || 0, item.currency)}
                  </p>
                </div>
              </Checkbox>
            </div>
          )}

          {/* Show note if hasVariety is true but no varieties data yet */}
          {item.hasVariety && (!item.varieties || item.varieties.length === 0) && (
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-700">This item has varieties available</p>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-6 border-t border-gray-200">
          {hasVarieties ? (
            /* Close button for items with varieties */
            <button
              onClick={onClose}
              className="w-full py-3 px-6 rounded-lg text-sm font-medium transition-all duration-200 bg-gray-100 text-gray-700 hover:bg-gray-200"
            >
              Close
            </button>
          ) : (
            /* Quantity controls for items without varieties */
            !item.isAvailable ? (
              <button
                disabled
                className="w-full py-3 px-6 rounded-lg text-sm font-medium transition-all duration-200 bg-gray-300 text-gray-500 cursor-not-allowed"
              >
                Item Unavailable
              </button>
            ) : getItemQuantity(item.id, true) === 0 ? (
              // Show "Add Item" button when quantity is 0
              <button
                onClick={handleAddToCart}
                className="w-full py-3 px-6 rounded-lg text-sm font-medium transition-all duration-200 bg-gradient-to-t from-[#6D42E2] to-[#A07EFF] text-white hover:opacity-90 shadow-sm"
              >
                Add Item
              </button>
            ) : (
              // Show increment/decrement buttons when quantity > 0
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={() => onRemoveFromCart(item.uniqueKey || item.id)}
                  className="w-10 h-10 rounded-lg border  text-gray-600  flex items-center justify-center transition-all shadow-sm"
                >
                  <Minus className="w-5 h-5" />
                </button>
                <span className="min-w-[40px] text-center font-bold text-gray-900 text-xl">
                  {getItemQuantity(item.id, true)}
                </span>
                <button
                  onClick={handleAddToCart}
                  className="w-10 h-10 rounded-lg bg-gradient-to-t from-[#6D42E2] to-[#A07EFF] text-white hover:opacity-90 flex items-center justify-center transition-all shadow-sm"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};
