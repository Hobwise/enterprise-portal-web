'use client';

import React, { useState } from 'react';

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
  TableRow
} from '@nextui-org/react';
import { useRouter } from 'next/navigation';
import { BsCalendar2Check } from 'react-icons/bs';
import { FaRegEdit } from 'react-icons/fa';
import { HiOutlineDotsVertical } from 'react-icons/hi';
import { LiaTimesSolid } from 'react-icons/lia';
import {
  availableOptions,
  columns,
  statusColorMap,
  statusDataMap
} from './data';
import Filters from './filters';

import { useGlobalContext } from '@/hooks/globalProvider';

import usePagination from '@/hooks/usePagination';
import { formatPrice, saveJsonItemToLocalStorage } from '@/lib/utils';
import moment from 'moment';
import CancelOrderModal from './cancelOrder';
import ConfirmOrderModal from './confirmOrder';

const INITIAL_VISIBLE_COLUMNS = [
  'name',
  'amount',
  'orderID',
  'placedByPhoneNumber',
  'status',
  'dateCreated',
  'actions',
];
const OrdersList = ({ orders, onOpen, getAllOrders }: any) => {
  const router = useRouter();

  const [singleOrder, setSingleOrder] = React.useState('');
  const [isOpenCancelOrder, setIsOpenCancelOrder] =
    React.useState<Boolean>(false);
  const [isOpenConfirmOrder, setIsOpenConfirmOrder] =
    React.useState<Boolean>(false);
  const [filteredOrder, setFilteredOrder] = React.useState(orders[0]?.orders);
  const {
    toggleModalDelete,
    isOpenDelete,
    setIsOpenDelete,
    isOpenEdit,
    toggleModalEdit,
  } = useGlobalContext();
  const {
    bottomContent,
    headerColumns,
    setSelectedKeys,
    sortedItems,
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
  } = usePagination(filteredOrder, columns, INITIAL_VISIBLE_COLUMNS);

  const toggleCancelModal = (order: any) => {
    setSingleOrder(order);
    setIsOpenCancelOrder(!isOpenCancelOrder);
  };
  const toggleConfirmModal = (order: any) => {
    setSingleOrder(order);
    setIsOpenConfirmOrder(!isOpenConfirmOrder);
  };

  const [value, setValue] = useState('');

  const handleTabChange = (index) => {
    setValue(index);
  };

  const handleTabClick = (index) => {
    const filteredOrder = orders.filter((item) => item.name === index);
    setFilteredOrder(filteredOrder[0]?.orders);
  };

  const renderCell = React.useCallback((order, columnKey) => {
    const cellValue = order[columnKey];
    const options = availableOptions[statusDataMap[order.status]];
    switch (columnKey) {
      case 'name':
        return (
          <div className='flex text-textGrey text-sm'>{order.placedByName}</div>
        );
      case 'amount':
        return (
          <div className='text-textGrey text-sm'>
            <p>{formatPrice(order.totalAmount)}</p>
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
            <Dropdown aria-label='drop down' className=''>
              <DropdownTrigger aria-label='actions'>
                <div className='cursor-pointer flex justify-center items-center text-black'>
                  <HiOutlineDotsVertical className='text-[22px] ' />
                </div>
              </DropdownTrigger>
              <DropdownMenu className='text-black'>
                {options && options.includes('Update Order') && (
                  <DropdownItem
                    onClick={() => {
                      router.push('/dashboard/orders/place-order');
                      saveJsonItemToLocalStorage('order', order);
                    }}
                    aria-label='update order'
                  >
                    <div className={` flex gap-3  items-center text-grey500`}>
                      <FaRegEdit />
                      <p>Update order</p>
                    </div>
                  </DropdownItem>
                )}
                {options && options.includes('Checkout') && (
                  <DropdownItem
                    onClick={() => toggleConfirmModal(order)}
                    aria-label='checkout'
                  >
                    <div className={`flex gap-3 items-center text-grey500`}>
                      <BsCalendar2Check />
                      <p>Checkout</p>
                    </div>
                  </DropdownItem>
                )}
                {options && options.includes('Cancel Order') && (
                  <DropdownItem
                    onClick={() => toggleCancelModal(order)}
                    aria-label='cancel order'
                  >
                    <div
                      className={` text-danger-500 flex  items-center gap-3 `}
                    >
                      <LiaTimesSolid />

                      <p>Cancel order</p>
                    </div>
                  </DropdownItem>
                )}
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
        orders={orders}
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
    filteredOrder.length,
    hasSearchFilter,
  ]);

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
      <CancelOrderModal
        getAllOrders={getAllOrders}
        singleOrder={singleOrder}
        isOpenCancelOrder={isOpenCancelOrder}
        toggleCancelModal={toggleCancelModal}
      />
      <ConfirmOrderModal
        getAllOrders={getAllOrders}
        singleOrder={singleOrder}
        isOpenConfirmOrder={isOpenConfirmOrder}
        toggleConfirmModal={toggleConfirmModal}
      />
    </section>
  );
};

export default OrdersList;
