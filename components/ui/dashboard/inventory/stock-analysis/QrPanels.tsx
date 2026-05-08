'use client';

import React, { useMemo, useState } from 'react';
import moment from 'moment';
import { Button, Skeleton } from '@nextui-org/react';
import { FiDownload } from 'react-icons/fi';
import { formatPrice } from '@/lib/utils';
import { BarList, SortableTH, StatCards, useTableSort } from './SharedPanels';
import { TablePagination } from './SalesPanels';
import { ExportType } from './exportHelpers';
import {
  BarRow,
  QrDetailsSection,
  QrPerformanceItem,
  QrReportResponse,
  QrTopItem,
  StatCard,
} from './types';

const PAGE_SIZE = 10;

const safeNumber = (value: unknown): number => {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
};

const formatNgn = (value: number): string => formatPrice(value, 'NGN');

const formatPercentage = (value: number): string => {
  if (!Number.isFinite(value)) return '0%';
  return `${value.toFixed(value >= 10 ? 0 : 2)}%`;
};

interface QrPanelProps {
  data?: QrReportResponse;
  isLoading?: boolean;
  onExport?: (exportType: number) => void | Promise<void>;
  isExporting?: boolean;
}

const Skeletonized: React.FC = () => (
  <div className="flex flex-col gap-5">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {[0, 1, 2, 3].map((i) => (
        <Skeleton key={i} className="h-28 rounded-2xl" />
      ))}
    </div>
    <Skeleton className="h-64 rounded-2xl" />
  </div>
);

interface ExportButtonsProps {
  onExportExcel?: () => void;
  onExportPdf?: () => void;
  isLoading?: boolean;
}

const ExportButtons: React.FC<ExportButtonsProps> = ({
  onExportExcel,
  onExportPdf,
  isLoading,
}) => (
  <div className="flex items-center gap-2 px-5 py-4">
    <Button
      variant="bordered"
      onPress={onExportExcel}
      isLoading={isLoading}
      startContent={isLoading ? null : <FiDownload size={14} />}
      className="border border-gray-200 text-gray-700 bg-white rounded-lg text-xs h-9"
    >
      Exp Excel
    </Button>
    <Button
      onPress={onExportPdf}
      isLoading={isLoading}
      startContent={isLoading ? null : <FiDownload size={14} />}
      className="bg-primaryColor text-white rounded-lg text-xs h-9"
    >
      Exp PDF
    </Button>
  </div>
);

const buildExportHandlers = (
  onExport?: (exportType: number) => void | Promise<void>
) => ({
  onExportExcel: onExport ? () => onExport(ExportType.Excel) : undefined,
  onExportPdf: onExport ? () => onExport(ExportType.Pdf) : undefined,
});

const tonalDelta = (
  percentageChange: string | undefined
): { delta: string; direction: 'up' | 'down' | 'neutral' } => {
  if (!percentageChange) {
    return { delta: '0%', direction: 'neutral' };
  }
  const numeric = safeNumber(percentageChange);
  if (numeric === 0) return { delta: '0%', direction: 'neutral' };
  const sign = numeric > 0 ? '+' : '';
  return {
    delta: `${sign}${numeric}%`,
    direction: numeric > 0 ? 'up' : 'down',
  };
};

interface TopQrCardProps {
  title: string;
  item: QrTopItem | null;
  metricLabel: string;
  metricValue: string;
}

const TopQrCard: React.FC<TopQrCardProps> = ({
  title,
  item,
  metricLabel,
  metricValue,
}) => (
  <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5">
    <p className="text-xs uppercase tracking-wide text-gray-500 mb-2">
      {title}
    </p>
    {item ? (
      <>
        <p className="text-lg font-semibold text-gray-900 mb-3 break-words">
          {item.qrName}
        </p>
        <div className="space-y-1.5 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-gray-500">{metricLabel}</span>
            <span className="font-semibold text-primaryColor">
              {metricValue}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-500">Orders</span>
            <span className="text-gray-700">
              {item.orderCount.toLocaleString()}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-500">Avg. Order Value</span>
            <span className="text-gray-700">
              {formatNgn(safeNumber(item.averageOrderValue))}
            </span>
          </div>
          {item.lastOrderDateTime && (
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500">Last Order</span>
              <span className="text-gray-700">
                {moment(item.lastOrderDateTime).format('DD MMM YYYY')}
              </span>
            </div>
          )}
        </div>
      </>
    ) : (
      <p className="text-sm text-gray-500 py-4">No data for this period</p>
    )}
  </div>
);

