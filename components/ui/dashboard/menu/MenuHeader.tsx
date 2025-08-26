
import { Download } from 'lucide-react';

interface MenuHeaderProps {
  menuSections: any[];
  menuItems: any[] | null;
  activeSubCategory: string;
  isExporting: boolean;
  handleExportCSV: () => void;
}

const MenuHeader = ({
  menuSections,
  menuItems,
  activeSubCategory,
  isExporting,
  handleExportCSV,
}: MenuHeaderProps) => {
  return (
    <div className="bg-white px-6 py-4 border-b border-gray-200">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold font-satoshi">Menu</h1>
          <p className="text-gray-500 text-sm font-satoshi mt-1">
            {menuSections.length > 0
              ? `Showing ${menuItems?.length || 0} items in ${
                  menuSections.find((s) => s.id === activeSubCategory)?.name || 'menu'
                }`
              : 'Showing all menu items'}
          </p>
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
  );
};

export default MenuHeader;
