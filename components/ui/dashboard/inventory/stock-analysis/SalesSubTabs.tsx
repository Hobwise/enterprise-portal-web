'use client';

import React, { useMemo, useState } from 'react';
import moment from 'moment';
import { Button, Skeleton } from '@nextui-org/react';
import { FiDownload } from 'react-icons/fi';
import { formatPrice } from '@/lib/utils';
import { BarList, StatCards } from './SharedPanels';
import { TablePagination } from './SalesPanels';
import { ExportType } from './exportHelpers';
import {
  BarRow,
  CategoryPerformanceItem,
  EmployeeOrderItem,
  OrderPaymentItem,
  OrderReportItem,
  OrderReportResponse,
  PopularItem,
  StatCard,
} from './types';

const PAGE_SIZE = 10;

const safeNumber = (value: unknown): number => {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
};

const parseAmount = (formatted: string): number => {
  if (!formatted) return 0;
  const cleaned = formatted.replace(/[^0-9.-]+/g, '');
  return safeNumber(cleaned);
};

const formatNgn = (value: number): string => formatPrice(value, 'NGN');

interface SalesSubTabPanelProps {
  data?: OrderReportResponse;
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

const SubTabSkeleton: React.FC = () => (
  <div className="flex flex-col gap-5">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {[0, 1, 2, 3].map((i) => (
        <Skeleton key={i} className="h-28 rounded-2xl" />
      ))}
    </div>
    <Skeleton className="h-80 rounded-2xl" />
  </div>
);

const NoOrdersMessage: React.FC<{ label?: string }> = ({ label }) => (
  <div className="bg-white border border-gray-100 rounded-2xl shadow-sm py-12 text-center text-sm text-gray-500">
    {label ?? 'No orders for this period'}
  </div>
);

const normalizeStatus = (status: string): string => {
  const s = (status ?? '').toLowerCase();
  if (s === 'awaitingconfirmation') return 'awaiting';
  return s;
};

const formatStatusLabel = (status: string): string => {
  const s = (status ?? '').toLowerCase();
  if (s === 'awaitingconfirmation') return 'Awaiting Confirmation';
  if (!status) return '—';
  return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
};

const orderStatusClass = (status: string): string => {
  const s = normalizeStatus(status);
  if (s === 'closed') return 'text-emerald-600';
  if (s === 'open') return 'text-primaryColor';
  if (s === 'cancelled') return 'text-red-500';
  if (s === 'awaiting') return 'text-amber-500';
  return 'text-gray-700';
};

interface PillCountTab {
  id: string;
  label: string;
  count: number;
}

interface PillTabBarProps {
  tabs: PillCountTab[];
  active: string;
  onChange: (id: string) => void;
}

const PillCountTabs: React.FC<PillTabBarProps> = ({
  tabs,
  active,
  onChange,
}) => (
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

export const OrdersVolumesPanel: React.FC<SalesSubTabPanelProps> = ({
  data,
  isLoading,
  onExport,
  isExporting,
}) => {
  const [statusTab, setStatusTab] = useState<
    'all' | 'open' | 'closed' | 'awaiting' | 'cancelled'
  >('all');
  const [page, setPage] = useState(1);
  const exportHandlers = buildExportHandlers(onExport);

  const orders = (data?.orders ?? []) as OrderReportItem[];

  const counts = useMemo(() => {
    let total = 0;
    let open = 0;
    let closed = 0;
    let cancelled = 0;
    let awaiting = 0;
    let grossRevenue = 0;
    orders.forEach((o) => {
      total += 1;
      grossRevenue += parseAmount(o.totalAmount);
      const status = normalizeStatus(o.orderStatus);
      if (status === 'open') open += 1;
      else if (status === 'closed') closed += 1;
      else if (status === 'cancelled') cancelled += 1;
      else if (status === 'awaiting') awaiting += 1;
    });
    return { total, open, closed, cancelled, awaiting, grossRevenue };
  }, [orders]);

  const filteredOrders = useMemo(() => {
    const sorted = [...orders].sort((a, b) =>
      moment(b.dateCreated).diff(moment(a.dateCreated))
    );
    if (statusTab === 'all') return sorted;
    return sorted.filter(
      (o) => normalizeStatus(o.orderStatus) === statusTab
    );
  }, [orders, statusTab]);

  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageRows = filteredOrders.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE
  );

  if (isLoading) return <SubTabSkeleton />;

  const stats: StatCard[] = [
    {
      label: 'Total Orders',
      value: counts.total.toLocaleString(),
      footer: 'In period',
      footerTone: 'muted',
    },
    {
      label: 'Open Orders',
      value: counts.open.toLocaleString(),
      footer: 'Currently active',
      footerTone: 'muted',
    },
    {
      label: 'Closed Orders',
      value: counts.closed.toLocaleString(),
      footer: 'Successfully fulfilled',
      footerTone: 'success',
    },
    {
      label: 'Gross Revenue',
      value: formatNgn(counts.grossRevenue),
      footer: 'In period',
      footerTone: 'muted',
    },
  ];

  return (
    <div className="flex flex-col gap-5">
      <StatCards cards={stats} />
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm">
        <div className="flex items-center justify-between flex-wrap gap-3 pr-5">
          <PillCountTabs
            tabs={[
              { id: 'all', label: 'All Orders', count: counts.total },
              { id: 'open', label: 'Open', count: counts.open },
              { id: 'closed', label: 'Closed', count: counts.closed },
              {
                id: 'awaiting',
                label: 'Awaiting Confirmation',
                count: counts.awaiting,
              },
              { id: 'cancelled', label: 'Cancelled', count: counts.cancelled },
            ]}
            active={statusTab}
            onChange={(v) => {
              setStatusTab(v as typeof statusTab);
              setPage(1);
            }}
          />
          <ExportButtons {...exportHandlers} isLoading={isExporting} />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="text-left px-5 py-3 font-medium">Date</th>
                <th className="text-left px-5 py-3 font-medium">Order ID</th>
                <th className="text-left px-5 py-3 font-medium">Customer</th>
                <th className="text-left px-5 py-3 font-medium">QR Name</th>
                <th className="text-left px-5 py-3 font-medium">Treated By</th>
                <th className="text-left px-5 py-3 font-medium">
                  Payment Method
                </th>
                <th className="text-left px-5 py-3 font-medium">
                  Total Amount
                </th>
                <th className="text-left px-5 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {pageRows.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-5 py-8 text-center text-sm text-gray-500"
                  >
                    No orders for this period
                  </td>
                </tr>
              ) : (
                pageRows.map((order) => (
                  <tr key={order.orderId} className="hover:bg-gray-50">
                    <td className="px-5 py-4 text-gray-700">
                      {moment(order.dateCreated).format('MMM DD, hh:mma')}
                    </td>
                    <td className="px-5 py-4 text-gray-700 font-mono text-xs">
                      {order.orderId}
                    </td>
                    <td className="px-5 py-4 text-gray-900 font-medium">
                      {order.customerName || 'anonymous'}
                    </td>
                    <td className="px-5 py-4 text-gray-700">
                      {order.quickResponseName || '—'}
                    </td>
                    <td className="px-5 py-4 text-gray-700">
                      {order.treatedBy || '—'}
                    </td>
                    <td className="px-5 py-4 text-gray-700">
                      {order.paymentMethod || '—'}
                    </td>
                    <td className="px-5 py-4 text-gray-900 font-semibold">
                      {order.totalAmount}
                    </td>
                    <td
                      className={`px-5 py-4 font-medium ${orderStatusClass(
                        order.orderStatus
                      )}`}
                    >
                      {formatStatusLabel(order.orderStatus)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {filteredOrders.length > 0 && (
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

export const PopularItemsPanel: React.FC<SalesSubTabPanelProps> = ({
  data,
  isLoading,
  onExport,
  isExporting,
}) => {
  const [page, setPage] = useState(1);
  const items: PopularItem[] = data?.items ?? [];
  const exportHandlers = buildExportHandlers(onExport);

  const sortedItems = useMemo(
    () => [...items].sort((a, b) => b.totalQuantitySold - a.totalQuantitySold),
    [items]
  );

  const totalPages = Math.max(1, Math.ceil(sortedItems.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageRows = sortedItems.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE
  );

  if (isLoading) return <SubTabSkeleton />;

  const totalQty = sortedItems.reduce(
    (s, i) => s + safeNumber(i.totalQuantitySold),
    0
  );
  const totalGross = sortedItems.reduce(
    (s, i) => s + parseAmount(i.grossSalesAmount),
    0
  );
  const top = sortedItems[0] ?? null;

  const stats: StatCard[] = [
    {
      label: 'Total Items Tracked',
      value: sortedItems.length.toLocaleString(),
      footer: 'In Order Menu',
      footerTone: 'success',
    },
    {
      label: 'Top Seller',
      value: top?.itemName ?? '—',
      footer: top ? `${safeNumber(top.totalQuantitySold)} sold` : 'No data',
      footerTone: 'success',
    },
    {
      label: 'Gross Item Sales',
      value: formatNgn(totalGross),
      footer: 'Across all items',
      footerTone: 'muted',
    },
    {
      label: 'Total Quantity Sold',
      value: totalQty.toLocaleString(),
      footer: 'In period',
      footerTone: 'muted',
    },
  ];

  const topRows: BarRow[] = sortedItems.slice(0, 7).map((i) => ({
    label: i.itemName,
    value: safeNumber(i.totalQuantitySold),
    suffix: ' sold',
  }));

  const revenueRows: BarRow[] = [...sortedItems]
    .sort(
      (a, b) =>
        parseAmount(b.grossSalesAmount) - parseAmount(a.grossSalesAmount)
    )
    .slice(0, 7)
    .map((i) => ({
      label: i.itemName,
      value: parseAmount(i.grossSalesAmount),
    }));

  return (
    <div className="flex flex-col gap-5">
      <StatCards cards={stats} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {topRows.length > 0 ? (
          <BarList title="Top Sellers by Quantity" rows={topRows} />
        ) : (
          <NoOrdersMessage label="No items in this period" />
        )}
        {revenueRows.length > 0 ? (
          <BarList
            title="Top Sellers by Revenue"
            rows={revenueRows}
            valueFormatter={(r) => formatNgn(r.value)}
          />
        ) : (
          <NoOrdersMessage label="No items in this period" />
        )}
      </div>
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm">
        <div className="flex items-center justify-between flex-wrap gap-3 px-5 py-4">
          <h3 className="text-base font-semibold text-gray-900">
            All items Order Volumes
          </h3>
          <ExportButtons {...exportHandlers} isLoading={isExporting} />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="text-left px-5 py-3 font-medium">Item Name</th>
                <th className="text-left px-5 py-3 font-medium">Menu</th>
                <th className="text-left px-5 py-3 font-medium">
                  Quantity Sold
                </th>
                <th className="text-left px-5 py-3 font-medium">
                  Current Price
                </th>
                <th className="text-left px-5 py-3 font-medium">Net Sales</th>
                <th className="text-left px-5 py-3 font-medium">Packaging</th>
                <th className="text-left px-5 py-3 font-medium">Gross Sales</th>
                <th className="text-left px-5 py-3 font-medium">
                  Availability
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
                    No items in this period
                  </td>
                </tr>
              ) : (
                pageRows.map((i, index) => (
                  <tr
                    key={`${i.itemName}-${index}`}
                    className="hover:bg-gray-50"
                  >
                    <td className="px-5 py-4 text-gray-900 font-medium">
                      {i.itemName}
                    </td>
                    <td className="px-5 py-4 text-gray-700">
                      {i.menuName || '—'}
                    </td>
                    <td className="px-5 py-4 text-gray-700">
                      {safeNumber(i.totalQuantitySold).toLocaleString()}
                    </td>
                    <td className="px-5 py-4 text-gray-700">
                      {i.currentPrice}
                    </td>
                    <td className="px-5 py-4 text-gray-700">
                      {i.netSalesAmount}
                    </td>
                    <td className="px-5 py-4 text-gray-700">
                      {i.totalPackagingAmount}
                    </td>
                    <td className="px-5 py-4 text-gray-900 font-semibold">
                      {i.grossSalesAmount}
                    </td>
                    <td
                      className={`px-5 py-4 font-medium ${
                        i.isCurrentlyAvailable
                          ? 'text-emerald-600'
                          : 'text-red-500'
                      }`}
                    >
                      {i.isCurrentlyAvailable ? 'Available' : 'Unavailable'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {sortedItems.length > 0 && (
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

export const EmployeePerformancePanel: React.FC<SalesSubTabPanelProps> = ({
  data,
  isLoading,
  onExport,
  isExporting,
}) => {
  const [page, setPage] = useState(1);
  const exportHandlers = buildExportHandlers(onExport);
  const employees = ((data?.orders as EmployeeOrderItem[] | undefined) ?? [])
    .slice()
    .sort((a, b) => parseAmount(b.totalSales) - parseAmount(a.totalSales));

  const totalPages = Math.max(1, Math.ceil(employees.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageRows = employees.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE
  );

  if (isLoading) return <SubTabSkeleton />;

  const top = employees[0] ?? null;
  const totalSales = employees.reduce(
    (s, e) => s + parseAmount(e.totalSales),
    0
  );
  const totalConfirmed = employees.reduce(
    (s, e) => s + parseAmount(e.confirmedSales),
    0
  );
  const totalOrders = employees.reduce(
    (s, e) => s + safeNumber(e.numberOfOrders),
    0
  );

  const fullName = (e: EmployeeOrderItem) =>
    `${e.firstName ?? ''} ${e.lastName ?? ''}`.trim() || e.emailAddress;

  const stats: StatCard[] = [
    {
      label: 'Staffs Handling Orders',
      value: employees.length.toLocaleString(),
      footer: 'Active Staffs',
      footerTone: 'success',
    },
    {
      label: 'Top Performer',
      value: top ? fullName(top) : '—',
      footer: top
        ? `${safeNumber(top.numberOfOrders)} Orders`
        : 'No data',
      footerTone: 'success',
    },
    {
      label: 'Confirmed Sales',
      value: formatNgn(totalConfirmed),
      footer: 'Across all staffs',
      footerTone: 'success',
    },
    {
      label: 'Number of Orders',
      value: totalOrders.toLocaleString(),
      footer: 'Treated in period',
      footerTone: 'muted',
    },
  ];

  return (
    <div className="flex flex-col gap-5">
      <StatCards cards={stats} />
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm">
        <div className="flex items-center justify-between flex-wrap gap-3 px-5 py-4">
          <h3 className="text-base font-semibold text-gray-900">
            All Employees Performance
          </h3>
          <ExportButtons {...exportHandlers} isLoading={isExporting} />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="text-left px-5 py-3 font-medium">Staff</th>
                <th className="text-left px-5 py-3 font-medium">Email</th>
                <th className="text-left px-5 py-3 font-medium">
                  No. of Orders
                </th>
                <th className="text-left px-5 py-3 font-medium">
                  Pending Sales
                </th>
                <th className="text-left px-5 py-3 font-medium">
                  Confirmed Sales
                </th>
                <th className="text-left px-5 py-3 font-medium">Total Sales</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {pageRows.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-5 py-8 text-center text-sm text-gray-500"
                  >
                    No staff orders in this period
                  </td>
                </tr>
              ) : (
                pageRows.map((e, index) => (
                  <tr
                    key={`${e.emailAddress}-${index}`}
                    className="hover:bg-gray-50"
                  >
                    <td className="px-5 py-4 text-gray-900 font-medium">
                      {fullName(e)}
                    </td>
                    <td className="px-5 py-4 text-gray-700">
                      {e.emailAddress || '—'}
                    </td>
                    <td className="px-5 py-4 text-gray-700">
                      {safeNumber(e.numberOfOrders).toLocaleString()}
                    </td>
                    <td className="px-5 py-4 text-amber-500">
                      {e.pendingSales}
                    </td>
                    <td className="px-5 py-4 text-emerald-600">
                      {e.confirmedSales}
                    </td>
                    <td className="px-5 py-4 text-gray-900 font-semibold">
                      {e.totalSales}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {employees.length > 0 && (
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

export const CategoryPerformancePanel: React.FC<SalesSubTabPanelProps> = ({
  data,
  isLoading,
  onExport,
  isExporting,
}) => {
  const [page, setPage] = useState(1);
  const exportHandlers = buildExportHandlers(onExport);
  const categories: CategoryPerformanceItem[] = useMemo(
    () =>
      [...(data?.categories ?? [])].sort(
        (a, b) => parseAmount(b.totalAmount) - parseAmount(a.totalAmount)
      ),
    [data]
  );

  const totalPages = Math.max(1, Math.ceil(categories.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageRows = categories.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE
  );

  if (isLoading) return <SubTabSkeleton />;

  const totalSales = categories.reduce(
    (s, c) => s + parseAmount(c.totalAmount),
    0
  );
  const totalOrders = categories.reduce(
    (s, c) => s + safeNumber(c.totalOrders),
    0
  );
  const totalItems = categories.reduce(
    (s, c) => s + safeNumber(c.totalItemsSold),
    0
  );
  const top = categories[0] ?? null;

  const stats: StatCard[] = [
    {
      label: 'Categories',
      value: categories.length.toLocaleString(),
      footer: 'Active categories',
      footerTone: 'success',
    },
    {
      label: 'Top Category',
      value: top?.categoryName ?? '—',
      footer: top
        ? `${safeNumber(top.totalOrders)} Orders`
        : 'No data',
      footerTone: 'success',
    },
    {
      label: 'Total Sales',
      value: formatNgn(totalSales),
      footer: 'Across all categories',
      footerTone: 'muted',
    },
    {
      label: 'Items Sold',
      value: totalItems.toLocaleString(),
      footer: `${totalOrders.toLocaleString()} orders`,
      footerTone: 'muted',
    },
  ];

  const dailyRows: BarRow[] = categories.slice(0, 7).map((c) => ({
    label: c.categoryName,
    value: safeNumber(c.totalOrders),
    suffix: ' Orders',
  }));

  return (
    <div className="flex flex-col gap-5">
      <StatCards cards={stats} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {dailyRows.length > 0 ? (
          <BarList title="Orders by Category" rows={dailyRows} />
        ) : (
          <NoOrdersMessage label="No category data" />
        )}
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5">
          <h3 className="text-base font-semibold text-gray-900 mb-4">
            Share of Sales
          </h3>
          {categories.length === 0 ? (
            <p className="text-sm text-gray-500 py-4 text-center">
              No category data
            </p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {categories.slice(0, 6).map((c) => (
                <li
                  key={c.categoryName}
                  className="flex items-center justify-between py-3 text-sm"
                >
                  <span className="text-gray-700">{c.categoryName}</span>
                  <span className="font-semibold text-primaryColor">
                    {c.percentageOfTotalSales}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm">
        <div className="flex items-center justify-between flex-wrap gap-3 px-5 py-4">
          <h3 className="text-base font-semibold text-gray-900">
            All categories and Order Volumes
          </h3>
          <ExportButtons {...exportHandlers} isLoading={isExporting} />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="text-left px-5 py-3 font-medium">Category</th>
                <th className="text-left px-5 py-3 font-medium">Orders</th>
                <th className="text-left px-5 py-3 font-medium">Items Sold</th>
                <th className="text-left px-5 py-3 font-medium">
                  Total Sales Revenue
                </th>
                <th className="text-left px-5 py-3 font-medium">Percentage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {pageRows.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-5 py-8 text-center text-sm text-gray-500"
                  >
                    No categories for this period
                  </td>
                </tr>
              ) : (
                pageRows.map((c) => (
                  <tr key={c.categoryName} className="hover:bg-gray-50">
                    <td className="px-5 py-4 text-gray-900 font-medium">
                      {c.categoryName}
                    </td>
                    <td className="px-5 py-4 text-gray-700">
                      {safeNumber(c.totalOrders).toLocaleString()}
                    </td>
                    <td className="px-5 py-4 text-gray-700">
                      {safeNumber(c.totalItemsSold).toLocaleString()}
                    </td>
                    <td className="px-5 py-4 text-gray-900 font-semibold">
                      {c.totalAmount}
                    </td>
                    <td className="px-5 py-4 text-primaryColor font-semibold">
                      {c.percentageOfTotalSales}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {categories.length > 0 && (
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

const paymentStatusClass = (status: string): string => {
  const s = (status ?? '').toLowerCase();
  if (s === 'paid') return 'text-emerald-600';
  if (s === 'unpaid') return 'text-red-500';
  if (s === 'partially paid') return 'text-amber-500';
  if (s === 'refunded') return 'text-primaryColor';
  return 'text-gray-700';
};

export const OrderPaymentSummaryPanel: React.FC<SalesSubTabPanelProps> = ({
  data,
  isLoading,
  onExport,
  isExporting,
}) => {
  const [statusTab, setStatusTab] = useState<string>('all');
  const [page, setPage] = useState(1);
  const exportHandlers = buildExportHandlers(onExport);

  const orderPayments: OrderPaymentItem[] = data?.orderPayments ?? [];

  const counts = useMemo(() => {
    let total = 0;
    let paid = 0;
    let unpaid = 0;
    let partial = 0;
    let refunded = 0;
    let totalRevenue = 0;
    let totalOutstanding = 0;
    let totalRefunds = 0;
    orderPayments.forEach((o) => {
      total += 1;
      const s = (o.paymentStatus ?? '').toLowerCase();
      if (s === 'paid') paid += 1;
      else if (s === 'unpaid') unpaid += 1;
      else if (s === 'partially paid') partial += 1;
      else if (s === 'refunded') refunded += 1;
      totalRevenue += parseAmount(o.totalPaid);
      totalOutstanding += parseAmount(o.outstanding);
      totalRefunds += parseAmount(o.totalRefunded);
    });
    return {
      total,
      paid,
      unpaid,
      partial,
      refunded,
      totalRevenue,
      totalOutstanding,
      totalRefunds,
    };
  }, [orderPayments]);

  const filtered = useMemo(() => {
    const sorted = [...orderPayments].sort((a, b) =>
      moment(b.orderDate).diff(moment(a.orderDate))
    );
    if (statusTab === 'all') return sorted;
    return sorted.filter(
      (o) => (o.paymentStatus ?? '').toLowerCase() === statusTab
    );
  }, [orderPayments, statusTab]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageRows = filtered.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE
  );

  if (isLoading) return <SubTabSkeleton />;

  const stats: StatCard[] = [
    {
      label: 'Total Collected',
      value: formatNgn(counts.totalRevenue),
      footer: `${counts.total} orders`,
      footerTone: 'muted',
    },
    {
      label: 'Outstanding',
      value: formatNgn(counts.totalOutstanding),
      footer: counts.totalOutstanding > 0 ? 'To be collected' : 'All settled',
      footerTone: counts.totalOutstanding > 0 ? 'warning' : 'success',
    },
    {
      label: 'Refunds',
      value: formatNgn(counts.totalRefunds),
      footer: 'Issued',
      footerTone: 'muted',
    },
    {
      label: 'Paid Orders',
      value: counts.paid.toLocaleString(),
      footer: 'Fully settled',
      footerTone: 'success',
    },
  ];

  const tabs: PillCountTab[] = [
    { id: 'all', label: 'All payments', count: counts.total },
    { id: 'paid', label: 'Paid', count: counts.paid },
    {
      id: 'partially paid',
      label: 'Partially Paid',
      count: counts.partial,
    },
    { id: 'unpaid', label: 'Unpaid', count: counts.unpaid },
    { id: 'refunded', label: 'Refunded', count: counts.refunded },
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
          <ExportButtons {...exportHandlers} isLoading={isExporting} />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="text-left px-5 py-3 font-medium">Date</th>
                <th className="text-left px-5 py-3 font-medium">Order ID</th>
                <th className="text-left px-5 py-3 font-medium">Customer</th>
                <th className="text-left px-5 py-3 font-medium">Order Total</th>
                <th className="text-left px-5 py-3 font-medium">Total Paid</th>
                <th className="text-left px-5 py-3 font-medium">Refunded</th>
                <th className="text-left px-5 py-3 font-medium">Outstanding</th>
                <th className="text-left px-5 py-3 font-medium">
                  Payment Status
                </th>
                <th className="text-left px-5 py-3 font-medium">
                  Order Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {pageRows.length === 0 ? (
                <tr>
                  <td
                    colSpan={9}
                    className="px-5 py-8 text-center text-sm text-gray-500"
                  >
                    No orders match this filter
                  </td>
                </tr>
              ) : (
                pageRows.map((o) => (
                  <tr key={o.orderId} className="hover:bg-gray-50">
                    <td className="px-5 py-4 text-gray-700">
                      {moment(o.orderDate).format('MMM DD, hh:mma')}
                    </td>
                    <td className="px-5 py-4 text-gray-700 font-mono text-xs">
                      {o.orderId}
                    </td>
                    <td className="px-5 py-4 text-gray-900 font-medium">
                      {o.customer || 'anonymous'}
                    </td>
                    <td className="px-5 py-4 text-gray-700">{o.orderTotal}</td>
                    <td className="px-5 py-4 text-emerald-600">
                      {o.totalPaid}
                    </td>
                    <td className="px-5 py-4 text-gray-700">
                      {o.totalRefunded}
                    </td>
                    <td
                      className={`px-5 py-4 ${
                        parseAmount(o.outstanding) > 0
                          ? 'text-red-500 font-semibold'
                          : 'text-gray-700'
                      }`}
                    >
                      {o.outstanding}
                    </td>
                    <td
                      className={`px-5 py-4 font-medium ${paymentStatusClass(
                        o.paymentStatus
                      )}`}
                    >
                      {o.paymentStatus}
                    </td>
                    <td
                      className={`px-5 py-4 font-medium ${orderStatusClass(
                        o.orderStatus
                      )}`}
                    >
                      {formatStatusLabel(o.orderStatus)}
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
    </div>
  );
};
