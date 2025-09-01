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
  return (
    <div className=" rounded-md">
      <div className="flex items-center px-4 gap-6 py-2">
        {loadingCategories ? (
          <div className="flex items-center gap-1 px-4">
            <Spinner size="sm" />
            <span className="text-sm text-gray-600 font-satoshi">Loading categories...</span>
          </div>
        ) : categories.length === 0 ? (
          <span className="text-sm text-gray-500 font-satoshi">No categories available</span>
        ) : (
          categories.map((category) => (
            <button
              key={category.categoryId || category.id}
              onClick={() => handleCategorySelect(category.categoryId || category.id)}
              className={`px-2 border-b-3 transition-colors text-base font-satoshi ${
                activeCategory === (category.categoryId || category.id)
                  ? 'border-[#5F35D2] text-[#5F35D2] font-medium'
                  : 'border-transparent text-[#6C7278] hover:text-gray-800'
              }`}
            >
              {category.categoryName || category.name}
            </button>
          ))
        )}
      </div>
    </div>
  );
};

export default OrderCategoryTabs;