export const QrOverviewPanel: React.FC<QrPanelProps> = ({ data, isLoading }) => {
  const qrDetails: QrDetailsSection | undefined = data?.qrDetails;

  const topRows = useMemo<BarRow[]>(() => {
    const list = data?.qrPerformanceSummaries ?? [];
    return list
      .slice()
      .sort((a, b) => safeNumber(b.orderCount) - safeNumber(a.orderCount))
      .slice(0, 6)
      .map((row) => ({
        label: row.qrName,
        value: safeNumber(row.orderCount),
        suffix: ' Orders',
      }));
  }, [data]);

  if (isLoading) return <Skeletonized />;

  const totalQRCodes = safeNumber(qrDetails?.totalQRCodes);
  const activeQRCodes = safeNumber(qrDetails?.activeQRCodes);
  const idleQRCodes = safeNumber(qrDetails?.idleQRCodes);
  const totalQROrders = safeNumber(qrDetails?.totalQROrders);
  const totalQRRevenue = safeNumber(qrDetails?.totalQRRevenue);
  const averageOrdersPerActiveQR = safeNumber(
    qrDetails?.averageOrdersPerActiveQR
  );
  const topQRConcentrationPct = safeNumber(qrDetails?.topQRConcentrationPct);
  const revenueDelta = tonalDelta(qrDetails?.percentageChange);

  const stats: StatCard[] = [
    {
      label: 'Total QR Codes',
      value: totalQRCodes.toLocaleString(),
      footer: `${activeQRCodes.toLocaleString()} active · ${idleQRCodes.toLocaleString()} idle`,
      footerTone: activeQRCodes > 0 ? 'success' : 'muted',
    },
    {
      label: 'Total QR Orders',
      value: totalQROrders.toLocaleString(),
      footer: `Avg ${averageOrdersPerActiveQR.toFixed(2)} per active QR`,
      footerTone: 'muted',
    },
    {
      label: 'QR Revenue',
      value: formatNgn(totalQRRevenue),
      delta: revenueDelta.delta,
      direction: revenueDelta.direction,
      footer: 'vs. previous period',
      footerTone: 'muted',
    },
    {
      label: 'Top QR Concentration',
      value: formatPercentage(topQRConcentrationPct),
      footer: 'Share of orders by top QR',
      footerTone: topQRConcentrationPct >= 50 ? 'warning' : 'muted',
    },
  ];

  const hasAnyTop =
    qrDetails?.topByRevenue ||
    qrDetails?.topByOrders ||
    qrDetails?.topByAverageOrderValue;

  return (
    <div className="flex flex-col gap-5">
      <StatCards cards={stats} />

      {hasAnyTop && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <TopQrCard
            title="Top QR by Revenue"
            item={qrDetails?.topByRevenue ?? null}
            metricLabel="Net Revenue"
            metricValue={formatNgn(
              safeNumber(qrDetails?.topByRevenue?.netRevenue)
            )}
          />
          <TopQrCard
            title="Top QR by Orders"
            item={qrDetails?.topByOrders ?? null}
            metricLabel="Order Count"
            metricValue={safeNumber(
              qrDetails?.topByOrders?.orderCount
            ).toLocaleString()}
          />
          <TopQrCard
            title="Top QR by Avg. Order Value"
            item={qrDetails?.topByAverageOrderValue ?? null}
            metricLabel="Avg. Order Value"
            metricValue={formatNgn(
              safeNumber(qrDetails?.topByAverageOrderValue?.averageOrderValue)
            )}
          />
        </div>
      )}

      {topRows.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-1 gap-5">
          <BarList
            title="Top QR Codes by Orders"
            rows={topRows}
            max={Math.max(...topRows.map((r) => r.value), 1)}
            valueFormatter={(r) => `${r.value.toLocaleString()} Orders`}
          />
        </div>
      )}
    </div>
  );
};

interface QrDetailRow {
  qrName: string;
  orders: number;
  openOrders: number;
  averageValue: number;
  netRevenue: number;
  refunds: number;
  status: 'Active' | 'Inactive';
}

const buildDetailRows = (
  performance: QrPerformanceItem[]
): QrDetailRow[] => {
  return performance.map((row) => {
    const orders = safeNumber(row.orderCount);
    const status = (() => {
      if (typeof row.status === 'string') {
        const s = row.status.toLowerCase();
        if (s === 'active') return 'Active' as const;
        if (s === 'inactive' || s === 'idle') return 'Inactive' as const;
      }
      return orders > 0 ? ('Active' as const) : ('Inactive' as const);
    })();
    return {
      qrName: row.qrName ?? 'Unknown',
      orders,
      openOrders: safeNumber(row.openOrders),
      averageValue: safeNumber(row.averageOrderValue),
      netRevenue: safeNumber(row.netRevenue),
      refunds: safeNumber(row.refundAmount ?? row.cancelledOrders),
      status,
    };
  });
};

