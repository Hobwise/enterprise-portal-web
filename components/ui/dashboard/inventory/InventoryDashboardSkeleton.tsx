'use client';

import React from 'react';
import { Card, Skeleton } from '@nextui-org/react';

const InventoryDashboardSkeleton: React.FC = () => {
  return (
    <div className="flex flex-col gap-5">
      {/* Stats Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((idx) => (
          <Card key={idx} shadow="sm" className="p-4 rounded-xl">
            <div className="flex flex-col gap-2">
              <Skeleton className="h-4 w-24 rounded-lg" />
              <Skeleton className="h-8 w-20 rounded-lg" />
              <Skeleton className="h-3 w-32 rounded-lg" />
            </div>
          </Card>
        ))}
      </div>

      {/* Chart and Side Cards Row */}
      <div className="flex lg:flex-row flex-col gap-5">
        {/* Chart Skeleton */}
        <Card shadow="sm" className="rounded-xl lg:w-[70%]">
          <div className="border-b border-gray-200 p-4">
            <Skeleton className="h-6 w-48 rounded-lg" />
          </div>
          <div className="p-4">
            <Skeleton className="h-[300px] w-full rounded-lg" />
          </div>
        </Card>

        {/* Side Cards Skeleton */}
        <div className="flex flex-col gap-4 lg:w-[30%]">
          {[1, 2].map((idx) => (
            <Card key={idx} shadow="sm" className="p-6 rounded-xl border border-gray-200">
              <div className="flex flex-col gap-2">
                <Skeleton className="h-4 w-28 rounded-lg" />
                <Skeleton className="h-10 w-16 rounded-lg" />
                <Skeleton className="h-3 w-36 rounded-lg" />
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Activity and Low Stock Row */}
      <div className="flex lg:flex-row flex-col gap-5">
        {/* Recent Activity Skeleton */}
        <Card shadow="sm" className="rounded-xl lg:w-[60%]">
          <div className="border-b border-gray-200 p-4">
            <Skeleton className="h-6 w-32 rounded-lg" />
          </div>
          <div className="p-4 space-y-4">
            {[1, 2, 3].map((idx) => (
              <div key={idx} className="flex items-center gap-4">
                <Skeleton className="w-10 h-10 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4 rounded-lg" />
                  <Skeleton className="h-3 w-1/2 rounded-lg" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-12 rounded-lg" />
                  <Skeleton className="h-3 w-16 rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Low Stock Skeleton */}
        <Card shadow="sm" className="rounded-xl lg:w-[40%]">
          <div className="border-b border-gray-200 p-4">
            <Skeleton className="h-6 w-24 rounded-lg" />
          </div>
          <div className="p-4 space-y-4">
            {[1, 2, 3, 4, 5].map((idx) => (
              <div key={idx} className="flex items-center gap-4">
                <Skeleton className="h-4 w-16 rounded-lg" />
                <Skeleton className="h-2 flex-1 rounded-full" />
                <Skeleton className="h-4 w-10 rounded-lg" />
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default InventoryDashboardSkeleton;
