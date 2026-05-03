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
import {
  AvailableReportsList,
  BarList,
  StatCards,
} from './SharedPanels';
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
}

interface PaymentMethodsChartProps {
  breakdown: PaymentMethodBreakdownItem[];
}

const PaymentMethodsChart: React.FC<PaymentMethodsChartProps> = ({ breakdown }) => {
  const hasData = breakdown.some((item) => (item.amount ?? 0) > 0 || (item.count ?? 0) > 0);

  const chartData = {
    labels: breakdown.map((item) => item.method),
    datasets: [
      {
        data: breakdown.map((item) => item.amount ?? 0),
        backgroundColor: breakdown.map(
          (_, index) => METHOD_COLORS[index % METHOD_COLORS.length]
        ),
        borderWidth: 0,
        hoverOffset: 4,
      },
    ],
  };

  const chartOptions = {
    cutout: '70%',
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
            const item = breakdown[context.dataIndex];
            return ` ${item.method}: ${formatPrice(item.amount ?? 0, 'NGN')} (${
              item.sharePct ?? 0
            }%)`;
          },
        },
      },
    },
    maintainAspectRatio: false,
  };

  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5 flex flex-col gap-4">
      <h3 className="text-base font-semibold text-gray-900">Methods of Payment</h3>
      {hasData ? (
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="relative w-[180px] h-[180px] shrink-0">
            <Doughnut data={chartData} options={chartOptions} />
          </div>
          <ul className="flex flex-col gap-3 flex-1 w-full">
            {breakdown.map((item, index) => (
              <li
                key={item.method}
                className="flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{
                      backgroundColor:
                        METHOD_COLORS[index % METHOD_COLORS.length],
                    }}
                  />
                  <span className="text-sm font-medium text-gray-700">
                    {item.method}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-500">
                    {item.sharePct ?? 0}%
                  </span>
                  <span className="text-sm font-semibold text-gray-900">
                    {formatPrice(item.amount ?? 0, 'NGN')}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="py-12 flex items-center justify-center text-sm text-gray-500">
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
    return `${sign}${n}% from yesterday${suffix}`;
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
      <AvailableReportsList
        reports={data.availableReport}
        route="payments"
        title="Available Payment Reports"
      />
    </div>
  );
};
