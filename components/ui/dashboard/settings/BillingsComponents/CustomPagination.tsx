import React from "react";
import { Pagination, PaginationItemType, cn, Button } from "@nextui-org/react";
import { IoIosArrowForward } from "react-icons/io";

const CustomPagination = ({
  currentPage,
  totalPages,
  onPageChange,
  onNext,
  onPrevious,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onNext: () => void;
  onPrevious: () => void;
}) => {
  const renderItem = ({
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
          title="next"
          className={cn(className, "bg-default-200/50 min-w-8 w-8 h-8")}
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
          title="previous"
          className={cn(className, "bg-default-200/50 min-w-8 w-8 h-8")}
          onClick={onPrevious}
        >
          <IoIosArrowForward className="rotate-180" />
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
        className={cn(
          className,
          isActive && "rounded-md text-primaryColor bg-[#EAE5FF]"
        )}
        onClick={() => setPage(value)}
      >
        {value}
      </button>
    );
  };

  return (
    <div className="hidden md:flex flex-col sm:flex-row gap-4 sm:gap-0 justify-between items-center p-4">
      <div className="hidden md:block text-[14px] text-grey600 mb-2 md:mb-0">
        Page {currentPage} of {totalPages || 1}
      </div>

      <Pagination
        page={currentPage}
        total={totalPages}
        onChange={onPageChange}
        renderItem={renderItem}
        className="gap-2 text-sm"
        variant="light"
      />
      <div className="flex flex-row gap-4">
        <Button
          // className="bg-default-200/50 px-4 py-2 rounded"
          onPress={onPrevious}
          size="sm"
          variant="flat"
          // disabled={currentPage === 1}
          isDisabled={currentPage === 1}
        >
          Previous
        </Button>

        <Button
          isDisabled={currentPage === totalPages}
          size="sm"
          variant="flat"
          // className="bg-default-200/50 px-4 py-2 rounded"
          onPress={onNext}
          // disabled={currentPage === totalPages}
        >
          Next
        </Button>
      </div>
    </div>
    
  );
};

export default CustomPagination;
