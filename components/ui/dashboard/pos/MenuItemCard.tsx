import React from 'react';
import { formatPrice } from '@/lib/utils';
import { MenuItem } from '@/app/pos/types';

interface MenuItemCardProps {
  item: MenuItem;
  onQuickAdd: (item: MenuItem) => void;
  onViewDetails: (item: MenuItem) => void;
  isInCart?: boolean;
}

export const MenuItemCard: React.FC<MenuItemCardProps> = ({
  item,
  onQuickAdd,
  onViewDetails,
  isInCart = false
}) => {
  return (
    <div
      onClick={() => item.isAvailable && onViewDetails(item)}
      className={`bg-gradient-to-t from-[#EAE1FF] to-[#fff] rounded-lg shadow-sm hover:shadow-md transition-all duration-200 min-h-[120px] flex flex-col cursor-pointer ${
        item.isAvailable ? 'hover:scale-105' : 'opacity-60 cursor-not-allowed'
      }`}
    >
      <div className="p-3 sm:p-4 flex flex-col items-center flex-1 relative">
        {/* Variety Badge */}
        {item.hasVariety && (
          <div className="absolute top-2 right-2 bg-purple-600 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-sm">
            Varieties
          </div>
        )}

        <h3 className="font-medium text-center text-gray-900 text-xs sm:text-sm mb-1 leading-tight">
          {item.itemName}
        </h3>

        <p className="text-xs font-semibold text-purple-700 mt-auto">
          {formatPrice(item.price, item.currency)}
        </p>
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onQuickAdd(item);
        }}
        disabled={!item.isAvailable}
        className={`w-full py-2 px-4 rounded-b-lg text-xs sm:text-sm transition-all duration-200 touch-manipulation ${
          !item.isAvailable
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-gradient-to-t from-[#5F35D2] to-[#A07EFF] text-white hover:from-purple-700 hover:to-purple-800'
        }`}
      >
        {!item.isAvailable ? 'Unavailable' : isInCart ? 'Added ✓' : 'Quick Add'}
      </button>
    </div>
  );
};
