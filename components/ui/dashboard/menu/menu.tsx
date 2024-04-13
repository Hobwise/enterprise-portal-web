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
} from '@nextui-org/react';
import { HiOutlineDotsVertical } from 'react-icons/hi';
import { IoIosArrowForward } from 'react-icons/io';
import { columns } from './data';
import Filters from './filters';
import Link from 'next/link';
import Image from 'next/image';
import {
  convertBase64ToImageURL,
  saveJsonItemToLocalStorage,
} from '@/lib/utils';
import { useGlobalContext } from '@/hooks/globalProvider';
import DeleteMenu from '@/app/dashboard/menu/[menuId]/deleteMenu';
import EditMenu from '@/app/dashboard/menu/[menuId]/editMenu';
import noImage from '../../../../public/assets/images/no-image.jpg';

const INITIAL_VISIBLE_COLUMNS = ['name', 'desc', 'price', 'actions'];
const MenuList = ({ menus, onOpen }: any) => {
  const [filterValue, setFilterValue] = React.useState('');
  const [filteredMenu, setFilteredMenu] = React.useState(menus[0]?.items);
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
    const filteredMenu = menus.filter((item) => item.name === index);

    setFilteredMenu(filteredMenu[0]?.items);
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

  const renderCell = React.useCallback((menu, columnKey) => {
    const cellValue = menu[columnKey];

    switch (columnKey) {
      case 'name':
        return (
          <div className='flex'>
            <Image
              className='h-[60px] w-[60px] bg-cover rounded-lg'
              width={60}
              height={60}
              alt='menu'
              unoptimized
              aria-label='menu'
              src={
                menu.image ? `data:image/jpeg;base64,${menu.image}` : noImage
              }
            />

            <div className='ml-5 gap-1'>
              <p className='font-bold'>{menu.itemName}</p>
              <p>{menu.itemName}</p>
            </div>
          </div>
        );
      case 'price':
        return (
          <div className=''>
            <p>₦{menu.price}</p>
          </div>
        );
      case 'desc':
        return (
          <div className='flex  max-h-[100px] m-0 overflow-scroll w-[360px] flex-col'>
            {menu.itemDescription}
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
                      pathname: `/dashboard/menu/${menu.itemName}`,
                      query: {
                        itemId: menu.id,
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
        menus={menus}
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

  const classNames = React.useMemo(
    () => ({
      wrapper: ['max-h-[382px]', 'max-w-3xl'],
      th: ['bg-transparent', 'text-default-500', 'border-b', 'border-divider'],
      tr: ' border-b border-divider',
      td: [
        // changing the rows border radius
        // first
        'py-3',
        'group-data-[first=true]:first:before:rounded-none',
        'group-data-[first=true]:last:before:rounded-none',
        // middle
        'group-data-[middle=true]:before:rounded-none',
        // last
        'group-data-[last=true]:first:before:rounded-none',
        'group-data-[last=true]:last:before:rounded-none',
      ],
    }),
    []
  );
  return (
    <section>
      <Table
        isCompact
        removeWrapper
        aria-label='list of menu'
        bottomContent={bottomContent}
        bottomContentPlacement='outside'
        classNames={classNames}
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
        <TableBody emptyContent={'No menu items found'} items={sortedItems}>
          {(item) => (
            <TableRow key={item?.name}>
              {(columnKey) => (
                <TableCell>{renderCell(item, columnKey)}</TableCell>
              )}
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* <DeleteMenu
        menuItem={filteredMenu}
        isOpenDelete={isOpenDelete}
        toggleModalDelete={toggleModalDelete}
      /> */}
      {/* <EditMenu isOpenEdit={isOpenEdit} toggleModalEdit={toggleModalEdit} /> */}
    </section>
  );
};

export default MenuList;
