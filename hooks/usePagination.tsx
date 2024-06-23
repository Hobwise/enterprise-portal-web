'use client';
import { Button, Pagination, PaginationItemType, cn } from '@nextui-org/react';
import React from 'react';
import { IoIosArrowForward } from 'react-icons/io';
import { useGlobalContext } from './globalProvider';

const usePagination = (arrayToMap, columns = [], visibleColumn = []) => {
  const { page, setPage, rowsPerPage, setRowsPerPage } = useGlobalContext();

  const refinedArrayToMap = arrayToMap ? arrayToMap?.totalPages : 1;
  const [filterValue, setFilterValue] = React.useState('');

  const [statusFilter, setStatusFilter] = React.useState('all');
  const [selectedKeys, setSelectedKeys] = React.useState(new Set([]));
  const [visibleColumns, setVisibleColumns] = React.useState(
    new Set(visibleColumn)
  );
  const [sortDescriptor, setSortDescriptor] = React.useState({
    column: 'price',
    direction: 'ascending',
  });

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

  // const pages = Math.ceil(arrayToMap?.length / rowsPerPage);
  const hasSearchFilter = Boolean(filterValue);

  const headerColumns = React.useMemo(() => {
    if (visibleColumns === 'all') return columns;

    return columns?.filter((column) =>
      Array.from(visibleColumns).includes(column.uid)
    );
  }, [visibleColumns]);

  const onNextPage = React.useCallback(() => {
    if (page < refinedArrayToMap) {
      setPage(page + 1);
    }
  }, [page, refinedArrayToMap]);

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

  const bottomContent = (
    <div className='py-2 px-2 flex justify-between items-center'>
      <div className='text-[14px] text-grey600'>
        Page {arrayToMap?.currentPage} of {arrayToMap?.totalPages}
      </div>
      <Pagination
        disableCursorAnimation
        // showControls
        page={page}
        total={refinedArrayToMap}
        onChange={setPage}
        className='gap-2'
        radius='full'
        renderItem={renderItem}
        variant='light'
      />

      <div className='hidden md:flex w-[30%] justify-end gap-2'>
        <Button
          isDisabled={
            refinedArrayToMap === 1 || arrayToMap?.hasPrevious === false
          }
          size='sm'
          variant='flat'
          onPress={onPreviousPage}
        >
          Previous
        </Button>
        <Button
          isDisabled={refinedArrayToMap === 1 || arrayToMap?.hasNext === false}
          size='sm'
          variant='flat'
          onPress={onNextPage}
        >
          Next
        </Button>
      </div>
    </div>
  );

  const onClear = React.useCallback(() => {
    setFilterValue('');
    setPage(1);
  }, []);
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
  return {
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
    hasSearchFilter,
    classNames,
  };
};

export default usePagination;
