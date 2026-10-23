'use client';

import React from 'react';
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  DropdownSection,
  SortDescriptor,
  Selection,
  Chip,
} from '@nextui-org/react';
import {
  Pencil,
  Eye,
  Factory,
  Trash2,
  AlertTriangle,
} from 'lucide-react';
import { HiOutlineDotsVertical } from 'react-icons/hi';
import SpinnerLoader from '@/components/ui/dashboard/menu/SpinnerLoader';
import usePagination from '@/hooks/usePagination';
import { columns, INITIAL_VISIBLE_COLUMNS } from './data';
import { InventoryItemType } from '@/app/api/controllers/dashboard/inventory';
import type { InventoryItem } from '@/app/api/controllers/dashboard/inventory';


interface InventoryItemsTableProps {
  data: any;
  isLoading: boolean;
  onViewItem: (item: InventoryItem) => void;
  onEditItem: (item: InventoryItem) => void;
  onDeleteItem: (item: InventoryItem) => void;
  onBatchProduction?: (item: InventoryItem) => void;
}

const getItemTypeLabel = (type: InventoryItemType): string => {
  switch (type) {
    case InventoryItemType.Direct:
      return 'Direct';
    case InventoryItemType.Ingredient:
      return 'Ingredient';
    case InventoryItemType.Produced:
      return 'Produced';
    default:
      return String(type);
  }
};

const getStockPercentage = (
  stockLevel: number,
  reorderLevel: number
): number => {
  if (stockLevel === 0) return 0;
  if (reorderLevel <= 0) return 100;
  if (stockLevel > reorderLevel) return 100;
  return Math.max(5, Math.round((stockLevel / reorderLevel) * 100));
};

const getStockBarColor = (stockLevel: number, reorderLevel: number): string => {
  if (stockLevel === 0) return 'bg-red-500';
  if (reorderLevel > 0 && stockLevel <= reorderLevel) return 'bg-red-500';
  return 'bg-emerald-500';
};

