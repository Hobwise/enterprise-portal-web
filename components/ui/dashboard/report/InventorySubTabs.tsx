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
  InventoryReportItem,
  PurchaseAdjustmentItem,
  StatCard,
  StockMovementItem,
} from './types';

const PAGE_SIZE = 10;

const safeNumber = (value: unknown): number => {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
};

const formatNgn = (value: number): string => formatPrice(value, 'NGN');

const formatNumber = (value: number): string => {
  if (!Number.isFinite(value)) return '0';
  if (Number.isInteger(value)) return value.toLocaleString();
  return value.toLocaleString(undefined, { maximumFractionDigits: 2 });
};

interface InventorySubTabPanelProps {
  data?: unknown[];
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
  <div className="flex items-center gap-2 px-5 py-4">
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

const TableSkeleton: React.FC = () => (
  <div className="flex flex-col gap-5">
    <Skeleton className="h-96 rounded-2xl" />
  </div>
);

const stockStatusClass = (status: string): string => {
  const s = (status ?? '').toLowerCase();
  if (s === 'out' || s === 'out of stock') return 'text-red-500';
  if (s === 'low' || s === 'low stock') return 'text-amber-500';
  if (s === 'ok' || s === 'in stock') return 'text-emerald-600';
  return 'text-gray-700';
};

const stockStatusLabel = (status: string): string => {
  const s = (status ?? '').toLowerCase();
  if (s === 'out') return 'Out of Stock';
  if (s === 'low') return 'Low stock';
  if (s === 'ok') return 'In Stock';
  return status || '—';
};

const stockValueClass = (
  current: number,
  reorder: number,
  status: string
): string => {
  const s = (status ?? '').toLowerCase();
  if (s === 'out' || current <= 0) return 'text-red-500 font-semibold';
  if (s === 'low' || (reorder > 0 && current <= reorder))
    return 'text-amber-500 font-semibold';
  return 'text-emerald-600 font-semibold';
};

export const StockLevelPanel: React.FC<InventorySubTabPanelProps> = ({
  data,
  isLoading,
  onExport,
  isExporting,
}) => {
  const [statusTab, setStatusTab] = useState<string>('all');
  const [page, setPage] = useState(1);
  const exportHandlers = buildExportHandlers(onExport);
  const items = (data ?? []) as InventoryReportItem[];

  const counts = useMemo(() => {
    let total = 0;
    let ok = 0;
    let low = 0;
    let out = 0;
    let totalStockValue = 0;
    items.forEach((i) => {
      total += 1;
      const s = (i.status ?? '').toLowerCase();
      if (s === 'ok') ok += 1;
      else if (s === 'low') low += 1;
      else if (s === 'out') out += 1;
      totalStockValue += safeNumber(i.stockValue);
    });
    return { total, ok, low, out, totalStockValue };
  }, [items]);

  const filtered = useMemo(() => {
    if (statusTab === 'all') return items;
    return items.filter((i) => (i.status ?? '').toLowerCase() === statusTab);
  }, [items, statusTab]);

  const getStockValue = React.useCallback(
    (
      i: InventoryReportItem,
      key:
        | 'itemName'
        | 'itemType'
        | 'supplierName'
        | 'unitName'
        | 'quantityOnHand'
        | 'reorderLevel'
        | 'averageCostPerUnit'
        | 'stockValue'
        | 'lastRestocked'
        | 'status'
    ) => {
      switch (key) {
        case 'quantityOnHand':
          return safeNumber(i.quantityOnHand);
        case 'reorderLevel':
          return safeNumber(i.reorderLevel);
        case 'averageCostPerUnit':
          return safeNumber(i.averageCostPerUnit);
        case 'stockValue':
          return safeNumber(i.stockValue);
        case 'lastRestocked':
          return i.lastRestocked ? moment(i.lastRestocked).valueOf() : null;
        default:
          return ((i as any)[key] ?? '') as string;
      }
    },
    []
  );

  const { sort, sorted, toggleSort } = useTableSort(filtered, getStockValue, {
    key: 'itemName',
    direction: 'asc',
  });

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageRows = sorted.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE
  );

  if (isLoading) return <TableSkeleton />;

