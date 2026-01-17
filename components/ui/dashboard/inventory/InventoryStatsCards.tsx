'use client';

import React from 'react';
import { InventoryStats } from './mockData';

interface InventoryStatsCardsProps {
  data: InventoryStats;
}

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

// Minimalist icons
const BoxIcon = ({ className }: { className?: string }) => (
  <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
    <path d="m3.3 7 8.7 5 8.7-5M12 22V12" />
  </svg>
);

const AlertIcon = ({ className }: { className?: string }) => (
  <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

const WalletIcon = ({ className }: { className?: string }) => (
  <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
    <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
    <path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
  </svg>
);

const ClockIcon = ({ className }: { className?: string }) => (
  <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const InventoryStatsCards: React.FC<InventoryStatsCardsProps> = ({ data }) => {
  const stats = [
    {
      label: 'Total Items',
      value: data.totalItems.toString(),
      subtitle: 'All in stock',
      icon: BoxIcon,
      iconBg: 'bg-[#EBE8F9]',
      iconColor: 'text-[#5F35D2]',
      valueColor: 'text-gray-900',
    },
    {
      label: 'Low Stock',
      value: data.lowStockItems.toString(),
      subtitle: `Below ${data.lowStockThreshold}% threshold`,
      icon: AlertIcon,
      iconBg: 'bg-red-50',
      iconColor: 'text-red-500',
      valueColor: 'text-gray-900',
    },
    {
      label: 'Inventory Value',
      value: formatCurrency(data.inventoryValue),
      subtitle: 'Total stock value',
      icon: WalletIcon,
      iconBg: 'bg-emerald-50',
      iconColor: 'text-emerald-600',
      valueColor: 'text-gray-900',
    },
    {
      label: 'Pending Orders',
      value: data.pendingPurchase.toString(),
      subtitle: 'Awaiting delivery',
      icon: ClockIcon,
      iconBg: 'bg-amber-50',
      iconColor: 'text-amber-600',
      valueColor: 'text-gray-900',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, idx) => (
        <div
          key={idx}
          className="bg-white rounded-xl p-5  shadow-small border-gray-100 hover:border-gray-200 transition-all duration-200 hover:shadow-sm"
        >
          <div className="flex items-start justify-between">
            <div className="flex flex-col gap-1">
              <span className="text-sm font-medium text-gray-500">{stat.label}</span>
              <span className={`text-2xl font-semibold ${stat.valueColor} tracking-tight`}>
                {stat.value}
              </span>
              <span className="text-xs text-gray-400 mt-1">
                {stat.subtitle}
              </span>
            </div>
            <div className={`${stat.iconBg} p-2.5 rounded-lg`}>
              <stat.icon className={stat.iconColor} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default InventoryStatsCards;