const InventoryItemsTable: React.FC<InventoryItemsTableProps> = ({
  data,
  isLoading,
  onViewItem,
  onEditItem,
  onDeleteItem,
  onBatchProduction,
}) => {
  const {
    bottomContent,
    headerColumns,
    setSelectedKeys,
    selectedKeys,
    sortDescriptor,
    setSortDescriptor,
    classNames,
    displayData,
    isMobile,
  } = usePagination(data, columns, INITIAL_VISIBLE_COLUMNS, {
    column: 'dateCreated',
    direction: 'descending',
  });

  const sortedItems = React.useMemo(() => {
    if (!displayData || displayData.length === 0) {
      return displayData || [];
    }

    return [...displayData].sort((a: InventoryItem, b: InventoryItem) => {
      const first = a[sortDescriptor.column as keyof InventoryItem];
      const second = b[sortDescriptor.column as keyof InventoryItem];

      let cmp = 0;
      if (first === null || first === undefined) cmp = 1;
      else if (second === null || second === undefined) cmp = -1;
      else if (first < second) cmp = -1;
      else if (first > second) cmp = 1;

      return sortDescriptor.direction === 'descending' ? -cmp : cmp;
    });
  }, [displayData, sortDescriptor]);

  const renderCell = React.useCallback(
    (item: InventoryItem, columnKey: string) => {
      const cellValue = item[columnKey as keyof InventoryItem];

      switch (columnKey) {
        case 'name':
          return (
            <div className="font-semibold text-sm text-black">
              {item.name}
            </div>
          );
        case 'itemType':
          return (
            <div className="text-sm text-black">
              {getItemTypeLabel(item.itemType)}
            </div>
          );
        case 'stockLevel': {
          const stock = item.stockLevel ?? 0;
          const reorder = item.reorderLevel ?? 0;
          const percentage = getStockPercentage(stock, reorder);
          const barColor = getStockBarColor(stock, reorder);
          const isLowStock = stock > 0 && stock <= reorder;
          const isOutOfStock = stock === 0;

          return (
            <div className="flex flex-col gap-1.5 min-w-[120px]">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-black">{stock} {item.unitCode || ''}</span>
                {isOutOfStock && (
                  <Chip
                    size="sm"
                    variant="flat"
                    color="danger"
                    startContent={<AlertTriangle size={12} />}
                    classNames={{ base: 'h-5 px-1.5', content: 'text-xs font-medium px-0.5' }}
                  >
                    Out of Stock
                  </Chip>
                )}
                {isLowStock && (
                  <Chip
                    size="sm"
                    variant="flat"
                    color="warning"
                    startContent={<AlertTriangle size={12} />}
                    classNames={{ base: 'h-5 px-1.5', content: 'text-xs font-medium px-0.5' }}
                  >
                    Low Stock
                  </Chip>
                )}
              </div>
              <div className="w-full bg-gray-100 rounded-full h-1.5">
                <div
                  className={`h-1.5 rounded-full transition-all ${barColor}`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        }
        case 'reorderLevel':
          return (
            <div className="text-sm text-black">
              {item.reorderLevel}
            </div>
          );
        case 'actions':
          return (
            <div
              className="relative flex justify-center items-center gap-2"
              onClick={(e) => e.stopPropagation()}
            >
              <Dropdown>
                <DropdownTrigger aria-label="actions">
                  <div className="cursor-pointer flex justify-center items-center text-black">
                    <HiOutlineDotsVertical className="text-[22px]" />
                  </div>
                </DropdownTrigger>
                <DropdownMenu aria-label="Item actions" className="text-black">
                    <DropdownItem
                      key="edit"
                      startContent={<Pencil size={16} />}
                      onPress={() => onEditItem(item)}
                      aria-label="edit item"
                    >
                      Edit
                    </DropdownItem>

                  <DropdownSection title="">
                    <DropdownItem
                      key="view"
                      startContent={<Eye size={16} />}
                      onPress={() => onViewItem(item)}
                      aria-label="view item"
                    >
                      View Details
                    </DropdownItem>
                    {item.itemType === InventoryItemType.Produced && onBatchProduction && (
                      <DropdownItem
                        key="batch"
                        startContent={<Factory size={16} />}
                        onPress={() => onBatchProduction(item)}
                        aria-label="batch production"
                      >
                        Batch Production
                      </DropdownItem>
                    )}
                    <DropdownItem
                      key="delete"
                      startContent={<Trash2 size={16} />}
                      onPress={() => onDeleteItem(item)}
                      aria-label="delete item"
                      className="text-danger"
                      color="danger"
                    >
                      Delete
                    </DropdownItem>
                  </DropdownSection>
                </DropdownMenu>
              </Dropdown>
            </div>
          );
        default: {
          const fallback = cellValue ?? '';
          if (fallback === '') return <></>;
          return (
            <div className="text-sm text-textGrey">{String(fallback)}</div>
          );
        }
      }
    },
    [onViewItem, onEditItem, onDeleteItem, onBatchProduction]
  );

  const shouldShowLoading = isLoading && (!displayData || displayData.length === 0);

  return (
    <section className="border border-primaryGrey rounded-lg overflow-hidden bg-white">
      {isMobile ? (
        <div className="divide-y divide-primaryGrey">
          {shouldShowLoading && (
            <div className="flex justify-center items-center py-16">
              <SpinnerLoader size="md" />
            </div>
          )}
          
          {!shouldShowLoading && sortedItems.length === 0 && (
            <div className="flex flex-col items-center justify-center gap-2 py-16 px-4 text-center">
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-textGrey"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                  />
                </svg>
              </div>
              <p className="text-sm font-medium text-gray-700">
                No inventory items found
              </p>
              <p className="text-xs text-textGrey">
                Try adjusting your search or filters
              </p>
            </div>
          )}
          
          {!shouldShowLoading && sortedItems.map((item: InventoryItem) => {
            const stock = item.stockLevel ?? 0;
            const reorder = item.reorderLevel ?? 0;
            const unitLabel = item.unitCode || item.unitName || item.unit || '';
            const typeLabel = getItemTypeLabel(item.itemType);

            return (
              <article
                key={String(item.id)}
                className="p-4 active:bg-gray-100 transition-colors"
                onClick={() => onViewItem(item)}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-[15px] text-black leading-snug truncate">
                      {item.name}
                    </h3>
                    <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                      <span className="inline-flex items-center rounded-md bg-[#5F35D2]/10 px-2 py-0.5 text-[11px] font-medium text-[#5F35D2]">
                        {typeLabel}
                      </span>
                      {stock === 0 && (
                        <span className="inline-flex items-center gap-1 rounded-md bg-danger-500/10 px-2 py-0.5 text-[11px] font-medium text-danger-500">
                          <AlertTriangle size={11} />
                          Out of Stock
                        </span>
                      )}
                      {stock > 0 && stock <= reorder && (
                        <span className="inline-flex items-center gap-1 rounded-md bg-amber-500/10 px-2 py-0.5 text-[11px] font-medium text-amber-600">
                          <AlertTriangle size={11} />
                          Low Stock
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="shrink-0" onClick={(e) => e.stopPropagation()}>
                    {renderCell(item, 'actions')}
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-3">
                  <div>
                    <div className="text-[11px] uppercase tracking-wide text-textGrey mb-1">
                      Current Stock
                    </div>
                    <div className="text-sm font-medium text-black">
                      {stock} {unitLabel}
                    </div>
                  </div>
                  <div>
                    <div className="text-[11px] uppercase tracking-wide text-textGrey mb-1">
                      Reorder At
                    </div>
                    <div className="text-sm font-medium text-black">
                      {item.reorderLevel} {unitLabel}
                    </div>
                  </div>
                </div>

                <div className="mt-3 w-full bg-gray-100 rounded-full h-1.5">
                  <div
                    className={`h-1.5 rounded-full transition-all ${getStockBarColor(stock, reorder)}`}
                    style={{ width: `${getStockPercentage(stock, reorder)}%` }}
                  />
                </div>
              </article>
            );
          })}
          {bottomContent}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table
            radius="lg"
            isCompact
            removeWrapper
            aria-label="list of inventory items"
            bottomContent={bottomContent}
            bottomContentPlacement="outside"
            classNames={classNames}
            selectedKeys={selectedKeys}
            sortDescriptor={sortDescriptor as SortDescriptor}
            onSelectionChange={setSelectedKeys as (keys: Selection) => void}
            onSortChange={setSortDescriptor as (descriptor: SortDescriptor) => void}
          >
            <TableHeader columns={headerColumns}>
              {(column) => (
                <TableColumn
                  key={column.uid}
                  align={column.uid === 'actions' ? 'center' : 'start'}
                  allowsSorting={column.sortable}
                >
                  {column.name}
                </TableColumn>
              )}
            </TableHeader>
            <TableBody
              emptyContent={"No inventory items found"}
              items={shouldShowLoading ? [] : sortedItems}
              isLoading={shouldShowLoading}
              loadingContent={<SpinnerLoader size="md" />}
            >
              {(item: InventoryItem) => (
                <TableRow
                  key={String(item.id)}
                  className="cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  {(columnKey) => (
                    <TableCell
                      onClick={columnKey !== 'actions' ? () => onViewItem(item) : undefined}
                    >
                      {renderCell(item, String(columnKey))}
                    </TableCell>
                  )}
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </section>
  );
};

export default InventoryItemsTable;
