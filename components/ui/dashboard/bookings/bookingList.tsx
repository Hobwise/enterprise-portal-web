"use client";

import React, { useState } from "react";

import {
  columns,
  statusColorMap,
  statusDataMap,
} from "@/app/dashboard/reservation/[reservationId]/data";
import { useGlobalContext } from "@/hooks/globalProvider";
import usePagination from "@/hooks/usePagination";
import {
  Chip,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownSection,
  DropdownTrigger,
  Selection,
  SortDescriptor,
  Spinner,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@nextui-org/react";
import SpinnerLoader from "@/components/ui/dashboard/menu/SpinnerLoader";
import moment from "moment";
import { HiOutlineDotsVertical } from "react-icons/hi";

import { postBookingStatus } from "@/app/api/controllers/dashboard/bookings";
import usePermission from "@/hooks/cachedEndpoints/usePermission";
import { notify, submitBookingStatus } from "@/lib/utils";
import { CiCalendar } from "react-icons/ci";
import { IoCheckmark } from "react-icons/io5";
import { LiaTimesSolid } from "react-icons/lia";
import { MdOutlineModeEditOutline } from "react-icons/md";
import DeleteModal from "../../deleteModal";
import EditBooking from "./editBooking";
import Filters from "./filters";

const INITIAL_VISIBLE_COLUMNS = [
  "reservationName",
  "firstName",
  "lastName",
  "id",
  "emailAddress",
  "quantity",
  "phoneNumber",
  "reference",
  "bookingDateTime",
  "bookingStatus",
  "actions",
];

interface BookingItem {
  reservationName: string;
  firstName: string;
  lastName: string;
  emailAddress: string;
  phoneNumber: string;
  reference: string;
  checkInDateTime: string;
  checkOutDateTime: string;
  bookingDateTime: string;
  bookingStatus: number;
  statusComment: string;
  id?: number;
  dateCreated?: string;
}

interface BookingCategory {
  name: string;
  totalCount: number;
  bookings: BookingItem[];
}

interface BookingsListProps {
  bookings:
    | BookingItem[]
    | { bookings?: BookingItem[]; data?: BookingItem[] }
    | any;
  categories: { bookingCategories: BookingCategory[] } | any;
  searchQuery: string;
  refetch: () => void;
  isLoading?: boolean;
  isPending?: boolean;
  getCategoryDetails?: (categoryName: string) => any;
  isLoadingInitial?: boolean;
}



// Function to get filtered bookings based on category and pending state
const getFilteredBookingDetails = (
  bookings: any,
  categories: any,
  isLoading: boolean,
  isPending: boolean,
  selectedCategory: string,
  searchQuery: string = ""
): { bookings: BookingItem[]; paginationMeta: any } => {
  // Default pagination meta structure
  const defaultPaginationMeta = {
    totalPages: 1,
    currentPage: 1,
    hasNext: false,
    hasPrevious: false,
    totalCount: 0,
  };

  // Check if data is in pending state
  if (isLoading || isPending || !bookings) {
    return { bookings: [], paginationMeta: defaultPaginationMeta };
  }

  // Check if categories array is empty
  if (
    !categories?.bookingCategories ||
    categories?.bookingCategories?.length === 0
  ) {
    return { bookings: [], paginationMeta: defaultPaginationMeta };
  }

  // Check if the selected category has totalCount of 0
  const selectedCategoryData = categories?.bookingCategories?.find(
    (cat: BookingCategory) => cat.name === selectedCategory
  );
  if (selectedCategoryData && selectedCategoryData.totalCount === 0) {
    return { bookings: [], paginationMeta: defaultPaginationMeta };
  }

  // Extract bookings data and pagination metadata
  let allBookings: BookingItem[] = [];
  let paginationMeta = { ...defaultPaginationMeta };

  if (Array.isArray(bookings)) {
    // If bookings is directly an array
    allBookings = bookings;
  } else if (bookings?.data?.bookings && Array.isArray(bookings.data.bookings)) {
    // If bookings has nested structure with data.bookings
    allBookings = bookings.data.bookings;
    // Preserve API pagination metadata
    paginationMeta = {
      totalPages: bookings.data.totalPages || 1,
      currentPage: bookings.data.currentPage || 1,
      hasNext: bookings.data.hasNext || false,
      hasPrevious: bookings.data.hasPrevious || false,
      totalCount: bookings.data.totalCount || allBookings.length,
    };
  } else if (bookings?.bookings && Array.isArray(bookings.bookings)) {
    // Alternative structure with direct bookings property
    allBookings = bookings.bookings;
    // Check if pagination metadata exists at root level
    if (bookings.totalPages !== undefined) {
      paginationMeta = {
        totalPages: bookings.totalPages || 1,
        currentPage: bookings.currentPage || 1,
        hasNext: bookings.hasNext || false,
        hasPrevious: bookings.hasPrevious || false,
        totalCount: bookings.totalCount || allBookings.length,
      };
    }
  } else {
    // Fallback to empty array if no valid data found
    allBookings = [];
  }

  // Safety check - ensure allBookings is valid array before filtering
  if (!Array.isArray(allBookings)) {
    return { bookings: [], paginationMeta: defaultPaginationMeta };
  }

  let filteredByStatus = allBookings;

  // Apply search filter if provided
  if (searchQuery.trim() && Array.isArray(filteredByStatus)) {
    filteredByStatus = filteredByStatus.filter(
      (booking: BookingItem) =>
        booking.reservationName
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        booking.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        booking.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        booking.reference?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        booking.emailAddress
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        booking.phoneNumber
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        booking.bookingDateTime
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase())
    );
  }

  return { bookings: filteredByStatus, paginationMeta };
};

