'use client';
import { Button, Pagination, PaginationItemType, cn } from '@nextui-org/react';
import React, { useCallback, useMemo } from 'react';
import { IoIosArrowForward } from 'react-icons/io';
import { useGlobalContext } from './globalProvider';

function usePagination<T = any>(arrayToMap: any, columns: T[] = [], visibleColumn: string[] = []) {
  const { page, setPage, rowsPerPage, setRowsPerPage } = useGlobalContext();

  // Convert these to useMemo to prevent unnecessary recalculations
  const refinedArrayToMap = useMemo(
    () => (arrayToMap ? arrayToMap?.totalPages : 1),
    [arrayToMap?.totalPages]
  );

  const [filterValue, setFilterValue] = React.useState('');
  const [statusFilter] = React.useState('all');
  const [selectedKeys, setSelectedKeys] = React.useState(new Set([]));
  const [visibleColumns, setVisibleColumns] = React.useState(
    new Set(visibleColumn)
  );
  const [sortDescriptor, setSortDescriptor] = React.useState({
    column: 'price',
    direction: 'ascending',
  });

  // Memoize the renderItem function
  const renderItem = useCallback(
    ({
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
            title='next'
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
            title='previous'
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
    },
    [setPage]
  );

  const hasSearchFilter = Boolean(filterValue);

  // Replace useEffect with useMemo for visibleColumns
  const currentVisibleColumns = useMemo(() => {
    return new Set(visibleColumn);
  }, [visibleColumn]);

  const headerColumns = useMemo(() => {
    if (currentVisibleColumns === 'all') return columns;

    return columns?.filter((column: any) =>
      Array.from(currentVisibleColumns).includes(column.uid)
    );
  }, [currentVisibleColumns, columns]);

  const onNextPage = useCallback(() => {
    if (page < refinedArrayToMap) {
      setPage(page + 1);
    }
  }, [page, refinedArrayToMap, setPage]);

  const onPreviousPage = useCallback(() => {
    if (page > 1) {
      setPage(page - 1);
    }
  }, [page, setPage]);

  const onRowsPerPageChange = useCallback(
    (e) => {
      setRowsPerPage(Number(e.target.value));
      setPage(1);
    },
    [setRowsPerPage, setPage]
  );

  const onSearchChange = useCallback(
    (value) => {
      if (value) {
        setFilterValue(value);
        setPage(1);
      } else {
        setFilterValue('');
      }
    },
    [setPage]
  );

  const onClear = useCallback(() => {
    setFilterValue('');
    setPage(1);
  }, [setPage]);

  // Memoize the bottomContent
  const bottomContent = useMemo(
    () => (
      <div className='py-2 px-2 flex justify-between items-center'>
        <div className='text-[14px] text-grey600'>
          Page {arrayToMap?.currentPage} of {arrayToMap?.totalPages || 1}
        </div>
        <Pagination
          disableCursorAnimation
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
            isDisabled={
              refinedArrayToMap === 1 || arrayToMap?.hasNext === false
            }
            size='sm'
            variant='flat'
            onPress={onNextPage}
          >
            Next
          </Button>
        </div>
      </div>
    ),
    [
      arrayToMap?.currentPage,
      arrayToMap?.totalPages,
      arrayToMap?.hasPrevious,
      arrayToMap?.hasNext,
      page,
      refinedArrayToMap,
      setPage,
      renderItem,
      onPreviousPage,
      onNextPage,
    ]
  );

  const classNames = useMemo(
    () => ({
      grid: 'w-full overflow-x-scroll',
      wrapper: ['max-h-[382px]'],
      th: [
        'text-default-500',
        'text-sm',
        'border-b',
        'border-divider',
        'py-4',
        'rounded-none',
        'bg-grey300',
      ],
      tr: 'border-b border-divider rounded-none',
      td: [
        'py-3',
        'text-textGrey',
        'group-data-[first=true]:first:before:rounded-none',
        'group-data-[first=true]:last:before:rounded-none',
        'group-data-[middle=true]:before:rounded-none',
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
    onClear,
  };
}

export default usePagination;
