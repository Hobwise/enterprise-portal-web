import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Checkbox } from '@nextui-org/react';
import { formatPrice } from '@/lib/utils';
import { MenuItem } from '@/app/pos/types';
import { DEFAULT_PREP_TIME } from '@/app/pos/constants';

interface ItemDetailsModalProps {
  isOpen: boolean;
  item: MenuItem | null;
  onClose: () => void;
  onAddToCart: (item: MenuItem, includePacking: boolean) => void;
}

export const ItemDetailsModal: React.FC<ItemDetailsModalProps> = ({
  isOpen,
  item,
  onClose,
  onAddToCart,
}) => {
  const [includePacking, setIncludePacking] = useState(false);

  if (!isOpen || !item) return null;

  const handleAddToCart = () => {
    onAddToCart(item, includePacking);
    setIncludePacking(false);
  };

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

        {/* Modal Body */}
        <div className="p-6 space-y-4">
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
            <label className="text-sm text-gray-600">Price</label>
            <p className="text-lg font-semibold text-purple-700">
              {formatPrice(item.price, item.currency)}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Category */}
            <div>
              <label className="text-sm text-gray-600">Category</label>
              <p className="text-gray-900">{item.menuName}</p>
            </div>

            {/* Menu Section */}
            <div>
              <label className="text-sm text-gray-600">Menu</label>
              <p className="text-gray-900">{item.sectionName}</p>
            </div>
          </div>

          {/* Preparation Time */}
          <div>
            <label className="text-sm text-gray-600">Preparation Time</label>
            <p className="text-gray-900">
              {item.waitingTimeMinutes || DEFAULT_PREP_TIME} minutes
            </p>
          </div>

          {/* Packing Option */}
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

          {/* Has Variety Note */}
          {item.hasVariety && (
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-700">This item has varieties available</p>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-6 border-t border-gray-200">
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
        </div>
      </div>
    </div>
  );
};
