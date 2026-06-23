import React from 'react';
import { Search, List } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface POSHeaderProps {
  onSearch?: (query: string) => void;
}

export const POSHeader: React.FC<POSHeaderProps> = ({ onSearch }) => {
  const router = useRouter();

  return (
    <div className="flex items-center gap-2 shrink-0 px-3 py-2">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <input
          type="text"
          placeholder="Search here..."
          className="w-36 lg:w-56 pl-9 pr-3 py-1.5 rounded-md text-sm bg-white focus:outline-none focus:ring-1 focus:ring-white/60"
          onChange={(e) => onSearch?.(e.target.value)}
        />
      </div>
      <button
        onClick={() => router.push('/dashboard/orders?from=pos')}
        className="flex items-center justify-center gap-2 px-3 py-1.5 bg-white text-[#5F35D2] rounded-md hover:bg-purple-50 text-sm whitespace-nowrap"
      >
        <List className="w-4 h-4 text-[#5F35D2]" />
        <span>Order list</span>
      </button>
    </div>
  );
};
