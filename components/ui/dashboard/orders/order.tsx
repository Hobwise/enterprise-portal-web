'use client';

import React, { useEffect, useState } from 'react';

import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Button,
  DropdownTrigger,
  Dropdown,
  DropdownMenu,
  DropdownItem,
  cn,
  PaginationItemType,
  Pagination,
  menu,
  Chip,
} from '@nextui-org/react';
import { HiOutlineDotsVertical } from 'react-icons/hi';
import { IoIosArrowForward } from 'react-icons/io';
import {
  columns,
  getTableClasses,
  statusColorMap,
  statusDataMap,
} from './data';
import Filters from './filters';
import Link from 'next/link';
import Image from 'next/image';

import { useGlobalContext } from '@/hooks/globalProvider';

import noImage from '../../../../public/assets/images/no-image.jpg';
import moment from 'moment';

const INITIAL_VISIBLE_COLUMNS = [
  'name',
  'amount',
  'orderID',
  'placedByPhoneNumber',
  'status',
  'dateCreated',
  'actions',
];
const OrdersList = ({ orders, onOpen }: any) => {
  const [filterValue, setFilterValue] = React.useState('');
  const [filteredMenu, setFilteredMenu] = React.useState(orders[0]?.orders);
  const {
    toggleModalDelete,
    isOpenDelete,
    setIsOpenDelete,
    isOpenEdit,
    toggleModalEdit,
  } = useGlobalContext();

  const [selectedKeys, setSelectedKeys] = React.useState(new Set([]));
  const [visibleColumns, setVisibleColumns] = React.useState(
    new Set(INITIAL_VISIBLE_COLUMNS)
  );

  const [value, setValue] = useState('');

  const handleTabChange = (index) => {
    setValue(index);
  };

  const handleTabClick = (index) => {
    const filteredMenu = orders.filter((item) => item.name === index);
    setFilteredMenu(filteredMenu[0]?.orders);
  };

  const [statusFilter, setStatusFilter] = React.useState('all');
  const [rowsPerPage, setRowsPerPage] = React.useState(5);
  const [sortDescriptor, setSortDescriptor] = React.useState({
    column: 'price',
    direction: 'ascending',
  });
  const [page, setPage] = React.useState(1);

  const pages = Math.ceil(filteredMenu.length / rowsPerPage);

  const hasSearchFilter = Boolean(filterValue);

  const headerColumns = React.useMemo(() => {
    if (visibleColumns === 'all') return columns;

    return columns.filter((column) =>
      Array.from(visibleColumns).includes(column.uid)
    );
  }, [visibleColumns]);

  const filteredItems = React.useMemo(() => {
    let filteredMenus = [...filteredMenu];

    if (hasSearchFilter) {
      filteredMenus = filteredMenus.filter((user) =>
        user.name.toLowerCase().includes(filterValue.toLowerCase())
      );
    }

    return filteredMenus;
  }, [filteredMenu, filterValue, statusFilter]);

  const items = React.useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;

    return filteredItems.slice(start, end);
  }, [page, filteredItems, rowsPerPage]);

  const sortedItems = React.useMemo(() => {
    return [...items].sort((a, b) => {
      const first = a[sortDescriptor.column];
      const second = b[sortDescriptor.column];
      const cmp = first < second ? -1 : first > second ? 1 : 0;

      return sortDescriptor.direction === 'descending' ? -cmp : cmp;
    });
  }, [sortDescriptor, items]);

  const renderCell = React.useCallback((order, columnKey) => {
    const cellValue = order[columnKey];

    switch (columnKey) {
      case 'name':
        return (
          <div className='flex text-textGrey text-sm'>{order.placedByName}</div>
        );
      case 'amount':
        return (
          <div className='text-textGrey text-sm'>
            <p>₦{order.totalAmount}</p>
          </div>
        );
      case 'orderID':
        return <div className='text-textGrey text-sm'>{order.reference}</div>;
      case 'placedByPhoneNumber':
        return (
          <div className='text-textGrey text-sm'>
            {order.placedByPhoneNumber}
          </div>
        );
      case 'status':
        return (
          <Chip
            className='capitalize'
            color={statusColorMap[order.status]}
            size='sm'
            variant='bordered'
          >
            {statusDataMap[cellValue]}
          </Chip>
        );
      case 'dateCreated':
        return (
          <div className='text-textGrey text-sm'>
            {moment(order.dateCreated).format('MMMM Do YYYY, h:mm:ss a')}
          </div>
        );

      case 'actions':
        return (
          <div className='relative flexjustify-center items-center gap-2'>
            <Dropdown className=''>
              <DropdownTrigger aria-label='actions'>
                <div className='cursor-pointer flex justify-center items-center text-black'>
                  <HiOutlineDotsVertical className='text-[22px] ' />
                </div>
              </DropdownTrigger>
              <DropdownMenu className='text-black'>
                <DropdownItem aria-label='view'>
                  <Link
                    href={{
                      pathname: `/dashboard/order/${order.itemName}`,
                      query: {
                        itemId: order.id,
                      },
                    }}
                  >
                    View
                  </Link>
                </DropdownItem>
                {/* <DropdownItem
                  onClick={() => {
                    saveJsonItemToLocalStorage('menuItem', menu);
                    toggleModalEdit();
                  }}
                  aria-label='edit'
                >
                  Edit
                </DropdownItem> */}
                {/* <DropdownItem
                  aria-label='delete'
                  onClick={() => {
                    toggleModalDelete();
                    console.log(menu.id, 'cellValue');
                    // setFilteredMenu(menu);
                    // saveJsonItemToLocalStorage('menuItem', menu);
                  }}
                >
                  Delete
                </DropdownItem> */}
              </DropdownMenu>
            </Dropdown>
          </div>
        );
      default:
        return cellValue;
    }
  }, []);

  const onNextPage = React.useCallback(() => {
    if (page < pages) {
      setPage(page + 1);
    }
  }, [page, pages]);

  const onPreviousPage = React.useCallback(() => {
    if (page > 1) {
      setPage(page - 1);
    }
  }, [page]);

  const onRowsPerPageChange = React.useCallback((e) => {
    setRowsPerPage(Number(e.target.value));
    setPage(1);
  }, []);

  const onSearchChange = React.useCallback((value) => {
    if (value) {
      setFilterValue(value);
      setPage(1);
    } else {
      setFilterValue('');
    }
  }, []);

  const onClear = React.useCallback(() => {
    setFilterValue('');
    setPage(1);
  }, []);
  const topContent = React.useMemo(() => {
    return (
      <Filters
        onOpen={onOpen}
        menus={orders}
        handleTabChange={handleTabChange}
        value={value}
        handleTabClick={handleTabClick}
      />
    );
  }, [
    filterValue,
    statusFilter,
    visibleColumns,
    onSearchChange,
    onRowsPerPageChange,
    filteredMenu.length,
    hasSearchFilter,
  ]);

  const renderItem = ({
    ref,
    key,
    value,
    isActive,
    onNext,
    onPrevious,
    setPage,
    className,
  }: any) => {
    if (value === PaginationItemType.NEXT) {
      return (
        <button
          key={key}
          className={cn(className, 'bg-default-200/50 min-w-8 w-8 h-8')}
          onClick={onNext}
        >
          <IoIosArrowForward />
        </button>
      );
    }

    if (value === PaginationItemType.PREV) {
      return (
        <button
          key={key}
          className={cn(className, 'bg-default-200/50 min-w-8 w-8 h-8')}
          onClick={onPrevious}
        >
          <IoIosArrowForward className='rotate-180' />
        </button>
      );
    }

    if (value === PaginationItemType.DOTS) {
      return (
        <button key={key} className={className}>
          ...
        </button>
      );
    }

    // cursor is the default item
    return (
      <button
        key={key}
        ref={ref}
        className={cn(
          className,
          isActive && 'rounded-md text-primaryColor bg-[#EAE5FF] '
        )}
        onClick={() => setPage(value)}
      >
        {value}
      </button>
    );
  };

  const bottomContent = React.useMemo(() => {
    return (
      <div className='py-2 px-2 flex justify-between items-center'>
        <span className='w-[30%] text-small text-black'>
          Page{' '}
          {selectedKeys === 'all'
            ? 'All items selected'
            : `${selectedKeys.size} of ${filteredItems.length} `}
        </span>

        <Pagination
          disableCursorAnimation
          showControls
          page={page}
          total={pages}
          onChange={setPage}
          className='gap-2'
          radius='full'
          renderItem={renderItem}
          variant='light'
        />
        <div className='hidden sm:flex w-[30%] justify-end gap-2'>
          <Button
            isDisabled={pages === 1}
            size='sm'
            variant='flat'
            onPress={onPreviousPage}
          >
            Previous
          </Button>
          <Button
            isDisabled={pages === 1}
            size='sm'
            variant='flat'
            onPress={onNextPage}
          >
            Next
          </Button>
        </div>
      </div>
    );
  }, [selectedKeys, items.length, page, pages, hasSearchFilter]);

  return (
    <section className='border border-primaryGrey rounded-lg'>
      <Table
        radius='lg'
        isCompact
        removeWrapper
        allowsSorting
        aria-label='list of orders'
        bottomContent={bottomContent}
        bottomContentPlacement='outside'
        classNames={getTableClasses()}
        selectedKeys={selectedKeys}
        // selectionMode='multiple'
        sortDescriptor={sortDescriptor}
        topContent={topContent}
        topContentPlacement='outside'
        onSelectionChange={setSelectedKeys}
        onSortChange={setSortDescriptor}
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
        <TableBody emptyContent={'No orders found'} items={sortedItems}>
          {(item) => (
            <TableRow key={item?.name}>
              {(columnKey) => (
                <TableCell>{renderCell(item, columnKey)}</TableCell>
              )}
            </TableRow>
          )}
        </TableBody>
      </Table>
    </section>
  );
};

export default OrdersList;
