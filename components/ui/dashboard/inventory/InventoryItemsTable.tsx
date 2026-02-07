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
  SortDescriptor,
  Selection,
} from '@nextui-org/react';
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
            <div className="text-sm text-textGrey">
              {getItemTypeLabel(item.itemType)}
            </div>
          );
        case 'stockLevel':
          return <div className="text-sm text-textGrey">{item.stockLevel ?? 0}</div>;
        case 'reorderLevel':
          return (
            <div className="text-sm text-textGrey">{item.reorderLevel}</div>
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
                    key="view"
                    onClick={() => onViewItem(item)}
                    aria-label="view item"
                  >
                    <div className="flex gap-2 items-center text-grey500">
                      <p>View Details</p>
                    </div>
                  </DropdownItem>
                  <DropdownItem
                    key="edit"
                    onClick={() => onEditItem(item)}
                    aria-label="edit item"
                  >
                    <div className="flex gap-2 items-center text-grey500">
                      <p>Edit Item</p>
                    </div>
                  </DropdownItem>
                  {item.itemType === InventoryItemType.Produced && onBatchProduction && (
                    <DropdownItem
                      key="batch"
                      onClick={() => onBatchProduction(item)}
                      aria-label="batch production"
                    >
                      <div className="flex gap-2 items-center text-grey500">
                        <p>Batch Production</p>
                      </div>
                    </DropdownItem>
                  )}
                  <DropdownItem
                    key="delete"
                    onClick={() => onDeleteItem(item)}
                    aria-label="delete item"
                    className="text-danger"
                    color="danger"
                  >
                    <div className="flex gap-2 items-center">
                      <p>Delete Item</p>
                    </div>
                  </DropdownItem>
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
