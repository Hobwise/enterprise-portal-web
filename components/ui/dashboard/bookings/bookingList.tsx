"use client";

import React, { useEffect, useState } from "react";

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
  "reservationName",
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
}

interface BookingCategory {
  name: string;
  totalCount: number;
  bookings: BookingItem[];
}

interface BookingsListProps {
  bookings: BookingItem[] | { bookings?: BookingItem[]; data?: BookingItem[] } | any;
  categories: { bookingCategories: BookingCategory[] } | any;
  searchQuery: string;
  refetch: () => void;
  isLoading?: boolean;
  isPending?: boolean;
}

// Status mapping for booking categories
const getStatusForBookingCategory = (categoryName: string): number | null => {
  switch (categoryName.toLowerCase()) {
    case 'pending bookings':
      return 0;
    case 'confirmed bookings':
    case 'incoming bookings':
      return 1;
    case 'processed bookings':
      return null;
    case "today's bookings":
      return null; 
    case 'unsuccessful bookings':
      return 5; 
    default:
      return null; // null means show all bookings
  }
};

// Function to get filtered bookings based on category and pending state
const getFilteredBookingDetails = (
  bookings: any, 
  isLoading: boolean, 
  isPending: boolean, 
  selectedCategory: string,
  searchQuery: string = ''
): BookingItem[] => {
  // Check if data is in pending state
  if (isLoading || isPending || !bookings) {
    console.log('Loading state:', isLoading, isPending, bookings);
    return [];
  }
  
  // Extract bookings data
  let allBookings: BookingItem[] = [];
  if (bookings.bookings && Array.isArray(bookings.bookings)) {
    allBookings = bookings.bookings;
  } else if (bookings.data && Array.isArray(bookings.data)) {
    allBookings = bookings.data;
  } else if (Array.isArray(bookings)) {
    allBookings = bookings;
  }
  
  // Get the status filter for the selected category
  const statusFilter = getStatusForBookingCategory(selectedCategory);
  
  // Filter by status if not "All Bookings"
  let filteredByStatus = allBookings;
  if (statusFilter !== null) {
    filteredByStatus = allBookings.filter((booking: BookingItem) => booking.bookingStatus === statusFilter);
  }
  
  // Apply search filter if provided
  if (searchQuery.trim()) {
    filteredByStatus = filteredByStatus.filter((booking: BookingItem) =>
      booking.reservationName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.reference?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.emailAddress?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.phoneNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.bookingDateTime?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }
  
  return filteredByStatus;
};

const BookingsList: React.FC<BookingsListProps> = ({ 
  bookings, 
  categories, 
  searchQuery, 
  refetch, 
  isLoading = false,
  isPending = false 
}) => {
  const { userRolePermissions, role } = usePermission();
  const [isOpenDelete, setIsOpenDelete] = React.useState<Boolean>(false);
  const [isEditBookingModal, setIsEditBookingModal] = React.useState<Boolean>(false);
  const [id, setId] = React.useState<Number>();
  const [eachBooking, setEachBooking] = React.useState<any>(null);
  const [loadedCategories, setLoadedCategories] = useState<Set<string>>(new Set());
  const [isFirstTimeLoading, setIsFirstTimeLoading] = useState<boolean>(false);

  const toggleDeleteModal = (id?: number) => {
    setId(id);
    setIsOpenDelete(!isOpenDelete);
  };
  
  const toggleEditBookingModal = (booking: any) => {
    setEachBooking(booking);
    setIsEditBookingModal(!isEditBookingModal);
  };

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
  } = useGlobalContext();

  const handleTabClick = (categoryName: string) => {
    // Check if this category has been loaded before
    const isFirstTime = !loadedCategories.has(categoryName);
    
    
    // Only show loading state for first-time loads
    if (isFirstTime) {
      setIsFirstTimeLoading(true);
      setLoadedCategories(prev => new Set([...prev, categoryName]));
      
      setTimeout(() => {
        if(bookings) setIsFirstTimeLoading(false);
       
      }, 4000);
    }
    
    setTableStatus(categoryName);
    setPage(1);
  };

  // Use the new filtered function that includes status filtering
  const bookingDetails = getFilteredBookingDetails(
    bookings, 
    isLoading, 
    isPending || false, 
    tableStatus || 'All Bookings', // Default to "All Bookings" if tableStatus is not set
    searchQuery
  );
  
  const matchingObject = { 
    data: bookingDetails, 
    totalCount: bookingDetails.length 
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
  } = usePagination(matchingObject, columns, INITIAL_VISIBLE_COLUMNS);

  // Sort the bookings based on sortDescriptor
  const sortedBookings = React.useMemo(() => {
    if (!bookingDetails || bookingDetails.length === 0) return bookingDetails;
    
    return [...bookingDetails].sort((a: BookingItem, b: BookingItem) => {
      const first = a[sortDescriptor.column as keyof BookingItem];
      const second = b[sortDescriptor.column as keyof BookingItem];
      
      let cmp = 0;
      if (first === null || first === undefined) cmp = 1;
      else if (second === null || second === undefined) cmp = -1;
      else if (first < second) cmp = -1;
      else if (first > second) cmp = 1;
      
      return sortDescriptor.direction === "descending" ? -cmp : cmp;
    });
  }, [bookingDetails, sortDescriptor]);

  const [value, setValue] = useState("");

  const handleTabChange = (index: string) => {
    setValue(index);
  };

  const updateBookingStatus = async (status: number, id: number) => {
    const data = await postBookingStatus(String(id), status);
    if (data?.data?.isSuccessful) {
      notify({
        title: "Success!",
        text: "Operation successful",
        type: "success",
      });
      refetch();
      status === 3 && toggleDeleteModal();
    } else if (data?.data?.error) {
      notify({
        title: "Error!",
        text: data?.data?.error,
        type: "error",
      });
    }
  };

  const renderCell = React.useCallback((booking: BookingItem, columnKey: string) => {
    const cellValue = booking[columnKey as keyof BookingItem];

    switch (columnKey) {
      case "firstName":
        return (
          <div className="text-sm">
            <p className="font-medium text-black">
              {booking?.firstName} {booking?.lastName}
            </p>
            <p className="text-[13px] text-textGrey">{booking?.phoneNumber}</p>
          </div>
        );

      case "bookingDateTime":
        return (
          <div className="text-textGrey text-sm">
            {moment(booking?.bookingDateTime).format("MMMM Do YYYY, h:mm:ss a")}
          </div>
        );
      case "reference":
        return <div className="text-textGrey text-sm">{booking.reference}</div>;
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
        return (
          <div className="relative flexjustify-center items-center gap-2">
            <Dropdown aria-label="drop down" className="">
              <DropdownTrigger aria-label="actions">
                <div className="cursor-pointer flex justify-center items-center text-black">
                  <HiOutlineDotsVertical className="text-[22px] " />
                </div>
              </DropdownTrigger>
              <DropdownMenu className="text-black">
                <DropdownSection>
                  {(role === 0 || userRolePermissions?.canEditOrder === true) &&
                    booking?.bookingStatus === 1 ? (
                      <DropdownItem
                        aria-label="admit"
                        onClick={() =>
                          updateBookingStatus(
                            submitBookingStatus(booking?.bookingStatus),
                            booking?.id!
                          )
                        }
                      >
                        <div
                          className={` flex gap-2  items-center text-grey500`}
                        >
                          <IoCheckmark className="text-[20px]" />
                          <p>Admit</p>
                        </div>
                      </DropdownItem>
                    ) : null}
                  {(role === 0 || userRolePermissions?.canEditOrder === true) &&
                    booking?.bookingStatus === 0 ? (
                      <DropdownItem
                        aria-label="confirm booking"
                        onClick={() =>
                          updateBookingStatus(
                            submitBookingStatus(booking?.bookingStatus),
                            booking?.id!
                          )
                        }
                      >
                        <div
                          className={` flex gap-2  items-center text-grey500`}
                        >
                          <IoCheckmark className="text-[20px]" />

                          <p>Confirm booking</p>
                        </div>
                      </DropdownItem>
                    ) : null}
                  {(role === 0 || userRolePermissions?.canEditOrder === true) &&
                    booking?.bookingStatus !== 6 &&
                    booking?.bookingStatus !== 4 &&
                    booking?.bookingStatus !== 5 ? (
                      <DropdownItem
                        aria-label="edit booking"
                        onClick={() => toggleEditBookingModal(booking)}
                      >
                        <div
                          className={` flex gap-2  items-center text-grey500`}
                        >
                          <MdOutlineModeEditOutline className="text-[20px]" />

                          <p>Edit booking</p>
                        </div>
                      </DropdownItem>
                    ) : null}
                  {(role === 0 || userRolePermissions?.canEditOrder === true) &&
                    (booking?.bookingStatus === 0 ||
                      booking?.bookingStatus === 1) ? (
                      <DropdownItem
                        aria-label="cancel"
                        onClick={() => {
                          toggleDeleteModal(booking?.id);
                        }}
                      >
                        <div
                          className={` flex gap-2  items-center text-danger-500`}
                        >
                          <LiaTimesSolid className="text-[20px]" />

                          <p>Cancel booking</p>
                        </div>
                      </DropdownItem>
                    ) : null}

                  {(role === 0 || userRolePermissions?.canEditOrder === true) &&
                    booking?.bookingStatus === 2 ? (
                      <DropdownItem
                        aria-label="close booking"
                        onClick={() =>
                          updateBookingStatus(
                            submitBookingStatus(booking?.bookingStatus),
                            booking?.id!
                          )
                        }
                      >
                        <div
                          className={` flex gap-2  items-center text-grey500`}
                        >
                          <CiCalendar className="text-[20px]" />

                          <p>Close booking</p>
                        </div>
                      </DropdownItem>
                    ) : null}
                </DropdownSection>
              </DropdownMenu>
            </Dropdown>
          </div>
        );
      default:
        return cellValue ? String(cellValue) : '';
    }
  }, [role, userRolePermissions]);

  const topContent = React.useMemo(() => {
    return (
      <Filters
        bookings={categories?.bookingCategories || []}
        handleTabChange={handleTabChange}
        value={value}
        handleTabClick={handleTabClick}
        onViewBookings={() => {
          // Placeholder for view all bookings functionality
        }}
      />
    );
  }, [
    categories,
    filterValue,
    statusFilter,
    visibleColumns,
    onSearchChange,
    onRowsPerPageChange,
    hasSearchFilter,
    handleTabChange,
    value,
    handleTabClick,
  ]);

  // Determine if we should show loading spinner
  const shouldShowLoading = isFirstTimeLoading || isPending || (isLoading && !loadedCategories.has(tableStatus));

  return (
    <section className="border border-primaryGrey rounded-lg">
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
          items={shouldShowLoading ? [] : sortedBookings}
          isLoading={shouldShowLoading}
          loadingContent={<SpinnerLoader size="md" />}
        >
          {(booking: BookingItem) => (
            <TableRow key={String(booking?.reference || booking?.id)}>
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
      />
    </section>
  );
};

export default BookingsList;