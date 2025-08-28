
import { Download, Search, X } from 'lucide-react';
import { Chip } from '@nextui-org/react';

interface MenuHeaderProps {
  menuSections?: any[];  // Keep for backward compatibility but not used
  menuItems?: any[] | null;  // Keep for backward compatibility but not used
  activeSubCategory?: string;  // Keep for backward compatibility but not used
  isExporting: boolean;
  handleExportCSV: () => void;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  categories?: any[];
}

const MenuHeader = ({
  isExporting,
  handleExportCSV,
  searchQuery,
  onSearchChange,
  categories = [],
}: MenuHeaderProps) => {
  return (
    <div className="bg-white py-4 ">
      <div className="flex flex-row flex-wrap items-center justify-between">
        <div>
          <div className="text-[24px] leading-8 font-semibold">
            {categories.length > 0 ? (
              <div className="flex items-center">
                <span>Menu</span>
                <Chip
                  classNames={{
                    base: `ml-2 text-xs h-7 font-[600] w-5 bg-[#EAE5FF] text-primaryColor`,
                  }}
                >
                  {categories.length}
                </Chip>
              </div>
            ) : (
              <span>Menu</span>
            )}
          </div>
          <p className="text-sm text-grey600">
            Showing all menu items
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search menu items..."
              className="pl-10 pr-10 py-2 w-64 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent font-satoshi text-base"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2"
              >
                <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
              </button>
            )}
          </div>
          <button
            onClick={handleExportCSV}
            disabled={isExporting}
            className="text-gray-700 flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 font-satoshi text-base"
          >
            <Download className="w-4 h-4" />
            <span>{isExporting ? 'Exporting...' : 'Export CSV'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default MenuHeader;