const BookingsList: React.FC<BookingsListProps> = ({
  bookings,
  categories,
  searchQuery,
  refetch,
  isLoading = false,
  isPending = false,
  getCategoryDetails,
  isLoadingInitial = false,
}) => {
  const { userRolePermissions, role } = usePermission();
  const [isOpenDelete, setIsOpenDelete] = React.useState<boolean>(false);
  const [isEditBookingModal, setIsEditBookingModal] =
    React.useState<boolean>(false);
  const [id, setId] = React.useState<number>();
  const [eachBooking, setEachBooking] = React.useState<any>(null);
  const [isCancelLoading, setIsCancelLoading] = React.useState<boolean>(false);

  const {
    page,
    rowsPerPage,
    tableStatus,
    setTableStatus,
    setPage,
    toggleModalDelete,
    isOpenDelete: globalIsOpenDelete,
    setIsOpenDelete: globalSetIsOpenDelete,
    isOpenEdit,
    toggleModalEdit,
    setBookingDetails,
    openBookingDetailsModal,
  } = useGlobalContext();

  const toggleDeleteModal = (id?: number) => {
    setId(id);
    setIsOpenDelete(!isOpenDelete);
  };

  const toggleEditBookingModal = (booking: any) => {
    setEachBooking(booking);
    setIsEditBookingModal(!isEditBookingModal);
  };



  const currentCategoryName =
    tableStatus || categories?.bookingCategories?.[0]?.name || "All Bookings";
  const currentCategoryData = getCategoryDetails
    ? getCategoryDetails(currentCategoryName)
    : null;

  // Use the new filtered function that includes status filtering
  const filteredData = getFilteredBookingDetails(
    currentCategoryData || bookings,
    categories,
    isLoading || isLoadingInitial,
    isPending || false,
    tableStatus || "All Bookings",
    searchQuery
  );

  const matchingObject = {
    data: filteredData.bookings,
    paginationMeta: filteredData.paginationMeta,
  };


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
    displayData,
    isMobile,
  } = usePagination(matchingObject, columns, INITIAL_VISIBLE_COLUMNS);

  // Sort the bookings based on sortDescriptor
  // Use displayData which contains accumulated data on mobile, current page on desktop
  const sortedBookings = React.useMemo(() => {
    if (!displayData || displayData.length === 0) {
      return displayData || [];
    }

    return [...displayData].sort((a: BookingItem, b: BookingItem) => {
      let first = a[sortDescriptor.column as keyof BookingItem];
      let second = b[sortDescriptor.column as keyof BookingItem];

      if (sortDescriptor.column === "bookingDateTime") {
        first = a["dateCreated"] as string;
        second = b["dateCreated"] as string;
      }
      
      let cmp = 0;
      if (first === null || first === undefined) cmp = 1;
      else if (second === null || second === undefined) cmp = -1;
      else if (first < second) cmp = -1;
      else if (first > second) cmp = 1;

      return sortDescriptor.direction === "ascending" ? -cmp : cmp;
    });
  }, [displayData, sortDescriptor]);

  const handleTabChange = React.useCallback((key: any) => {
    setTableStatus(key as string);
    setPage(1);
  }, [setTableStatus, setPage]);

  const updateBookingStatus = async (status: number, id: number) => {
    if (status === 3) setIsCancelLoading(true);
    const response: any = await postBookingStatus(String(id), status);
    if (response?.data?.isSuccessful) {
      notify({
        title: "Success!",
        text: "Operation successful",
        type: "success",
      });
      await refetch();
      if (status === 3) {
        setIsCancelLoading(false);
        toggleDeleteModal();
      }
    } else if (response?.data?.error) {
      setIsCancelLoading(false);
      notify({
        title: "Error!",
        text: response?.data?.error,
        type: "error",
      });
    }
  };

  const renderCell = React.useCallback(
    (booking: BookingItem, columnKey: string) => {
      const cellValue = booking[columnKey as keyof BookingItem];
      

      switch (columnKey) {
        case "firstName":
          return (
            <div className="text-sm">
              <p className="font-medium text-black">
                {booking?.firstName} {booking?.lastName}
              </p>
              <p className="text-[13px] text-textGrey">
                {booking?.phoneNumber}
              </p>
            </div>
          );

        case "bookingDateTime":
          return (
            <div className="text-textGrey text-sm">
              {moment(booking?.bookingDateTime).format(
                "MMMM Do YYYY, h:mm:ss a"
              )}
            </div>
          );
        case "reference":
          return (
            <div className="text-textGrey text-sm">{booking.reference}</div>
          );
        case "bookingStatus":
          return (
            <Chip
              className="capitalize"
              color={statusColorMap[booking?.bookingStatus]}
              size="sm"
              variant="bordered"
            >
              {statusDataMap[booking?.bookingStatus]}
            </Chip>
          );
        case "actions":
          const dropdownItems = [];

          if (
            (role === 0 || userRolePermissions?.canEditOrder === true) &&
            booking?.bookingStatus === 1
          ) {
            dropdownItems.push(
              <DropdownItem
                key="admit"
                aria-label="admit"
                onClick={() =>
                  updateBookingStatus(
                    submitBookingStatus(booking?.bookingStatus),
                    booking?.id!
                  )
                }
              >
                <div className="flex gap-2 items-center text-grey500">
                  <IoCheckmark className="text-[20px]" />
                  <p>Admit</p>
                </div>
              </DropdownItem>
            );
          }

          if (
            (role === 0 || userRolePermissions?.canEditOrder === true) &&
            booking?.bookingStatus === 0
          ) {
            dropdownItems.push(
              <DropdownItem
                key="confirm"
                aria-label="confirm booking"
                onClick={() =>
                  updateBookingStatus(
                    submitBookingStatus(booking?.bookingStatus),
                    booking?.id!
                  )
                }
              >
                <div className="flex gap-2 items-center text-grey500">
                  <IoCheckmark className="text-[20px]" />
                  <p>Confirm booking</p>
                </div>
              </DropdownItem>
            );
          }

          if (
            (role === 0 || userRolePermissions?.canEditOrder === true) &&
            booking?.bookingStatus !== 6 &&
            booking?.bookingStatus !== 4 &&
            booking?.bookingStatus !== 5
          ) {
            dropdownItems.push(
              <DropdownItem
                key="edit"
                aria-label="edit booking"
                onClick={() => toggleEditBookingModal(booking)}
              >
                <div className="flex gap-2 items-center text-grey500">
                  <MdOutlineModeEditOutline className="text-[20px]" />
                  <p>Edit booking</p>
                </div>
              </DropdownItem>
            );
          }

          if (
            (role === 0 || userRolePermissions?.canEditOrder === true) &&
            (booking?.bookingStatus === 0 || booking?.bookingStatus === 1)
          ) {
            dropdownItems.push(
              <DropdownItem
                key="cancel"
                aria-label="cancel"
                onClick={() => {
                  toggleDeleteModal(booking?.id);
                }}
              >
                <div className="flex gap-2 items-center text-danger-500">
                  <LiaTimesSolid className="text-[20px]" />
                  <p>Cancel booking</p>
                </div>
              </DropdownItem>
            );
          }

          if (
            (role === 0 || userRolePermissions?.canEditOrder === true) &&
            booking?.bookingStatus === 2
          ) {
            dropdownItems.push(
              <DropdownItem
                key="close"
                aria-label="close booking"
                onClick={() =>
                  updateBookingStatus(
                    submitBookingStatus(booking?.bookingStatus),
                    booking?.id!
                  )
                }
              >
                <div className="flex gap-2 items-center text-grey500">
                  <CiCalendar className="text-[20px]" />
                  <p>Close booking</p>
                </div>
              </DropdownItem>
            );
          }

          return (
            <div className="relative flex justify-center items-center gap-2">
              <Dropdown aria-label="drop down" className="">
                <DropdownTrigger aria-label="actions">
                  <div className="cursor-pointer flex justify-center items-center text-black">
                    <HiOutlineDotsVertical className="text-[22px]" />
                  </div>
                </DropdownTrigger>
                <DropdownMenu className="text-black">
                  <DropdownSection>{dropdownItems}</DropdownSection>
                </DropdownMenu>
              </Dropdown>
            </div>
          );
        default:
          return cellValue ? String(cellValue) : "";
      }
    },
    [role, userRolePermissions]
  );

  

  const topContent = React.useMemo(() => {
    return (
      <Filters
        bookings={categories?.bookingCategories || []}
        handleTabChange={handleTabChange}
        value={currentCategoryName}
      />
    );
  }, [
    categories?.bookingCategories,
    handleTabChange,
    currentCategoryName,
  ]);

  // Determine if data is loading (initial load, tab switch, or pagination)
  const isDataLoading = isLoading || isLoadingInitial || isPending;

  return (
    <section className="border border-primaryGrey rounded-lg overflow-hidden">
      <Table
        radius="lg"
        isCompact
        removeWrapper
        aria-label="list of bookings"
        bottomContent={bottomContent}
        topContent={topContent}
        bottomContentPlacement="outside"
        classNames={classNames}
        selectedKeys={selectedKeys}
        // selectionMode='multiple'
        sortDescriptor={sortDescriptor as SortDescriptor}
        topContentPlacement="outside"
        onSelectionChange={setSelectedKeys as (keys: Selection) => void}
        onSortChange={setSortDescriptor as (descriptor: SortDescriptor) => void}
      >
        <TableHeader columns={headerColumns}>
          {(column) => (
            <TableColumn
              key={column.uid}
              align={column.uid === "actions" ? "center" : "start"}
              allowsSorting={column.sortable}
            >
              {column.name}
            </TableColumn>
          )}
        </TableHeader>
        <TableBody
          emptyContent={"No booking(s) found"}
          items={isDataLoading ? [] : sortedBookings}
          isLoading={isDataLoading}
          loadingContent={
            <div className="flex justify-center items-center w-full h-full py-10">
              <SpinnerLoader size="md" />
            </div>
          }
        >
          {(booking: BookingItem) => (
            <TableRow
              key={String(booking?.reference || booking?.id)}
              className="cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => {
                setBookingDetails(booking);
                openBookingDetailsModal();
              }}
            >
              {(columnKey) => (
                <TableCell>{renderCell(booking, String(columnKey))}</TableCell>
              )}
            </TableRow>
          )}
        </TableBody>
      </Table>

      <EditBooking
        eachBooking={eachBooking}
        isEditBookingModal={isEditBookingModal}
        toggleEditBookingModal={toggleEditBookingModal}
        refetch={refetch}
      />

      <DeleteModal
        isOpen={isOpenDelete}
        text="Are you sure you want to cancel this booking?"
        handleDelete={() => updateBookingStatus(3, id as number)}
        setIsOpen={setIsOpenDelete}
        toggleModal={toggleDeleteModal}
        isLoading={isCancelLoading}
        title="Cancel Booking"
        actionLabel="Yes, Cancel"
        loadingLabel="Cancelling..."
      />
    </section>
  );
};

export default BookingsList;