  const stats: StatCard[] = [
    {
      label: 'Total Items',
      value: counts.total.toLocaleString(),
      footer: 'Tracked inventory',
      footerTone: 'muted',
    },
    {
      label: 'In Stock',
      value: counts.ok.toLocaleString(),
      footer: 'Healthy levels',
      footerTone: 'success',
    },
    {
      label: 'Low / Out of Stock',
      value: (counts.low + counts.out).toLocaleString(),
      footer: `${counts.low} low, ${counts.out} out`,
      footerTone: counts.low + counts.out > 0 ? 'warning' : 'muted',
    },
    {
      label: 'Total Stock Value',
      value: formatNgn(counts.totalStockValue),
      footer: 'On hand',
      footerTone: 'muted',
    },
  ];

  const tabs = [
    { id: 'all', label: 'All', count: counts.total },
    { id: 'ok', label: 'In Stock', count: counts.ok },
    { id: 'low', label: 'Low Stock', count: counts.low },
    { id: 'out', label: 'Out of Stock', count: counts.out },
  ];

  return (
    <div className="flex flex-col gap-5">
      <StatCards cards={stats} />
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm">
        <div className="flex items-center justify-between flex-wrap gap-3 px-5 py-4">
          <div className="flex items-center gap-3 flex-wrap">
            <h3 className="text-base font-semibold text-gray-900">
              Inventory Stock Levels
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
                  label="Item Name"
                  sortKey="itemName"
                  active={sort.key}
                  direction={sort.direction}
                  onSort={toggleSort}
                />
                <SortableTH
                  label="Type"
                  sortKey="itemType"
                  active={sort.key}
                  direction={sort.direction}
                  onSort={toggleSort}
                />
                <SortableTH
                  label="Supplier"
                  sortKey="supplierName"
                  active={sort.key}
                  direction={sort.direction}
                  onSort={toggleSort}
                />
                <SortableTH
                  label="Unit"
                  sortKey="unitName"
                  active={sort.key}
                  direction={sort.direction}
                  onSort={toggleSort}
                />
                <SortableTH
                  label="Quantity on Hand"
                  sortKey="quantityOnHand"
                  active={sort.key}
                  direction={sort.direction}
                  onSort={toggleSort}
                />
                <SortableTH
                  label="Reorder Level"
                  sortKey="reorderLevel"
                  active={sort.key}
                  direction={sort.direction}
                  onSort={toggleSort}
                />
                <SortableTH
                  label="Avg. Cost / Unit"
                  sortKey="averageCostPerUnit"
                  active={sort.key}
                  direction={sort.direction}
                  onSort={toggleSort}
                />
                <SortableTH
                  label="Stock Value"
                  sortKey="stockValue"
                  active={sort.key}
                  direction={sort.direction}
                  onSort={toggleSort}
                />
                <SortableTH
                  label="Last Restocked"
                  sortKey="lastRestocked"
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
                    No inventory items for this period
                  </td>
                </tr>
              ) : (
                pageRows.map((row, index) => {
                  const current = safeNumber(row.quantityOnHand);
                  const reorder = safeNumber(row.reorderLevel);
                  return (
                    <tr
                      key={`${row.itemName}-${row.itemType}-${index}`}
                      className="hover:bg-gray-50"
                    >
                      <td className="px-5 py-4 text-gray-900 font-medium">
                        {row.itemName}
                      </td>
                      <td className="px-5 py-4 text-gray-700">
                        {row.itemType || '—'}
                      </td>
                      <td className="px-5 py-4 text-gray-700">
                        {row.supplierName || '—'}
                      </td>
                      <td className="px-5 py-4 text-gray-700">
                        {row.unitName || '—'}
                      </td>
                      <td
                        className={`px-5 py-4 ${stockValueClass(
                          current,
                          reorder,
                          row.status
                        )}`}
                      >
                        {formatNumber(current)}
                      </td>
                      <td className="px-5 py-4 text-gray-700">
                        {formatNumber(reorder)}
                      </td>
                      <td className="px-5 py-4 text-gray-700">
                        {formatNgn(safeNumber(row.averageCostPerUnit))}
                      </td>
                      <td className="px-5 py-4 text-gray-900 font-semibold">
                        {formatNgn(safeNumber(row.stockValue))}
                      </td>
                      <td className="px-5 py-4 text-gray-700">
                        {row.lastRestocked
                          ? moment(row.lastRestocked).format('MMM DD, YYYY')
                          : '—'}
                      </td>
                      <td
                        className={`px-5 py-4 font-medium ${stockStatusClass(
                          row.status
                        )}`}
                      >
                        {stockStatusLabel(row.status)}
                      </td>
                    </tr>
                  );
                })
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

const movementTypeClass = (type: string): string => {
  const t = (type ?? '').toLowerCase();
  if (t === 'in') return 'text-emerald-600';
  if (t === 'out') return 'text-red-500';
  return 'text-gray-500';
};

const transactionTypeClass = (type: string): string => {
  const t = (type ?? '').toLowerCase();
  if (t === 'sale') return 'bg-blue-50 text-blue-600';
  if (t === 'restock' || t === 'openingstock') return 'bg-emerald-50 text-emerald-600';
  if (t === 'transferin') return 'bg-purple-50 text-purple-600';
  if (t === 'transferout') return 'bg-amber-50 text-amber-600';
  if (t === 'production') return 'bg-pink-50 text-primaryColor';
  if (t === 'stockadjustment') return 'bg-gray-100 text-gray-700';
  return 'bg-gray-100 text-gray-700';
};

const formatTransactionType = (type: string): string =>
  (type ?? '').replace(/([a-z])([A-Z])/g, '$1 $2');

const normalizeMovementType = (type: string, qty: number): string => {
  const t = (type ?? '').toLowerCase();
  if (t === 'in' || t === 'out') return type;
  return qty < 0 ? 'Out' : 'In';
};

export const StockTransferPanel: React.FC<InventorySubTabPanelProps> = ({
  data,
  isLoading,
  onExport,
  isExporting,
}) => {
  const exportHandlers = buildExportHandlers(onExport);
  const [transactionFilter, setTransactionFilter] = useState<string>('all');
  const [page, setPage] = useState(1);

  const movements = (data ?? []) as StockMovementItem[];

  const counts = useMemo(() => {
    let total = 0;
    let inbound = 0;
    let outbound = 0;
    let totalIn = 0;
    let totalOut = 0;
    let totalValue = 0;
    movements.forEach((m) => {
      total += 1;
      const qty = safeNumber(m.quantityChange);
      const direction = normalizeMovementType(m.movementType, qty).toLowerCase();
      if (direction === 'in' || qty > 0) {
        inbound += 1;
        totalIn += Math.abs(qty);
      } else if (direction === 'out' || qty < 0) {
        outbound += 1;
        totalOut += Math.abs(qty);
      }
      totalValue += safeNumber(m.value);
    });
    return { total, inbound, outbound, totalIn, totalOut, totalValue };
  }, [movements]);

  const transactionTypes = useMemo(() => {
    const set = new Set<string>();
    movements.forEach((m) => {
      if (m.transactionType) set.add(m.transactionType);
    });
    return Array.from(set);
  }, [movements]);

  const filtered = useMemo(() => {
    if (transactionFilter === 'all') return movements;
    return movements.filter((m) => m.transactionType === transactionFilter);
  }, [movements, transactionFilter]);

  const getMovementValue = React.useCallback(
    (
      m: StockMovementItem,
      key:
        | 'dateCreated'
        | 'itemName'
        | 'movementType'
        | 'transactionType'
        | 'quantityChange'
        | 'costPerUnit'
        | 'unitName'
        | 'value'
        | 'reason'
        | 'performedBy'
    ) => {
      switch (key) {
        case 'dateCreated':
          return m.dateCreated ? moment(m.dateCreated).valueOf() : 0;
        case 'quantityChange':
          return safeNumber(m.quantityChange);
        case 'costPerUnit':
          return safeNumber(m.costPerUnit);
        case 'value':
          return safeNumber(m.value);
        default:
          return ((m as any)[key] ?? '') as string;
      }
    },
    []
  );

  const { sort, sorted, toggleSort } = useTableSort(filtered, getMovementValue, {
    key: 'dateCreated',
    direction: 'desc',
  });

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageRows = sorted.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE
  );

  if (isLoading) return <TableSkeleton />;

  const stats: StatCard[] = [
    {
      label: 'Total Movements',
      value: counts.total.toLocaleString(),
      footer: `${transactionTypes.length} transaction types`,
      footerTone: 'muted',
    },
    {
      label: 'Stock In',
      value: counts.inbound.toLocaleString(),
      footer: `${formatNumber(counts.totalIn)} units`,
      footerTone: 'success',
    },
    {
      label: 'Stock Out',
      value: counts.outbound.toLocaleString(),
      footer: `${formatNumber(counts.totalOut)} units`,
      footerTone: 'warning',
    },
    {
      label: 'Total Value',
      value: formatNgn(counts.totalValue),
      footer: 'Cost impact',
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
              Stock Movement Report
            </h3>
            {transactionTypes.length > 0 && (
              <select
                value={transactionFilter}
                onChange={(e) => {
                  setTransactionFilter(e.target.value);
                  setPage(1);
                }}
                className="text-xs h-9 px-3 rounded-lg border border-gray-200 text-gray-700 bg-white focus:outline-none focus:border-primaryColor"
              >
                <option value="all">All transactions</option>
                {transactionTypes.map((t) => (
                  <option key={t} value={t}>
                    {formatTransactionType(t)}
                  </option>
                ))}
              </select>
            )}
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
                  label="Item"
                  sortKey="itemName"
                  active={sort.key}
                  direction={sort.direction}
                  onSort={toggleSort}
                />
                <SortableTH
                  label="Movement"
                  sortKey="movementType"
                  active={sort.key}
                  direction={sort.direction}
                  onSort={toggleSort}
                />
                <SortableTH
                  label="Transaction"
                  sortKey="transactionType"
                  active={sort.key}
                  direction={sort.direction}
                  onSort={toggleSort}
                />
                <SortableTH
                  label="Quantity Change"
                  sortKey="quantityChange"
                  active={sort.key}
                  direction={sort.direction}
                  onSort={toggleSort}
                />
                <SortableTH
                  label="Unit"
                  sortKey="unitName"
                  active={sort.key}
                  direction={sort.direction}
                  onSort={toggleSort}
                />
                <SortableTH
                  label="Cost / Unit"
                  sortKey="costPerUnit"
                  active={sort.key}
                  direction={sort.direction}
                  onSort={toggleSort}
                />
                <SortableTH
                  label="Value"
                  sortKey="value"
                  active={sort.key}
                  direction={sort.direction}
                  onSort={toggleSort}
                />
                <SortableTH
                  label="Reason"
                  sortKey="reason"
                  active={sort.key}
                  direction={sort.direction}
                  onSort={toggleSort}
                />
                <SortableTH
                  label="Performed By"
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
                    colSpan={10}
                    className="px-5 py-8 text-center text-sm text-gray-500"
                  >
                    No stock movements for this period
                  </td>
                </tr>
              ) : (
                pageRows.map((row, index) => {
                  const qty = safeNumber(row.quantityChange);
                  const direction = normalizeMovementType(
                    row.movementType,
                    qty
                  );
                  return (
                    <tr
                      key={`${row.itemName}-${row.dateCreated}-${index}`}
                      className="hover:bg-gray-50"
                    >
                      <td className="px-5 py-4 text-gray-700">
                        {moment(row.dateCreated).format('MMM DD, hh:mma')}
                      </td>
                      <td className="px-5 py-4 text-gray-900 font-medium">
                        {row.itemName}
                      </td>
                      <td
                        className={`px-5 py-4 font-medium ${movementTypeClass(
                          direction
                        )}`}
                      >
                        {direction}
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${transactionTypeClass(
                            row.transactionType
                          )}`}
                        >
                          {formatTransactionType(row.transactionType)}
                        </span>
                      </td>
                      <td
                        className={`px-5 py-4 font-semibold ${
                          qty < 0 ? 'text-red-500' : 'text-emerald-600'
                        }`}
                      >
                        {qty > 0 ? '+' : ''}
                        {formatNumber(qty)}
                      </td>
                      <td className="px-5 py-4 text-gray-700">
                        {row.unitName || '—'}
                      </td>
                      <td className="px-5 py-4 text-gray-700">
                        {formatNgn(safeNumber(row.costPerUnit))}
                      </td>
                      <td className="px-5 py-4 text-gray-700">
                        {formatNgn(safeNumber(row.value))}
                      </td>
                      <td
                        className="px-5 py-4 text-gray-700 max-w-xs truncate"
                        title={row.reason}
                      >
                        {row.reason || '—'}
                      </td>
                      <td className="px-5 py-4 text-gray-700">
                        {row.performedBy || '—'}
                      </td>
                    </tr>
                  );
                })
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

const adjustmentTypeClass = (type: string): string => {
  const t = (type ?? '').toLowerCase();
  if (t === 'damaged' || t === 'waste') return 'bg-red-50 text-red-500';
  if (t === 'theftorloss') return 'bg-red-50 text-red-500';
  if (t.includes('decrease')) return 'bg-amber-50 text-amber-600';
  if (t.includes('increase')) return 'bg-emerald-50 text-emerald-600';
  return 'bg-gray-100 text-gray-700';
};

const formatAdjustmentType = (type: string): string =>
  (type ?? '').replace(/([a-z])([A-Z])/g, '$1 $2');

export const PurchaseOrderPanel: React.FC<InventorySubTabPanelProps> = ({
  data,
  isLoading,
  onExport,
  isExporting,
}) => {
  const exportHandlers = buildExportHandlers(onExport);
  const [adjustmentFilter, setAdjustmentFilter] = useState<string>('all');
  const [page, setPage] = useState(1);

  const adjustments = (data ?? []) as PurchaseAdjustmentItem[];

  const counts = useMemo(() => {
    let total = 0;
    let totalQty = 0;
    let totalCostImpact = 0;
    let damaged = 0;
    let lossOrTheft = 0;
    adjustments.forEach((a) => {
      total += 1;
      totalQty += Math.abs(safeNumber(a.quantityWasted));
      totalCostImpact += safeNumber(a.costImpact);
      const t = (a.adjustmentType ?? '').toLowerCase();
      if (t === 'damaged' || t === 'waste') damaged += 1;
      if (t === 'theftorloss') lossOrTheft += 1;
    });
    return { total, totalQty, totalCostImpact, damaged, lossOrTheft };
  }, [adjustments]);

  const types = useMemo(() => {
    const set = new Set<string>();
    adjustments.forEach((a) => {
      if (a.adjustmentType) set.add(a.adjustmentType);
    });
    return Array.from(set);
  }, [adjustments]);

  const filtered = useMemo(() => {
    if (adjustmentFilter === 'all') return adjustments;
    return adjustments.filter((a) => a.adjustmentType === adjustmentFilter);
  }, [adjustments, adjustmentFilter]);

  const getAdjustmentValue = React.useCallback(
    (
      a: PurchaseAdjustmentItem,
      key:
        | 'date'
        | 'itemName'
        | 'adjustmentType'
        | 'quantityWasted'
        | 'costImpact'
        | 'reason'
        | 'performedBy'
    ) => {
      switch (key) {
        case 'date':
          return a.date ? moment(a.date).valueOf() : 0;
        case 'quantityWasted':
          return safeNumber(a.quantityWasted);
        case 'costImpact':
          return safeNumber(a.costImpact);
        default:
          return ((a as any)[key] ?? '') as string;
      }
    },
    []
  );

  const { sort, sorted, toggleSort } = useTableSort(
    filtered,
    getAdjustmentValue,
    { key: 'date', direction: 'desc' }
  );

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageRows = sorted.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE
  );

  if (isLoading) return <TableSkeleton />;

  const stats: StatCard[] = [
    {
      label: 'Total Adjustments',
      value: counts.total.toLocaleString(),
      footer: `${types.length} adjustment types`,
      footerTone: 'muted',
    },
    {
      label: 'Quantity Affected',
      value: formatNumber(counts.totalQty),
      footer: 'Across all items',
      footerTone: 'warning',
    },
    {
      label: 'Damage / Waste',
      value: counts.damaged.toLocaleString(),
      footer: counts.damaged > 0 ? 'Items lost' : 'No damages',
      footerTone: counts.damaged > 0 ? 'danger' : 'muted',
    },
    {
      label: 'Cost Impact',
      value: formatNgn(Math.abs(counts.totalCostImpact)),
      footer: counts.totalCostImpact < 0 ? 'Total loss' : 'Net impact',
      footerTone: counts.totalCostImpact < 0 ? 'danger' : 'muted',
    },
  ];

  return (
    <div className="flex flex-col gap-5">
      <StatCards cards={stats} />
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm">
        <div className="flex items-center justify-between flex-wrap gap-3 px-5 py-4">
          <div className="flex items-center gap-3 flex-wrap">
            <h3 className="text-base font-semibold text-gray-900">
              Inventory Adjustments Report
            </h3>
            {types.length > 0 && (
              <select
                value={adjustmentFilter}
                onChange={(e) => {
                  setAdjustmentFilter(e.target.value);
                  setPage(1);
                }}
                className="text-xs h-9 px-3 rounded-lg border border-gray-200 text-gray-700 bg-white focus:outline-none focus:border-primaryColor"
              >
                <option value="all">All adjustments</option>
                {types.map((t) => (
                  <option key={t} value={t}>
                    {formatAdjustmentType(t)}
                  </option>
                ))}
              </select>
            )}
          </div>
          <ExportButtons {...exportHandlers} isLoading={isExporting} />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <SortableTH
                  label="Date"
                  sortKey="date"
                  active={sort.key}
                  direction={sort.direction}
                  onSort={toggleSort}
                />
                <SortableTH
                  label="Item"
                  sortKey="itemName"
                  active={sort.key}
                  direction={sort.direction}
                  onSort={toggleSort}
                />
                <SortableTH
                  label="Adjustment Type"
                  sortKey="adjustmentType"
                  active={sort.key}
                  direction={sort.direction}
                  onSort={toggleSort}
                />
                <SortableTH
                  label="Quantity Wasted"
                  sortKey="quantityWasted"
                  active={sort.key}
                  direction={sort.direction}
                  onSort={toggleSort}
                />
                <SortableTH
                  label="Cost Impact"
                  sortKey="costImpact"
                  active={sort.key}
                  direction={sort.direction}
                  onSort={toggleSort}
                />
                <SortableTH
                  label="Reason"
                  sortKey="reason"
                  active={sort.key}
                  direction={sort.direction}
                  onSort={toggleSort}
                />
                <SortableTH
                  label="Performed By"
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
                    colSpan={7}
                    className="px-5 py-8 text-center text-sm text-gray-500"
                  >
                    No adjustments for this period
                  </td>
                </tr>
              ) : (
                pageRows.map((row, index) => {
                  const qty = safeNumber(row.quantityWasted);
                  const cost = safeNumber(row.costImpact);
                  return (
                    <tr
                      key={`${row.itemName}-${row.date}-${index}`}
                      className="hover:bg-gray-50"
                    >
                      <td className="px-5 py-4 text-gray-700">
                        {moment(row.date).format('MMM DD, hh:mma')}
                      </td>
                      <td className="px-5 py-4 text-gray-900 font-medium">
                        {row.itemName}
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${adjustmentTypeClass(
                            row.adjustmentType
                          )}`}
                        >
                          {formatAdjustmentType(row.adjustmentType)}
                        </span>
                      </td>
                      <td
                        className={`px-5 py-4 font-semibold ${
                          qty < 0 ? 'text-red-500' : 'text-emerald-600'
                        }`}
                      >
                        {formatNumber(qty)}
                      </td>
                      <td
                        className={`px-5 py-4 ${
                          cost < 0
                            ? 'text-red-500 font-semibold'
                            : 'text-gray-700'
                        }`}
                      >
                        {cost < 0 ? '-' : ''}
                        {formatNgn(Math.abs(cost))}
                      </td>
                      <td
                        className="px-5 py-4 text-gray-700 max-w-xs truncate"
                        title={row.reason}
                      >
                        {row.reason || '—'}
                      </td>
                      <td className="px-5 py-4 text-gray-700">
                        {row.performedBy || '—'}
                      </td>
                    </tr>
                  );
                })
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
