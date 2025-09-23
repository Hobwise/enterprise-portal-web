
import React, { useState } from 'react';
import SpinnerLoader from '@/components/ui/dashboard/menu/SpinnerLoader';
import EmptyState from '@/components/ui/dashboard/menu/EmptyState';
import { Chip, Spinner } from '@nextui-org/react';
const noImage = "/assets/images/no-image.svg";

interface MenuItemsGridProps {
  loadingItems: boolean;
  menuItems: any[] | null;
  menuSections: any[];
  onOpen: () => void;
  setIsAddItemModalOpen: (isOpen: boolean) => void;
  setIsAddItemChoiceModalOpen?: (isOpen: boolean) => void;
  handleItemClick: (item: any) => void;
  searchQuery?: string;
  canCreateMenu?: boolean;
}

const MenuItemsGrid = ({
  loadingItems,
  menuItems,
  menuSections,
  onOpen,
  setIsAddItemModalOpen,
  setIsAddItemChoiceModalOpen,
  handleItemClick,
  searchQuery,
  canCreateMenu = false,
}: MenuItemsGridProps) => {
  const [loadingItemId, setLoadingItemId] = useState<string | null>(null);

  const onItemClick = async (item: any) => {
    setLoadingItemId(item.id);
    await handleItemClick(item);
    // Reset loading state after a delay to ensure modal has opened
    setTimeout(() => setLoadingItemId(null), 500);
  };

  return (
    <div className="p-6 h-[60vh]">
      {loadingItems || menuItems === null ? (
        <SpinnerLoader size="md" />
      ) : menuItems && menuItems.length === 0 && searchQuery ? (
        <div className="flex flex-col items-center justify-center py-16">
          <p className="text-gray-500 text-lg font-satoshi">No items found matching "{searchQuery}"</p>
          <p className="text-gray-400 text-sm font-satoshi mt-2">Try adjusting your search terms</p>
        </div>
        
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3  lg:grid-cols-6 xl:grid-cols-6 gap-4 md:gap-8">
          {/* Add New Item Card */}
          {canCreateMenu && (
            <div
              onClick={() => setIsAddItemChoiceModalOpen ? setIsAddItemChoiceModalOpen(true) : setIsAddItemModalOpen(true)}
              className="bg-white border rounded-lg shadow p-6 flex flex-col items-center justify-center hover:border-[#5F35D2] cursor-pointer transition-colors h-[180px]"
            >
              <img src="/assets/icons/menu.svg" alt="add"  />
              <span className="text-gray-600 text-sm font-med
              ium font-satoshi">Add new item</span>
            </div>
          )}

          {/* Menu Items */}
          {menuItems && menuItems.length > 0 && (
            menuItems.map((item) => (
              <div
                key={item.id}
                onClick={() => onItemClick(item)}
                className={`bg-white border rounded-lg border-[#D5D5D5BF] hover:shadow-md h-[180px] transition-shadow cursor-pointer relative ${
                  item.isAvailable === false ? '' : ''
                }`}
              >
                {loadingItemId === item.id && (
                  <div className="absolute inset-0 bg-white/90 rounded-lg flex items-center justify-center z-10">
                    <Spinner size="lg" color="secondary" />
                  </div>
                )}
                
                {/* Out of Stock Badge */}
                {item.isAvailable === false && (
                  <Chip
                    className="absolute top-2 right-2 z-20 bg-primaryColor text-white border-primaryColor"
                    size="sm"
                    variant="flat"
                  >
                    Out of stock
                  </Chip>
                )}
                
                <div className="relative overflow-hidden rounded-t-lg">
                  {/* Grey overlay for unavailable items */}
                  {item.isAvailable === false && (
                    <div className="absolute inset-0 bg-gray-900/40 z-10 rounded-t-lg" />
                  )}
                  <img
                    src={
                      item.image.startsWith('data:') || item.image.startsWith('http')
                        ? item.image
                        : `data:image/jpeg;base64,${item.image}`
                    }
                    alt={item.name}
                    className={`w-full h-[130px] object-cover ${
                      item.isAvailable === false ? 'grayscale opacity-70' : ''
                    }`}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        noImage;
                    }}
                  />
                </div>
                <div className="px-1.5 mt-1">
                  <h3 className={`text-sm font-normal mb-1 truncate font-satoshi ${
                    item.isAvailable === false ? 'text-gray-500' : 'text-[#596375]'
                  }`}>
                    {item.name}
                  </h3>
                  <p className={`text-xs font-medium font-satoshi ${
                    item.isAvailable === false ? 'text-gray-500' : 'text-[#596375]'
                  }`}>
                    ₦
                    {item.price.toLocaleString('en-NG', {
                      minimumFractionDigits: 2,
                    })}
                  </p>
                </div>
              </div>
            ))
          )}
         
        </div>
      )}
    </div>
  );
};

export default MenuItemsGrid;
