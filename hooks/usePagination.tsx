'use client';
import { Button, Pagination, PaginationItemType, cn, Spinner } from '@nextui-org/react';
import React, { useCallback, useMemo, useState, useEffect, useRef } from 'react';
import { IoIosArrowForward } from 'react-icons/io';
import { useGlobalContext } from './globalProvider';
import { useMobile } from './useMobile';

function usePagination<T = any>(arrayToMap: any, columns: T[] = [], visibleColumn: string[] = []) {
  const { page, setPage, rowsPerPage, setRowsPerPage } = useGlobalContext();

  // Mobile detection
  const isMobile = useMobile();

  // Infinite scroll state for mobile
  const [accumulatedData, setAccumulatedData] = useState<any[]>([]);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Universal pagination data processor to handle different data structures
  const paginationInfo = useMemo(() => {
    // Handle null/undefined input
    if (!arrayToMap) {
      return {
        totalPages: 1,
        currentPage: 1,
        hasNext: false,
        hasPrevious: false,
        totalCount: 0
      };
    }

    // Type 1: Already properly structured (Orders component)
    if (arrayToMap.totalPages && arrayToMap.currentPage !== undefined &&
        typeof arrayToMap.hasNext === 'boolean' && typeof arrayToMap.hasPrevious === 'boolean') {
      return {
        totalPages: arrayToMap.totalPages,
        currentPage: arrayToMap.currentPage,
        hasNext: arrayToMap.hasNext,
        hasPrevious: arrayToMap.hasPrevious,
        totalCount: arrayToMap.totalCount || 0
      };
    }

    // Type 2: Object with data array and totalCount (Payments, some components)
    if (arrayToMap.data && Array.isArray(arrayToMap.data) && arrayToMap.totalCount !== undefined) {
      const totalCount = arrayToMap.totalCount || arrayToMap.data.length;
      const totalPages = Math.max(1, Math.ceil(totalCount / rowsPerPage));
      const currentPage = Math.max(1, Math.min(page, totalPages));

      return {
        totalPages,
        currentPage,
        hasNext: currentPage < totalPages,
        hasPrevious: currentPage > 1,
        totalCount
      };
    }

    // Type 3: Menu category object with items array and totalCount
    if (arrayToMap.items && Array.isArray(arrayToMap.items) && arrayToMap.totalCount !== undefined) {
      const totalCount = arrayToMap.totalCount || arrayToMap.items.length;
      const totalPages = Math.max(1, Math.ceil(totalCount / rowsPerPage));
      const currentPage = Math.max(1, Math.min(page, totalPages));

      return {
        totalPages,
        currentPage,
        hasNext: currentPage < totalPages,
        hasPrevious: currentPage > 1,
        totalCount
      };
    }

    // Type 4: Simple array (QR codes, some other components)
    if (Array.isArray(arrayToMap)) {
      const totalCount = arrayToMap.length;
      const totalPages = Math.max(1, Math.ceil(totalCount / rowsPerPage));
      const currentPage = Math.max(1, Math.min(page, totalPages));

      return {
        totalPages,
        currentPage,
        hasNext: currentPage < totalPages,
        hasPrevious: currentPage > 1,
        totalCount
      };
    }

    // Type 5: Object with just totalCount (some edge cases)
    if (arrayToMap.totalCount !== undefined) {
      const totalCount = arrayToMap.totalCount;
      const totalPages = Math.max(1, Math.ceil(totalCount / rowsPerPage));
      const currentPage = Math.max(1, Math.min(page, totalPages));

      return {
        totalPages,
        currentPage,
        hasNext: currentPage < totalPages,
        hasPrevious: currentPage > 1,
        totalCount
      };
    }

    // Fallback: treat as empty
    return {
      totalPages: 1,
      currentPage: 1,
      hasNext: false,
      hasPrevious: false,
      totalCount: 0
    };
  }, [arrayToMap, page, rowsPerPage]);

  // Keep existing variable for backward compatibility
  const refinedArrayToMap = paginationInfo.totalPages;

  const [filterValue, setFilterValue] = React.useState('');
  const [statusFilter] = React.useState('all');
  const [selectedKeys, setSelectedKeys] = React.useState(new Set([]));
  const [visibleColumns, setVisibleColumns] = React.useState(
    new Set(visibleColumn)
  );
  const [sortDescriptor, setSortDescriptor] = React.useState({
    column: 'dateUpdated',
    direction: 'descending',
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
    if (page < paginationInfo.totalPages) {
      setPage(page + 1);
    }
  }, [page, paginationInfo.totalPages, setPage]);

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

  // Extract current page data based on data structure
  const getCurrentPageData = useCallback(() => {
    if (!arrayToMap) return [];

    // Type 1: Already has data array
    if (Array.isArray(arrayToMap.data)) return arrayToMap.data;

    // Type 2: Has items array (menu)
    if (Array.isArray(arrayToMap.items)) return arrayToMap.items;

    // Type 3: Is itself an array
    if (Array.isArray(arrayToMap)) return arrayToMap;

    return [];
  }, [arrayToMap]);

  // Handle data accumulation for mobile infinite scroll
  useEffect(() => {
    if (!isMobile) return;

    const currentData = getCurrentPageData();

    if (page === 1) {
      // Reset accumulated data on first page
      setAccumulatedData(currentData);
      setIsLoadingMore(false);
    } else if (currentData.length > 0) {
      // Append new data to accumulated data
      setAccumulatedData(prev => {
        // Avoid duplicates by checking IDs
        const existingIds = new Set(prev.map((item: any) => item.id || item.itemID));
        const newItems = currentData.filter((item: any) => !existingIds.has(item.id || item.itemID));
        return [...prev, ...newItems];
      });
      setIsLoadingMore(false);
    }
  }, [isMobile, page, getCurrentPageData]);

  // IntersectionObserver for mobile infinite scroll
  useEffect(() => {
    if (!isMobile || !sentinelRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && paginationInfo.hasNext && !isLoadingMore) {
          setIsLoadingMore(true);
          setPage(page + 1);
        }
      },
      {
        root: null,
        rootMargin: '100px', // Start loading 100px before reaching bottom
        threshold: 0.1
      }
    );

    observer.observe(sentinelRef.current);

    return () => {
      observer.disconnect();
    };
  }, [isMobile, paginationInfo.hasNext, isLoadingMore, page, setPage]);

  // Reset accumulated data when filters change on mobile
  useEffect(() => {
    if (isMobile && page === 1) {
      setAccumulatedData([]);
    }
  }, [isMobile, filterValue]);

  // Memoize the bottomContent - different for mobile vs desktop
  const bottomContent = useMemo(
    () => {
      // Mobile: Show infinite scroll indicator
      if (isMobile) {
        return (
          <div className='py-4 flex flex-col items-center justify-center gap-2'>
            {/* Sentinel element for IntersectionObserver */}
            <div ref={sentinelRef} className='h-1 w-full' />

            {/* Loading indicator */}
            {isLoadingMore && paginationInfo.hasNext && (
              <div className='flex items-center gap-2 text-sm text-gray-500'>
                <Spinner size='sm' />
                <span>Loading more...</span>
              </div>
            )}

            {/* End of list indicator */}
            {!paginationInfo.hasNext && accumulatedData.length > 0 && (
              <div className='text-sm text-gray-500'>No more items</div>
            )}
          </div>
        );
      }

      // Desktop: Show traditional pagination
      return (
        <div className='py-2 px-2 flex justify-between items-center'>
          <div className='text-[14px] text-grey600'>
            Page {paginationInfo.currentPage} of {paginationInfo.totalPages}
          </div>
          <Pagination
            disableCursorAnimation
            page={paginationInfo.currentPage}
            total={paginationInfo.totalPages}
            onChange={setPage}
            className='gap-2'
            radius='full'
            renderItem={renderItem}
            variant='light'
          />
          <div className='hidden md:flex w-[30%] justify-end gap-2'>
            <Button
              isDisabled={
                paginationInfo.totalPages === 1 || !paginationInfo.hasPrevious
              }
              size='sm'
              variant='flat'
              onPress={onPreviousPage}
            >
              Previous
            </Button>
            <Button
              isDisabled={
                paginationInfo.totalPages === 1 || !paginationInfo.hasNext
              }
              size='sm'
              variant='flat'
              onPress={onNextPage}
            >
              Next
            </Button>
          </div>
        </div>
      );
    },
    [
      isMobile,
      isLoadingMore,
      paginationInfo.currentPage,
      paginationInfo.totalPages,
      paginationInfo.hasPrevious,
      paginationInfo.hasNext,
      accumulatedData.length,
      page,
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

  // Get the data to display based on mobile/desktop mode
  const displayData = useMemo(() => {
    if (isMobile && accumulatedData.length > 0) {
      return accumulatedData;
    }
    return getCurrentPageData();
  }, [isMobile, accumulatedData, getCurrentPageData]);

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
    displayData, // NEW: Accumulated data on mobile, current page on desktop
    isMobile, // NEW: Mobile detection flag
    isLoadingMore, // NEW: Loading more indicator for mobile
  };
}

export default usePagination;
