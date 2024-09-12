'use client';

import React, { useEffect, useState } from 'react';

import { useGlobalContext } from '@/hooks/globalProvider';
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
import { useRouter } from 'next/navigation';
import { BsCalendar2Check } from 'react-icons/bs';
import { FaRegEdit } from 'react-icons/fa';
import { HiOutlineDotsVertical } from 'react-icons/hi';
import { TbFileInvoice } from 'react-icons/tb';
import {
  availableOptions,
  columns,
  statusColorMap,
  statusDataMap,
} from './data';
import Filters from './filters';

import usePagination from '@/hooks/usePagination';
import { formatPrice, saveJsonItemToLocalStorage } from '@/lib/utils';
import moment from 'moment';
import { FaCommentDots } from 'react-icons/fa6';
import { LiaTimesSolid } from 'react-icons/lia';
import CancelOrderModal from './cancelOrder';
import Comment from './comment';
import ConfirmOrderModal from './confirmOrder';
import InvoiceModal from './invoice';

const INITIAL_VISIBLE_COLUMNS = [
  'name',
  'amount',
  'orderID',
  'placedByPhoneNumber',
  'status',
  'dateCreated',
  'actions',
];
const OrdersList = ({ orders, searchQuery }: any) => {
  const router = useRouter();

  const [singleOrder, setSingleOrder] = React.useState('');
  const [isOpenCancelOrder, setIsOpenCancelOrder] =
    React.useState<Boolean>(false);
  const [isOpenInvoice, setIsOpenInvoice] = React.useState<Boolean>(false);
  const [isOpenConfirmOrder, setIsOpenConfirmOrder] =
    React.useState<Boolean>(false);
  const [isOpenComment, setIsOpenComment] = React.useState<Boolean>(false);
  const [filteredOrder, setFilteredOrder] = React.useState(orders[0]?.orders);

  const handleTabClick = (index) => {
    setPage(1);
    const filteredOrder = orders.filter((item) => item.name === index);
    setTableStatus(filteredOrder[0]?.name);

    setFilteredOrder(filteredOrder[0]?.orders);
  };

  useEffect(() => {
    if (orders && searchQuery) {
      const filteredData = orders.map((order) => ({
        ...order,
        orders: order?.orders?.filter(
          (item) =>
            item?.placedByName?.toLowerCase().includes(searchQuery) ||
            String(item?.totalAmount)?.toLowerCase().includes(searchQuery) ||
            item?.dateCreated?.toLowerCase().includes(searchQuery) ||
            item?.reference?.toLowerCase().includes(searchQuery) ||
            item?.placedByPhoneNumber?.toLowerCase().includes(searchQuery) ||
            item?.paymentReference?.toLowerCase().includes(searchQuery)
        ),
      }));

      setFilteredOrder(filteredData?.length > 0 ? filteredData[0]?.orders : []);
    } else {
      setFilteredOrder(orders?.[0]?.orders);
    }
  }, [searchQuery, orders]);

  const {
    toggleModalDelete,
    isOpenDelete,
    setIsOpenDelete,
    isOpenEdit,
    toggleModalEdit,
    page,
    rowsPerPage,
    setTableStatus,
    tableStatus,
    setPage,
  } = useGlobalContext();

  const matchingObject = orders?.find(
    (category) => category?.name === tableStatus
  );
  const matchingObjectArray = matchingObject ? matchingObject?.orders : [];
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

  const toggleCancelModal = (order: any) => {
    setSingleOrder(order);
    setIsOpenCancelOrder(!isOpenCancelOrder);
  };
  const toggleCommentModal = (order: any) => {
    setSingleOrder(order);
    setIsOpenComment(!isOpenComment);
  };
  const toggleConfirmModal = (order: any) => {
    setSingleOrder(order);
    setIsOpenConfirmOrder(!isOpenConfirmOrder);
  };
  const toggleInvoiceModal = (order: any) => {
    setSingleOrder(order);
    setIsOpenInvoice(!isOpenInvoice);
  };

  const [value, setValue] = useState('');

  const handleTabChange = (index) => {
    setValue(index);
  };

  const renderCell = React.useCallback((order, columnKey) => {
    const cellValue = order[columnKey];
    const options = availableOptions[statusDataMap[order.status]];
    switch (columnKey) {
      case 'name':
        return (
          <div className='flex text-textGrey items-center gap-2 text-sm cursor-pointer'>
            <span>{order.placedByName}</span>
            {order.comment && (
              <div
                title={'view comment'}
                onClick={() => toggleCommentModal(order)}
                className=' cursor-pointer'
              >
                <FaCommentDots className='text-primaryColor' />
              </div>
            )}
          </div>
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
                <DropdownItem
                  onClick={() => toggleInvoiceModal(order)}
                  aria-label='Generate invoice'
                >
                  <div className={`  flex gap-3  items-center text-grey500`}>
                    <TbFileInvoice className='text-[18px]' />
                    <p>Generate invoice</p>
                  </div>
                </DropdownItem>
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
    filteredOrder?.length,
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
        <TableBody emptyContent={'No orders found'} items={matchingObjectArray}>
          {(item) => (
            <TableRow key={item?.name}>
              {(columnKey) => (
                <TableCell>{renderCell(item, columnKey)}</TableCell>
              )}
            </TableRow>
          )}
        </TableBody>
      </Table>
      <Comment
        toggleCommentModal={toggleCommentModal}
        singleOrder={singleOrder}
        isOpenComment={isOpenComment}
      />
      <CancelOrderModal
        singleOrder={singleOrder}
        isOpenCancelOrder={isOpenCancelOrder}
        toggleCancelModal={toggleCancelModal}
      />
      <ConfirmOrderModal
        singleOrder={singleOrder}
        isOpenConfirmOrder={isOpenConfirmOrder}
        toggleConfirmModal={toggleConfirmModal}
      />
      <InvoiceModal
        singleOrder={singleOrder}
        isOpenInvoice={isOpenInvoice}
        toggleInvoiceModal={toggleInvoiceModal}
      />
    </section>
  );
};

export default OrdersList;
