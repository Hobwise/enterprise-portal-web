import React, { useState } from 'react';
import { Button, Chip } from '@nextui-org/react';
import { IoAddCircleOutline } from 'react-icons/io5';
import Image from 'next/image';
import { formatPrice } from '@/lib/utils';
import SpinnerLoader from '@/components/ui/dashboard/menu/SpinnerLoader';
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
  menuItems: Item[] | null;
  selectedItems: Item[];
  onItemClick: (item: Item) => void;
  onQuickAdd: (item: Item, e: React.MouseEvent) => void;
  searchQuery?: string;
  isError?: boolean;
  onRetry?: () => void;
}

const OrderItemsGrid = ({
  loadingItems,
  menuItems,
  selectedItems,
  onItemClick,
  onQuickAdd,
  searchQuery,
  isError,
  onRetry,
}: OrderItemsGridProps) => {
  if (loadingItems || menuItems === null) {
    return <SpinnerLoader />;
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-10">
        <Image
          width={80}
          height={80}
          className="w-[80px] h-[80px] mb-4"
          src={noMenu}
          alt="error loading items"
        />
        <p className="text-gray-500 mb-4">Failed to load menu items</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="px-4 py-2 bg-primaryColor text-white rounded-lg hover:bg-primaryColor/90 transition-colors"
          >
            Try Again
          </button>
        )}
      </div>
    );
  }

  if (menuItems.length === 0 && searchQuery) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <p className="text-gray-500 text-lg font-satoshi">No items found matching "{searchQuery}"</p>
        <p className="text-gray-400 text-sm font-satoshi mt-2">Try adjusting your search terms</p>
      </div>
    );
  }

  if (menuItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10">
        <Image
          width={80}
          height={80}
          className="w-[80px] h-[80px] mb-4"
          src={noMenu}
          alt="no menu items"
        />
        <p className="text-gray-500">No items in this category</p>
      </div>
    );
  }

  return (
    <div className="grid w-full grid-cols-2 md:grid-cols-4 xl:grid-cols-4 gap-4">
      {menuItems.map((menu: Item, index: number) => (
        <div
          title={menu?.isAvailable ? "Select item" : ""}
          onClick={() =>
            menu?.isAvailable ? onItemClick(menu) : null
          }
          onDoubleClick={() => {
            if (menu?.isAvailable && selectedItems.find((selected) => selected.id === menu.id)) {
              onItemClick(menu);
            }
          }}
          key={menu.id}
          className={`relative border rounded-md ${
            menu?.isAvailable && "cursor-pointer"
          }`}
        >
          {menu?.isAvailable === false && (
            <Chip
              className="capitalize bg-white absolute top-2 right-2"
              color={"primary"}
              size="sm"
              variant="bordered"
            >
              {"Out of stock"}
            </Chip>
          )}
          {selectedItems.find(
            (selected) => selected.id === menu.id
          ) && (
            <Chip
              className="absolute top-2 left-2"
              startContent={<CheckIcon size={18} />}
              variant="flat"
              classNames={{
                base: "bg-primaryColor text-white text-[12px]",
              }}
            >
              Selected
            </Chip>
          )}
          {selectedItems.some((item) =>
            menu.varieties?.some((variety: any) => variety.id === item.id)
          ) && (
            <Chip
              className="absolute top-2 left-2"
              startContent={<CheckIcon size={18} />}
              variant="flat"
              classNames={{
                base: "bg-primaryColor text-white text-[12px]",
              }}
            >
    
            </Chip>
          )}

          <Image
            width={163.5}
            height={100.54}
            src={
              menu?.image
                ? `data:image/jpeg;base64,${menu?.image}`
                : noImage
            }
            alt={index + menu?.id}
            style={{
              objectFit: "cover",
            }}
            className="w-full md:h-[150.54px] h-[150px] rounded-lg border border-primaryGrey mb-2 bg-cover"
          />
          <div className="p-2">
            <h3 className="text-[14px] font-[500]">
              {menu.itemName}
            </h3>
            <p className="text-gray-600 text-[13px] font-[400]">
              {formatPrice(menu.price)}
            </p>
          </div>
          
          {/* Quick Add Button */}
          {menu?.isAvailable && (
            <Button
              isIconOnly
              size="sm"
              radius="full"
              className="absolute m-2 -bottom-1 right-2 bg-primaryColor h-5 min-w-4 w-5 text-white shadow-md hover:scale-110 transition-transform"
              onClick={(e) => onQuickAdd(menu, e)}
              aria-label="Quick add to cart"
            >
              <IoAddCircleOutline className="text-lg" />
            </Button>
          )}
        </div>
      ))}
    </div>
  );
};

export default OrderItemsGrid;