'use client';

import React, { useMemo, useState } from 'react';
import moment from 'moment';
import { Button, Skeleton } from '@nextui-org/react';
import { FiDownload } from 'react-icons/fi';
import { formatPrice } from '@/lib/utils';
import { SortableTH, StatCards, useTableSort } from './SharedPanels';
import { TablePagination } from './SalesPanels';
import { ExportType } from './exportHelpers';
import {
  NetRevenueItem,
  OutstandingReceivableItem,
  PaymentMethodSummary,
  PaymentReportItem,
  PaymentReportResponse,
  QrRevenueItem,
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

const toTime = (value: string | null | undefined): number => {
  if (!value) return 0;
  const m = moment(value);
  return m.isValid() ? m.valueOf() : 0;
};

const formatNgn = (value: number): string => formatPrice(value, 'NGN');

interface PaymentSubTabPanelProps {
  data?: PaymentReportResponse;
  isLoading?: boolean;
  onExport?: (exportType: number) => void | Promise<void>;
  isExporting?: boolean;
}

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
  <div className="flex gap-2">
    <Button
      variant="bordered"
      onPress={onExportExcel}
      isLoading={isLoading}
      startContent={isLoading ? null : <FiDownload size={14} />}
      className="border border-gray-200 text-gray-700 bg-white rounded-lg text-xs h-9"
    >
      Export Excel
    </Button>
    <Button
      onPress={onExportPdf}
      isLoading={isLoading}
      startContent={isLoading ? null : <FiDownload size={14} />}
      className="bg-primaryColor text-white rounded-lg text-xs h-9"
    >
      Export PDF
    </Button>
  </div>
);

const buildExportHandlers = (
  onExport?: (exportType: number) => void | Promise<void>
) => ({
  onExportExcel: onExport ? () => onExport(ExportType.Excel) : undefined,
  onExportPdf: onExport ? () => onExport(ExportType.Pdf) : undefined,
});

const PaymentSubTabSkeleton: React.FC = () => (
  <div className="flex flex-col gap-5">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {[0, 1, 2, 3].map((i) => (
        <Skeleton key={i} className="h-28 rounded-2xl" />
      ))}
    </div>
    <Skeleton className="h-80 rounded-2xl" />
  </div>
);

const statusColor = (status: string): string => {
  const s = (status ?? '').toLowerCase();
  if (s === 'confirmed' || s === 'success') return 'text-emerald-600';
  if (s === 'pending') return 'text-amber-500';
  if (s === 'failed' || s === 'cancelled') return 'text-red-500';
  return 'text-primaryColor';
};

const directionColor = (direction: string): string => {
  const d = (direction ?? '').toLowerCase();
  if (d === 'credit') return 'text-emerald-600';
  if (d === 'debit') return 'text-red-500';
  return 'text-gray-700';
};

