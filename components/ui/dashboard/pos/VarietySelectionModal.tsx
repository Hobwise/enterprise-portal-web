import React, { useState } from 'react';
import { X, Plus, Check } from 'lucide-react';
import { Checkbox } from '@nextui-org/react';
import { formatPrice } from '@/lib/utils';
import { MenuItem, Variety } from '@/app/pos/types';

interface OrderItem {
  id: string;
  itemName: string;
  count: number;
  isPacked?: boolean;
  price: number;
  currency: string;
}

interface VarietySelectionModalProps {
  isOpen: boolean;
  item: MenuItem | null;
  orderItems: OrderItem[];
  onClose: () => void;
  onAddToCart: (item: MenuItem, variety?: Variety, includePacking?: boolean) => void;
  onRemoveFromCart: (itemId: string) => void;
}

export const VarietySelectionModal: React.FC<VarietySelectionModalProps> = ({
  isOpen,
  item,
  orderItems,
  onClose,
  onAddToCart,
  onRemoveFromCart,
}) => {
  const [baseItemPacking, setBaseItemPacking] = useState(false);
  const [varietyPacking, setVarietyPacking] = useState<Record<string, boolean>>({});

  if (!isOpen || !item) return null;

  // Check if item or variety is in cart
  const isInCart = (itemId: string): boolean => {
    return orderItems.some((orderItem) => orderItem.id === itemId);
  };

  // Get packing status from cart
  const getPackingStatus = (itemId: string): boolean => {
    const orderItem = orderItems.find((oi) => oi.id === itemId);
    return orderItem?.isPacked || false;
  };

  // Handle base item selection
  const handleBaseItemToggle = () => {
    if (isInCart(item.id)) {
      onRemoveFromCart(item.id);
    } else {
      onAddToCart(item, undefined, baseItemPacking);
    }
  };

  // Handle variety selection
  const handleVarietyToggle = (variety: Variety) => {
    const varietyId = variety.id;
    if (isInCart(varietyId)) {
      onRemoveFromCart(varietyId);
    } else {
      const isPacked = varietyPacking[varietyId] || false;
      onAddToCart(item, variety, isPacked);
    }
  };

  // Handle packing toggle for variety
  const handleVarietyPackingToggle = (varietyId: string, isPacked: boolean) => {
    setVarietyPacking(prev => ({
      ...prev,
      [varietyId]: isPacked
    }));
  };

  const hasVarieties = item.varieties && item.varieties.length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative w-full md:max-w-5xl md:mx-4 bg-white md:rounded-2xl rounded-t-2xl shadow-2xl transform transition-transform duration-300 ease-out max-h-[90vh] md:max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 md:p-6 border-b border-gray-200 flex-shrink-0">
          <h3 className="text-lg md:text-xl font-semibold text-gray-900">Select Options</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Close variety selection"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 md:p-6">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-8">
              {/* Main Item Details */}
              <div className="lg:col-span-3">
                <div className="space-y-4">
                  {/* Item Info */}
                  <div>
                    <h4 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">
                      {item.itemName}
                    </h4>
                    <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700 mb-3">
                      {item.menuName}
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="text-sm text-gray-600 font-medium">Description</label>
                    <p className="text-gray-900 mt-1 leading-relaxed">
                      {item.itemDescription || 'No description available'}
                    </p>
                  </div>

                  {/* Base Price */}
                  <div className="pt-4 border-t border-gray-200">
                    <label className="text-sm text-gray-600 font-medium">Base Price</label>
                    <p className="text-2xl md:text-3xl font-bold text-purple-700 mt-1">
                      {formatPrice(item.price, item.currency)}
                    </p>
                  </div>

                  {/* Packing Option for Base Item (only if base item is selected or can be selected) */}
                  {(!hasVarieties || isInCart(item.id)) && (
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <Checkbox
                        size="sm"
                        isSelected={isInCart(item.id) ? getPackingStatus(item.id) : baseItemPacking}
                        onValueChange={setBaseItemPacking}
                        className="text-sm font-medium text-gray-900"
                        isDisabled={isInCart(item.id)}
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

                  {/* Base Item Selection Button */}
                  <div className="pt-4">
                    <button
                      onClick={handleBaseItemToggle}
                      disabled={!item.isAvailable}
                      className={`w-full py-3 px-6 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
                        !item.isAvailable
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : isInCart(item.id)
                          ? 'bg-purple-600 text-white hover:bg-purple-700'
                          : 'bg-white text-purple-600 border-2 border-purple-600 hover:bg-purple-50'
                      }`}
                    >
                      {isInCart(item.id) ? (
                        <>
                          <Check className="w-5 h-5" />
                          <span>Base Item Added</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-5 h-5" />
                          <span>{hasVarieties ? 'Add Base Item' : 'Add to Cart'}</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Preparation Time */}
                  <div className="pt-4 border-t border-gray-200">
                    <label className="text-sm text-gray-600 font-medium">Preparation Time</label>
                    <p className="text-gray-900 mt-1">
                      {item.waitingTimeMinutes || 15} minutes
                    </p>
                  </div>
                </div>
              </div>

              {/* Varieties Section */}
              {hasVarieties && (
                <div className="lg:col-span-2">
                  <div className="bg-gradient-to-br from-purple-50 to-white rounded-2xl p-4 md:p-6 border border-purple-100 shadow-sm">
                    {/* Header */}
                    <div className="mb-4">
                      <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-1">
                        Available Varieties
                      </h3>
                      <p className="text-sm text-gray-600">
                        {item.varieties.length} option{item.varieties.length !== 1 ? 's' : ''} available
                      </p>
                    </div>

                    {/* Varieties List */}
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {item.varieties.map((variety: Variety) => {
                        const varietyInCart = isInCart(variety.id);
                        const varietyPacked = getPackingStatus(variety.id);
                        const isAvailable = variety.isAvailable !== false;

                        return (
                          <div
                            key={variety.id}
                            className={`bg-white p-4 rounded-xl border transition-all duration-200 ${
                              varietyInCart
                                ? 'border-purple-400 shadow-md'
                                : 'border-gray-200 hover:border-purple-200 hover:shadow-sm'
                            }`}
                          >
                            {/* Variety Info */}
                            <div className="flex justify-between items-start mb-3">
                              <div className="flex-1">
                                <h4 className="font-bold text-gray-900 text-sm md:text-base">
                                  {variety.unit || variety.name || item.itemName}
                                </h4>
                                {variety.description && (
                                  <p className="text-xs md:text-sm text-gray-600 mt-1">
                                    {variety.description}
                                  </p>
                                )}
                              </div>
                              {!isAvailable && (
                                <div className="flex items-center gap-1 ml-2">
                                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                                  <span className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded-full font-semibold">
                                    Out of Stock
                                  </span>
                                </div>
                              )}
                            </div>

                            {/* Price and Action */}
                            <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                              <div className="text-lg md:text-xl font-bold text-gray-900">
                                {formatPrice(variety.price, item.currency)}
                              </div>

                              {isAvailable && (
                                <button
                                  onClick={() => handleVarietyToggle(variety)}
                                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
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
                              )}
                            </div>

                            {/* Packing Option for Variety */}
                            {varietyInCart && (
                              <div className="mt-3 pt-3 border-t border-gray-100">
                                <Checkbox
                                  size="sm"
                                  isSelected={varietyPacked}
                                  onValueChange={(checked) => handleVarietyPackingToggle(variety.id, checked)}
                                  isDisabled={true}
                                >
                                  <div className="flex flex-col">
                                    <span className="text-sm text-gray-700">Include Packing</span>
                                    <span className="text-xs text-gray-500">
                                      {formatPrice(item.packingCost || 0, item.currency)}
                                    </span>
                                  </div>
                                </Checkbox>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer with Close Button (Mobile) */}
        <div className="md:hidden p-4 border-t border-gray-200 flex-shrink-0">
          <button
            onClick={onClose}
            className="w-full py-3 px-6 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
