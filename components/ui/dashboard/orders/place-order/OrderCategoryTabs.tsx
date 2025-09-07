import { Spinner } from '@nextui-org/react';

interface OrderCategoryTabsProps {
  loadingCategories: boolean;
  categories: any[];
  activeCategory: string;
  handleCategorySelect: (categoryId: string) => void;
}

const OrderCategoryTabs = ({
  loadingCategories,
  categories,
  activeCategory,
  handleCategorySelect,
}: OrderCategoryTabsProps) => {
  // Ensure categories is always an array and filter out invalid entries
  const safeCategories = Array.isArray(categories) ? categories.filter(cat => cat != null) : [];
  
  return (
    <div className=" rounded-md">
      <div className="flex items-center px-4 gap-6 py-2">
        {loadingCategories ? (
          <div className="flex items-center gap-1 px-4">
            <Spinner size="sm" />
            <span className="text-sm text-gray-600 font-satoshi">Loading categories...</span>
          </div>
        ) : safeCategories.length === 0 ? (
          <span className="text-sm text-gray-500 font-satoshi">No categories available</span>
        ) : (
          safeCategories.map((category, index) => {
            // Create a stable unique key
            const categoryKey = category.categoryId 
              ? `cat-${category.categoryId}` 
              : category.id 
              ? `id-${category.id}` 
              : `idx-${index}`;
            
            const categoryId = category.categoryId || category.id || `category-${index}`;
            const categoryName = category.categoryName || category.name || 'Unnamed Category';
            
            return (
              <button
                key={categoryKey}
                onClick={() => handleCategorySelect(categoryId)}
                className={`px-2 border-b-3 transition-colors text-base font-satoshi ${
                  activeCategory === categoryId
                    ? 'border-[#5F35D2] text-[#5F35D2] font-medium'
                    : 'border-transparent text-[#6C7278] hover:text-gray-800'
                }`}
              >
                {categoryName}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};

export default OrderCategoryTabs;