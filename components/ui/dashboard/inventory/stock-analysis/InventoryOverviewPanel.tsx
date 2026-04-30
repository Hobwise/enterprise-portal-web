'use client';

import React from 'react';
import moment from 'moment';
import { Skeleton } from '@nextui-org/react';
import { formatPrice } from '@/lib/utils';
import {
  AvailableReportsList,
  BarList,
  BreakdownList,
  StatCards,
} from './SharedPanels';
import {
  BarRow,
  BreakdownRow,
  InventoryDetailsSection,
  MoverItem,
  StatCard,
} from './types';

interface InventoryOverviewPanelProps {
  data?: InventoryDetailsSection;
  isLoading?: boolean;
}

const moverToBarRow = (mover: MoverItem): BarRow => ({
  label: mover.name ?? mover.itemName ?? 'Unknown',
  value: mover.qty ?? mover.quantity ?? mover.movement ?? mover.value ?? 0,
});

export const InventoryOverviewPanel: React.FC<InventoryOverviewPanelProps> = ({
  data,
  isLoading,
}) => {
  if (isLoading || !data) {
    return (
      <div className="flex flex-col gap-5">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-28 rounded-2xl" />
          ))}
        </div>
        <Skeleton className="h-64 rounded-2xl" />
      </div>
    );
  }

  const stockValueDirection: StatCard['direction'] =
    Number(data.stockValuePercentageChange) > 0
      ? 'up'
      : Number(data.stockValuePercentageChange) < 0
      ? 'down'
      : 'neutral';

  const wastageDirection: StatCard['direction'] =
    Number(data.wastagePercentageChange) > 0
      ? 'up'
      : Number(data.wastagePercentageChange) < 0
      ? 'down'
      : 'neutral';

  const stats: StatCard[] = [
    {
      label: 'Total Stock Value',
      value: formatPrice(data.totalStockValue ?? 0, 'NGN'),
      delta: `${data.stockValuePercentageChange}% change`,
      direction: stockValueDirection,
    },
    {
      label: 'Items Below Reorder',
      value: String(data.itemsBelowReorder ?? 0),
      footer: 'Restock recommended',
      footerTone: data.itemsBelowReorder > 0 ? 'warning' : 'muted',
    },
    {
      label: 'Items Out of Stock',
      value: String(data.itemsOutOfStock ?? 0),
      footer: 'Currently unavailable',
      footerTone: data.itemsOutOfStock > 0 ? 'danger' : 'muted',
    },
    {
      label: 'Total COGS',
      value: formatPrice(data.totalCogs ?? 0, 'NGN'),
      footer: 'Cost of goods sold',
      footerTone: 'muted',
    },
  ];

  const breakdownRows: BreakdownRow[] = [
    {
      label: 'Stock Turnover Rate',
      value: data.stockTurnoverRate ?? 0,
    },
    {
      label: 'Days of Inventory On Hand',
      value: data.daysOfInventoryOnHand ?? 0,
    },
    {
      label: 'Wastage Cost',
      value: formatPrice(data.wastageCost ?? 0, 'NGN'),
      valueClass: 'text-red-500',
    },
    {
      label: 'Wastage % Change',
      value: `${data.wastagePercentageChange ?? 0}%`,
      valueClass:
        wastageDirection === 'down'
          ? 'text-emerald-600'
          : wastageDirection === 'up'
          ? 'text-red-500'
          : 'text-gray-500',
    },
  ];

  const topMoverRows = (data.topMovers ?? []).map(moverToBarRow);
  const slowMoverRows = (data.slowMovers ?? []).map(moverToBarRow);

  return (
    <div className="flex flex-col gap-5">
      <StatCards cards={stats} />
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {topMoverRows.length > 0 ? (
          <BarList
            title="Top Movers"
            rows={topMoverRows}
            className="lg:col-span-3"
            valueFormatter={(r) => `${r.value.toLocaleString()} units`}
          />
        ) : (
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5 lg:col-span-3 flex items-center justify-center min-h-[180px]">
            <p className="text-sm text-gray-500">No top movers in this period</p>
          </div>
        )}
        <BreakdownList
          title="Stock Health"
          rows={breakdownRows}
          className="lg:col-span-2"
        />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {slowMoverRows.length > 0 ? (
          <BarList
            title="Slow Movers"
            rows={slowMoverRows}
            valueFormatter={(r) => `${r.value.toLocaleString()} units`}
          />
        ) : (
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5 flex items-center justify-center min-h-[160px]">
            <p className="text-sm text-gray-500">No slow movers in this period</p>
          </div>
        )}
        <AvailableReportsList
          reports={data.availableReport}
          route="inventory"
          title="Available Inventory Reports"
        />
      </div>
    </div>
  );
};
