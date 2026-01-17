'use client';

import React from 'react';
import { RecentPurchaseOrder, RecentStockTransfer } from './mockData';

interface RecentActivityProps {
  purchaseOrders: RecentPurchaseOrder[];
  stockTransfers: RecentStockTransfer[];
  className?: string;
}

const ClockIcon = ({ className }: { className?: string }) => (
  <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const PurchaseIcon = () => (
  <div className="w-9 h-9 bg-[#EBE8F9] rounded-lg flex items-center justify-center flex-shrink-0">
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#5F35D2" strokeWidth="2">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  </div>
);

const TransferIcon = () => (
  <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2">
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  </div>
);

const RecentActivity: React.FC<RecentActivityProps> = ({
  purchaseOrders,
  stockTransfers,
  className,
}) => {
  const allActivities = [
    ...purchaseOrders.map((po) => ({
      type: 'purchase' as const,
      id: po.id,
      title: `Purchase Order`,
      orderNumber: po.orderNumber,
      subtitle: po.supplierName,
      status: po.status,
      timestamp: po.timestamp,
    })),
    ...stockTransfers.map((st) => ({
      type: 'transfer' as const,
      id: st.id,
      title: `Stock Transfer`,
      orderNumber: st.transferNumber,
      subtitle: st.storeName,
      status: st.status,
      timestamp: st.timestamp,
    })),
  ];

  const getStatusStyle = (status: string) => {
    switch (status.toLowerCase()) {
      case 'sent':
        return 'bg-emerald-50 text-emerald-700';
      case 'pending':
        return 'bg-amber-50 text-amber-700';
      case 'received':
        return 'bg-blue-50 text-blue-700';
      default:
        return 'bg-gray-50 text-gray-700';
    }
  };

  return (
    <div className={`bg-white rounded-xl shadow-small border-gray-100 ${className}`}>
      <div className="flex items-center justify-between p-5 border-b border-gray-50">
        <div className="flex items-center gap-2">
          <div className="bg-amber-50 p-2 rounded-lg">
            <ClockIcon className="text-amber-600" />
          </div>
          <h3 className="font-semibold text-gray-900">Recent Activity</h3>
        </div>
        <span className="text-xs text-gray-400">{allActivities.length} items</span>
      </div>
      <div className="p-3">
        <div className="space-y-1 max-h-[280px] overflow-y-auto">
          {allActivities.map((activity, idx) => (
            <div
              key={`${activity.type}-${activity.id}-${idx}`}
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
            >
              {activity.type === 'purchase' ? <PurchaseIcon /> : <TransferIcon />}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                  <span className="text-xs text-gray-400">{activity.orderNumber}</span>
                </div>
                <p className="text-xs text-gray-500 truncate">{activity.subtitle}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${getStatusStyle(activity.status)}`}>
                  {activity.status}
                </span>
                <p className="text-xs text-gray-400 mt-1">{activity.timestamp}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RecentActivity;
