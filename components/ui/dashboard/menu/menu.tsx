'use client';

import React, { useEffect, useState } from 'react';

import { useGlobalContext } from '@/hooks/globalProvider';
import usePagination from '@/hooks/usePagination';
import { formatPrice } from '@/lib/utils';
import {
  Chip,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from '@nextui-org/react';
import Image from 'next/image';
import Link from 'next/link';
import { GrFormView } from 'react-icons/gr';
import { HiOutlineDotsVertical } from 'react-icons/hi';
import noImage from '../../../../public/assets/images/no-image.svg';
import { columns, statusColorMap, statusDataMap } from './data';
import Filters from './filters';

const INITIAL_VISIBLE_COLUMNS = ['name', 'desc', 'price', 'actions'];
const MenuList = ({ menus, onOpen, searchQuery }: any) => {
  const [filteredMenu, setFilteredMenu] = React.useState(menus[0]?.items);
  const {
    toggleModalDelete,
    isOpenDelete,
    setIsOpenDelete,
    isOpenEdit,
    toggleModalEdit,
    page,
    rowsPerPage,
    menuIdTable,
    setMenuIdTable,
    setPage,
  } = useGlobalContext();
  useEffect(() => {
    setMenuIdTable(menus[0]?.id);
  }, []);

  useEffect(() => {
    if (menus && searchQuery) {
      const filteredData = menus
        .map((item) => ({
          ...item,
          items: item?.items?.filter(
            (item) =>
              item?.itemName?.toLowerCase().includes(searchQuery) ||
              String(item?.price)?.toLowerCase().includes(searchQuery) ||
              item?.menuName?.toLowerCase().includes(searchQuery) ||
              item?.itemDescription?.toLowerCase().includes(searchQuery)
          ),
        }))
        .filter((item) => item?.items?.length > 0);
      setFilteredMenu(filteredData.length > 0 ? filteredData[0].items : []);
    } else {
      setFilteredMenu(menus?.[0]?.items);
    }
  }, [searchQuery, menus]);

  const matchingObject = menus?.find(
    (category) => category?.id === menuIdTable
  );

  const matchingObjectArray = matchingObject
    ? matchingObject?.items
    : filteredMenu;
  const {
    bottomContent,
    headerColumns,
    setSelectedKeys,

    selectedKeys,
    sortDescriptor,
    setSortDescriptor,
    filterValue,
    statusFilter,
    visibleColumns,
    onSearchChange,
    onRowsPerPageChange,
    classNames,
    hasSearchFilter,
  } = usePagination(matchingObject, columns, INITIAL_VISIBLE_COLUMNS);

  const [value, setValue] = useState('');

  const handleTabChange = (index) => {
    setValue(index);
  };

  const handleTabClick = (index) => {
    setPage(1);
    const filteredMenu = menus.filter((item) => item.name === index);

    setMenuIdTable(filteredMenu[0]?.id);
    setFilteredMenu(filteredMenu[0]?.items);
  };

  const renderCell = React.useCallback((menu, columnKey) => {
    const cellValue = menu[columnKey];

    switch (columnKey) {
      case 'name':
        return (
          <div className='flex '>
            <Image
              className='h-[60px] w-[60px] bg-cover rounded-lg'
              width={60}
              height={60}
              alt='menu'
              aria-label='menu'
              src={
                menu.image ? `data:image/jpeg;base64,${menu.image}` : noImage
              }
            />

            <div className='ml-5 gap-1 grid place-content-center'>
              <p className='font-bold text-sm'>{menu.menuName}</p>
              <p className='text-sm'>{menu.itemName}</p>
              {menu.isAvailable === false && (
                <Chip
                  className='capitalize'
                  color={statusColorMap[menu.isAvailable]}
                  size='sm'
                  variant='bordered'
                >
                  {statusDataMap[menu.isAvailable]}
                </Chip>
              )}
            </div>
          </div>
        );
      case 'price':
        return (
          <div className='text-sm'>
            <p>{formatPrice(menu.price)}</p>
          </div>
        );
      case 'desc':
        return (
          <div className=' text-sm grid  m-0  w-[360px]   flex-col'>
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
                    className='flex w-full'
                    href={{
                      pathname: `/dashboard/menu/${menu.itemName}`,
                      query: {
                        itemId: menu.id,
                      },
                    }}
                  >
                    <div className={` flex gap-2  items-center text-grey500`}>
                      <GrFormView className='text-[20px]' />
                      <p>View more</p>
                    </div>
                  </Link>
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </div>
        );
      default:
        return cellValue;
    }
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

  return (
    <section>
      <Table
        isCompact
        removeWrapper
        hideHeader
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
              key={column?.uid}
              align={column?.uid === 'actions' ? 'center' : 'start'}
              allowsSorting={column?.sortable}
            >
              {column?.name}
            </TableColumn>
          )}
        </TableHeader>
        <TableBody
          emptyContent={'No menu items found'}
          items={matchingObjectArray}
        >
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

export default MenuList;
