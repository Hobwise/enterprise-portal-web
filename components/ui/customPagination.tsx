'use client';
import { cn } from '@/lib/utils';
import { ArrowLeft, ArrowRight3 } from '@/public/assets/svg';
import { Pagination, PaginationItemType, PaginationItemRenderProps } from '@nextui-org/react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

interface ICustomPagination {
  totalPage: number;
  initialPage: number;
}

export default function CustomPagination({ totalPage = 10, initialPage = 1 }: ICustomPagination) {
  const pathname = usePathname();
  const { replace, push } = useRouter();
  const searchParams = useSearchParams();

  const handleChangeParams = (term: string, key: string) => {
    const params = new URLSearchParams(searchParams);

    if (term) {
      params.set(key, term);
    } else {
      params.delete(key);
    }
    replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const renderItem = ({ ref, key, value, isActive, onNext, onPrevious, setPage, className }: PaginationItemRenderProps) => {
    if (value === PaginationItemType.NEXT) {
      return (
        <button
          key={key}
          className={cn(className, 'flex items-center w-28')}
          onClick={() => {
            onNext();
            handleChangeParams(String(initialPage + 1), 'page');
          }}
        >
          <p className="text-sm text-[#3D424A] font-medium">Next</p>
          <ArrowRight3 />
        </button>
      );
    }

    if (value === PaginationItemType.PREV) {
      return (
        <button
          key={key}
          className={cn(className, 'flex items-center w-28')}
          onClick={() => {
            onPrevious();
            initialPage > 1 && handleChangeParams(String(initialPage - 1), 'page');
          }}
        >
          <ArrowLeft />
          <p className="text-sm text-[#3D424A] font-medium">Previous</p>
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

    // cursor is the default item
    return (
      <button
        ref={ref}
        key={key}
        className={cn(className, 'text-[#98A2B3] font-light', isActive && 'text-[#6D42E2] bg-[#EAE5FF]')}
        onClick={() => {
          handleChangeParams(String(value), 'page');
          setPage(value);
        }}
      >
        {value}
      </button>
    );
  };

  return (
    <Pagination
      disableCursorAnimation
      showControls
      total={totalPage}
      initialPage={initialPage}
      className="gap-2"
      radius="md"
      renderItem={renderItem}
      variant="light"
    />
  );
}
