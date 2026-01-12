'use client';
import React from 'react';
import { Button } from '@nextui-org/react';
import { IoIosArrowBack, IoIosArrowForward } from 'react-icons/io';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
  totalCount: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onNext: () => void;
  onPrevious: () => void;
  isLoading?: boolean;
}

const CustomPagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  hasNext,
  hasPrevious,
  totalCount,
  pageSize,
  onPageChange,
  onNext,
  onPrevious,
  isLoading = false
}) => {
  // Generate page numbers to show (max 6 pages)
  const generatePageNumbers = () => {
    const maxVisible = 6;
    const pages: (number | string)[] = [];

    if (totalPages <= maxVisible) {
      // Show all pages if total is less than max
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Smart pagination with ellipsis
      if (currentPage <= 3) {
        // Show first 4 pages, then ellipsis, then last page
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        if (totalPages > 5) pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        // Show first page, ellipsis, then last 4 pages
        pages.push(1);
        if (totalPages > 5) pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        // Show first, ellipsis, current-1, current, current+1, ellipsis, last
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const pageNumbers = generatePageNumbers();

  // Calculate item range
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalCount);

  if (totalPages <= 1) {
    return null; // Don't show pagination if only one page
  }

  return (
    <div className="flex items-center justify-between w-full py-4 px-2">
      {/* Left side - Items info */}
      <div className="text-sm text-gray-600">
        {totalCount > 0 ? (
          <>
            Showing {startItem}-{endItem} of {totalCount} items
          </>
        ) : (
          'No items'
        )}
      </div>

      {/* Center - Page numbers */}
      <div className="flex items-center gap-1">
        {pageNumbers.map((page, index) => {
          if (page === '...') {
            return (
              <span key={`ellipsis-${index}`} className="px-2 py-1 text-gray-400">
                ...
              </span>
            );
          }

          const pageNum = page as number;
          const isActive = pageNum === currentPage;

          return (
            <button
              key={pageNum}
              onClick={() => onPageChange(pageNum)}
              disabled={isLoading}
              className={`
                min-w-[32px] h-8 px-2 rounded-md text-sm font-medium transition-colors
                ${isActive
                  ? 'bg-purple-100 text-purple-700 border border-purple-200'
                  : 'text-gray-700 hover:bg-gray-100 border border-transparent'
                }
                ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              `}
            >
              {pageNum}
            </button>
          );
        })}
      </div>

      {/* Right side - Navigation buttons */}
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant="flat"
          isDisabled={!hasPrevious || isLoading}
          onPress={onPrevious}
          startContent={<IoIosArrowBack />}
        >
          Previous
        </Button>
        <Button
          size="sm"
          variant="flat"
          isDisabled={!hasNext || isLoading}
          onPress={onNext}
          endContent={<IoIosArrowForward />}
        >
          Next
        </Button>
      </div>
    </div>
  );
};

export default CustomPagination;