export const QrDetailsPanel: React.FC<QrPanelProps> = ({
  data,
  isLoading,
  onExport,
  isExporting,
}) => {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const exportHandlers = buildExportHandlers(onExport);
  const performance = data?.qrPerformanceSummaries ?? [];

  const allRows = useMemo(() => buildDetailRows(performance), [performance]);

  const counts = useMemo(() => {
    let active = 0;
    let inactive = 0;
    allRows.forEach((r) => {
      if (r.status === 'Active') active += 1;
      else inactive += 1;
    });
    return { active, inactive };
  }, [allRows]);

  const filteredRows = useMemo(() => {
    if (statusFilter === 'all') return allRows;
    if (statusFilter === 'active')
      return allRows.filter((r) => r.status === 'Active');
    if (statusFilter === 'inactive')
      return allRows.filter((r) => r.status === 'Inactive');
    return allRows;
  }, [allRows, statusFilter]);

  const getQrDetailValue = React.useCallback(
    (
      r: QrDetailRow,
      key:
        | 'qrName'
        | 'orders'
        | 'openOrders'
        | 'averageValue'
        | 'netRevenue'
        | 'refunds'
        | 'status'
    ) => r[key] as string | number,
    []
  );

  const { sort, sorted, toggleSort } = useTableSort(
    filteredRows,
    getQrDetailValue,
    { key: 'orders', direction: 'desc' }
  );

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageRows = sorted.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE
  );

  if (isLoading) {
    return (
      <div className="flex flex-col gap-5">
        <Skeleton className="h-96 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm">
        <div className="flex items-center justify-between flex-wrap gap-3 px-5 py-4">
          <div className="flex items-center gap-3 flex-wrap">
            <h3 className="text-base font-semibold text-gray-900">
              QR Code Details
            </h3>
            <span className="text-xs text-gray-500">
              {allRows.length.toLocaleString()} total
            </span>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="text-xs h-9 px-3 rounded-lg border border-gray-200 text-gray-700 bg-white focus:outline-none focus:border-primaryColor"
            >
              <option value="all">All QR codes</option>
              <option value="active">Active ({counts.active})</option>
              <option value="inactive">Inactive ({counts.inactive})</option>
            </select>
          </div>
          <ExportButtons {...exportHandlers} isLoading={isExporting} />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <SortableTH
                  label="QR Name"
                  sortKey="qrName"
                  active={sort.key}
                  direction={sort.direction}
                  onSort={toggleSort}
                />
                <SortableTH
                  label="Orders"
                  sortKey="orders"
                  active={sort.key}
                  direction={sort.direction}
                  onSort={toggleSort}
                />
                <SortableTH
                  label="Open Orders"
                  sortKey="openOrders"
                  active={sort.key}
                  direction={sort.direction}
                  onSort={toggleSort}
                />
                <SortableTH
                  label="Average Value"
                  sortKey="averageValue"
                  active={sort.key}
                  direction={sort.direction}
                  onSort={toggleSort}
                />
                <SortableTH
                  label="Net Revenue"
                  sortKey="netRevenue"
                  active={sort.key}
                  direction={sort.direction}
                  onSort={toggleSort}
                />
                <SortableTH
                  label="Refunds"
                  sortKey="refunds"
                  active={sort.key}
                  direction={sort.direction}
                  onSort={toggleSort}
                />
                <SortableTH
                  label="Status"
                  sortKey="status"
                  active={sort.key}
                  direction={sort.direction}
                  onSort={toggleSort}
                />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {pageRows.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-5 py-8 text-center text-sm text-gray-500"
                  >
                    No QR code activity for this period
                  </td>
                </tr>
              ) : (
                pageRows.map((row) => (
                  <tr key={row.qrName} className="hover:bg-gray-50">
                    <td className="px-5 py-4 text-gray-900 font-medium">
                      {row.qrName}
                    </td>
                    <td className="px-5 py-4 text-gray-700">
                      {row.orders.toLocaleString()}
                    </td>
                    <td className="px-5 py-4 text-gray-700">
                      {row.openOrders.toLocaleString()}
                    </td>
                    <td className="px-5 py-4 text-gray-700">
                      {formatNgn(row.averageValue)}
                    </td>
                    <td className="px-5 py-4 text-gray-700">
                      {formatNgn(row.netRevenue)}
                    </td>
                    <td className="px-5 py-4 text-gray-700">
                      {row.refunds.toLocaleString()}
                    </td>
                    <td
                      className={`px-5 py-4 font-medium ${
                        row.status === 'Active'
                          ? 'text-emerald-600'
                          : 'text-red-500'
                      }`}
                    >
                      {row.status}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {sorted.length > 0 && (
          <TablePagination
            currentPage={safePage}
            totalPages={totalPages}
            onChange={setPage}
          />
        )}
      </div>
    </div>
  );
};
