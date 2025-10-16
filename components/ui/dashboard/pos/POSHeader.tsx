import React from 'react';
import { Search, List } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface POSHeaderProps {
  onSearch?: (query: string) => void;
}

export const POSHeader: React.FC<POSHeaderProps> = ({ onSearch }) => {
  const router = useRouter();

  return (
    <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center border-b border-gray-200 px-4 sm:px-6 w-full">
      <div className="mb-4 lg:mb-0">
        <h2 className="text-lg font-medium">Today Menu</h2>
        <p className="text-xs mb-2 lg:mb-6">Showing all items on orders</p>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-3 pb-3 lg:px-6 lg:py-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-300 w-4 h-4" />
          <input
            type="text"
            placeholder="Search here..."
            className="w-full pl-10 pr-4 py-2 border rounded-md focus:ring-1 focus:ring-gray-100 focus:border-gray-100 text-sm"
            onChange={(e) => onSearch?.(e.target.value)}
          />
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => router.push('/dashboard/orders?from=pos')}
            className="flex-1 sm:flex-none flex items-center justify-center space-x-2 px-4 py-2 text-[#5F35D2] border border-[#5F35D2] rounded-md hover:bg-purple-50 text-sm"
          >
            <List className="w-4 h-4 text-[#5F35D2]" />
            <span className="">Order list</span>
          </button>
        </div>
      </div>
    </div>
  );
};
