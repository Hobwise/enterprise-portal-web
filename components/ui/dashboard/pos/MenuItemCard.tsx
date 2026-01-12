import React from 'react';
import { Chip } from '@nextui-org/react';
import { formatPrice } from '@/lib/utils';
import { MenuItem } from '@/app/pos/types';

const CheckIcon = ({ size, height, width, ...props }: any) => {
  return (
    <svg
      width={size || width || 24}
      height={size || height || 24}
      viewBox='0 0 24 24'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
      {...props}
    >
      <path
        d='M12 2C6.49 2 2 6.49 2 12C2 17.51 6.49 22 12 22C17.51 22 22 17.51 22 12C22 6.49 17.51 2 12 2ZM16.78 9.7L11.11 15.37C10.97 15.51 10.78 15.59 10.58 15.59C10.38 15.59 10.19 15.51 10.05 15.37L7.22 12.54C6.93 12.25 6.93 11.77 7.22 11.48C7.51 11.19 7.99 11.19 8.28 11.48L10.58 13.78L15.72 8.64C16.01 8.35 16.49 8.35 16.78 8.64C17.07 8.93 17.07 9.4 16.78 9.7Z'
        fill='currentColor'
      />
    </svg>
  );
};

interface MenuItemCardProps {
  item: MenuItem;
  onQuickAdd: (item: MenuItem) => void;
  onViewDetails: (item: MenuItem) => void;
  isInCart?: boolean;
  count?: number;
}

export const MenuItemCard: React.FC<MenuItemCardProps> = ({
  item,
  onQuickAdd,
  onViewDetails,
  isInCart = false,
  count = 0
}) => {
  return (
    <div
      onClick={() => item.isAvailable && onViewDetails(item)}
      className={`bg-gradient-to-t from-[#EAE1FF] to-[#fff] rounded-lg shadow-sm hover:shadow-md transition-all duration-200 min-h-[120px] flex flex-col cursor-pointer ${
        item.isAvailable ? 'hover:scale-105' : 'opacity-60 cursor-not-allowed'
      }`}
    >
      <div className="p-3 sm:p-4 flex flex-col items-center flex-1 relative">
        {/* Count Badge - shown when item is in cart */}
        {count > 0 && (
          <Chip
            className="absolute top-2 left-2 z-20"
            startContent={<CheckIcon size={18} />}
            variant="flat"
            classNames={{
              base: "bg-primaryColor text-white text-[12px]",
            }}
          >
            {count}
          </Chip>
        )}

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
