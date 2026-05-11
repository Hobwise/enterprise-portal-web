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
  OrderReportItem,
  QrActivityTimelineItem,
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

type OrderHistorySortKey =
  | 'orderId'
  | 'customerName'
  | 'quickResponseName'
  | 'paymentMethod'
  | 'totalAmount'
  | 'orderStatus'
  | 'dateCreated';

export const QrOrderHistoryPanel: React.FC<QrPanelProps> = ({
  data,
  isLoading,
  onExport,
  isExporting,
}) => {
  const [page, setPage] = useState(1);
  const exportHandlers = buildExportHandlers(onExport);
  const rows: OrderReportItem[] = data?.qrOrderHistories ?? [];

  const getValue = React.useCallback(
    (row: OrderReportItem, key: OrderHistorySortKey): string | number => {
      if (key === 'totalAmount') return safeNumber(row.totalAmount);
      if (key === 'dateCreated') {
        const t = Date.parse(row.dateCreated ?? '');
        return Number.isFinite(t) ? t : 0;
      }
      const v = row[key];
      return typeof v === 'string' || typeof v === 'number' ? v : '';
    },
    []
  );

  const { sort, sorted, toggleSort } = useTableSort<
    OrderReportItem,
    OrderHistorySortKey
  >(rows, getValue, { key: 'dateCreated', direction: 'desc' });

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
              QR Order History
            </h3>
            <span className="text-xs text-gray-500">
              {rows.length.toLocaleString()} orders
            </span>
          </div>
          <ExportButtons {...exportHandlers} isLoading={isExporting} />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <SortableTH
                  label="Order ID"
                  sortKey="orderId"
                  active={sort.key}
                  direction={sort.direction}
                  onSort={toggleSort}
                />
                <SortableTH
                  label="Customer"
                  sortKey="customerName"
                  active={sort.key}
                  direction={sort.direction}
                  onSort={toggleSort}
                />
                <SortableTH
                  label="QR"
                  sortKey="quickResponseName"
                  active={sort.key}
                  direction={sort.direction}
                  onSort={toggleSort}
                />
                <SortableTH
                  label="Payment Method"
                  sortKey="paymentMethod"
                  active={sort.key}
                  direction={sort.direction}
                  onSort={toggleSort}
                />
                <SortableTH
                  label="Total"
                  sortKey="totalAmount"
                  active={sort.key}
                  direction={sort.direction}
                  onSort={toggleSort}
                />
                <SortableTH
                  label="Status"
                  sortKey="orderStatus"
                  active={sort.key}
                  direction={sort.direction}
                  onSort={toggleSort}
                />
                <SortableTH
                  label="Date Created"
                  sortKey="dateCreated"
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
                    No QR orders for this period
                  </td>
                </tr>
              ) : (
                pageRows.map((row, idx) => (
                  <tr
                    key={`${row.orderId}-${idx}`}
                    className="hover:bg-gray-50"
                  >
                    <td className="px-5 py-4 text-gray-900 font-medium">
                      {row.orderId || '—'}
                    </td>
                    <td className="px-5 py-4 text-gray-700">
                      {row.customerName || '—'}
                    </td>
                    <td className="px-5 py-4 text-gray-700">
                      {row.quickResponseName || '—'}
                    </td>
                    <td className="px-5 py-4 text-gray-700">
                      {row.paymentMethod || '—'}
                    </td>
                    <td className="px-5 py-4 text-gray-700">
                      {formatNgn(safeNumber(row.totalAmount))}
                    </td>
                    <td className="px-5 py-4 text-gray-700">
                      {row.orderStatus || '—'}
                    </td>
                    <td className="px-5 py-4 text-gray-700">
                      {row.dateCreated
                        ? moment(row.dateCreated).format('DD MMM YYYY HH:mm')
                        : '—'}
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

type RevenueRowSortKey =
  | 'qrName'
  | 'netRevenue'
  | 'orderCount'
  | 'averageOrderValue'
  | 'refundAmount'
  | 'lastOrderDateTime';

export const QrRevenueByCodePanel: React.FC<QrPanelProps> = ({
  data,
  isLoading,
  onExport,
  isExporting,
}) => {
  const [page, setPage] = useState(1);
  const exportHandlers = buildExportHandlers(onExport);
  const qrDetails: QrDetailsSection | undefined = data?.qrDetails;
  const performance: QrPerformanceItem[] = data?.qrPerformanceSummaries ?? [];

  const getValue = React.useCallback(
    (row: QrPerformanceItem, key: RevenueRowSortKey): string | number => {
      if (key === 'lastOrderDateTime') {
        const t = Date.parse(row.lastOrderDateTime ?? '');
        return Number.isFinite(t) ? t : 0;
      }
      if (key === 'qrName') return row.qrName ?? '';
      const v = row[key as Exclude<RevenueRowSortKey, 'qrName' | 'lastOrderDateTime'>];
      return safeNumber(v);
    },
    []
  );

  const { sort, sorted, toggleSort } = useTableSort<
    QrPerformanceItem,
    RevenueRowSortKey
  >(performance, getValue, { key: 'netRevenue', direction: 'desc' });

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageRows = sorted.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE
  );

  if (isLoading) return <Skeletonized />;

  const totalQRRevenue = safeNumber(qrDetails?.totalQRRevenue);
  const activeQRCodes = safeNumber(qrDetails?.activeQRCodes);
  const averagePerActive = safeNumber(qrDetails?.averageOrdersPerActiveQR);
  const topRevenue = qrDetails?.topByRevenue ?? null;
  const revenueDelta = tonalDelta(qrDetails?.percentageChange);

  const stats: StatCard[] = [
    {
      label: 'Total QR Revenue',
      value: formatNgn(totalQRRevenue),
      delta: revenueDelta.delta,
      direction: revenueDelta.direction,
      footer: 'vs. previous period',
      footerTone: 'muted',
    },
    {
      label: 'Top QR by Revenue',
      value: topRevenue?.qrName ?? '—',
      footer: topRevenue
        ? `${formatNgn(safeNumber(topRevenue.netRevenue))} net`
        : 'No data',
      footerTone: topRevenue ? 'success' : 'muted',
    },
    {
      label: 'Active QR Codes',
      value: activeQRCodes.toLocaleString(),
      footer: `Avg ${averagePerActive.toFixed(2)} orders / active QR`,
      footerTone: 'muted',
    },
    {
      label: 'Top Concentration',
      value: formatPercentage(safeNumber(qrDetails?.topQRConcentrationPct)),
      footer: 'Share of orders by top QR',
      footerTone: 'muted',
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

      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm">
        <div className="flex items-center justify-between flex-wrap gap-3 px-5 py-4">
          <div className="flex items-center gap-3 flex-wrap">
            <h3 className="text-base font-semibold text-gray-900">
              Revenue by QR Code
            </h3>
            <span className="text-xs text-gray-500">
              {performance.length.toLocaleString()} QR codes
            </span>
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
                  label="Net Revenue"
                  sortKey="netRevenue"
                  active={sort.key}
                  direction={sort.direction}
                  onSort={toggleSort}
                />
                <SortableTH
                  label="Orders"
                  sortKey="orderCount"
                  active={sort.key}
                  direction={sort.direction}
                  onSort={toggleSort}
                />
                <SortableTH
                  label="Avg Order Value"
                  sortKey="averageOrderValue"
                  active={sort.key}
                  direction={sort.direction}
                  onSort={toggleSort}
                />
                <SortableTH
                  label="Refund Amount"
                  sortKey="refundAmount"
                  active={sort.key}
                  direction={sort.direction}
                  onSort={toggleSort}
                />
                <SortableTH
                  label="Last Order"
                  sortKey="lastOrderDateTime"
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
                    colSpan={6}
                    className="px-5 py-8 text-center text-sm text-gray-500"
                  >
                    No revenue data for this period
                  </td>
                </tr>
              ) : (
                pageRows.map((row, idx) => (
                  <tr key={`${row.qrName}-${idx}`} className="hover:bg-gray-50">
                    <td className="px-5 py-4 text-gray-900 font-medium">
                      {row.qrName ?? '—'}
                    </td>
                    <td className="px-5 py-4 text-gray-700">
                      {formatNgn(safeNumber(row.netRevenue))}
                    </td>
                    <td className="px-5 py-4 text-gray-700">
                      {safeNumber(row.orderCount).toLocaleString()}
                    </td>
                    <td className="px-5 py-4 text-gray-700">
                      {formatNgn(safeNumber(row.averageOrderValue))}
                    </td>
                    <td className="px-5 py-4 text-gray-700">
                      {formatNgn(safeNumber(row.refundAmount))}
                    </td>
                    <td className="px-5 py-4 text-gray-700">
                      {row.lastOrderDateTime
                        ? moment(row.lastOrderDateTime).format('DD MMM YYYY')
                        : '—'}
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

type TimelineSortKey =
  | 'occurredAt'
  | 'qrName'
  | 'eventType'
  | 'orderId'
  | 'amount'
  | 'performedBy';

export const QrActivityTimelinePanel: React.FC<QrPanelProps> = ({
  data,
  isLoading,
  onExport,
  isExporting,
}) => {
  const [page, setPage] = useState(1);
  const exportHandlers = buildExportHandlers(onExport);
  const rows: QrActivityTimelineItem[] = data?.qrActivityTimelines ?? [];

  const getValue = React.useCallback(
    (row: QrActivityTimelineItem, key: TimelineSortKey): string | number => {
      if (key === 'occurredAt') {
        const t = Date.parse(row.occurredAt ?? '');
        return Number.isFinite(t) ? t : 0;
      }
      if (key === 'amount') return safeNumber(row.amount);
      const v = row[key];
      return typeof v === 'string' || typeof v === 'number' ? v : '';
    },
    []
  );

  const { sort, sorted, toggleSort } = useTableSort<
    QrActivityTimelineItem,
    TimelineSortKey
  >(rows, getValue, { key: 'occurredAt', direction: 'desc' });

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

  const hasAmount = rows.some(
    (r) => r.amount !== undefined && r.amount !== null
  );

  return (
    <div className="flex flex-col gap-5">
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm">
        <div className="flex items-center justify-between flex-wrap gap-3 px-5 py-4">
          <div className="flex items-center gap-3 flex-wrap">
            <h3 className="text-base font-semibold text-gray-900">
              QR Activity Timeline
            </h3>
            <span className="text-xs text-gray-500">
              {rows.length.toLocaleString()} events
            </span>
          </div>
          <ExportButtons {...exportHandlers} isLoading={isExporting} />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <SortableTH
                  label="When"
                  sortKey="occurredAt"
                  active={sort.key}
                  direction={sort.direction}
                  onSort={toggleSort}
                />
                <SortableTH
                  label="QR"
                  sortKey="qrName"
                  active={sort.key}
                  direction={sort.direction}
                  onSort={toggleSort}
                />
                <SortableTH
                  label="Event"
                  sortKey="eventType"
                  active={sort.key}
                  direction={sort.direction}
                  onSort={toggleSort}
                />
                <SortableTH
                  label="Order ID"
                  sortKey="orderId"
                  active={sort.key}
                  direction={sort.direction}
                  onSort={toggleSort}
                />
                {hasAmount && (
                  <SortableTH
                    label="Amount"
                    sortKey="amount"
                    active={sort.key}
                    direction={sort.direction}
                    onSort={toggleSort}
                  />
                )}
                <SortableTH
                  label="By"
                  sortKey="performedBy"
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
                    colSpan={hasAmount ? 6 : 5}
                    className="px-5 py-8 text-center text-sm text-gray-500"
                  >
                    No QR activity in this period
                  </td>
                </tr>
              ) : (
                pageRows.map((row, idx) => (
                  <tr
                    key={`${row.qrName}-${row.occurredAt}-${idx}`}
                    className="hover:bg-gray-50"
                  >
                    <td className="px-5 py-4 text-gray-700">
                      {row.occurredAt
                        ? moment(row.occurredAt).format('DD MMM YYYY HH:mm')
                        : '—'}
                    </td>
                    <td className="px-5 py-4 text-gray-900 font-medium">
                      {row.qrName ?? '—'}
                    </td>
                    <td className="px-5 py-4 text-gray-700">
                      {row.eventType ?? '—'}
                    </td>
                    <td className="px-5 py-4 text-gray-700">
                      {row.orderId ?? '—'}
                    </td>
                    {hasAmount && (
                      <td className="px-5 py-4 text-gray-700">
                        {row.amount !== undefined && row.amount !== null
                          ? formatNgn(safeNumber(row.amount))
                          : '—'}
                      </td>
                    )}
                    <td className="px-5 py-4 text-gray-700">
                      {row.performedBy ?? '—'}
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
