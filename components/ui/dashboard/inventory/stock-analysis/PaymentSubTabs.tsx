'use client';

import React, { useMemo, useState } from 'react';
import moment from 'moment';
import { Button, Skeleton } from '@nextui-org/react';
import { FiDownload } from 'react-icons/fi';
import { formatPrice } from '@/lib/utils';
import { AvailableReportsList, StatCards } from './SharedPanels';
import { TablePagination } from './SalesPanels';
import { ExportType } from './exportHelpers';
import {
  AvailableReport,
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

const parseAmount = (formatted: string | null | undefined): number => {
  if (!formatted) return 0;
  const cleaned = formatted.replace(/[^0-9.-]+/g, '');
  return safeNumber(cleaned);
};

const formatNgn = (value: number): string => formatPrice(value, 'NGN');

interface PaymentSubTabPanelProps {
  data?: PaymentReportResponse;
  isLoading?: boolean;
  reports?: AvailableReport[];
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

interface PillCountTab {
  id: string;
  label: string;
  count: number;
}

const PillCountTabs: React.FC<{
  tabs: PillCountTab[];
  active: string;
  onChange: (id: string) => void;
}> = ({ tabs, active, onChange }) => (
  <div className="flex items-center gap-6 px-5 pt-4 border-b border-gray-100 overflow-x-auto scrollbar-hide">
    {tabs.map((tab) => {
      const isActive = active === tab.id;
      return (
        <button
          key={tab.id}
          type="button"
          onClick={() => onChange(tab.id)}
          className={`flex items-center gap-2 pb-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
            isActive
              ? 'text-primaryColor border-primaryColor'
              : 'text-gray-500 border-transparent hover:text-gray-700'
          }`}
        >
          <span>{tab.label}</span>
          <span
            className={`h-5 min-w-5 px-2 inline-flex items-center justify-center rounded-full text-[11px] font-semibold ${
              isActive
                ? 'bg-pink200 text-primaryColor'
                : 'bg-gray-100 text-gray-500'
            }`}
          >
            {tab.count}
          </span>
        </button>
      );
    })}
  </div>
);

export const PaymentSummarySubPanel: React.FC<PaymentSubTabPanelProps> = ({
  data,
  isLoading,
  reports,
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
    const sorted = [...payments].sort((a, b) =>
      moment(b.dateCreated).diff(moment(a.dateCreated))
    );
    if (statusTab === 'all') return sorted;
    return sorted.filter(
      (p) => (p.status ?? '').toLowerCase() === statusTab
    );
  }, [payments, statusTab]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageRows = filtered.slice(
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

  const tabs: PillCountTab[] = [
    { id: 'all', label: 'All payments', count: counts.total },
    { id: 'confirmed', label: 'Confirmed', count: counts.confirmed },
    { id: 'pending', label: 'Pending', count: counts.pending },
    { id: 'failed', label: 'Failed', count: counts.failed },
  ];

  return (
    <div className="flex flex-col gap-5">
      <StatCards cards={stats} />
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm">
        <div className="flex items-center justify-between flex-wrap gap-3 pr-5">
          <PillCountTabs
            tabs={tabs}
            active={statusTab}
            onChange={(v) => {
              setStatusTab(v);
              setPage(1);
            }}
          />
          <div className="px-5 py-4">
            <ExportButtons {...exportHandlers} isLoading={isExporting} />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="text-left px-5 py-3 font-medium">Date</th>
                <th className="text-left px-5 py-3 font-medium">Order ID</th>
                <th className="text-left px-5 py-3 font-medium">Customer</th>
                <th className="text-left px-5 py-3 font-medium">QR Name</th>
                <th className="text-left px-5 py-3 font-medium">Method</th>
                <th className="text-left px-5 py-3 font-medium">Type</th>
                <th className="text-left px-5 py-3 font-medium">Direction</th>
                <th className="text-left px-5 py-3 font-medium">Amount</th>
                <th className="text-left px-5 py-3 font-medium">Confirmed By</th>
                <th className="text-left px-5 py-3 font-medium">Status</th>
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
        {filtered.length > 0 && (
          <TablePagination
            currentPage={safePage}
            totalPages={totalPages}
            onChange={setPage}
          />
        )}
      </div>
      <AvailableReportsList
        reports={reports}
        route="payments"
        title="Available Payment Reports"
      />
    </div>
  );
};

export const PaymentMethodsSubPanel: React.FC<PaymentSubTabPanelProps> = ({
  data,
  isLoading,
  reports,
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

  const sortedMethods = useMemo(
    () =>
      [...methods].sort(
        (a, b) =>
          parseAmount(b.netAmountProcessed) -
          parseAmount(a.netAmountProcessed)
      ),
    [methods]
  );

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
                <th className="text-left px-5 py-3 font-medium">
                  Payment Method
                </th>
                <th className="text-left px-5 py-3 font-medium">
                  No. of Payments
                </th>
                <th className="text-left px-5 py-3 font-medium">
                  Total Credits
                </th>
                <th className="text-left px-5 py-3 font-medium">
                  Total Debits
                </th>
                <th className="text-left px-5 py-3 font-medium">
                  Net Amount Processed
                </th>
                <th className="text-left px-5 py-3 font-medium">
                  Last Activity
                </th>
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
      <AvailableReportsList
        reports={reports}
        route="payments"
        title="Available Payment Reports"
      />
    </div>
  );
};

export const QrRevenueSubPanel: React.FC<PaymentSubTabPanelProps> = ({
  data,
  isLoading,
  reports,
  onExport,
  isExporting,
}) => {
  const exportHandlers = buildExportHandlers(onExport);
  const [page, setPage] = useState(1);

  const qrOrders: QrRevenueItem[] = data?.qrOrders ?? [];

  const sortedQr = useMemo(
    () =>
      [...qrOrders].sort(
        (a, b) =>
          parseAmount(b.totalSalesAmount) - parseAmount(a.totalSalesAmount)
      ),
    [qrOrders]
  );

  const totals = useMemo(() => {
    let orders = 0;
    let total = 0;
    let confirmed = 0;
    let pending = 0;
    let refunds = 0;
    let gross = 0;
    sortedQr.forEach((q) => {
      orders += safeNumber(q.numberOfOrders);
      total += parseAmount(q.totalSalesAmount);
      confirmed += parseAmount(q.confirmedSalesAmount);
      pending += parseAmount(q.pendingSalesAmount);
      refunds += parseAmount(q.totalRefundAmount);
      gross += parseAmount(q.grossSalesAmount);
    });
    return { orders, total, confirmed, pending, refunds, gross };
  }, [sortedQr]);

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
                <th className="text-left px-5 py-3 font-medium">QR Code</th>
                <th className="text-left px-5 py-3 font-medium">Orders</th>
                <th className="text-left px-5 py-3 font-medium">Pending</th>
                <th className="text-left px-5 py-3 font-medium">Confirmed</th>
                <th className="text-left px-5 py-3 font-medium">Total Sales</th>
                <th className="text-left px-5 py-3 font-medium">Refunds</th>
                <th className="text-left px-5 py-3 font-medium">Gross Sales</th>
                <th className="text-left px-5 py-3 font-medium">
                  Last Activity
                </th>
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
      <AvailableReportsList
        reports={reports}
        route="payments"
        title="Available Payment Reports"
      />
    </div>
  );
};

export const NetRevenueSubPanel: React.FC<PaymentSubTabPanelProps> = ({
  data,
  isLoading,
  reports,
  onExport,
  isExporting,
}) => {
  const exportHandlers = buildExportHandlers(onExport);
  const [page, setPage] = useState(1);
  const netRevenues: NetRevenueItem[] = data?.netRevenues ?? [];

  const sortedRevenues = useMemo(
    () =>
      [...netRevenues].sort((a, b) =>
        moment(b.period).diff(moment(a.period))
      ),
    [netRevenues]
  );

  const totals = useMemo(() => {
    let net = 0;
    let positive = 0;
    let negative = 0;
    let positiveCount = 0;
    let negativeCount = 0;
    sortedRevenues.forEach((r) => {
      const amount = parseAmount(r.netRevenue);
      net += amount;
      if (amount > 0) {
        positive += amount;
        positiveCount += 1;
      } else if (amount < 0) {
        negative += amount;
        negativeCount += 1;
      }
    });
    return { net, positive, negative, positiveCount, negativeCount };
  }, [sortedRevenues]);

  const totalPages = Math.max(1, Math.ceil(sortedRevenues.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageRows = sortedRevenues.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE
  );

  if (isLoading) return <PaymentSubTabSkeleton />;

  const top = sortedRevenues.reduce<NetRevenueItem | null>((acc, r) => {
    if (!acc) return r;
    return parseAmount(r.netRevenue) > parseAmount(acc.netRevenue) ? r : acc;
  }, null);

  const stats: StatCard[] = [
    {
      label: 'Net Revenue',
      value: formatNgn(totals.net),
      footer: `${sortedRevenues.length} periods`,
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
          <h3 className="text-base font-semibold text-gray-900">
            Net Revenue by Period
          </h3>
          <ExportButtons {...exportHandlers} isLoading={isExporting} />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="text-left px-5 py-3 font-medium">Period</th>
                <th className="text-left px-5 py-3 font-medium">Day</th>
                <th className="text-left px-5 py-3 font-medium">Net Revenue</th>
                <th className="text-left px-5 py-3 font-medium">
                  Last Activity
                </th>
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
      <AvailableReportsList
        reports={reports}
        route="payments"
        title="Available Payment Reports"
      />
    </div>
  );
};

export const OutstandingReceivablesSubPanel: React.FC<
  PaymentSubTabPanelProps
> = ({ data, isLoading, reports, onExport, isExporting }) => {
  const [page, setPage] = useState(1);
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

  const sorted = useMemo(
    () =>
      [...enriched].sort(
        (a, b) => b.outstandingAmount - a.outstandingAmount
      ),
    [enriched]
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
          <h3 className="text-base font-semibold text-gray-900">
            All Outstanding Receivables
          </h3>
          <ExportButtons {...exportHandlers} isLoading={isExporting} />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="text-left px-5 py-3 font-medium">Order Date</th>
                <th className="text-left px-5 py-3 font-medium">Order ID</th>
                <th className="text-left px-5 py-3 font-medium">Customer</th>
                <th className="text-left px-5 py-3 font-medium">Treated By</th>
                <th className="text-left px-5 py-3 font-medium">
                  Order Total
                </th>
                <th className="text-left px-5 py-3 font-medium">Paid So Far</th>
                <th className="text-left px-5 py-3 font-medium">Outstanding</th>
                <th className="text-left px-5 py-3 font-medium">
                  Days Outstanding
                </th>
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
      <AvailableReportsList
        reports={reports}
        route="payments"
        title="Available Payment Reports"
      />
    </div>
  );
};
