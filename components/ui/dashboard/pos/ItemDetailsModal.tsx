import React, { useState } from 'react';
import { X, Plus, Check } from 'lucide-react';
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

  // Check if item or variety is in cart
  const isInCart = (itemId: string): boolean => {
    return orderItems.some((orderItem) => orderItem.id === itemId);
  };

  // Handle base item add/remove
  const handleBaseItemToggle = () => {
    if (isInCart(item.id)) {
      onRemoveFromCart(item.id);
    } else {
      onAddToCart(item, undefined, includePacking);
    }
  };

  // Handle variety add/remove
  const handleVarietyToggle = (variety: Variety) => {
    if (isInCart(variety.id)) {
      onRemoveFromCart(variety.id);
    } else {
      onAddToCart(item, variety, false);
    }
  };

  // For items without varieties
  const handleAddToCart = () => {
    onAddToCart(item, undefined, includePacking);
    setIncludePacking(false);
  };

  const hasVarieties = item.hasVariety && item.varieties && item.varieties.length > 0;

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
          <h3 className="text-xl font-semibold text-gray-900">Menu Item Details</h3>
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
              <p className="text-gray-900">{item.menuName}</p>
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
            <div className="pt-4 border-t border-gray-200">
              <h4 className="text-sm font-semibold text-gray-700 mb-3">
                Available Options ({item.varieties!.length + 1})
              </h4>

              <div className="space-y-2">
                {/* Base Item Option */}
                <div className={`p-3 border rounded-lg transition-all ${
                  isInCart(item.id)
                    ? 'bg-purple-50 border-purple-300'
                    : 'bg-gray-50 border-gray-200'
                }`}>
                  <div className="flex justify-between items-center">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">Base Item</p>
                      <p className="text-sm text-purple-700 font-semibold">
                        {formatPrice(item.price, item.currency)}
                      </p>
                    </div>
                    <button
                      onClick={handleBaseItemToggle}
                      disabled={!item.isAvailable}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                        !item.isAvailable
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : isInCart(item.id)
                          ? 'bg-purple-600 text-white hover:bg-purple-700'
                          : 'bg-white text-purple-600 border border-purple-600 hover:bg-purple-50'
                      }`}
                    >
                      {isInCart(item.id) ? (
                        <>
                          <Check className="w-4 h-4" />
                          <span>Added</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4" />
                          <span>Add</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Variety Options */}
                {item.varieties!.map((variety: Variety) => {
                  const varietyInCart = isInCart(variety.id);
                  const isAvailable = variety.isAvailable !== false;

                  return (
                    <div
                      key={variety.id}
                      className={`p-3 border rounded-lg transition-all ${
                        varietyInCart
                          ? 'bg-purple-50 border-purple-300'
                          : 'bg-white border-gray-200'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
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
                            {formatPrice(variety.price, item.currency)}
                          </p>
                        </div>
                        {isAvailable ? (
                          <button
                            onClick={() => handleVarietyToggle(variety)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                              varietyInCart
                                ? 'bg-purple-600 text-white hover:bg-purple-700'
                                : 'bg-white text-purple-600 border border-purple-600 hover:bg-purple-50'
                            }`}
                          >
                            {varietyInCart ? (
                              <>
                                <Check className="w-4 h-4" />
                                <span>Added</span>
                              </>
                            ) : (
                              <>
                                <Plus className="w-4 h-4" />
                                <span>Add</span>
                              </>
                            )}
                          </button>
                        ) : (
                          <div className="flex items-center gap-1">
                            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                            <span className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded-full font-semibold">
                              Out of Stock
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
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
            /* Done button for items with varieties */
            <button
              onClick={onClose}
              className="w-full py-3 px-6 rounded-lg text-sm font-medium transition-all duration-200 bg-gray-100 text-gray-700 hover:bg-gray-200"
            >
              Done
            </button>
          ) : (
            /* Add to Cart button for items without varieties */
            <button
              onClick={handleAddToCart}
              disabled={!item.isAvailable}
              className={`w-full py-3 px-6 rounded-lg text-sm font-medium transition-all duration-200 ${
                item.isAvailable
                  ? 'bg-gradient-to-t from-[#5F35D2] to-[#A07EFF] text-white hover:from-purple-700 hover:to-purple-800'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {item.isAvailable ? 'Add to Cart' : 'Item Unavailable'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
