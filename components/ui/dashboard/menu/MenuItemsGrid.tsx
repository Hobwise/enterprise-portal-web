
import SpinnerLoader from '@/components/ui/dashboard/menu/SpinnerLoader';
import EmptyState from '@/components/ui/dashboard/menu/EmptyState';
const noImage = "/assets/images/no-image.svg";

interface MenuItemsGridProps {
  loadingItems: boolean;
  menuItems: any[] | null;
  menuSections: any[];
  onOpen: () => void;
  setIsAddItemModalOpen: (isOpen: boolean) => void;
  handleItemClick: (item: any) => void;
}

const MenuItemsGrid = ({
  loadingItems,
  menuItems,
  menuSections,
  onOpen,
  setIsAddItemModalOpen,
  handleItemClick,
}: MenuItemsGridProps) => {
  return (
    <div className="p-6">
      {loadingItems || menuItems === null ? (
        <SpinnerLoader size="md" />
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-4">
          {/* Add New Item Card */}
          <div
            onClick={() => setIsAddItemModalOpen(true)}
            className="bg-white border rounded-lg shadow p-6 flex flex-col items-center justify-center hover:border-[#5F35D2] cursor-pointer transition-colors h-[170px]"
          >
            <img src="/assets/icons/menu.svg" alt="add" />
            <span className="text-gray-600 text-sm font-medium font-satoshi">Add new item</span>
          </div>

          {/* Menu Items */}
          {menuItems && menuItems.length > 0 ? (
            menuItems.map((item) => (
              <div
                key={item.id}
                onClick={() => handleItemClick(item)}
                className="bg-white border rounded-lg shadow  hover:shadow-md h-[170px] transition-shadow cursor-pointer"
              >
                <div className="relative overflow-hidden rounded-t-lg">
                    <img
                      src={
                        item.image.startsWith('data:') || item.image.startsWith('http')
                          ? item.image
                          : `data:image/jpeg;base64,${item.image}`
                      }
                      alt={item.name}
                      className="w-full h-[120px] object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          noImage;
                      }}
                    />
                
                </div>
                <div className="px-1.5 mt-1">
                  <h3 className="text-sm font-medium text-gray-800 mb-1 truncate font-satoshi">
                    {item.name}
                  </h3>
                  <p className="text-xs font-medium text-gray-900 font-satoshi">
                    ₦
                    {item.price.toLocaleString('en-NG', {
                      minimumFractionDigits: 2,
                    })}
                  </p>
                </div>
              </div>
            ))
          ) : (
            !loadingItems &&
            menuSections.length === 0 && (
              <div className="col-span-full">
                <EmptyState
                  title="No menu sections available"
                  description="Create a menu section to add items to this category."
                  actionButton={{
                    text: 'Create Menu',
                    onClick: onOpen,
                  }}
                />
              </div>
            )
          )}
          {!loadingItems &&
            menuItems !== null &&
            menuSections.length > 0 &&
            menuItems.length === 0 && (
              <div className="col-span-full">
                <EmptyState
                  title="No items in this menu section"
                  description="Click 'Add new item' to get started with your first menu item."
                  actionButton={{
                    text: 'Add New Item',
                    onClick: () => setIsAddItemModalOpen(true),
                  }}
                />
              </div>
            )}
        </div>
      )}
    </div>
  );
};

export default MenuItemsGrid;
