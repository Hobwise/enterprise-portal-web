'use client';

import React, { useMemo, useState } from 'react';
import moment from 'moment';
import { Button, Skeleton } from '@nextui-org/react';
import { FiDownload } from 'react-icons/fi';
import { formatPrice } from '@/lib/utils';
import {
  BarList,
  DistributionDonut,
  DistributionSegment,
  SortableTH,
  StatCards,
  useTableSort,
} from './SharedPanels';
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
      const status = normalizeStatus(o.orderStatus);
      // Gross Revenue should reflect realized sales — exclude cancelled orders.
      if (status !== 'cancelled') grossRevenue += parseAmount(o.totalAmount);
      if (status === 'open') open += 1;
      else if (status === 'closed') closed += 1;
      else if (status === 'cancelled') cancelled += 1;
      else if (status === 'awaiting') awaiting += 1;
    });
    return { total, open, closed, cancelled, awaiting, grossRevenue };
  }, [orders]);

  const filteredOrders = useMemo(() => {
    if (statusTab === 'all') return orders;
    return orders.filter((o) => normalizeStatus(o.orderStatus) === statusTab);
  }, [orders, statusTab]);

  const getOrderValue = React.useCallback(
    (
      o: OrderReportItem,
      key:
        | 'dateCreated'
        | 'orderId'
        | 'customerName'
        | 'quickResponseName'
        | 'treatedBy'
        | 'paymentMethod'
        | 'totalAmount'
        | 'orderStatus'
    ) => {
      if (key === 'dateCreated') return toTime(o.dateCreated);
      if (key === 'totalAmount') return parseAmount(o.totalAmount);
      return ((o as any)[key] ?? '') as string;
    },
    []
  );

  const { sort, sorted, toggleSort } = useTableSort(
    filteredOrders,
    getOrderValue,
    { key: 'dateCreated', direction: 'desc' }
  );

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageRows = sorted.slice(
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
        <div className="flex items-center justify-between flex-wrap gap-3 px-5 py-4">
          <div className="flex items-center gap-3 flex-wrap">
            <h3 className="text-base font-semibold text-gray-900">
              Order Value
            </h3>
            <select
              value={statusTab}
              onChange={(e) => {
                setStatusTab(e.target.value as typeof statusTab);
                setPage(1);
              }}
              className="text-xs h-9 px-3 rounded-lg border border-gray-200 text-gray-700 bg-white focus:outline-none focus:border-primaryColor"
            >
              <option value="all">All Orders ({counts.total})</option>
              <option value="open">Open ({counts.open})</option>
              <option value="closed">Closed ({counts.closed})</option>
              <option value="awaiting">
                Awaiting Confirmation ({counts.awaiting})
              </option>
              <option value="cancelled">
                Cancelled ({counts.cancelled})
              </option>
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
                  sortKey="customerName"
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
                  label="Treated By"
                  sortKey="treatedBy"
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
                  label="Total Amount"
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

export const PopularItemsPanel: React.FC<SalesSubTabPanelProps> = ({
  data,
  isLoading,
  onExport,
  isExporting,
}) => {
  const [page, setPage] = useState(1);
  const [menuFilter, setMenuFilter] = useState<string>('all');
  const items: PopularItem[] = data?.items ?? [];
  const exportHandlers = buildExportHandlers(onExport);

  const menuNames = useMemo(() => {
    const set = new Set<string>();
    items.forEach((i) => {
      if (i.menuName) set.add(i.menuName);
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [items]);

  const filteredItems = useMemo(() => {
    if (menuFilter === 'all') return items;
    if (menuFilter === 'available')
      return items.filter((i) => i.isCurrentlyAvailable);
    if (menuFilter === 'unavailable')
      return items.filter((i) => !i.isCurrentlyAvailable);
    return items.filter((i) => i.menuName === menuFilter);
  }, [items, menuFilter]);

  const getPopularItemValue = React.useCallback(
    (
      i: PopularItem,
      key:
        | 'itemName'
        | 'menuName'
        | 'totalQuantitySold'
        | 'currentPrice'
        | 'netSalesAmount'
        | 'totalPackagingAmount'
        | 'grossSalesAmount'
        | 'isCurrentlyAvailable'
    ) => {
      switch (key) {
        case 'totalQuantitySold':
          return safeNumber(i.totalQuantitySold);
        case 'currentPrice':
          return parseAmount(i.currentPrice);
        case 'netSalesAmount':
          return parseAmount(i.netSalesAmount);
        case 'totalPackagingAmount':
          return parseAmount(i.totalPackagingAmount);
        case 'grossSalesAmount':
          return parseAmount(i.grossSalesAmount);
        case 'isCurrentlyAvailable':
          return i.isCurrentlyAvailable ? 1 : 0;
        default:
          return ((i as any)[key] ?? '') as string;
      }
    },
    []
  );

  const {
    sort: itemsSort,
    sorted: sortedItems,
    toggleSort: toggleItemsSort,
  } = useTableSort(filteredItems, getPopularItemValue, {
    key: 'totalQuantitySold',
    direction: 'desc',
  });

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
          <div className="flex items-center gap-3 flex-wrap">
            <h3 className="text-base font-semibold text-gray-900">
              All items Order Volumes
            </h3>
            <select
              value={menuFilter}
              onChange={(e) => {
                setMenuFilter(e.target.value);
                setPage(1);
              }}
              className="text-xs h-9 px-3 rounded-lg border border-gray-200 text-gray-700 bg-white focus:outline-none focus:border-primaryColor"
            >
              <option value="all">All items</option>
              <option value="available">Available</option>
              <option value="unavailable">Unavailable</option>
              {menuNames.length > 0 && (
                <optgroup label="Menus">
                  {menuNames.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </optgroup>
              )}
            </select>
          </div>
          <ExportButtons {...exportHandlers} isLoading={isExporting} />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <SortableTH
                  label="Item Name"
                  sortKey="itemName"
                  active={itemsSort.key}
                  direction={itemsSort.direction}
                  onSort={toggleItemsSort}
                />
                <SortableTH
                  label="Menu"
                  sortKey="menuName"
                  active={itemsSort.key}
                  direction={itemsSort.direction}
                  onSort={toggleItemsSort}
                />
                <SortableTH
                  label="Quantity Sold"
                  sortKey="totalQuantitySold"
                  active={itemsSort.key}
                  direction={itemsSort.direction}
                  onSort={toggleItemsSort}
                />
                <SortableTH
                  label="Current Price"
                  sortKey="currentPrice"
                  active={itemsSort.key}
                  direction={itemsSort.direction}
                  onSort={toggleItemsSort}
                />
                <SortableTH
                  label="Net Sales"
                  sortKey="netSalesAmount"
                  active={itemsSort.key}
                  direction={itemsSort.direction}
                  onSort={toggleItemsSort}
                />
                <SortableTH
                  label="Packaging"
                  sortKey="totalPackagingAmount"
                  active={itemsSort.key}
                  direction={itemsSort.direction}
                  onSort={toggleItemsSort}
                />
                <SortableTH
                  label="Gross Sales"
                  sortKey="grossSalesAmount"
                  active={itemsSort.key}
                  direction={itemsSort.direction}
                  onSort={toggleItemsSort}
                />
                <SortableTH
                  label="Availability"
                  sortKey="isCurrentlyAvailable"
                  active={itemsSort.key}
                  direction={itemsSort.direction}
                  onSort={toggleItemsSort}
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
  const [activityFilter, setActivityFilter] = useState<string>('all');
  const exportHandlers = buildExportHandlers(onExport);
  const allEmployees = useMemo(
    () => (data?.orders as EmployeeOrderItem[] | undefined) ?? [],
    [data]
  );

  const employees = useMemo(() => {
    if (activityFilter === 'all') return allEmployees;
    if (activityFilter === 'active')
      return allEmployees.filter((e) => safeNumber(e.numberOfOrders) > 0);
    if (activityFilter === 'idle')
      return allEmployees.filter((e) => safeNumber(e.numberOfOrders) === 0);
    if (activityFilter === 'pending')
      return allEmployees.filter((e) => parseAmount(e.pendingSales) > 0);
    return allEmployees;
  }, [allEmployees, activityFilter]);

  const getEmployeeValue = React.useCallback(
    (
      e: EmployeeOrderItem,
      key:
        | 'firstName'
        | 'emailAddress'
        | 'numberOfOrders'
        | 'pendingSales'
        | 'confirmedSales'
        | 'totalSales'
    ) => {
      switch (key) {
        case 'firstName':
          return `${e.firstName ?? ''} ${e.lastName ?? ''}`.trim();
        case 'numberOfOrders':
          return safeNumber(e.numberOfOrders);
        case 'pendingSales':
          return parseAmount(e.pendingSales);
        case 'confirmedSales':
          return parseAmount(e.confirmedSales);
        case 'totalSales':
          return parseAmount(e.totalSales);
        default:
          return e.emailAddress ?? '';
      }
    },
    []
  );

  const {
    sort: empSort,
    sorted: sortedEmployees,
    toggleSort: toggleEmpSort,
  } = useTableSort(employees, getEmployeeValue, {
    key: 'totalSales',
    direction: 'desc',
  });

  const totalPages = Math.max(1, Math.ceil(sortedEmployees.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageRows = sortedEmployees.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE
  );

  if (isLoading) return <SubTabSkeleton />;

  const top =
    allEmployees.length > 0
      ? [...allEmployees].sort(
          (a, b) => parseAmount(b.totalSales) - parseAmount(a.totalSales)
        )[0]
      : null;
  const totalSales = allEmployees.reduce(
    (s, e) => s + parseAmount(e.totalSales),
    0
  );
  const totalConfirmed = allEmployees.reduce(
    (s, e) => s + parseAmount(e.confirmedSales),
    0
  );
  const totalOrders = allEmployees.reduce(
    (s, e) => s + safeNumber(e.numberOfOrders),
    0
  );

  const fullName = (e: EmployeeOrderItem) =>
    `${e.firstName ?? ''} ${e.lastName ?? ''}`.trim() || e.emailAddress;

  const stats: StatCard[] = [
    {
      label: 'Staffs Handling Orders',
      value: allEmployees.length.toLocaleString(),
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
          <div className="flex items-center gap-3 flex-wrap">
            <h3 className="text-base font-semibold text-gray-900">
              All Employees Performance
            </h3>
            <select
              value={activityFilter}
              onChange={(e) => {
                setActivityFilter(e.target.value);
                setPage(1);
              }}
              className="text-xs h-9 px-3 rounded-lg border border-gray-200 text-gray-700 bg-white focus:outline-none focus:border-primaryColor"
            >
              <option value="all">All staffs</option>
              <option value="active">With Orders</option>
              <option value="idle">No Orders</option>
              <option value="pending">Has Pending Sales</option>
            </select>
          </div>
          <ExportButtons {...exportHandlers} isLoading={isExporting} />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <SortableTH
                  label="Staff"
                  sortKey="firstName"
                  active={empSort.key}
                  direction={empSort.direction}
                  onSort={toggleEmpSort}
                />
                <SortableTH
                  label="Email"
                  sortKey="emailAddress"
                  active={empSort.key}
                  direction={empSort.direction}
                  onSort={toggleEmpSort}
                />
                <SortableTH
                  label="No. of Orders"
                  sortKey="numberOfOrders"
                  active={empSort.key}
                  direction={empSort.direction}
                  onSort={toggleEmpSort}
                />
                <SortableTH
                  label="Pending Sales"
                  sortKey="pendingSales"
                  active={empSort.key}
                  direction={empSort.direction}
                  onSort={toggleEmpSort}
                />
                <SortableTH
                  label="Confirmed Sales"
                  sortKey="confirmedSales"
                  active={empSort.key}
                  direction={empSort.direction}
                  onSort={toggleEmpSort}
                />
                <SortableTH
                  label="Total Sales"
                  sortKey="totalSales"
                  active={empSort.key}
                  direction={empSort.direction}
                  onSort={toggleEmpSort}
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
        {sortedEmployees.length > 0 && (
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
    () => data?.categories ?? [],
    [data]
  );

  const getCategoryValue = React.useCallback(
    (
      c: CategoryPerformanceItem,
      key:
        | 'categoryName'
        | 'totalOrders'
        | 'totalItemsSold'
        | 'totalAmount'
        | 'percentageOfTotalSales'
    ) => {
      switch (key) {
        case 'totalOrders':
          return safeNumber(c.totalOrders);
        case 'totalItemsSold':
          return safeNumber(c.totalItemsSold);
        case 'totalAmount':
          return parseAmount(c.totalAmount);
        case 'percentageOfTotalSales':
          return parseAmount(c.percentageOfTotalSales);
        default:
          return c.categoryName ?? '';
      }
    },
    []
  );

  const {
    sort: catSort,
    sorted: sortedCategories,
    toggleSort: toggleCatSort,
  } = useTableSort(categories, getCategoryValue, {
    key: 'totalAmount',
    direction: 'desc',
  });

  const totalPages = Math.max(1, Math.ceil(sortedCategories.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageRows = sortedCategories.slice(
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
  const top =
    categories.length > 0
      ? [...categories].sort(
          (a, b) => parseAmount(b.totalAmount) - parseAmount(a.totalAmount)
        )[0]
      : null;

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

  const shareSegments: DistributionSegment[] = categories.map((c) => ({
    label: c.categoryName,
    value: parseAmount(c.totalAmount),
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
        <DistributionDonut
          title="Share of Sales"
          segments={shareSegments}
          centerLabel="Total"
          centerValue={formatNgn(totalSales)}
          emptyLabel="No category data"
          valueFormatter={formatNgn}
        />
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
                <SortableTH
                  label="Category"
                  sortKey="categoryName"
                  active={catSort.key}
                  direction={catSort.direction}
                  onSort={toggleCatSort}
                />
                <SortableTH
                  label="Orders"
                  sortKey="totalOrders"
                  active={catSort.key}
                  direction={catSort.direction}
                  onSort={toggleCatSort}
                />
                <SortableTH
                  label="Items Sold"
                  sortKey="totalItemsSold"
                  active={catSort.key}
                  direction={catSort.direction}
                  onSort={toggleCatSort}
                />
                <SortableTH
                  label="Total Sales Revenue"
                  sortKey="totalAmount"
                  active={catSort.key}
                  direction={catSort.direction}
                  onSort={toggleCatSort}
                />
                <SortableTH
                  label="Percentage"
                  sortKey="percentageOfTotalSales"
                  active={catSort.key}
                  direction={catSort.direction}
                  onSort={toggleCatSort}
                />
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
        {sortedCategories.length > 0 && (
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
    if (statusTab === 'all') return orderPayments;
    return orderPayments.filter(
      (o) => (o.paymentStatus ?? '').toLowerCase() === statusTab
    );
  }, [orderPayments, statusTab]);

  const getOrderPaymentValue = React.useCallback(
    (
      o: OrderPaymentItem,
      key:
        | 'orderDate'
        | 'orderId'
        | 'customer'
        | 'orderTotal'
        | 'totalPaid'
        | 'totalRefunded'
        | 'outstanding'
        | 'paymentStatus'
        | 'orderStatus'
    ) => {
      switch (key) {
        case 'orderDate':
          return toTime(o.orderDate);
        case 'orderTotal':
          return parseAmount(o.orderTotal);
        case 'totalPaid':
          return parseAmount(o.totalPaid);
        case 'totalRefunded':
          return parseAmount(o.totalRefunded);
        case 'outstanding':
          return parseAmount(o.outstanding);
        default:
          return ((o as any)[key] ?? '') as string;
      }
    },
    []
  );

  const { sort, sorted, toggleSort } = useTableSort(
    filtered,
    getOrderPaymentValue,
    { key: 'orderDate', direction: 'desc' }
  );

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageRows = sorted.slice(
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

  const tabs = [
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
        <div className="flex items-center justify-between flex-wrap gap-3 px-5 py-4">
          <div className="flex items-center gap-3 flex-wrap">
            <h3 className="text-base font-semibold text-gray-900">
              Order Payment Summary
            </h3>
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
                  label="Order Total"
                  sortKey="orderTotal"
                  active={sort.key}
                  direction={sort.direction}
                  onSort={toggleSort}
                />
                <SortableTH
                  label="Total Paid"
                  sortKey="totalPaid"
                  active={sort.key}
                  direction={sort.direction}
                  onSort={toggleSort}
                />
                <SortableTH
                  label="Refunded"
                  sortKey="totalRefunded"
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
                  label="Payment Status"
                  sortKey="paymentStatus"
                  active={sort.key}
                  direction={sort.direction}
                  onSort={toggleSort}
                />
                <SortableTH
                  label="Order Status"
                  sortKey="orderStatus"
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
