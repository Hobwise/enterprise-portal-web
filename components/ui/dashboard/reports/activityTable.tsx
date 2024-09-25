import useOrder from '@/hooks/cachedEndpoints/useOrder';
import usePagination from '@/hooks/usePagination';
import { SmallLoader, formatPrice } from '@/lib/utils';
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
import { useCallback } from 'react';
import { columns, statusColorMap, statusDataMap } from '../orders/data';

const INITIAL_VISIBLE_COLUMNS = [
  'name',
  'amount',
  'orderID',
  'placedByPhoneNumber',
  'status',
  'dateCreated',
  'actions',
];

const ActivityTable = () => {
  const { data, isLoading, isError, refetch } = useOrder();
  console.log(data, 'data');
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
  } = usePagination(data, columns, INITIAL_VISIBLE_COLUMNS);
  const renderCell = useCallback((order, columnKey) => {
    const cellValue = order[columnKey];

    switch (columnKey) {
      case 'name':
        return (
          <div className='flex text-textGrey items-center gap-2 text-sm cursor-pointer'>
            <span>{order.placedByName}</span>
            {/* {order.comment && (
                  <div
                    title={'view comment'}
                    onClick={() => toggleCommentModal(order)}
                    className=' cursor-pointer'
                  >
                    <FaCommentDots className='text-primaryColor' />
                  </div>
                )} */}
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

      default:
        return cellValue;
    }
  }, []);

  return (
    <section className='border border-primaryGrey rounded-md mt-2 p-3'>
      <div className=' flex flex-col items-center mb-4'>
        <p className='text-xl font-bold'>All Orders</p>
        <p className='text-base font-semibold'>ABC restaurant, Lagos</p>
        <p className='text-sm text-grey600'>September 1 - 12, 2024</p>
      </div>
      <Table
        radius='lg'
        isCompact
        removeWrapper
        allowsSorting
        aria-label='list of orders'
        // bottomContent={bottomContent}
        bottomContentPlacement='outside'
        classNames={classNames}
        selectedKeys={selectedKeys}
        // selectionMode='multiple'
        sortDescriptor={sortDescriptor}
        // topContent={topContent}
        topContentPlacement='outside'
        onSelectionChange={setSelectedKeys}
        onSortChange={setSortDescriptor}
      >
        <TableHeader columns={headerColumns}>
          {(column) => (
            <TableColumn
              key={column.uid}
              align={column.uid === 'actions' ? 'center' : 'start'}
              //   allowsSorting={column.sortable}
              allowsSorting
            >
              {column.name}
            </TableColumn>
          )}
        </TableHeader>
        <TableBody
          emptyContent={'No orders found'}
          items={data?.[0]?.orders || []}
          isLoading={isLoading}
          loadingContent={<SmallLoader />}
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

export default ActivityTable;
