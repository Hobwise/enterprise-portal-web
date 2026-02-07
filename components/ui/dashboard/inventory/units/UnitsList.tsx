'use client';

import React, { useState, useMemo } from 'react';
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Input,
  Button,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Chip,
  SortDescriptor,
  Selection,
} from '@nextui-org/react';
import { Search, Ruler } from 'lucide-react';
import { HiOutlineDotsVertical } from 'react-icons/hi';
import type { InventoryUnit } from '@/app/api/controllers/dashboard/inventory';
import usePagination from '@/hooks/usePagination';

interface UnitsListProps {
  units: InventoryUnit[];
  onAddUnit: () => void;
  onEditUnit: (unit: InventoryUnit) => void;
  onDeleteUnit: (unit: InventoryUnit) => void;
}

const UNIT_CATEGORY_LABELS: Record<number, string> = {
  0: 'Weight',
  1: 'Volume',
  2: 'Length',
  3: 'Count',
};

const columns = [
  { name: 'NAME', uid: 'name', sortable: true },
  { name: 'CODE', uid: 'code', sortable: true },
  { name: 'CATEGORY', uid: 'category', sortable: true },
  { name: 'STATUS', uid: 'status', sortable: true },
  { name: '', uid: 'actions', sortable: false },
];

const INITIAL_VISIBLE_COLUMNS = ['name', 'code', 'category', 'status', 'actions'];

const UnitsList: React.FC<UnitsListProps> = ({
  units,
  onAddUnit,
  onEditUnit,
  onDeleteUnit,
}) => {
  const [filterValue, setFilterValue] = useState('');

  const hasSearchFilter = Boolean(filterValue);

  const filteredItems = useMemo(() => {
    let filtered = [...units];

    if (hasSearchFilter) {
      filtered = filtered.filter(
        (unit) =>
          unit.name.toLowerCase().includes(filterValue.toLowerCase()) ||
          unit.code.toLowerCase().includes(filterValue.toLowerCase())
      );
    }

    return filtered;
  }, [units, filterValue]);

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
  } = usePagination(filteredItems, columns, INITIAL_VISIBLE_COLUMNS, {
    column: 'name',
    direction: 'ascending',
  });

  const sortedItems = React.useMemo(() => {
    if (!displayData || displayData.length === 0) {
      return displayData || [];
    }

    return [...displayData].sort((a: InventoryUnit, b: InventoryUnit) => {
      let first: any;
      let second: any;

      if (sortDescriptor.column === 'category') {
        first = UNIT_CATEGORY_LABELS[a.unitCategory] || '';
        second = UNIT_CATEGORY_LABELS[b.unitCategory] || '';
      } else if (sortDescriptor.column === 'status') {
        first = a.isActive ? 1 : 0;
        second = b.isActive ? 1 : 0;
      } else {
        first = a[sortDescriptor.column as keyof InventoryUnit];
        second = b[sortDescriptor.column as keyof InventoryUnit];
      }

      let cmp = 0;
      if (first === null || first === undefined) cmp = 1;
      else if (second === null || second === undefined) cmp = -1;
      else if (first < second) cmp = -1;
      else if (first > second) cmp = 1;

      return sortDescriptor.direction === 'descending' ? -cmp : cmp;
    });
  }, [displayData, sortDescriptor]);

  const renderCell = React.useCallback(
    (unit: InventoryUnit, columnKey: string) => {
      switch (columnKey) {
        case 'name':
          return (
            <div className="font-semibold text-sm text-black">
              {unit.name}
            </div>
          );
        case 'code':
          return <div className="text-sm text-textGrey">{unit.code}</div>;
        case 'category':
          return (
            <div className="text-sm text-textGrey">
              {UNIT_CATEGORY_LABELS[unit.unitCategory] || `Category ${unit.unitCategory}`}
            </div>
          );
        case 'status':
          return unit.isActive ? (
            <Chip size="sm" variant="flat" color="success">
              Active
            </Chip>
          ) : (
            <Chip size="sm" variant="flat" color="danger">
              Inactive
            </Chip>
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
                <DropdownMenu aria-label="Unit actions" className="text-black">
                  <DropdownItem
                    key="edit"
                    isDisabled={unit.isSystem}
                    onClick={() => onEditUnit(unit)}
                    className="text-black"
                  >
                    Edit
                  </DropdownItem>
                  <DropdownItem
                    key="delete"
                    isDisabled={unit.isSystem}
                    onClick={() => onDeleteUnit(unit)}
                    className="text-danger"
                    color="danger"
                  >
                    Delete
                  </DropdownItem>
                </DropdownMenu>
              </Dropdown>
            </div>
          );
        default:
          return null;
      }
    },
    [onEditUnit, onDeleteUnit]
  );

  const onSearchChange = React.useCallback((value?: string) => {
    if (value) {
      setFilterValue(value);
    } else {
      setFilterValue('');
    }
  }, []);

  const topContent = React.useMemo(() => {
    return (
      <div className="flex flex-col gap-4 mb-4 mt-5">
        <div className="flex justify-between gap-3 items-end">
          <div className="flex gap-4 items-center flex-1">
            <div className="bg-gray-200 p-2 rounded-md">
              <Ruler className="w-5 h-5 text-[#494E58]" />
            </div>
            <span className="text-md text-gray-500">
              {units.length} Units
            </span>
          </div>
          <div className="flex gap-3 w-1/2 justify-end">
            <Input
              isClearable
              className="w-full sm:max-w-[55%]"
              placeholder="Search by name or code"
              startContent={<Search className="text-default-300" size={16} />}
              value={filterValue}
              onClear={() => onSearchChange('')}
              onValueChange={onSearchChange}
              classNames={{
                inputWrapper: 'border border-gray-200 rounded-lg bg-white',
              }}
              variant="bordered"
            />
            <Button
              color="secondary"
              className="bg-primaryColor rounded-lg text-white font-medium"
              endContent={<span className="text-lg">+</span>}
              onPress={onAddUnit}
            >
              {isMobile ? '' : 'Add Unit'}
            </Button>
          </div>
        </div>
      </div>
    );
  }, [filterValue, onSearchChange, units.length, onAddUnit, isMobile]);

  return (
    <section>
      {topContent}

      <section className="border border-primaryGrey rounded-lg mt-3">
        <div className="overflow-x-auto">
          <Table
            radius="lg"
            isCompact
            removeWrapper
            aria-label="list of units"
            bottomContent={bottomContent}
            bottomContentPlacement="outside"
            classNames={classNames}
            selectedKeys={selectedKeys}
            sortDescriptor={sortDescriptor as SortDescriptor}
            onSelectionChange={setSelectedKeys as (keys: Selection) => void}
            onSortChange={setSortDescriptor as (descriptor: SortDescriptor) => void}
          >
            <TableHeader columns={headerColumns}>
              {(column: any) => (
                <TableColumn
                  key={column.uid}
                  align={column.uid === 'actions' ? 'center' : 'start'}
                  allowsSorting={column.sortable}
                >
                  {column.name}
                </TableColumn>
              )}
            </TableHeader>
            <TableBody items={sortedItems} emptyContent={'No units found'}>
              {(item: InventoryUnit) => (
                <TableRow
                  key={String(item.id)}
                  className="cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  {(columnKey) => (
                    <TableCell>
                      {renderCell(item, String(columnKey))}
                    </TableCell>
                  )}
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </section>
    </section>
  );
};

export default UnitsList;
