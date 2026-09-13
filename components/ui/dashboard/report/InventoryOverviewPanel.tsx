'use client';

import React from 'react';
import { Skeleton } from '@nextui-org/react';
import { formatPrice } from '@/lib/utils';
import {
  BarList,
  DistributionDonut,
  DistributionSegment,
  StatCards,
} from './SharedPanels';
import {
  BarRow,
  InventoryDetailsSection,
  MoverItem,
  StatCard,
} from './types';

interface InventoryOverviewPanelProps {
  data?: InventoryDetailsSection;
  isLoading?: boolean;
  comparisonLabel?: string;
}

const safeNumber = (value: unknown): number => {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
};

const moverToBarRow = (mover: MoverItem): BarRow => ({
  label: mover.name ?? mover.itemName ?? 'Unknown',
  value: safeNumber(mover.quantityMoved ?? mover.qty ?? mover.quantity ?? mover.movement),
});

export const InventoryOverviewPanel: React.FC<InventoryOverviewPanelProps> = ({
  data,
  isLoading,
  comparisonLabel = 'from previous period',
}) => {
  if (isLoading || !data) {
    return (
      <div className="flex flex-col gap-5">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-28 rounded-2xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <Skeleton className="h-72 rounded-2xl" />
          <Skeleton className="h-72 rounded-2xl" />
        </div>
      </div>
    );
  }

  const totalStockValue = safeNumber(data.totalStockValue);
  const itemsBelowReorder = safeNumber(data.itemsBelowReorder);
  const itemsOutOfStock = safeNumber(data.itemsOutOfStock);
  const stockTurnoverRate = safeNumber(data.stockTurnoverRate);
  const wastageCost = safeNumber(data.wastageCost);

  const stockChange = safeNumber(data.stockValuePercentageChange);
  const stockDirection: StatCard['direction'] =
    stockChange > 0 ? 'up' : stockChange < 0 ? 'down' : 'neutral';

  const stats: StatCard[] = [
    {
      label: 'Total Stock Value',
      value: formatPrice(totalStockValue, 'NGN'),
      delta: `${stockChange > 0 ? '+' : ''}${stockChange}% ${comparisonLabel}`,
      direction: stockDirection,
    },
    {
      label: 'Low Stock',
      value: itemsBelowReorder.toLocaleString(),
      footer: itemsBelowReorder > 0 ? 'Reorder Required' : 'All stocked',
      footerTone: itemsBelowReorder > 0 ? 'warning' : 'muted',
    },
    {
      label: 'Out of Stock',
      value: itemsOutOfStock.toLocaleString(),
      footer: itemsOutOfStock > 0 ? 'Immediate Action' : 'No items out',
      footerTone: itemsOutOfStock > 0 ? 'danger' : 'muted',
    },
    {
      label: 'Total COGS',
      value: formatPrice(safeNumber(data.totalCogs), 'NGN'),
      footer: 'Cost of goods sold',
      footerTone: 'muted',
    },
  ];

  const wastageChange = safeNumber(data.wastagePercentageChange);
  const wastageDirection: StatCard['direction'] =
    wastageChange > 0 ? 'up' : wastageChange < 0 ? 'down' : 'neutral';

  const daysOnHand = safeNumber(data.daysOfInventoryOnHand);
  const wastageBounded = Math.max(0, Math.min(wastageCost, totalStockValue));
  const activeStock = Math.max(0, totalStockValue - wastageBounded);

  const stockHealthSegments: DistributionSegment[] = [
    { label: 'Active Stock', value: activeStock, color: '#10B981' },
    { label: 'Wastage', value: wastageBounded, color: '#EF4444' },
  ];

  const turnoverDisplay = stockTurnoverRate.toLocaleString(undefined, {
    maximumFractionDigits: 2,
  });
  const wastageChangeDisplay = `${wastageChange > 0 ? '+' : ''}${wastageChange}%`;
  const stockHealthCaption =
    `Turnover ${turnoverDisplay} • ` +
    `Days on hand ${daysOnHand.toLocaleString()} • ` +
    `Wastage change ${wastageChangeDisplay} ` +
    `(${
      wastageDirection === 'down'
        ? 'improving'
        : wastageDirection === 'up'
        ? 'worsening'
        : 'stable'
    })`;

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
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5 lg:col-span-3 flex items-center justify-center min-h-[200px]">
            <p className="text-sm text-gray-500">No top movers in this period</p>
          </div>
        )}
        <DistributionDonut
          title="Stock Health"
          segments={stockHealthSegments}
          centerLabel="Stock Value"
          centerValue={formatPrice(totalStockValue, 'NGN')}
          caption={stockHealthCaption}
          emptyLabel="No stock value recorded"
          valueFormatter={(v) => formatPrice(v, 'NGN')}
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
      </div>
    </div>
  );
};
