'use client';
import { Button, Pagination } from '@nextui-org/react';
import React from 'react';

export const CheckIcon = ({ size, height, width, ...props }: any) => {
  return (
    <svg
      width={size || width || 24}
      height={size || height || 24}
      viewBox='0 0 24 24'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
      {...props}
    >
      <path
        d='M12 2C6.49 2 2 6.49 2 12C2 17.51 6.49 22 12 22C17.51 22 22 17.51 22 12C22 6.49 17.51 2 12 2ZM16.78 9.7L11.11 15.37C10.97 15.51 10.78 15.59 10.58 15.59C10.38 15.59 10.19 15.51 10.05 15.37L7.22 12.54C6.93 12.25 6.93 11.77 7.22 11.48C7.51 11.19 7.99 11.19 8.28 11.48L10.58 13.78L15.72 8.64C16.01 8.35 16.49 8.35 16.78 8.64C17.07 8.93 17.07 9.4 16.78 9.7Z'
        fill='currentColor'
      />
    </svg>
  );
};

export const CustomPagination = ({
  selectedKeys,
  filteredItems,
  page,
  pages,
  setPage,
  renderItem,
  onPreviousPage,
  items,
  onNextPage,
  hasSearchFilter,
}: any) => {
  return React.useMemo(() => {
    return (
      <div className='py-2 px-2 flex justify-between items-center'>
        <span className='w-[30%] text-small text-black'>
          Page{' '}
          {selectedKeys === 'all'
            ? 'All items selected'
            : `${selectedKeys?.size} of ${filteredItems?.length} `}
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
  }, [selectedKeys, items?.length, page, pages, hasSearchFilter]);
};
