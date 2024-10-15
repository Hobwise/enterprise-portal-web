import { Button, Pagination, PaginationItemType, cn } from '@nextui-org/react';
import { useCallback } from 'react';
import { IoIosArrowForward } from 'react-icons/io';

export const PaginationComponent = ({ data, page, setPage, pages }: any) => {
  const refinedArrayToMap = data ? pages : 1;

  const onNextPage = useCallback(() => {
    if (page < refinedArrayToMap) {
      setPage(page + 1);
    }
  }, [page, refinedArrayToMap]);

  const onPreviousPage = useCallback(() => {
    if (page > 1) {
      setPage(page - 1);
    }
  }, [page]);
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
  };
  return (
    <div className='py-2 px-2 flex justify-between items-center'>
      <div className='text-[14px] text-grey600'>
        Page {page} of {pages}
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
          isDisabled={refinedArrayToMap === 1}
          size='sm'
          variant='flat'
          onPress={onPreviousPage}
        >
          Previous
        </Button>
        <Button
          isDisabled={refinedArrayToMap === 1}
          size='sm'
          variant='flat'
          onPress={onNextPage}
        >
          Next
        </Button>
      </div>
    </div>
  );
};
