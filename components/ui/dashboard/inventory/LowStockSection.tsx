'use client';

import React from 'react';
import { LowStockItem } from './mockData';

interface LowStockSectionProps {
  items: LowStockItem[];
  className?: string;
}

const AlertIcon = ({ className }: { className?: string }) => (
  <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

const LowStockSection: React.FC<LowStockSectionProps> = ({ items, className }) => {
  const getProgressColor = (percentage: number) => {
    if (percentage <= 20) return 'bg-red-500';
    if (percentage <= 25) return 'bg-amber-500';
    return 'bg-[#5F35D2]';
  };

  const getTextColor = (percentage: number) => {
    if (percentage <= 20) return 'text-red-600';
    if (percentage <= 25) return 'text-amber-600';
    return 'text-[#5F35D2]';
  };

  return (
    <div className={`bg-white rounded-xl shadow-small border-gray-100 ${className}`}>
      <div className="flex items-center justify-between p-5 border-b border-gray-50">
        <div className="flex items-center gap-2">
          <div className="bg-red-50 p-2 rounded-lg">
            <AlertIcon className="text-red-500" />
          </div>
          <h3 className="font-semibold text-gray-900">Low Stock Alert</h3>
        </div>
        <span className="text-xs text-gray-400">{items.length} items</span>
      </div>
      <div className="p-4">
        <div className="space-y-4 max-h-[280px] overflow-y-auto">
          {items.map((item) => (
            <div key={item.id} className="flex items-center gap-4">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-700 truncate">{item.name}</p>
              </div>
              <div className="w-24 flex-shrink-0">
                <div className="w-full bg-gray-100 rounded-full h-1.5">
                  <div
                    className={`h-1.5 rounded-full transition-all ${getProgressColor(item.currentPercentage)}`}
                    style={{ width: `${item.currentPercentage}%` }}
                  />
                </div>
              </div>
              <div className="w-12 text-right flex-shrink-0">
                <span className={`text-sm font-semibold ${getTextColor(item.currentPercentage)}`}>
                  {item.currentPercentage}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LowStockSection;
