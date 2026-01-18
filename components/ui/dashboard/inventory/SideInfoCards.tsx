'use client';

import React from 'react';

interface SideInfoCardsProps {
  stockTransfers: number;
  totalSuppliers: number;
  className?: string;
}

const ArrowsIcon = ({ className }: { className?: string }) => (
  <svg className={className} width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M17 1l4 4-4 4" />
    <path d="M3 11V9a4 4 0 0 1 4-4h14" />
    <path d="M7 23l-4-4 4-4" />
    <path d="M21 13v2a4 4 0 0 1-4 4H3" />
  </svg>
);

const UsersIcon = ({ className }: { className?: string }) => (
  <svg className={className} width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const SideInfoCards: React.FC<SideInfoCardsProps> = ({
  stockTransfers,
  totalSuppliers,
  className,
}) => {
  return (
    <div className={`flex flex-col gap-4 ${className}`}>
      {/* Stock Transfers Card */}
      <div className="bg-white rounded-xl p-5 shadow-small border-gray-100  flex-1 flex flex-col justify-between">
        <div className="flex items-start justify-between">
          <span className="text-sm font-medium text-gray-500">Stock Transfers</span>
          <div className="bg-[#EBE8F9] p-2.5 rounded-lg">
            <ArrowsIcon className="text-[#5F35D2]" />
          </div>
        </div>
        <div className="mt-4">
          <span className="text-3xl font-semibold text-gray-900">{stockTransfers}</span>
          <p className="text-xs text-gray-400 mt-1">Moved to other stores</p>
        </div>
      </div>

      {/* Total Suppliers Card */}
      <div className="bg-white rounded-xl p-5 shadow-small border-gray-100  flex-1 flex flex-col justify-between">
        <div className="flex items-start justify-between">
          <span className="text-sm font-medium text-gray-500">Suppliers</span>
          <div className="bg-emerald-50 p-2.5 rounded-lg">
            <UsersIcon className="text-emerald-600" />
          </div>
        </div>
        <div className="mt-4">
          <span className="text-3xl font-semibold text-gray-900">{totalSuppliers}</span>
          <p className="text-xs text-gray-400 mt-1">Active suppliers</p>
        </div>
      </div>
    </div>
  );
};

export default SideInfoCards;
