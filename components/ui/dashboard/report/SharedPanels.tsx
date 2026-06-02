'use client';

import React, { useMemo, useState } from 'react';
import moment from 'moment';
import { useRouter } from 'next/navigation';
import { Button, Skeleton } from '@nextui-org/react';
import { FiDownload } from 'react-icons/fi';
import { IoIosArrowForward } from 'react-icons/io';
import { TbArrowsSort, TbArrowUp, TbArrowDown } from 'react-icons/tb';
import { Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  ChartOptions,
  Plugin,
} from 'chart.js';
import { formatPrice } from '@/lib/utils';
import { slugifyReportName } from '@/lib/reportRoutes';
import { ExportType } from './exportHelpers';
import { AvailableReport, BarRow, BreakdownRow, StatCard } from './types';

ChartJS.register(
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
);

export type SortDirection = 'asc' | 'desc';

export type SortableValue = string | number | boolean | null | undefined;

export interface SortState<K extends string> {
  key: K | null;
  direction: SortDirection;
}

type NoInferK<T> = [T][T extends string ? 0 : never];

export const useTableSort = <T, K extends string>(
  items: T[],
  getValue: (item: T, key: K) => SortableValue,
  initial?: { key: NoInferK<K>; direction?: SortDirection }
) => {
  const [sort, setSort] = useState<SortState<K>>({
    key: (initial?.key as K | undefined) ?? null,
    direction: initial?.direction ?? 'asc',
  });

  const sorted = useMemo(() => {
    if (!sort.key) return items;
    const key = sort.key;
    const dir = sort.direction === 'asc' ? 1 : -1;
    return [...items].sort((a, b) => {
      const av = getValue(a, key);
      const bv = getValue(b, key);
      if (av == null && bv == null) return 0;
      if (av == null) return 1;
      if (bv == null) return -1;
      let cmp = 0;
      if (typeof av === 'number' && typeof bv === 'number') {
        cmp = av - bv;
      } else {
        cmp = String(av).localeCompare(String(bv), undefined, {
          numeric: true,
          sensitivity: 'base',
        });
      }
      return cmp * dir;
    });
  }, [items, sort, getValue]);

  const toggleSort = (key: K) => {
    setSort((prev) =>
      prev.key === key
        ? { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' }
        : { key, direction: 'asc' }
    );
  };

  return { sort, sorted, toggleSort };
};

interface SortableTHProps<K extends string> {
  label: string;
  sortKey: K;
  active: K | null;
  direction: SortDirection;
  onSort: (key: K) => void;
  className?: string;
  align?: 'left' | 'right' | 'center';
}

export const SortableTH = <K extends string>({
  label,
  sortKey,
  active,
  direction,
  onSort,
  className,
  align = 'left',
}: SortableTHProps<K>) => {
  const isActive = active === sortKey;
  const alignClass =
    align === 'right'
      ? 'text-right justify-end'
      : align === 'center'
      ? 'text-center justify-center'
      : 'text-left';
  return (
    <th
      className={
        className ??
        `${alignClass} px-5 py-3 font-medium select-none whitespace-nowrap`
      }
    >
      <button
        type="button"
        onClick={() => onSort(sortKey)}
        className={`inline-flex items-center gap-1 hover:text-gray-900 transition-colors ${
          isActive ? 'text-gray-900' : 'text-gray-600'
        }`}
        aria-sort={
          isActive
            ? direction === 'asc'
              ? 'ascending'
              : 'descending'
            : 'none'
        }
      >
        <span>{label}</span>
        {isActive ? (
          direction === 'asc' ? (
            <TbArrowUp size={14} />
          ) : (
            <TbArrowDown size={14} />
          )
        ) : (
          <TbArrowsSort size={14} className="text-gray-300" />
        )}
      </button>
    </th>
  );
};

interface StatCardsProps {
  cards: StatCard[];
}

const STAT_CARD_GRID_CLASSES: Record<number, string> = {
  1: 'grid-cols-1',
  2: 'grid-cols-1 sm:grid-cols-2',
  3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
  4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
  5: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5',
  6: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6',
};

export const StatCards: React.FC<StatCardsProps> = ({ cards }) => {
  const colsClass =
    STAT_CARD_GRID_CLASSES[cards.length] ??
    'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4';
  const dense = cards.length >= 5;
  return (
    <div className={`grid ${colsClass} gap-4`}>
      {cards.map((card) => (
        <StatCardItem key={card.label} card={card} dense={dense} />
      ))}
    </div>
  );
};

interface StatCardItemProps {
  card: StatCard;
  dense?: boolean;
}

const toneClass = (tone?: StatCard['footerTone']): string => {
  switch (tone) {
    case 'success':
      return 'text-emerald-600';
    case 'danger':
      return 'text-red-500';
    case 'warning':
      return 'text-amber-600';
    case 'muted':
    default:
      return 'text-gray-500';
  }
};

export const StatCardItem: React.FC<StatCardItemProps> = ({ card, dense }) => {
  const direction = card.direction ?? 'up';
  const deltaColor =
    direction === 'down'
      ? 'text-red-500'
      : direction === 'neutral'
      ? 'text-gray-500'
      : 'text-emerald-600';
  const padding = dense ? 'p-4' : 'p-5';
  const valueSize = dense
    ? 'text-xl xl:text-2xl'
    : 'text-[28px]';
  const labelSpacing = dense ? 'mb-2' : 'mb-3';
  const valueSpacing = dense ? 'mb-2' : 'mb-3';
  return (
    <div
      className={`bg-white border border-gray-100 rounded-2xl shadow-sm ${padding}`}
    >
      <p className={`text-sm text-gray-500 ${labelSpacing}`}>{card.label}</p>
      <p
        className={`${valueSize} leading-tight font-bold text-gray-900 ${valueSpacing} break-words tabular-nums`}
      >
        {card.value}
      </p>
      {card.delta && (
        <p className={`text-xs font-medium ${deltaColor}`}>{card.delta}</p>
      )}
      {card.footer && (
        <p className={`text-xs font-medium ${toneClass(card.footerTone)}`}>
          {card.footer}
        </p>
      )}
    </div>
  );
};

interface BarListProps {
  title: string;
  rows: BarRow[];
  max?: number;
  barColor?: string;
  className?: string;
  valueFormatter?: (row: BarRow) => string;
}

export const BarList: React.FC<BarListProps> = ({
  title,
  rows,
  max,
  barColor = '#7C5BE6',
  className,
  valueFormatter,
}) => {
  const ceiling = max ?? Math.max(...rows.map((r) => r.value), 1);
  return (
    <div
      className={`bg-white border border-gray-100 rounded-2xl shadow-sm p-5 ${
        className ?? ''
      }`}
    >
      <h3 className="text-sm font-semibold text-gray-900 mb-4">{title}</h3>
      <div className="space-y-3">
        {rows.map((row) => {
          const pct = Math.max(2, Math.min(100, (row.value / ceiling) * 100));
          const display = valueFormatter
            ? valueFormatter(row)
            : `${row.value.toLocaleString()}${row.suffix ?? ''}`;
          return (
            <div key={row.label} className="flex items-center gap-3 text-sm">
              <span className="w-20 text-gray-600 shrink-0">{row.label}</span>
              <div className="flex-1 h-3 rounded-full bg-gray-100 overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${pct}%`,
                    backgroundColor: row.color ?? barColor,
                  }}
                />
              </div>
              <span className="text-xs font-medium text-gray-600 w-24 text-right shrink-0">
                {display}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

interface BreakdownListProps {
  title: string;
  rows: BreakdownRow[];
  className?: string;
}

export const BreakdownList: React.FC<BreakdownListProps> = ({
  title,
  rows,
  className,
}) => {
  return (
    <div
      className={`bg-white border border-gray-100 rounded-2xl shadow-sm p-5 ${
        className ?? ''
      }`}
    >
      <h3 className="text-sm font-semibold text-gray-900 mb-4">{title}</h3>
      <div className="divide-y divide-gray-100">
        {rows.map((row) => (
          <div
            key={row.label}
            className="flex items-center justify-between py-3 text-sm"
          >
            <span className="text-gray-600">{row.label}</span>
            <span
              className={`font-semibold ${
                row.valueClass ?? 'text-primaryColor'
              }`}
            >
              {row.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export interface InsightMetric {
  label: string;
  displayValue: string;
  fillPct: number;
  tone?: 'primary' | 'success' | 'warning' | 'danger';
  caption?: string;
}

interface InsightBarsProps {
  title: string;
  rows: InsightMetric[];
  className?: string;
}

const TONE_COLORS: Record<NonNullable<InsightMetric['tone']>, string> = {
  primary: '#7C5BE6',
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
};

export const InsightBars: React.FC<InsightBarsProps> = ({
  title,
  rows,
  className,
}) => {
  const data = {
    labels: rows.map((r) => r.label),
    datasets: [
      {
        data: rows.map((r) => Math.max(0, Math.min(100, r.fillPct))),
        backgroundColor: rows.map(
          (r) => TONE_COLORS[r.tone ?? 'primary']
        ),
        borderRadius: 6,
        borderSkipped: false as const,
        barThickness: 18,
      },
    ],
  };

  const options: ChartOptions<'bar'> = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    layout: { padding: { right: 80 } },
    scales: {
      x: {
        display: false,
        min: 0,
        max: 100,
        grid: { display: false },
      },
      y: {
        grid: { display: false },
        border: { display: false },
        ticks: {
          color: '#4B5563',
          font: { size: 12 },
          padding: 6,
        },
      },
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        titleColor: '#111827',
        bodyColor: '#374151',
        padding: 10,
        borderColor: '#e5e7eb',
        borderWidth: 1,
        callbacks: {
          label: (ctx) =>
            ` ${rows[ctx.dataIndex]?.displayValue ?? ctx.formattedValue}`,
          title: (items) => items[0]?.label ?? '',
        },
      },
    },
  };

  const valueLabelPlugin: Plugin<'bar'> = {
    id: 'insightValueLabels',
    afterDatasetsDraw(chart) {
      const ctx = chart.ctx;
      const meta = chart.getDatasetMeta(0);
      meta.data.forEach((bar, idx) => {
        const row = rows[idx];
        if (!row) return;
        const { y } = bar.tooltipPosition(true);
        ctx.save();
        ctx.fillStyle = '#111827';
        ctx.font = '600 12px ui-sans-serif, system-ui, sans-serif';
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        ctx.fillText(row.displayValue, chart.chartArea.right - 4, y);
        ctx.restore();
      });
    },
  };

  const chartHeight = Math.max(180, rows.length * 44);
  const captionRows = rows.filter((r) => r.caption);

  return (
    <div
      className={`bg-white border border-gray-100 rounded-2xl shadow-sm p-5 ${
        className ?? ''
      }`}
    >
      <h3 className="text-sm font-semibold text-gray-900 mb-4">{title}</h3>
      <div style={{ height: chartHeight }}>
        <Bar data={data} options={options} plugins={[valueLabelPlugin]} />
      </div>
      {captionRows.length > 0 && (
        <ul className="mt-3 space-y-1 border-t border-gray-100 pt-3">
          {captionRows.map((row) => (
            <li key={row.label} className="text-[11px] text-gray-500">
              <span className="font-medium text-gray-700">{row.label}:</span>{' '}
              {row.caption}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export interface DistributionSegment {
  label: string;
  value: number;
  color?: string;
}

interface DistributionDonutProps {
  title: string;
  segments: DistributionSegment[];
  emptyLabel?: string;
  centerLabel?: string;
  centerValue?: string;
  className?: string;
  caption?: string;
  valueFormatter?: (value: number) => string;
}

const DEFAULT_DONUT_COLORS = [
  '#7C5BE6',
  '#10B981',
  '#F59E0B',
  '#EF4444',
  '#3B82F6',
  '#EC4899',
  '#14B8A6',
];

export const DistributionDonut: React.FC<DistributionDonutProps> = ({
  title,
  segments,
  emptyLabel = 'No data for this period',
  centerLabel,
  centerValue,
  className,
  caption,
  valueFormatter,
}) => {
  const cleaned = segments
    .map((seg, idx) => ({
      ...seg,
      value: Number.isFinite(seg.value) && seg.value > 0 ? seg.value : 0,
      color: seg.color ?? DEFAULT_DONUT_COLORS[idx % DEFAULT_DONUT_COLORS.length],
    }))
    .filter((seg) => seg.value > 0);

  const total = cleaned.reduce((sum, seg) => sum + seg.value, 0);
  const formatValue = (value: number): string =>
    valueFormatter ? valueFormatter(value) : value.toLocaleString();

  const chartData = {
    labels: cleaned.map((s) => s.label),
    datasets: [
      {
        data: cleaned.map((s) => s.value),
        backgroundColor: cleaned.map((s) => s.color),
        borderColor: '#fff',
        borderWidth: 2,
        hoverOffset: 4,
      },
    ],
  };

  const options: ChartOptions<'doughnut'> = {
    cutout: '70%',
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        titleColor: '#111827',
        bodyColor: '#374151',
        padding: 10,
        borderColor: '#e5e7eb',
        borderWidth: 1,
        callbacks: {
          label: (ctx) => {
            const value = (ctx.raw as number) ?? 0;
            const pct = total > 0 ? (value / total) * 100 : 0;
            return ` ${ctx.label}: ${formatValue(value)} (${pct.toFixed(1)}%)`;
          },
        },
      },
    },
  };

  return (
    <div
      className={`bg-white border border-gray-100 rounded-2xl shadow-sm p-5 ${
        className ?? ''
      }`}
    >
      <h3 className="text-sm font-semibold text-gray-900 mb-4">{title}</h3>
      {total === 0 ? (
        <div className="py-8 text-center text-sm text-gray-500">
          {emptyLabel}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-5">
          <div className="relative w-[260px] h-[260px] max-w-full">
            <Doughnut data={chartData} options={options} />
            {(centerLabel || centerValue) && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none px-4">
                {centerLabel && (
                  <span className="text-[11px] uppercase tracking-wide text-gray-500">
                    {centerLabel}
                  </span>
                )}
                {centerValue && (
                  <span className="text-xl font-bold text-gray-900 leading-tight tabular-nums mt-1 break-words max-w-full">
                    {centerValue}
                  </span>
                )}
              </div>
            )}
          </div>
          <ul className="w-full flex flex-col gap-3 text-sm">
            {cleaned.map((seg) => {
              const sharePct = (seg.value / total) * 100;
              return (
                <li
                  key={seg.label}
                  className="grid grid-cols-[auto_1fr_auto] items-center gap-x-3"
                >
                  <span
                    className="h-2.5 w-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: seg.color }}
                    aria-hidden
                  />
                  <span className="flex items-baseline gap-2 min-w-0">
                    <span className="font-semibold text-gray-900 truncate">
                      {seg.label}
                    </span>
                    <span className="text-xs text-gray-500 shrink-0">
                      {sharePct.toFixed(2)}%
                    </span>
                  </span>
                  <span className="font-semibold text-gray-900 tabular-nums shrink-0">
                    {formatValue(seg.value)}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      )}
      {caption && (
        <p className="text-xs text-gray-500 mt-4 border-t border-gray-100 pt-3">
          {caption}
        </p>
      )}
    </div>
  );
};

interface ComingSoonPanelProps {
  label?: string;
}

export const ComingSoonPanel: React.FC<ComingSoonPanelProps> = ({ label }) => {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm py-20 flex items-center justify-center">
      <div className="flex flex-col items-center gap-3 text-center px-6">
        <div className="w-12 h-12 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400">
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M21 7.5l-9-5-9 5m18 0l-9 5m9-5v9l-9 5m0-14L3 7.5m9 5v9m-9-14v9l9 5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <h3 className="text-base font-semibold text-gray-700">
          Report Coming Soon
        </h3>
        <p className="text-sm text-gray-500">
          {label ?? 'This sub-report is under construction'}
        </p>
      </div>
    </div>
  );
};

const GENERIC_PAGE_SIZE = 10;
const GENERIC_WRAPPER_KEYS = new Set([
  'lastRecordDateTime',
  'hasExceededMaximumCount',
  'message',
  'availableReport',
]);
const GENERIC_COLUMN_PRESETS_BY_REPORT_TYPE: Record<number, string[]> = {
  0: [
    'customerName',
    'customerPhoneNumber',
    'orderId',
    'totalAmount',
    'treatedBy',
    'paymentMethod',
    'orderStatus',
    'dateCreated',
  ],
  1: [
    'itemName',
    'menuName',
    'totalQuantitySold',
    'currentPrice',
    'netSalesAmount',
    'totalPackagingAmount',
    'grossSalesAmount',
    'isCurrentlyAvailable',
  ],
  2: [
    'customerName',
    'customerPhoneNumber',
    'numberOfOrders',
    'totalPurchaseAmount',
  ],
  3: [
    'firstName',
    'lastName',
    'emailAddress',
    'numberOfOrders',
    'pendingSales',
    'confirmedSales',
    'totalSales',
    'dateUpdated',
  ],
  4: [
    'customer',
    'orderId',
    'treatedBy',
    'totalAmount',
    'quickResponseName',
    'paymentMethod',
    'paymentDirection',
    'paymentType',
    'paymentReference',
    'confirmedBy',
    'status',
    'dateCreated',
  ],
  5: [
    'paymentMethod',
    'numberOfPayments',
    'creditCount',
    'debitCount',
    'totalCredits',
    'totalDebits',
    'netAmountProcessed',
    'lastRecordDateTime',
  ],
  6: [
    'quickResponseName',
    'numberOfOrders',
    'pendingSalesAmount',
    'confirmedSalesAmount',
    'totalSalesAmount',
    'totalRefundAmount',
    'grossSalesAmount',
    'dateUpdated',
  ],
  7: [
    'firstName',
    'phoneNumber',
    'emailAddress',
    'bookingFee',
    'bookingDateTime',
    'bookingStatus',
  ],
  8: ['reservationName', 'totalBookingFee', 'totalBookings', 'dateUpdated'],
  9: [
    'customerFirstName',
    'customerLastName',
    'customerPhoneNumber',
    'customerEmailAddress',
    'totalBookingFee',
    'totalBookings',
  ],
  10: [
    'reservationName',
    'reservationCapacity',
    'occupancyRate',
    'totalBookings',
    'averageDailyUtilization',
    'lastRecordDateTime',
  ],
  11: [
    'userName',
    'emailAddress',
    'ipAddress',
    'activity',
    'dateCreated',
    'isSuccessful',
  ],
  12: [
    'fullName',
    'emailAddress',
    'firstLoginTime',
    'lastSeenTime',
    'activePeriod',
    'date',
  ],
  13: ['totalAmount', 'numberOfOrders', 'orderStatus'],
  14: [
    'categoryName',
    'totalOrders',
    'totalItemsSold',
    'totalAmount',
    'percentageOfTotalSales',
  ],
  15: [
    'orderId',
    'orderDate',
    'customer',
    'orderTotal',
    'totalPaid',
    'totalRefunded',
    'outstanding',
    'paymentStatus',
    'orderStatus',
  ],
  16: ['orderId', 'orderTotal', 'paidSoFar', 'remaining', 'lastPaymentDate'],
  17: [
    'orderId',
    'customer',
    'refundAmount',
    'refundReason',
    'approvedBy',
    'date',
  ],
  18: ['date', 'totalCredits', 'totalDebits', 'netMovement'],
  19: ['period', 'netRevenue'],
  20: [
    'orderId',
    'customer',
    'orderDate',
    'orderTotal',
    'totalPaid',
    'outstanding',
    'treatedBy',
  ],
  21: [
    'itemName',
    'itemType',
    'supplierName',
    'unitName',
    'quantityOnHand',
    'reorderLevel',
    'averageCostPerUnit',
    'stockValue',
    'lastRestocked',
    'status',
  ],
  22: [
    'dateCreated',
    'itemName',
    'movementType',
    'transactionType',
    'quantityChange',
    'unitName',
    'costPerUnit',
    'value',
    'reason',
    'performedBy',
  ],
  23: [
    'date',
    'itemName',
    'adjustmentType',
    'quantityWasted',
    'costImpact',
    'reason',
    'performedBy',
  ],
  30: [
    'qrName',
    'orderCount',
    'openOrders',
    'averageOrderValue',
    'netRevenue',
    'refundAmount',
    'status',
    'lastOrderDateTime',
  ],
  31: [
    'orderId',
    'customerName',
    'quickResponseName',
    'paymentMethod',
    'totalAmount',
    'orderStatus',
    'dateCreated',
  ],
  32: ['occurredAt', 'qrName', 'eventType', 'orderId', 'amount', 'performedBy'],
};
const GENERIC_COLUMN_PRESETS_BY_REPORT_NAME: Record<string, string[]> = {
  'customer-order-history': GENERIC_COLUMN_PRESETS_BY_REPORT_TYPE[2],
  'order-status-sales': GENERIC_COLUMN_PRESETS_BY_REPORT_TYPE[13],
  'partial-payment': GENERIC_COLUMN_PRESETS_BY_REPORT_TYPE[16],
  'refund-history': GENERIC_COLUMN_PRESETS_BY_REPORT_TYPE[17],
};
const GENERIC_COLUMN_PRESETS_BY_TABLE_KEY: Record<string, string[]> = {
  customers: GENERIC_COLUMN_PRESETS_BY_REPORT_TYPE[2],
  orders: GENERIC_COLUMN_PRESETS_BY_REPORT_TYPE[0],
  items: GENERIC_COLUMN_PRESETS_BY_REPORT_TYPE[1],
  categories: GENERIC_COLUMN_PRESETS_BY_REPORT_TYPE[14],
  orderPayments: GENERIC_COLUMN_PRESETS_BY_REPORT_TYPE[15],
  orderRefunds: GENERIC_COLUMN_PRESETS_BY_REPORT_TYPE[17],
  payments: GENERIC_COLUMN_PRESETS_BY_REPORT_TYPE[4],
  qrOrders: GENERIC_COLUMN_PRESETS_BY_REPORT_TYPE[6],
  cashMovements: GENERIC_COLUMN_PRESETS_BY_REPORT_TYPE[18],
  netRevenues: GENERIC_COLUMN_PRESETS_BY_REPORT_TYPE[19],
  outstandingReceivables: GENERIC_COLUMN_PRESETS_BY_REPORT_TYPE[20],
  bookings: GENERIC_COLUMN_PRESETS_BY_REPORT_TYPE[7],
  reservationBookings: GENERIC_COLUMN_PRESETS_BY_REPORT_TYPE[8],
  customerBookings: GENERIC_COLUMN_PRESETS_BY_REPORT_TYPE[9],
  dailyOccupancyUtilizations: GENERIC_COLUMN_PRESETS_BY_REPORT_TYPE[10],
  auditLogs: GENERIC_COLUMN_PRESETS_BY_REPORT_TYPE[11],
  userDailyActivePeriods: GENERIC_COLUMN_PRESETS_BY_REPORT_TYPE[12],
  qrPerformanceSummaries: GENERIC_COLUMN_PRESETS_BY_REPORT_TYPE[30],
  qrOrderHistories: GENERIC_COLUMN_PRESETS_BY_REPORT_TYPE[31],
  qrActivityTimelines: GENERIC_COLUMN_PRESETS_BY_REPORT_TYPE[32],
};
const MONEY_KEY_REGEX =
  /amount|revenue|sales|cost|cogs|profit|price|value|fee|payment|spend|outstanding|refund/i;
const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}T/;

const titleCase = (key: string): string =>
  key
    .replace(/[_-]+/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase());

const isPlainObject = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v);

const isObjectArray = (
  v: unknown
): v is Record<string, unknown>[] =>
  Array.isArray(v) && v.length > 0 && v.every(isPlainObject);

const normalizePresetKey = (value: string): string =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const mergeColumnPreset = (
  detectedColumns: string[],
  reportName: string,
  reportType?: number,
  tableKey?: string | null
): string[] => {
  const preset =
    (typeof reportType === 'number'
      ? GENERIC_COLUMN_PRESETS_BY_REPORT_TYPE[reportType]
      : undefined) ??
    GENERIC_COLUMN_PRESETS_BY_REPORT_NAME[normalizePresetKey(reportName)] ??
    (tableKey ? GENERIC_COLUMN_PRESETS_BY_TABLE_KEY[tableKey] : undefined);

  if (!preset) return detectedColumns;

  // With no data we can't validate the preset, so use it for header display.
  if (detectedColumns.length === 0) return preset;

  // A preset only orders/selects columns that genuinely exist in the data. Any
  // preset column absent from the rows (e.g. the generic `items` fallback
  // applied to an unmapped report) is dropped so it never renders as a column
  // of "—". Detected columns not covered by the preset are appended afterwards.
  const orderedPresetColumns = preset.filter((column) =>
    detectedColumns.includes(column)
  );
  const extraColumns = detectedColumns.filter(
    (column) => !preset.includes(column)
  );
  return [...orderedPresetColumns, ...extraColumns];
};

const formatCell = (key: string, value: unknown): string => {
  if (value === null || value === undefined || value === '') return '—';
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (typeof value === 'number') {
    if (MONEY_KEY_REGEX.test(key)) return formatPrice(value, 'NGN');
    return value.toLocaleString();
  }
  if (typeof value === 'string') {
    if (ISO_DATE_REGEX.test(value)) {
      const m = moment(value);
      return m.isValid() ? m.format('DD MMM YYYY HH:mm') : value;
    }
    if (MONEY_KEY_REGEX.test(key)) {
      const n = Number(value);
      if (Number.isFinite(n)) return formatPrice(n, 'NGN');
    }
    return value;
  }
  if (isPlainObject(value) || Array.isArray(value)) {
    try {
      return JSON.stringify(value);
    } catch {
      return String(value);
    }
  }
  return String(value);
};

const sortableValueFromCell = (
  key: string,
  value: unknown
): string | number => {
  if (value === null || value === undefined) return '';
  if (typeof value === 'number') return value;
  if (typeof value === 'boolean') return value ? 1 : 0;
  if (typeof value === 'string') {
    if (ISO_DATE_REGEX.test(value)) {
      const t = Date.parse(value);
      return Number.isFinite(t) ? t : 0;
    }
    if (MONEY_KEY_REGEX.test(key)) {
      const n = Number(value);
      if (Number.isFinite(n)) return n;
    }
    return value;
  }
  return String(value);
};

interface GenericReportPanelProps {
  reportName: string;
  reportType?: number;
  data?: Record<string, unknown> | unknown[] | null;
  isLoading?: boolean;
  onExport?: (exportType: number) => void | Promise<void>;
  isExporting?: boolean;
}

/**
 * Heuristic data-driven panel for dynamically-discovered "extra" sub-tabs.
 *
 * Accepts either a wrapper object (e.g. `{ items: [...], availableReport: [...] }`)
 * or a bare array of row objects. In wrapper mode, inspects fields and renders the
 * first array of objects as a sortable, paginated table; renders scalar numeric
 * fields as stat cards; surfaces `message` as a header subtitle. Empty report
 * responses still render the table shell so users see "no data" instead of a
 * placeholder for unfinished work.
 */
export const GenericReportPanel: React.FC<GenericReportPanelProps> = ({
  reportName,
  reportType,
  data,
  isLoading,
  onExport,
  isExporting,
}) => {
  const [page, setPage] = useState(1);

  const { tableKey, rows, columns, statCards, message } = useMemo(() => {
    const result: {
      tableKey: string | null;
      rows: Record<string, unknown>[];
      columns: string[];
      statCards: StatCard[];
      message: string | null;
    } = {
      tableKey: null,
      rows: [],
      columns: [],
      statCards: [],
      message: null,
    };
    if (!data) {
      result.columns = mergeColumnPreset([], reportName, reportType);
      return result;
    }

    if (isObjectArray(data)) {
      result.tableKey = 'items';
      result.rows = data;
      result.columns = mergeColumnPreset(
        Object.keys(data[0]),
        reportName,
        reportType,
        result.tableKey
      );
      return result;
    }

    if (Array.isArray(data)) {
      result.tableKey = 'items';
      // Keep any object rows rather than discarding the whole array when the
      // first element is atypical (e.g. a null/scalar slipped in).
      const objectRows = data.filter(isPlainObject) as Record<
        string,
        unknown
      >[];
      result.rows = objectRows;
      result.columns = mergeColumnPreset(
        objectRows.length > 0 ? Object.keys(objectRows[0]) : [],
        reportName,
        reportType,
        result.tableKey
      );
      return result;
    }

    if (!isPlainObject(data)) return result;

    Object.entries(data).forEach(([key, value]) => {
      if (key === 'message' && typeof value === 'string') {
        result.message = value;
        return;
      }
      if (GENERIC_WRAPPER_KEYS.has(key)) return;
      if (
        isObjectArray(value) &&
        (!result.tableKey || result.rows.length === 0)
      ) {
        result.tableKey = key;
        result.rows = value;
        result.columns = Object.keys(value[0]);
        return;
      }
      if (Array.isArray(value) && value.length === 0 && !result.tableKey) {
        result.tableKey = key;
        return;
      }
      if (typeof value === 'number' && Number.isFinite(value)) {
        result.statCards.push({
          label: titleCase(key),
          value: MONEY_KEY_REGEX.test(key)
            ? formatPrice(value, 'NGN')
            : value.toLocaleString(),
          footerTone: 'muted',
        });
      }
    });
    result.columns = mergeColumnPreset(
      result.columns,
      reportName,
      reportType,
      result.tableKey
    );
    return result;
  }, [data, reportName, reportType]);

  const getValue = React.useCallback(
    (row: Record<string, unknown>, key: string): string | number =>
      sortableValueFromCell(key, row[key]),
    []
  );

  const initialSortKey = columns[0] ?? '';
  const { sort, sorted, toggleSort } = useTableSort<
    Record<string, unknown>,
    string
  >(rows, getValue, initialSortKey ? { key: initialSortKey } : undefined);

  const totalPages = Math.max(1, Math.ceil(sorted.length / GENERIC_PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageRows = sorted.slice(
    (safePage - 1) * GENERIC_PAGE_SIZE,
    safePage * GENERIC_PAGE_SIZE
  );

  if (isLoading) {
    return (
      <div className="flex flex-col gap-5">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-28 rounded-2xl" />
          ))}
        </div>
        <Skeleton className="h-96 rounded-2xl" />
      </div>
    );
  }

  const shouldRenderTable =
    rows.length > 0 ||
    columns.length > 0 ||
    Boolean(tableKey) ||
    statCards.length === 0;

  const handleExportExcel = onExport
    ? () => onExport(ExportType.Excel)
    : undefined;
  const handleExportPdf = onExport
    ? () => onExport(ExportType.Pdf)
    : undefined;

  return (
    <div className="flex flex-col gap-5">
      {statCards.length > 0 && <StatCards cards={statCards} />}

      {shouldRenderTable && (
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between flex-wrap gap-3 px-5 py-4">
            <div className="flex items-center gap-3 flex-wrap">
              <h3 className="text-base font-semibold text-gray-900">
                {reportName}
              </h3>
              <span className="text-xs text-gray-500">
                {rows.length.toLocaleString()} rows
              </span>
              {message && (
                <span className="text-xs text-gray-500 italic">{message}</span>
              )}
            </div>
            {onExport && (
              <div className="flex items-center gap-2 px-1 py-1">
                <Button
                  variant="bordered"
                  onPress={handleExportExcel}
                  isLoading={isExporting}
                  startContent={
                    isExporting ? null : <FiDownload size={14} />
                  }
                  className="border border-gray-200 text-gray-700 bg-white rounded-lg text-xs h-9"
                >
                  Export Excel
                </Button>
                <Button
                  onPress={handleExportPdf}
                  isLoading={isExporting}
                  startContent={
                    isExporting ? null : <FiDownload size={14} />
                  }
                  className="bg-primaryColor text-white rounded-lg text-xs h-9"
                >
                  Export PDF
                </Button>
              </div>
            )}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              {columns.length > 0 && (
                <thead className="bg-gray-50 text-gray-600">
                  <tr>
                    {columns.map((col) => (
                      <SortableTH
                        key={col}
                        label={titleCase(col)}
                        sortKey={col}
                        active={sort.key}
                        direction={sort.direction}
                        onSort={toggleSort}
                      />
                    ))}
                  </tr>
                </thead>
              )}
              <tbody className="divide-y divide-gray-100">
                {pageRows.length === 0 ? (
                  <tr>
                    <td
                      colSpan={Math.max(columns.length, 1)}
                      className="px-5 py-8 text-center text-sm text-gray-500"
                    >
                      No data for this period
                    </td>
                  </tr>
                ) : (
                  pageRows.map((row, rowIdx) => (
                    <tr
                      key={`${tableKey}-${rowIdx}`}
                      className="hover:bg-gray-50"
                    >
                      {columns.map((col, colIdx) => (
                        <td
                          key={col}
                          className={`px-5 py-4 ${
                            colIdx === 0
                              ? 'text-gray-900 font-medium'
                              : 'text-gray-700'
                          }`}
                        >
                          {formatCell(col, row[col])}
                        </td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {sorted.length > GENERIC_PAGE_SIZE && (
            <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 text-xs text-gray-600">
              <span>
                Page {safePage} of {totalPages}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="h-8 px-3 rounded-lg border border-gray-200 disabled:opacity-50"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={safePage <= 1}
                >
                  Prev
                </button>
                <button
                  type="button"
                  className="h-8 px-3 rounded-lg border border-gray-200 disabled:opacity-50"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={safePage >= totalPages}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

type DrillDownRoute = 'orders' | 'payments' | 'bookings' | 'users' | 'inventory';

interface AvailableReportsListProps {
  reports?: AvailableReport[];
  route: DrillDownRoute;
  className?: string;
  title?: string;
}

export const AvailableReportsList: React.FC<AvailableReportsListProps> = ({
  reports,
  route,
  className,
  title = 'Available Reports',
}) => {
  const router = useRouter();
  const items = reports ?? [];

  const handleClick = (report: AvailableReport) => {
    const slug = slugifyReportName(report.reportName);
    if (route === 'inventory') {
      const params = new URLSearchParams({ module: 'inventory', sub: slug });
      router.push(`/report?${params.toString()}`);
      return;
    }
    router.push(`/dashboard/reports/${route}/${slug}`);
  };

  return (
    <div
      className={`bg-white border border-gray-100 rounded-2xl shadow-sm p-5 ${
        className ?? ''
      }`}
    >
      <h3 className="text-sm font-semibold text-gray-900 mb-3">{title}</h3>
      {items.length === 0 ? (
        <p className="text-sm text-gray-500 py-4 text-center">
          No reports available
        </p>
      ) : (
        <div className="divide-y divide-gray-100">
          {items.map((report) => (
            <button
              key={`${report.reportType}-${report.reportName}`}
              type="button"
              onClick={() => handleClick(report)}
              className="w-full flex items-center justify-between py-3 text-sm text-gray-700 hover:text-primaryColor transition-colors text-left"
            >
              <span>{report.reportName}</span>
              <IoIosArrowForward className="text-gray-400 shrink-0" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

interface DonutSegment {
  label: string;
  value: number;
  color: string;
}

interface DonutChartProps {
  title: string;
  segments: DonutSegment[];
  className?: string;
}

export const DonutChart: React.FC<DonutChartProps> = ({
  title,
  segments,
  className,
}) => {
  const total = segments.reduce((sum, s) => sum + s.value, 0) || 1;
  let accumulated = 0;
  const radius = 70;
  const stroke = 24;
  const circumference = 2 * Math.PI * radius;

  return (
    <div
      className={`bg-white border border-gray-100 rounded-2xl shadow-sm p-5 ${
        className ?? ''
      }`}
    >
      <h3 className="text-sm font-semibold text-gray-900 mb-4">{title}</h3>
      <div className="flex items-center gap-6 flex-wrap">
        <svg width="180" height="180" viewBox="0 0 180 180">
          <g transform="translate(90,90) rotate(-90)">
            <circle
              r={radius}
              fill="transparent"
              stroke="#F1F2F5"
              strokeWidth={stroke}
            />
            {segments.map((seg) => {
              const length = (seg.value / total) * circumference;
              const offset = circumference - accumulated;
              accumulated += length;
              return (
                <circle
                  key={seg.label}
                  r={radius}
                  fill="transparent"
                  stroke={seg.color}
                  strokeWidth={stroke}
                  strokeDasharray={`${length} ${circumference - length}`}
                  strokeDashoffset={offset}
                />
              );
            })}
          </g>
        </svg>
        <ul className="space-y-2 text-sm">
          {segments.map((seg) => (
            <li key={seg.label} className="flex items-center gap-2">
              <span
                className="inline-block h-3 w-3 rounded-full"
                style={{ backgroundColor: seg.color }}
              />
              <span className="text-gray-700">{seg.label}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
