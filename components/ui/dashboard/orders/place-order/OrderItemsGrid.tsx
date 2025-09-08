import React, { useState } from 'react';
import { Chip, Spinner, Button } from '@nextui-org/react';
import Image from 'next/image';
import { formatPrice } from '@/lib/utils';
import SpinnerLoader from '@/components/ui/dashboard/menu/SpinnerLoader';
import { FaPlus } from 'react-icons/fa6';
const noImage = "/assets/images/no-image.svg";
const noMenu = "/assets/images/no-menu.png";
import { CheckIcon } from './data';

type Item = {
  id: string;
  itemID: string;
  itemName: string;
  menuName: string;
  itemDescription: string;
  price: number;
  currency: string;
  isAvailable: boolean;
  hasVariety: boolean;
  image: string;
  isVariety: boolean;
  varieties: null | any;
  count: number;
  packingCost: number;
  isPacked?: boolean;
};

interface OrderItemsGridProps {
  loadingItems: boolean;
  loadingCategories?: boolean;
  menuItems: Item[] | null;
  selectedItems: Item[];
  onItemClick: (item: Item) => void;
  onIncrement?: (itemId: string) => void;
  handleCardClick?: (item: Item, isPacked: boolean) => void;
  searchQuery?: string;
}

const OrderItemsGrid = ({
  loadingItems,
  menuItems,
  selectedItems,
  loadingCategories,
  onItemClick,
  onIncrement,
  handleCardClick,
  searchQuery,
}: OrderItemsGridProps) => {
  const [loadingItemId, setLoadingItemId] = useState<string | null>(null);

  const onItemClickWithLoading = async (item: Item) => {
    setLoadingItemId(item.id);
    await onItemClick(item);
    // Reset loading state after a delay to ensure modal has opened
    setTimeout(() => setLoadingItemId(null), 500);
  };

  return (
    <div className="p-6 ">
      {loadingCategories || loadingItems || menuItems === null ? (
        <SpinnerLoader size="md" />
      ) : menuItems && menuItems.length === 0 && searchQuery ? (
        <div className="flex flex-col items-center justify-center py-16">
          <p className="text-gray-500 text-lg font-satoshi">No items found matching "{searchQuery}"</p>
          <p className="text-gray-400 text-sm font-satoshi mt-2">Try adjusting your search terms</p>
        </div>
      ) : menuItems && menuItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16">
          <Image
            width={80}
            height={80}
            className="w-[80px] h-[80px] mb-4"
            src={noMenu}
            alt="no menu items"
          />
          <p className="text-gray-500">No items in this category</p>
          <p className="text-gray-400 text-sm mt-2">This section doesn't have any menu items yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3  lg:grid-cols-4 xl:grid-cols-4 gap-4 md:gap-4">
          {menuItems.map((menu: Item, index: number) => (
        <div
          title={menu?.isAvailable ? "Select item" : ""}
          onClick={() =>
            menu?.isAvailable ? onItemClickWithLoading(menu) : null
          }
          onDoubleClick={() => {
            if (menu?.isAvailable && selectedItems.find((selected) => selected.id === menu.id)) {
              onItemClickWithLoading(menu);
            }
          }}
          key={menu.id}
          className={`bg-white border rounded-lg border-[#D5D5D5BF] hover:shadow-md h-[190px] transition-shadow cursor-pointer relative ${
            menu.isAvailable === false ? '' : ''
          }`}
        >
          {/* Loading Overlay */}
          {loadingItemId === menu.id && (
            <div className="absolute inset-0 bg-white/90 rounded-lg flex items-center justify-center z-10">
              <Spinner size="lg" color="secondary" />
            </div>
          )}
          {/* Out of Stock Badge */}
          {menu.isAvailable === false && (
            <Chip
              className="absolute top-2 right-2 z-20 bg-primaryColor text-white border-primaryColor"
              size="sm"
              variant="flat"
            >
              Out of stock
            </Chip>
          )}
          {selectedItems.find(
            (selected) => selected.id === menu.id
          ) && (
            <>
              <Chip
                className="absolute top-2 left-2 z-20"
                startContent={<CheckIcon size={18} />}
                variant="flat"
                classNames={{
                  base: "bg-primaryColor text-white text-[12px]",
                }}
              >
                {selectedItems.find((selected) => selected.id === menu.id)?.count || 0}
              </Chip>
            </>
          )}
          {selectedItems.some((item) =>
            menu.varieties?.some((variety: any) => variety.id === item.id)
          ) && (
            <>
              <Chip
                className="absolute top-2 left-2 z-20"
                startContent={<CheckIcon size={18} />}
                variant="flat"
                classNames={{
                  base: "bg-primaryColor text-white text-[12px]",
                }}
              >
                {selectedItems
                  .filter((item) => menu.varieties?.some((variety: any) => variety.id === item.id))
                  .reduce((sum, item) => sum + item.count, 0)}
              </Chip>
            </>
          )}

          <div className="relative overflow-hidden rounded-t-lg">
            {/* Grey overlay for unavailable items */}
            {menu.isAvailable === false && (
              <div className="absolute inset-0 bg-gray-900/40 z-10 rounded-t-lg" />
            )}
            <img
              src={
                menu.image && menu.image.startsWith('data:') || menu.image && menu.image.startsWith('http')
                  ? menu.image
                  : menu.image 
                    ? `data:image/jpeg;base64,${menu.image}`
                    : noImage
              }
              alt={menu.itemName}
              className={`w-full h-[130px] object-cover ${
                menu.isAvailable === false ? 'grayscale opacity-70' : ''
              }`}
              onError={(e) => {
                (e.target as HTMLImageElement).src = noImage;
              }}
            />
          </div>
          <div className="px-1.5 mt-1">
            <h3 className={`text-sm font-normal mb-1 truncate font-satoshi ${
              menu.isAvailable === false ? 'text-gray-500' : 'text-[#596375]'
            }`}>
              {menu.itemName}
            </h3>
            <p className={`text-xs font-medium font-satoshi ${
              menu.isAvailable === false ? 'text-gray-500' : 'text-[#596375]'
            }`}>
              ₦
              {menu.price.toLocaleString('en-NG', {
                minimumFractionDigits: 2,
              })}
            </p>
          </div>
          {/* Plus button for quick add/increment */}
          {menu.isAvailable && (
            <Button
              onClick={(e) => {
                e.stopPropagation();
                const selectedItem = selectedItems.find(s => s.id === menu.id);
                if (selectedItem && onIncrement) {
                  onIncrement(menu.id);
                } else if (handleCardClick) {
                  // Directly select the item without opening modal
                  handleCardClick(menu, false);
                } else {
                  // Fallback to modal if handleCardClick is not provided
                  onItemClickWithLoading(menu);
                }
              }}
              isIconOnly
              size="sm"
              radius="full"
              className="absolute bottom-2 border bg-white right-2 border-primaryColor w-[2px] h-[24px] z-20"
              aria-label="Add item"
            >
              <FaPlus size={14} color='#5f35d2' />
            </Button>
          )}
          </div>
        ))}
        </div>
      )}
    </div>
  );
};

export default OrderItemsGrid;