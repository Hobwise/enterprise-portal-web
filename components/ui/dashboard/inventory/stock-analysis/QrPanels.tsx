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
  OrderReportResponse,
  StatCard,
} from './types';

const PAGE_SIZE = 10;

const safeNumber = (value: unknown): number => {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
};

const parseAmount = (formatted: unknown): number => {
  if (formatted === null || formatted === undefined || formatted === '') return 0;
  if (typeof formatted === 'number') return safeNumber(formatted);
  const cleaned = String(formatted).replace(/[^0-9.-]+/g, '');
  return safeNumber(cleaned);
};

const formatNgn = (value: number): string => formatPrice(value, 'NGN');

interface QrPanelProps {
  data?: OrderReportResponse;
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

interface QrAggregate {
  qrName: string;
  orders: number;
  openOrders: number;
  closedOrders: number;
  cancelledOrders: number;
  totalRevenue: number;
}

const aggregateByQr = (orders: OrderReportItem[]): QrAggregate[] => {
  const groups = new Map<string, QrAggregate>();
  orders.forEach((o) => {
    const name = o.quickResponseName || 'Unknown';
    const existing =
      groups.get(name) ??
      ({
        qrName: name,
        orders: 0,
        openOrders: 0,
        closedOrders: 0,
        cancelledOrders: 0,
        totalRevenue: 0,
      } as QrAggregate);
    existing.orders += 1;
    const status = (o.orderStatus ?? '').toLowerCase();
    if (status === 'open') existing.openOrders += 1;
    else if (status === 'closed') existing.closedOrders += 1;
    else if (status === 'cancelled') existing.cancelledOrders += 1;
    existing.totalRevenue += parseAmount(o.totalAmount);
    groups.set(name, existing);
  });
  return Array.from(groups.values()).sort((a, b) => b.orders - a.orders);
};

export const QrOverviewPanel: React.FC<QrPanelProps> = ({ data, isLoading }) => {
  const orders = (data?.orders ?? []) as OrderReportItem[];

  const aggregates = useMemo(() => aggregateByQr(orders), [orders]);

  const totals = useMemo(() => {
    let totalOrders = 0;
    let totalRevenue = 0;
    let takeOuts = 0;
    orders.forEach((o) => {
      totalOrders += 1;
      totalRevenue += parseAmount(o.totalAmount);
      const name = (o.quickResponseName ?? '').toLowerCase();
      if (name.includes('take') && name.includes('out')) takeOuts += 1;
    });
    return { totalOrders, totalRevenue, takeOuts };
  }, [orders]);

  const dailyRows = useMemo<BarRow[]>(() => {
    const groups = new Map<string, number>();
    orders.forEach((o) => {
      if (!o.dateCreated) return;
      const key = moment(o.dateCreated).format('YYYY-MM-DD');
      groups.set(key, (groups.get(key) ?? 0) + 1);
    });
    return Array.from(groups.entries())
      .sort(([a], [b]) => (a < b ? -1 : 1))
      .map(([date, count]) => ({
        label: moment(date).format('ddd DD'),
        value: count,
        suffix: ' Orders',
      }));
  }, [orders]);

  if (isLoading) return <Skeletonized />;

  const activeQr = aggregates.length;
  const stats: StatCard[] = [
    {
      label: 'Active QR Code',
      value: activeQr.toLocaleString(),
      footer: activeQr > 0 ? 'All Active' : 'No active QR',
      footerTone: activeQr > 0 ? 'success' : 'muted',
    },
    {
      label: 'Total Orders Via QR',
      value: totals.totalOrders.toLocaleString(),
      footer: 'In period',
      footerTone: 'muted',
    },
    {
      label: 'QR Order Revenue',
      value: formatNgn(totals.totalRevenue),
      footer: 'Gross revenue',
      footerTone: 'muted',
    },
    {
      label: 'Take Outs From QR',
      value: totals.takeOuts.toLocaleString(),
      footer: 'Take-out orders',
      footerTone: 'muted',
    },
  ];

  const topOrdersByQr = aggregates.slice(0, 6);
  const otherCount = aggregates
    .slice(6)
    .reduce((sum, a) => sum + a.orders, 0);

  return (
    <div className="flex flex-col gap-5">
      <StatCards cards={stats} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <BarList
          title="Daily QR Orders"
          rows={dailyRows}
          max={Math.max(...dailyRows.map((r) => r.value), 1)}
          valueFormatter={(r) => `${r.value.toLocaleString()} Orders`}
        />
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">
            Top Orders by QR
          </h3>
          {topOrdersByQr.length === 0 ? (
            <p className="text-sm text-gray-500 py-4 text-center">
              No QR orders for this period
            </p>
          ) : (
            <div className="divide-y divide-gray-100">
              {topOrdersByQr.map((row) => (
                <div
                  key={row.qrName}
                  className="flex items-center justify-between py-3 text-sm"
                >
                  <span className="text-gray-700">{row.qrName}</span>
                  <span className="font-semibold text-primaryColor">
                    {row.orders.toLocaleString()}
                  </span>
                </div>
              ))}
              {otherCount > 0 && (
                <div className="flex items-center justify-between py-3 text-sm">
                  <span className="text-gray-700">Others</span>
                  <span className="font-semibold text-primaryColor">
                    {otherCount.toLocaleString()}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
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

const buildDetailRows = (orders: OrderReportItem[]): QrDetailRow[] => {
  const groups = aggregateByQr(orders);
  return groups.map((g) => ({
    qrName: g.qrName,
    orders: g.orders,
    openOrders: g.openOrders,
    averageValue: g.orders > 0 ? g.totalRevenue / g.orders : 0,
    netRevenue: g.totalRevenue,
    refunds: g.cancelledOrders,
    status: g.orders > 0 ? 'Active' : 'Inactive',
  }));
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
  const orders = (data?.orders ?? []) as OrderReportItem[];

  const allRows = useMemo(() => buildDetailRows(orders), [orders]);

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
