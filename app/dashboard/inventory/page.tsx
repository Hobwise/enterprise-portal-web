'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getJsonItemFromLocalStorage } from '@/lib/utils';
import {
  InventoryStatsCards,
  ItemsSoldChart,
  SideInfoCards,
  RecentActivity,
  LowStockSection,
  InventoryDashboardSkeleton,
  mockInventoryData,
} from '@/components/ui/dashboard/inventory';

const InventoryDashboard: React.FC = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    // Check if user is manager (role 0)
    const userInfo = getJsonItemFromLocalStorage('userInformation');
    const role = userInfo?.role;

    if (Number(role) !== 0) {
      // Redirect non-managers to unauthorized page
      router.replace('/dashboard/unauthorized');
      return;
    }

    setHasAccess(true);
    // Simulate loading data
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [router]);

  if (!hasAccess) {
    return null;
  }

  if (isLoading) {
    return <InventoryDashboardSkeleton />;
  }

  // Use mock data for now
  const data = mockInventoryData;

  return (
    <div className="flex flex-col gap-5">
      {/* Top Section: Stats Cards */}
      <InventoryStatsCards data={data.stats} />

      {/* Middle Section: Chart + Side Cards */}
      <div className="flex lg:flex-row flex-col gap-5">
        <ItemsSoldChart data={data.itemsSold} className="lg:w-[70%]" />
        <SideInfoCards
          stockTransfers={data.stockTransfers}
          totalSuppliers={data.totalSuppliers}
          className="lg:w-[30%]"
        />
      </div>

      {/* Bottom Section: Recent Activity + Low Stock */}
      <div className="flex lg:flex-row flex-col gap-5">
        <RecentActivity
          purchaseOrders={data.recentPurchaseOrders}
          stockTransfers={data.recentStockTransfers}
          className="lg:w-[60%]"
        />
        <LowStockSection items={data.lowStockItems} className="lg:w-[40%]" />
      </div>
    </div>
  );
};

export default InventoryDashboard;
