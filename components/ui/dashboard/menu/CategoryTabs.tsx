
import { Eye, Plus } from 'lucide-react';
import { Spinner } from '@nextui-org/react';

interface CategoryTabsProps {
  loadingCategories: boolean;
  categories: any[];
  activeCategory: string;
  handleCategorySelect: (categoryId: string) => void;
  setIsOpenCreateSection: (isOpen: boolean) => void;
  setViewMenuMode: (mode: 'all' | 'current') => void;
  setIsOpenViewMenu: (isOpen: boolean) => void;
}

const CategoryTabs = ({
  loadingCategories,
  categories,
  activeCategory,
  handleCategorySelect,
  setIsOpenCreateSection,
  setViewMenuMode,
  setIsOpenViewMenu,
}: CategoryTabsProps) => {
  return (
    <div className="mt-2 border-b border-gray-200">
      <div className="flex items-center gap-4 sm:gap-6 px-2 sm:px-4 py-2 overflow-x-auto scrollbar-hide">
        <button
          onClick={() => setIsOpenCreateSection(true)}
          className="border-2 border-gray-700 -mr-2 sm:-mr-3 rounded-full shrink-0"
        >
          <Plus className="w-4 h-4 text-gray-700" />
        </button>
        {loadingCategories ? (
          <div className="flex items-center gap-1 px-4 shrink-0">
            <Spinner size="sm" />
            <span className="text-sm text-gray-600 font-satoshi whitespace-nowrap">Loading categories...</span>
          </div>
        ) : categories.length === 0 ? (
          <span className="text-sm text-gray-500 font-satoshi whitespace-nowrap shrink-0">No categories available</span>
        ) : (
          categories.map((category) => (
            <button
              key={category.categoryId}
              onClick={() => handleCategorySelect(category.categoryId)}
              className={`px-2 sm:px-3 border-b-2 transition-colors text-sm sm:text-base font-satoshi whitespace-nowrap shrink-0 ${
                activeCategory === category.categoryId
                  ? 'border-[#5F35D2] text-[#5F35D2] font-medium'
                  : 'border-transparent text-[#6C7278] hover:text-gray-800'
              }`}
            >
              {category.categoryName}
            </button>
          ))
        )}
        <button
          onClick={() => {
            setViewMenuMode('current');
            setIsOpenViewMenu(true);
          }}
          className="ml-auto p-2 text-[#5F35D2] shrink-0"
        >
          <Eye className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default CategoryTabs;
