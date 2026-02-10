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
  MoreHorizontal,
  Eye,
  Factory,
  Trash2,
  AlertTriangle,
} from 'lucide-react';
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

const getItemTypeLabel = (type: InventoryItemType) => {
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

const getStockPercentage = (stockLevel: number, reorderLevel: number): number => {
  const fullCapacity = reorderLevel * 4;
  if (fullCapacity <= 0) return stockLevel > 0 ? 100 : 0;
  return Math.min(100, Math.max(0, (stockLevel / fullCapacity) * 100));
};

const getStockBarColor = (stockLevel: number, reorderLevel: number): string => {
  if (stockLevel === 0) return 'bg-red-500';
  if (stockLevel <= reorderLevel) return 'bg-amber-500';
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
                <span className="text-sm font-medium text-black">{stock}</span>
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
              {item.averageCostPerUnit}
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
                  <div className="cursor-pointer flex items-center gap-0.5 text-gray-500 hover:text-black transition-colors px-2 py-1 rounded-md hover:bg-gray-100">
                    <MoreHorizontal size={18} />
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
                    {item.itemType === InventoryItemType.Produced && onBatchProduction ? (
                      <DropdownItem
                        key="batch"
                        startContent={<Factory size={16} />}
                        onPress={() => onBatchProduction(item)}
                        aria-label="batch production"
                      >
                        Batch Production
                      </DropdownItem>
                    ) : null}
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
        default:
          return <div className="text-sm text-textGrey">{String(cellValue)}</div>;
      }
    },
    [onViewItem, onEditItem, onDeleteItem, onBatchProduction]
  );

  const shouldShowLoading = isLoading && (!displayData || displayData.length === 0);

  return (
    <section className="border border-primaryGrey rounded-lg overflow-hidden">
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
    </section>
  );
};

export default InventoryItemsTable;
