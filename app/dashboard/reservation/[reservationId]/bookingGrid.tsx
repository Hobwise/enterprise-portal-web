'use client';

import React, { useState } from 'react';

import { useGlobalContext } from '@/hooks/globalProvider';
import usePagination from '@/hooks/usePagination';
import {
  Chip,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from '@nextui-org/react';
import moment from 'moment';
import { columns, statusColorMap, statusDataMap } from './data';
import Filters from './filters';

const INITIAL_VISIBLE_COLUMNS = [
  'firstName',
  'reference',
  'bookingDateTime',
  'status',
  'actions',
];
const BookingGrid = ({ data }: any) => {
  //   console.log(data, 'data');

  const { page, rowsPerPage, setTableStatus, tableStatus, setPage } =
    useGlobalContext();

  const matchingObject = data?.find(
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

  const [value, setValue] = useState('');
  const [filteredBookings, setFilteredBookings] = React.useState(
    data[0]?.bookings
  );
  const handleTabChange = (index) => {
    setValue(index);
  };

  const handleTabClick = (index) => {
    setPage(1);
    const filteredBookings = data.filter((item) => item.name === index);
    setTableStatus(filteredOrder[0]?.name);
    setFilteredBookings(filteredBookings[0]?.bookings);
  };

  const topContent = React.useMemo(() => {
    return (
      <Filters
        bookings={data}
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
    filteredBookings.length,
    hasSearchFilter,
  ]);

  const renderCell = React.useCallback((data, columnKey) => {
    const cellValue = data[columnKey];

    switch (columnKey) {
      case 'firstName':
        return (
          <div className=' text-textGrey text-sm'>
            <p className='font-bold'>
              {data?.bookings[0]?.firstName} {data?.bookings[0]?.lastName}
            </p>
            <p>{data?.bookings[0]?.phoneNumber}</p>
          </div>
        );

      case 'reference':
        return (
          <div className='text-textGrey text-sm'>
            {data?.bookings[0]?.reference}
          </div>
        );
      case 'bookingDateTime':
        return (
          <div className='text-textGrey text-sm'>
            {moment(data?.bookings[0]?.bookingDateTime).format(
              'MMMM Do YYYY, h:mm:ss a'
            )}
          </div>
        );
      case 'status':
        return (
          <Chip
            className='capitalize'
            color={statusColorMap[data?.bookings[0]?.bookingStatus]}
            size='sm'
            variant='bordered'
          >
            {statusDataMap[data?.bookings[0]?.bookingStatus]}
          </Chip>
        );

      //   case 'actions':
      //     return (
      //       <div className='relative flexjustify-center items-center gap-2'>
      //         <Dropdown aria-label='drop down' className=''>
      //           <DropdownTrigger aria-label='actions'>
      //             <div className='cursor-pointer flex justify-center items-center text-black'>
      //               <HiOutlineDotsVertical className='text-[22px] ' />
      //             </div>
      //           </DropdownTrigger>
      //           <DropdownMenu className='text-black'>
      //             <DropdownItem onClick={() => {}} aria-label='delete QR'>
      //               <div className={` text-danger-500 flex  items-center gap-3 `}>
      //                 <RiDeleteBin6Line />

      //                 <p>Delete QR</p>
      //               </div>
      //             </DropdownItem>
      //           </DropdownMenu>
      //         </Dropdown>
      //       </div>
      //     );
      default:
        return cellValue;
    }
  }, []);

  return (
    <section className='border w-full border-primaryGrey rounded-lg'>
      <Table
        radius='lg'
        isCompact
        removeWrapper
        allowsSorting
        aria-label='list of bookings'
        bottomContent={bottomContent}
        bottomContentPlacement='outside'
        classNames={classNames}
        selectedKeys={selectedKeys}
        topContent={topContent}
        // selectionMode='multiple'
        sortDescriptor={sortDescriptor}
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
        <TableBody
          emptyContent={'No bookings found'}
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

export default BookingGrid;
