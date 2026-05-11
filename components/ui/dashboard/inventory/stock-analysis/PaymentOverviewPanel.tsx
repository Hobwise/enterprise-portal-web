'use client';

import React from 'react';
import moment from 'moment';
import { Skeleton } from '@nextui-org/react';
import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { formatPrice } from '@/lib/utils';
import { BarList, StatCards } from './SharedPanels';
import {
  BarRow,
  PaymentDetailsSection,
  PaymentMethodBreakdownItem,
  StatCard,
} from './types';

ChartJS.register(ArcElement, Tooltip, Legend);

const METHOD_COLORS = ['#5F35D2', '#EC4899', '#A78BFA', '#1E1B4B', '#22C55E', '#F59E0B'];

interface PaymentOverviewPanelProps {
  data?: PaymentDetailsSection;
  isLoading?: boolean;
  comparisonLabel?: string;
}

interface PaymentMethodsChartProps {
  breakdown: PaymentMethodBreakdownItem[];
}

interface ChartLegendItem {
  method: string;
  amount: number;
  sharePct: number;
  color: string;
}

const formatSharePct = (value: number): string => {
  if (!Number.isFinite(value) || value <= 0) return '0%';
  if (value < 0.01) return '<0.01%';
  return `${value.toFixed(2)}%`;
};

const MIN_SLICE_PCT = 1.5; // tiny slices get bumped to this so they stay visible

const PaymentMethodsChart: React.FC<PaymentMethodsChartProps> = ({ breakdown }) => {
  const totalAmount = breakdown.reduce(
    (sum, item) => sum + (Number.isFinite(item.amount) ? item.amount : 0),
    0
  );

  const items: ChartLegendItem[] = breakdown
    .map((item, index) => {
      const amount = Number.isFinite(item.amount) ? item.amount : 0;
      const sharePct = totalAmount > 0 ? (amount / totalAmount) * 100 : 0;
      return {
        method: item.method,
        amount,
        sharePct,
        color: METHOD_COLORS[index % METHOD_COLORS.length],
      };
    })
    .sort((a, b) => b.amount - a.amount);

  const hasData = totalAmount > 0;

  // Bump tiny non-zero slices so they remain visually distinguishable on the donut.
  // The legend still shows the true % and amount.
  const displayValues = items.map((item) => {
    if (item.amount <= 0) return 0;
    const minDisplay = (MIN_SLICE_PCT / 100) * totalAmount;
    return Math.max(item.amount, minDisplay);
  });

  const chartData = {
    labels: items.map((item) => item.method),
    datasets: [
      {
        data: displayValues,
        backgroundColor: items.map((item) => item.color),
        borderColor: '#ffffff',
        borderWidth: 2,
        hoverOffset: 4,
      },
    ],
  };

  const chartOptions = {
    cutout: '68%',
    plugins: {
      legend: { display: false },
      tooltip: {
        enabled: true,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        titleColor: '#111827',
        bodyColor: '#374151',
        padding: 10,
        borderColor: '#e5e7eb',
        borderWidth: 1,
        callbacks: {
          label: (context: any) => {
            const item = items[context.dataIndex];
            return ` ${item.method}: ${formatPrice(item.amount, 'NGN')} (${formatSharePct(
              item.sharePct
            )})`;
          },
        },
      },
    },
    maintainAspectRatio: false,
  };

  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5 flex flex-col">
      <h3 className="text-base font-semibold text-gray-900">Methods of Payment</h3>
      {hasData ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-5 mt-2">
          <div className="relative w-[200px] h-[200px]">
            <Doughnut data={chartData} options={chartOptions} />
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
              <span className="text-[11px] uppercase tracking-wider text-gray-500">
                Total
              </span>
              <span className="text-base font-bold text-gray-900 tabular-nums">
                {formatPrice(totalAmount, 'NGN')}
              </span>
            </div>
          </div>
          <ul className="flex flex-col gap-3 w-full">
            {items.map((item) => (
              <li
                key={item.method}
                className="flex items-center justify-between gap-3 text-sm"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className="h-2.5 w-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: item.color }}
                    aria-hidden
                  />
                  <span className="font-medium text-gray-700 truncate">
                    {item.method}
                  </span>
                  <span className="text-xs text-gray-500 shrink-0">
                    {formatSharePct(item.sharePct)}
                  </span>
                </div>
                <span className="font-semibold text-gray-900 tabular-nums shrink-0">
                  {formatPrice(item.amount, 'NGN')}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="flex-1 py-12 flex items-center justify-center text-sm text-gray-500">
          No payment method data available for this period.
        </div>
      )}
    </div>
  );
};

const safeNumber = (value: unknown): number => {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
};

export const PaymentOverviewPanel: React.FC<PaymentOverviewPanelProps> = ({
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
          <Skeleton className="h-64 rounded-2xl" />
          <Skeleton className="h-64 rounded-2xl" />
        </div>
      </div>
    );
  }

  const percentageChange = data.percentageChange ?? '0';
  const direction: StatCard['direction'] =
    safeNumber(percentageChange) > 0
      ? 'up'
      : safeNumber(percentageChange) < 0
      ? 'down'
      : 'neutral';

  const grossRevenue = safeNumber(data.totalAmount);
  const confirmed = safeNumber(data.confirmedAmount);
  const outstanding = safeNumber(data.outstandingAmount);
  const refundRate = safeNumber(data.refundRate);

  const formatChange = (value: string | undefined, suffix: string = '') => {
    const n = safeNumber(value);
    const sign = n > 0 ? '+' : '';
    return `${sign}${n}% ${comparisonLabel}${suffix}`;
  };

  const stats: StatCard[] = [
    {
      label: 'Gross Revenue',
      value: formatPrice(grossRevenue, 'NGN'),
      delta: formatChange(percentageChange, ' value'),
      direction,
    },
    {
      label: 'Confirmed',
      value: formatPrice(confirmed, 'NGN'),
      footer: 'Settled payments',
      footerTone: 'success',
    },
    {
      label: 'Refund Rate',
      value: `${refundRate}%`,
      footer: refundRate > 0 ? 'Investigate refunds' : 'No refunds',
      footerTone: refundRate > 0 ? 'danger' : 'muted',
    },
    {
      label: 'Total Outstanding',
      value: formatPrice(outstanding, 'NGN'),
      footer: outstanding > 0 ? 'Follow Up' : 'No outstanding',
      footerTone: outstanding > 0 ? 'danger' : 'muted',
    },
  ];

  const partitionRows: BarRow[] = (data.paymentPartitions ?? []).map((p) => ({
    label: p.partitionName,
    value: safeNumber(p.count),
    suffix: ' Payments',
  }));

  const breakdown = data.paymentMethodBreakdown ?? [];

  return (
    <div className="flex flex-col gap-5">
      <StatCards cards={stats} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <BarList
          title="Daily Orders"
          rows={partitionRows}
          max={Math.max(...partitionRows.map((r) => r.value), 1)}
          valueFormatter={(r) => `${r.value.toLocaleString()}`}
        />
        <PaymentMethodsChart breakdown={breakdown} />
      </div>
    </div>
  );
};