export const PaymentSummarySubPanel: React.FC<PaymentSubTabPanelProps> = ({
  data,
  isLoading,
  onExport,
  isExporting,
}) => {
  const [statusTab, setStatusTab] = useState<string>('all');
  const [page, setPage] = useState(1);
  const exportHandlers = buildExportHandlers(onExport);

  const payments = (data?.payments ?? []) as PaymentReportItem[];

  const counts = useMemo(() => {
    let total = 0;
    let confirmed = 0;
    let pending = 0;
    let failed = 0;
    let totalAmount = 0;
    let confirmedAmount = 0;
    let pendingAmount = 0;
    payments.forEach((p) => {
      total += 1;
      const amount = parseAmount(p.totalAmount);
      totalAmount += amount;
      const s = (p.status ?? '').toLowerCase();
      if (s === 'confirmed' || s === 'success') {
        confirmed += 1;
        confirmedAmount += amount;
      } else if (s === 'pending') {
        pending += 1;
        pendingAmount += amount;
      } else if (s === 'failed' || s === 'cancelled') {
        failed += 1;
      }
    });
    return {
      total,
      confirmed,
      pending,
      failed,
      totalAmount,
      confirmedAmount,
      pendingAmount,
    };
  }, [payments]);

  const filtered = useMemo(() => {
    if (statusTab === 'all') return payments;
    return payments.filter(
      (p) => (p.status ?? '').toLowerCase() === statusTab
    );
  }, [payments, statusTab]);

  const getPaymentValue = React.useCallback(
    (
      p: PaymentReportItem,
      key:
        | 'dateCreated'
        | 'orderId'
        | 'customer'
        | 'quickResponseName'
        | 'paymentMethod'
        | 'paymentType'
        | 'paymentDirection'
        | 'totalAmount'
        | 'confirmedBy'
        | 'status'
    ) => {
      if (key === 'dateCreated') return toTime(p.dateCreated);
      if (key === 'totalAmount') return parseAmount(p.totalAmount);
      return ((p as any)[key] ?? '') as string;
    },
    []
  );

  const { sort, sorted, toggleSort } = useTableSort(
    filtered,
    getPaymentValue,
    { key: 'dateCreated', direction: 'desc' }
  );

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageRows = sorted.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE
  );

  if (isLoading) return <PaymentSubTabSkeleton />;

  const stats: StatCard[] = [
    {
      label: 'All Payments',
      value: formatNgn(counts.totalAmount),
      footer: `${counts.total} transactions`,
      footerTone: 'muted',
    },
    {
      label: 'Confirmed',
      value: formatNgn(counts.confirmedAmount),
      footer: `${counts.confirmed} settled`,
      footerTone: 'success',
    },
    {
      label: 'Pending',
      value: formatNgn(counts.pendingAmount),
      footer: `${counts.pending} awaiting`,
      footerTone: 'warning',
    },
    {
      label: 'Failed',
      value: counts.failed.toLocaleString(),
      footer: counts.failed > 0 ? 'Investigate' : 'No failures',
      footerTone: counts.failed > 0 ? 'danger' : 'muted',
    },
  ];

  const tabs = [
    { id: 'all', label: 'All payments', count: counts.total },
    { id: 'confirmed', label: 'Confirmed', count: counts.confirmed },
    { id: 'pending', label: 'Pending', count: counts.pending },
    { id: 'failed', label: 'Failed', count: counts.failed },
  ];

  return (
    <div className="flex flex-col gap-5">
      <StatCards cards={stats} />
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm">
        <div className="flex items-center justify-between flex-wrap gap-3 px-5 py-4">
          <div className="flex items-center gap-3 flex-wrap">
            <select
              value={statusTab}
              onChange={(e) => {
                setStatusTab(e.target.value);
                setPage(1);
              }}
              className="text-xs h-9 px-3 rounded-lg border border-gray-200 text-gray-700 bg-white focus:outline-none focus:border-primaryColor"
            >
              {tabs.map((tab) => (
                <option key={tab.id} value={tab.id}>
                  {tab.label} ({tab.count})
                </option>
              ))}
            </select>
          </div>
          <ExportButtons {...exportHandlers} isLoading={isExporting} />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <SortableTH
                  label="Date"
                  sortKey="dateCreated"
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
                <SortableTH
                  label="Customer"
                  sortKey="customer"
                  active={sort.key}
                  direction={sort.direction}
                  onSort={toggleSort}
                />
                <SortableTH
                  label="QR Name"
                  sortKey="quickResponseName"
                  active={sort.key}
                  direction={sort.direction}
                  onSort={toggleSort}
                />
                <SortableTH
                  label="Method"
                  sortKey="paymentMethod"
                  active={sort.key}
                  direction={sort.direction}
                  onSort={toggleSort}
                />
                <SortableTH
                  label="Type"
                  sortKey="paymentType"
                  active={sort.key}
                  direction={sort.direction}
                  onSort={toggleSort}
                />
                <SortableTH
                  label="Direction"
                  sortKey="paymentDirection"
                  active={sort.key}
                  direction={sort.direction}
                  onSort={toggleSort}
                />
                <SortableTH
                  label="Amount"
                  sortKey="totalAmount"
                  active={sort.key}
                  direction={sort.direction}
                  onSort={toggleSort}
                />
                <SortableTH
                  label="Confirmed By"
                  sortKey="confirmedBy"
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
                    colSpan={10}
                    className="px-5 py-8 text-center text-sm text-gray-500"
                  >
                    No payments for this period
                  </td>
                </tr>
              ) : (
                pageRows.map((p, idx) => (
                  <tr
                    key={`${p.orderId}-${idx}`}
                    className="hover:bg-gray-50"
                  >
                    <td className="px-5 py-4 text-gray-700">
                      {moment(p.dateCreated).format('MMM DD, hh:mma')}
                    </td>
                    <td className="px-5 py-4 text-gray-700 font-mono text-xs">
                      {p.orderId}
                    </td>
                    <td className="px-5 py-4 text-gray-900 font-medium">
                      {p.customer || 'anonymous'}
                    </td>
                    <td className="px-5 py-4 text-gray-700">
                      {p.quickResponseName || '—'}
                    </td>
                    <td className="px-5 py-4 text-gray-700">
                      {p.paymentMethod}
                    </td>
                    <td className="px-5 py-4 text-gray-700">
                      {p.paymentType || '—'}
                    </td>
                    <td
                      className={`px-5 py-4 font-medium ${directionColor(
                        p.paymentDirection
                      )}`}
                    >
                      {p.paymentDirection || '—'}
                    </td>
                    <td className="px-5 py-4 text-gray-900 font-semibold">
                      {p.totalAmount}
                    </td>
                    <td className="px-5 py-4 text-gray-700">
                      {p.confirmedBy || '—'}
                    </td>
                    <td
                      className={`px-5 py-4 font-medium ${statusColor(
                        p.status
                      )}`}
                    >
                      {p.status}
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

export const PaymentMethodsSubPanel: React.FC<PaymentSubTabPanelProps> = ({
  data,
  isLoading,
  onExport,
  isExporting,
}) => {
  const exportHandlers = buildExportHandlers(onExport);
  const [page, setPage] = useState(1);
  const methods = (data?.payments ?? []) as PaymentMethodSummary[];

  const totals = useMemo(() => {
    let totalPayments = 0;
    let totalCredits = 0;
    let totalDebits = 0;
    let totalNet = 0;
    methods.forEach((m) => {
      totalPayments += safeNumber(m.numberOfPayments);
      totalCredits += parseAmount(m.totalCredits);
      totalDebits += parseAmount(m.totalDebits);
      totalNet += parseAmount(m.netAmountProcessed);
    });
    return { totalPayments, totalCredits, totalDebits, totalNet };
  }, [methods]);

  const getMethodValue = React.useCallback(
    (
      m: PaymentMethodSummary,
      key:
        | 'paymentMethod'
        | 'numberOfPayments'
        | 'totalCredits'
        | 'totalDebits'
        | 'netAmountProcessed'
        | 'lastRecordDateTime'
    ) => {
      switch (key) {
        case 'numberOfPayments':
          return safeNumber(m.numberOfPayments);
        case 'totalCredits':
          return parseAmount(m.totalCredits);
        case 'totalDebits':
          return parseAmount(m.totalDebits);
        case 'netAmountProcessed':
          return parseAmount(m.netAmountProcessed);
        case 'lastRecordDateTime':
          return toTime(m.lastRecordDateTime);
        default:
          return m.paymentMethod ?? '';
      }
    },
    []
  );

  const {
    sort: methodSort,
    sorted: sortedMethods,
    toggleSort: toggleMethodSort,
  } = useTableSort(methods, getMethodValue, {
    key: 'netAmountProcessed',
    direction: 'desc',
  });

  const totalPages = Math.max(1, Math.ceil(sortedMethods.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageRows = sortedMethods.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE
  );

  if (isLoading) return <PaymentSubTabSkeleton />;

  const top = sortedMethods[0] ?? null;

  const stats: StatCard[] = [
    {
      label: 'Active Methods',
      value: methods.length.toLocaleString(),
      footer: 'Used in period',
      footerTone: 'success',
    },
    {
      label: 'Top Method',
      value: top?.paymentMethod ?? '—',
      footer: top
        ? `${safeNumber(top.numberOfPayments)} payments`
        : 'No data',
      footerTone: 'success',
    },
    {
      label: 'Total Credits',
      value: formatNgn(totals.totalCredits),
      footer: 'Inflows',
      footerTone: 'success',
    },
    {
      label: 'Net Amount',
      value: formatNgn(totals.totalNet),
      footer: `${formatNgn(totals.totalDebits)} debits`,
      footerTone: 'muted',
    },
  ];

  return (
    <div className="flex flex-col gap-5">
      <StatCards cards={stats} />
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm">
        <div className="flex items-center justify-between flex-wrap gap-3 px-5 py-4">
          <h3 className="text-base font-semibold text-gray-900">
            All Payment Method Summaries
          </h3>
          <ExportButtons {...exportHandlers} isLoading={isExporting} />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <SortableTH
                  label="Payment Method"
                  sortKey="paymentMethod"
                  active={methodSort.key}
                  direction={methodSort.direction}
                  onSort={toggleMethodSort}
                />
                <SortableTH
                  label="No. of Payments"
                  sortKey="numberOfPayments"
                  active={methodSort.key}
                  direction={methodSort.direction}
                  onSort={toggleMethodSort}
                />
                <SortableTH
                  label="Total Credits"
                  sortKey="totalCredits"
                  active={methodSort.key}
                  direction={methodSort.direction}
                  onSort={toggleMethodSort}
                />
                <SortableTH
                  label="Total Debits"
                  sortKey="totalDebits"
                  active={methodSort.key}
                  direction={methodSort.direction}
                  onSort={toggleMethodSort}
                />
                <SortableTH
                  label="Net Amount Processed"
                  sortKey="netAmountProcessed"
                  active={methodSort.key}
                  direction={methodSort.direction}
                  onSort={toggleMethodSort}
                />
                <SortableTH
                  label="Last Activity"
                  sortKey="lastRecordDateTime"
                  active={methodSort.key}
                  direction={methodSort.direction}
                  onSort={toggleMethodSort}
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
                    No payment methods for this period
                  </td>
                </tr>
              ) : (
                pageRows.map((m, index) => (
                  <tr
                    key={`${m.paymentMethod}-${index}`}
                    className="hover:bg-gray-50"
                  >
                    <td className="px-5 py-4 text-gray-900 font-medium">
                      {m.paymentMethod}
                    </td>
                    <td className="px-5 py-4 text-gray-700">
                      {safeNumber(m.numberOfPayments).toLocaleString()}
                    </td>
                    <td className="px-5 py-4 text-emerald-600">
                      {m.totalCredits}
                    </td>
                    <td className="px-5 py-4 text-red-500">{m.totalDebits}</td>
                    <td className="px-5 py-4 text-gray-900 font-semibold">
                      {m.netAmountProcessed}
                    </td>
                    <td className="px-5 py-4 text-gray-700">
                      {m.lastRecordDateTime
                        ? moment(m.lastRecordDateTime).format('MMM DD, YYYY')
                        : '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {sortedMethods.length > 0 && (
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

export const QrRevenueSubPanel: React.FC<PaymentSubTabPanelProps> = ({
  data,
  isLoading,
  onExport,
  isExporting,
}) => {
  const exportHandlers = buildExportHandlers(onExport);
  const [page, setPage] = useState(1);

  const qrOrders: QrRevenueItem[] = data?.qrOrders ?? [];

  const totals = useMemo(() => {
    let orders = 0;
    let total = 0;
    let confirmed = 0;
    let pending = 0;
    let refunds = 0;
    let gross = 0;
    qrOrders.forEach((q) => {
      orders += safeNumber(q.numberOfOrders);
      total += parseAmount(q.totalSalesAmount);
      confirmed += parseAmount(q.confirmedSalesAmount);
      pending += parseAmount(q.pendingSalesAmount);
      refunds += parseAmount(q.totalRefundAmount);
      gross += parseAmount(q.grossSalesAmount);
    });
    return { orders, total, confirmed, pending, refunds, gross };
  }, [qrOrders]);

  const getQrValue = React.useCallback(
    (
      q: QrRevenueItem,
      key:
        | 'quickResponseName'
        | 'numberOfOrders'
        | 'pendingSalesAmount'
        | 'confirmedSalesAmount'
        | 'totalSalesAmount'
        | 'totalRefundAmount'
        | 'grossSalesAmount'
        | 'dateUpdated'
    ) => {
      switch (key) {
        case 'numberOfOrders':
          return safeNumber(q.numberOfOrders);
        case 'pendingSalesAmount':
          return parseAmount(q.pendingSalesAmount);
        case 'confirmedSalesAmount':
          return parseAmount(q.confirmedSalesAmount);
        case 'totalSalesAmount':
          return parseAmount(q.totalSalesAmount);
        case 'totalRefundAmount':
          return parseAmount(q.totalRefundAmount);
        case 'grossSalesAmount':
          return parseAmount(q.grossSalesAmount);
        case 'dateUpdated':
          return toTime(q.dateUpdated);
        default:
          return q.quickResponseName ?? '';
      }
    },
    []
  );

  const {
    sort: qrSort,
    sorted: sortedQr,
    toggleSort: toggleQrSort,
  } = useTableSort(qrOrders, getQrValue, {
    key: 'totalSalesAmount',
    direction: 'desc',
  });

  const totalPages = Math.max(1, Math.ceil(sortedQr.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageRows = sortedQr.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE
  );

  if (isLoading) return <PaymentSubTabSkeleton />;

  const top = sortedQr[0] ?? null;

  const stats: StatCard[] = [
    {
      label: 'Active QR Codes',
      value: sortedQr.length.toLocaleString(),
      footer: 'Generating revenue',
      footerTone: 'success',
    },
    {
      label: 'Top QR Code',
      value: top?.quickResponseName ?? '—',
      footer: top
        ? `${safeNumber(top.numberOfOrders)} orders`
        : 'No data',
      footerTone: 'success',
    },
    {
      label: 'Total QR Revenue',
      value: formatNgn(totals.total),
      footer: `${totals.orders} orders`,
      footerTone: 'muted',
    },
    {
      label: 'Refunds',
      value: formatNgn(totals.refunds),
      footer: totals.refunds > 0 ? 'Across QR codes' : 'No refunds',
      footerTone: totals.refunds > 0 ? 'danger' : 'muted',
    },
  ];

  return (
    <div className="flex flex-col gap-5">
      <StatCards cards={stats} />
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm">
        <div className="flex items-center justify-between flex-wrap gap-3 px-5 py-4">
          <h3 className="text-base font-semibold text-gray-900">
            Revenue by QR Code
          </h3>
          <ExportButtons {...exportHandlers} isLoading={isExporting} />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <SortableTH
                  label="QR Code"
                  sortKey="quickResponseName"
                  active={qrSort.key}
                  direction={qrSort.direction}
                  onSort={toggleQrSort}
                />
                <SortableTH
                  label="Orders"
                  sortKey="numberOfOrders"
                  active={qrSort.key}
                  direction={qrSort.direction}
                  onSort={toggleQrSort}
                />
                <SortableTH
                  label="Pending"
                  sortKey="pendingSalesAmount"
                  active={qrSort.key}
                  direction={qrSort.direction}
                  onSort={toggleQrSort}
                />
                <SortableTH
                  label="Confirmed"
                  sortKey="confirmedSalesAmount"
                  active={qrSort.key}
                  direction={qrSort.direction}
                  onSort={toggleQrSort}
                />
                <SortableTH
                  label="Total Sales"
                  sortKey="totalSalesAmount"
                  active={qrSort.key}
                  direction={qrSort.direction}
                  onSort={toggleQrSort}
                />
                <SortableTH
                  label="Refunds"
                  sortKey="totalRefundAmount"
                  active={qrSort.key}
                  direction={qrSort.direction}
                  onSort={toggleQrSort}
                />
                <SortableTH
                  label="Gross Sales"
                  sortKey="grossSalesAmount"
                  active={qrSort.key}
                  direction={qrSort.direction}
                  onSort={toggleQrSort}
                />
                <SortableTH
                  label="Last Activity"
                  sortKey="dateUpdated"
                  active={qrSort.key}
                  direction={qrSort.direction}
                  onSort={toggleQrSort}
                />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {pageRows.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-5 py-8 text-center text-sm text-gray-500"
                  >
                    No QR revenue for this period
                  </td>
                </tr>
              ) : (
                pageRows.map((q, index) => (
                  <tr
                    key={`${q.quickResponseName}-${index}`}
                    className="hover:bg-gray-50"
                  >
                    <td className="px-5 py-4 text-gray-900 font-medium">
                      {q.quickResponseName}
                    </td>
                    <td className="px-5 py-4 text-gray-700">
                      {safeNumber(q.numberOfOrders).toLocaleString()}
                    </td>
                    <td className="px-5 py-4 text-amber-500">
                      {q.pendingSalesAmount}
                    </td>
                    <td className="px-5 py-4 text-emerald-600">
                      {q.confirmedSalesAmount}
                    </td>
                    <td className="px-5 py-4 text-gray-900 font-semibold">
                      {q.totalSalesAmount}
                    </td>
                    <td className="px-5 py-4 text-red-500">
                      {q.totalRefundAmount}
                    </td>
                    <td className="px-5 py-4 text-primaryColor font-semibold">
                      {q.grossSalesAmount}
                    </td>
                    <td className="px-5 py-4 text-gray-700">
                      {q.dateUpdated
                        ? moment(q.dateUpdated).format('MMM DD, YYYY')
                        : '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {sortedQr.length > 0 && (
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

export const NetRevenueSubPanel: React.FC<PaymentSubTabPanelProps> = ({
  data,
  isLoading,
  onExport,
  isExporting,
}) => {
  const exportHandlers = buildExportHandlers(onExport);
  const [page, setPage] = useState(1);
  const [directionFilter, setDirectionFilter] = useState<string>('all');
  const netRevenues: NetRevenueItem[] = data?.netRevenues ?? [];

  const filteredRevenues = useMemo(() => {
    if (directionFilter === 'all') return netRevenues;
    return netRevenues.filter((r) => {
      const amount = parseAmount(r.netRevenue);
      if (directionFilter === 'positive') return amount > 0;
      if (directionFilter === 'negative') return amount < 0;
      if (directionFilter === 'zero') return amount === 0;
      return true;
    });
  }, [netRevenues, directionFilter]);

  const totals = useMemo(() => {
    let net = 0;
    let positive = 0;
    let negative = 0;
    let positiveCount = 0;
    let negativeCount = 0;
    let zeroCount = 0;
    netRevenues.forEach((r) => {
      const amount = parseAmount(r.netRevenue);
      net += amount;
      if (amount > 0) {
        positive += amount;
        positiveCount += 1;
      } else if (amount < 0) {
        negative += amount;
        negativeCount += 1;
      } else {
        zeroCount += 1;
      }
    });
    return { net, positive, negative, positiveCount, negativeCount, zeroCount };
  }, [netRevenues]);

  const getNetValue = React.useCallback(
    (
      r: NetRevenueItem,
      key: 'period' | 'netRevenue' | 'lastRecordDate'
    ) => {
      switch (key) {
        case 'period':
          return toTime(r.period);
        case 'netRevenue':
          return parseAmount(r.netRevenue);
        case 'lastRecordDate':
          return toTime(r.lastRecordDate);
        default:
          return '';
      }
    },
    []
  );

  const {
    sort: netSort,
    sorted: sortedRevenues,
    toggleSort: toggleNetSort,
  } = useTableSort(filteredRevenues, getNetValue, {
    key: 'period',
    direction: 'desc',
  });

  const totalPages = Math.max(1, Math.ceil(sortedRevenues.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageRows = sortedRevenues.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE
  );

  if (isLoading) return <PaymentSubTabSkeleton />;

  const top = netRevenues.reduce<NetRevenueItem | null>((acc, r) => {
    if (!acc) return r;
    return parseAmount(r.netRevenue) > parseAmount(acc.netRevenue) ? r : acc;
  }, null);

  const stats: StatCard[] = [
    {
      label: 'Net Revenue',
      value: formatNgn(totals.net),
      footer: `${netRevenues.length} periods`,
      footerTone: totals.net >= 0 ? 'success' : 'danger',
    },
    {
      label: 'Positive Days',
      value: totals.positiveCount.toLocaleString(),
      footer: formatNgn(totals.positive),
      footerTone: 'success',
    },
    {
      label: 'Negative Days',
      value: totals.negativeCount.toLocaleString(),
      footer: formatNgn(Math.abs(totals.negative)),
      footerTone: totals.negativeCount > 0 ? 'danger' : 'muted',
    },
    {
      label: 'Best Day',
      value: top ? moment(top.period).format('MMM DD') : '—',
      footer: top ? top.netRevenue : 'No data',
      footerTone: 'success',
    },
  ];

  const netRevenueClass = (value: string): string => {
    const amount = parseAmount(value);
    if (amount > 0) return 'text-emerald-600 font-semibold';
    if (amount < 0) return 'text-red-500 font-semibold';
    return 'text-gray-500';
  };

  return (
    <div className="flex flex-col gap-5">
      <StatCards cards={stats} />
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm">
        <div className="flex items-center justify-between flex-wrap gap-3 px-5 py-4">
          <div className="flex items-center gap-3 flex-wrap">
            <h3 className="text-base font-semibold text-gray-900">
              Net Revenue by Period
            </h3>
            <select
              value={directionFilter}
              onChange={(e) => {
                setDirectionFilter(e.target.value);
                setPage(1);
              }}
              className="text-xs h-9 px-3 rounded-lg border border-gray-200 text-gray-700 bg-white focus:outline-none focus:border-primaryColor"
            >
              <option value="all">All periods</option>
              <option value="positive">
                Positive ({totals.positiveCount})
              </option>
              <option value="negative">
                Negative ({totals.negativeCount})
              </option>
              <option value="zero">Zero ({totals.zeroCount})</option>
            </select>
          </div>
          <ExportButtons {...exportHandlers} isLoading={isExporting} />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <SortableTH
                  label="Period"
                  sortKey="period"
                  active={netSort.key}
                  direction={netSort.direction}
                  onSort={toggleNetSort}
                />
                <SortableTH
                  label="Day"
                  sortKey="period"
                  active={netSort.key}
                  direction={netSort.direction}
                  onSort={toggleNetSort}
                />
                <SortableTH
                  label="Net Revenue"
                  sortKey="netRevenue"
                  active={netSort.key}
                  direction={netSort.direction}
                  onSort={toggleNetSort}
                />
                <SortableTH
                  label="Last Activity"
                  sortKey="lastRecordDate"
                  active={netSort.key}
                  direction={netSort.direction}
                  onSort={toggleNetSort}
                />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {pageRows.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-5 py-8 text-center text-sm text-gray-500"
                  >
                    No net revenue for this period
                  </td>
                </tr>
              ) : (
                pageRows.map((r, index) => (
                  <tr
                    key={`${r.period}-${index}`}
                    className="hover:bg-gray-50"
                  >
                    <td className="px-5 py-4 text-gray-900 font-medium">
                      {moment(r.period).format('MMM DD, YYYY')}
                    </td>
                    <td className="px-5 py-4 text-gray-700">
                      {moment(r.period).format('dddd')}
                    </td>
                    <td className={`px-5 py-4 ${netRevenueClass(r.netRevenue)}`}>
                      {r.netRevenue}
                    </td>
                    <td className="px-5 py-4 text-gray-700">
                      {r.lastRecordDate
                        ? moment(r.lastRecordDate).format('MMM DD, YYYY')
                        : '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {sortedRevenues.length > 0 && (
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

export const OutstandingReceivablesSubPanel: React.FC<
  PaymentSubTabPanelProps
> = ({ data, isLoading, onExport, isExporting }) => {
  const [page, setPage] = useState(1);
  const [agingFilter, setAgingFilter] = useState<string>('all');
  const today = moment();
  const exportHandlers = buildExportHandlers(onExport);

  const receivables: OutstandingReceivableItem[] =
    data?.outstandingReceivables ?? [];

  const enriched = useMemo(
    () =>
      receivables.map((r) => ({
        ...r,
        outstandingAmount: parseAmount(r.outstanding),
        daysOutstanding: r.orderDate
          ? Math.max(0, today.diff(moment(r.orderDate), 'days'))
          : 0,
      })),
    [receivables, today]
  );

  const agingCounts = useMemo(() => {
    let recent = 0;
    let mid = 0;
    let aged = 0;
    enriched.forEach((r) => {
      if (r.daysOutstanding <= 7) recent += 1;
      else if (r.daysOutstanding <= 30) mid += 1;
      else aged += 1;
    });
    return { recent, mid, aged };
  }, [enriched]);

  const filtered = useMemo(() => {
    if (agingFilter === 'all') return enriched;
    if (agingFilter === 'recent')
      return enriched.filter((r) => r.daysOutstanding <= 7);
    if (agingFilter === 'mid')
      return enriched.filter(
        (r) => r.daysOutstanding > 7 && r.daysOutstanding <= 30
      );
    if (agingFilter === 'aged')
      return enriched.filter((r) => r.daysOutstanding > 30);
    return enriched;
  }, [enriched, agingFilter]);

  type EnrichedReceivable = typeof enriched[number];
  const getReceivableValue = React.useCallback(
    (
      r: EnrichedReceivable,
      key:
        | 'orderDate'
        | 'orderId'
        | 'customer'
        | 'treatedBy'
        | 'orderTotal'
        | 'paidSoFar'
        | 'outstanding'
        | 'daysOutstanding'
    ) => {
      switch (key) {
        case 'orderDate':
          return toTime(r.orderDate);
        case 'orderTotal':
          return parseAmount(r.orderTotal);
        case 'paidSoFar':
          return parseAmount(r.paidSoFar);
        case 'outstanding':
          return r.outstandingAmount;
        case 'daysOutstanding':
          return r.daysOutstanding;
        default:
          return ((r as any)[key] ?? '') as string;
      }
    },
    []
  );

  const { sort, sorted, toggleSort } = useTableSort(
    filtered,
    getReceivableValue,
    { key: 'outstanding', direction: 'desc' }
  );

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageRows = sorted.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE
  );

  const totalOutstanding = enriched.reduce(
    (s, r) => s + r.outstandingAmount,
    0
  );
  const totalPaid = enriched.reduce(
    (s, r) => s + parseAmount(r.paidSoFar),
    0
  );
  const averageOutstanding =
    enriched.length > 0 ? totalOutstanding / enriched.length : 0;
  const oldest = enriched.reduce<typeof enriched[number] | null>((acc, r) => {
    if (!acc) return r;
    return r.daysOutstanding > acc.daysOutstanding ? r : acc;
  }, null);

  if (isLoading) return <PaymentSubTabSkeleton />;

  const stats: StatCard[] = [
    {
      label: 'Outstanding Orders',
      value: enriched.length.toLocaleString(),
      footer:
        enriched.length > 0
          ? 'Need Immediate Attention'
          : 'No outstanding orders',
      footerTone: enriched.length > 0 ? 'danger' : 'muted',
    },
    {
      label: 'Total Outstanding',
      value: formatNgn(totalOutstanding),
      footer: `${formatNgn(totalPaid)} paid so far`,
      footerTone: 'warning',
    },
    {
      label: 'Average Outstanding',
      value: formatNgn(averageOutstanding),
      footer: 'Per order',
      footerTone: 'muted',
    },
    {
      label: 'Oldest Debt',
      value: oldest ? moment(oldest.orderDate).format('MMM DD') : '—',
      footer: oldest ? `${oldest.daysOutstanding} days` : 'No outstanding',
      footerTone: oldest ? 'danger' : 'muted',
    },
  ];

  return (
    <div className="flex flex-col gap-5">
      <StatCards cards={stats} />
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm">
        <div className="flex items-center justify-between flex-wrap gap-3 px-5 py-4">
          <div className="flex items-center gap-3 flex-wrap">
            <h3 className="text-base font-semibold text-gray-900">
              All Outstanding Receivables
            </h3>
            <select
              value={agingFilter}
              onChange={(e) => {
                setAgingFilter(e.target.value);
                setPage(1);
              }}
              className="text-xs h-9 px-3 rounded-lg border border-gray-200 text-gray-700 bg-white focus:outline-none focus:border-primaryColor"
            >
              <option value="all">All ages</option>
              <option value="recent">
                1 – 7 days ({agingCounts.recent})
              </option>
              <option value="mid">8 – 30 days ({agingCounts.mid})</option>
              <option value="aged">Over 30 days ({agingCounts.aged})</option>
            </select>
          </div>
          <ExportButtons {...exportHandlers} isLoading={isExporting} />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <SortableTH
                  label="Order Date"
                  sortKey="orderDate"
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
                <SortableTH
                  label="Customer"
                  sortKey="customer"
                  active={sort.key}
                  direction={sort.direction}
                  onSort={toggleSort}
                />
                <SortableTH
                  label="Treated By"
                  sortKey="treatedBy"
                  active={sort.key}
                  direction={sort.direction}
                  onSort={toggleSort}
                />
                <SortableTH
                  label="Order Total"
                  sortKey="orderTotal"
                  active={sort.key}
                  direction={sort.direction}
                  onSort={toggleSort}
                />
                <SortableTH
                  label="Paid So Far"
                  sortKey="paidSoFar"
                  active={sort.key}
                  direction={sort.direction}
                  onSort={toggleSort}
                />
                <SortableTH
                  label="Outstanding"
                  sortKey="outstanding"
                  active={sort.key}
                  direction={sort.direction}
                  onSort={toggleSort}
                />
                <SortableTH
                  label="Days Outstanding"
                  sortKey="daysOutstanding"
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
                    colSpan={8}
                    className="px-5 py-8 text-center text-sm text-gray-500"
                  >
                    No outstanding receivables
                  </td>
                </tr>
              ) : (
                pageRows.map((r) => (
                  <tr key={r.orderId} className="hover:bg-gray-50">
                    <td className="px-5 py-4 text-gray-700">
                      {r.orderDate
                        ? moment(r.orderDate).format('MMM DD, YYYY')
                        : '—'}
                    </td>
                    <td className="px-5 py-4 text-gray-700 font-mono text-xs">
                      {r.orderId}
                    </td>
                    <td className="px-5 py-4 text-gray-900 font-medium">
                      {r.customer}
                    </td>
                    <td className="px-5 py-4 text-gray-700">
                      {r.treatedBy || '—'}
                    </td>
                    <td className="px-5 py-4 text-gray-700">{r.orderTotal}</td>
                    <td className="px-5 py-4 text-emerald-600">
                      {r.paidSoFar}
                    </td>
                    <td className="px-5 py-4 text-red-500 font-semibold">
                      {r.outstanding}
                    </td>
                    <td
                      className={`px-5 py-4 font-medium ${
                        r.daysOutstanding > 30
                          ? 'text-red-500'
                          : r.daysOutstanding > 7
                          ? 'text-amber-500'
                          : 'text-gray-700'
                      }`}
                    >
                      {r.daysOutstanding} {r.daysOutstanding === 1 ? 'day' : 'days'}
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
