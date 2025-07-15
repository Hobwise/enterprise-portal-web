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
}

const BookingsList: React.FC<BookingsListProps> = ({ bookings, categories, searchQuery, refetch, isLoading = false }) => {
  const { userRolePermissions, role } = usePermission();
  const [isOpenDelete, setIsOpenDelete] = React.useState<Boolean>(false);
  const [isEditBookingModal, setIsEditBookingModal] =
    React.useState<Boolean>(false);
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

  const { page, rowsPerPage, tableStatus, setTableStatus, setPage } =
    useGlobalContext();

  const handleTabClick = (categoryName: string) => {
    // Immediately show loading state for any tab switch
    setIsFirstTimeLoading(true);
    
    setTableStatus(categoryName);
    setPage(1);
    
    // Check if this category has been loaded before
    const isFirstTime = !loadedCategories.has(categoryName);
    
    // Mark category as loaded and stop loading when data refetch completes
    // The loading state will be managed by the data fetching process
    if (isFirstTime) {
      setLoadedCategories(prev => new Set([...prev, categoryName]));
    }

    if (bookings?.data?.bookings) {
      setIsFirstTimeLoading(false);
    }
  
    setTimeout(() => {
      setIsFirstTimeLoading(false);
      console.log(bookings);
      
    }, 600);
  };

  const getBookingData = () => {
    if (!bookings) return [];
    if (bookings.bookings && Array.isArray(bookings.bookings)) {
      return bookings.bookings;
    }
    if (bookings.data && Array.isArray(bookings.data)) {
      return bookings.data;
    }
    return [];
  };

  const filteredBookings = getBookingData().filter(booking =>
    booking.reservationName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    booking.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    booking.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    booking.reference?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    booking.emailAddress?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    booking.phoneNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    booking.bookingDateTime?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const matchingObject = { data: filteredBookings, totalCount: filteredBookings.length };

  

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

  const [value, setValue] = useState("");

  const handleTabChange = (index) => {
    setValue(index);
  };

  const updateBookingStatus = async (status, id) => {
    const data = await postBookingStatus(id, status);
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

  

  const renderCell = React.useCallback((booking, columnKey) => {
    const cellValue = booking[columnKey];

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
                            booking?.id
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
                            booking?.id
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
                        // onClick={() => updateBookingStatus(3, booking?.id)}
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
                            booking?.id
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
        return cellValue;
    }
  }, []);

  const topContent = React.useMemo(() => {
    return (
      <Filters
        bookings={categories?.bookingCategories || []}
        handleTabChange={handleTabChange}
        value={value}
        handleTabClick={handleTabClick}
        onViewBookings={() => {
          // Placeholder for view all bookings functionality
          // This can be implemented based on your specific requirements
          console.log('View all bookings clicked');
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
  const shouldShowLoading = isFirstTimeLoading || (isLoading && !loadedCategories.has(tableStatus));

  return (
    <section className="border border-primaryGrey rounded-lg">
      <Table
        radius="lg"
        isCompact
        removeWrapper
        allowsSorting
        aria-label="list of bookings"
        bottomContent={bottomContent}
        topContent={topContent}
        bottomContentPlacement="outside"
        classNames={classNames}
        selectedKeys={selectedKeys}
        // selectionMode='multiple'
        sortDescriptor={sortDescriptor}
        topContentPlacement="outside"
        onSelectionChange={setSelectedKeys}
        onSortChange={setSortDescriptor}
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
          items={shouldShowLoading ? [] : filteredBookings}
          isLoading={shouldShowLoading}
          loadingContent={<SpinnerLoader size="md" />}
        >
          {(booking: BookingItem) => (
            <TableRow key={String(booking?.reference)}>
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
        handleDelete={() => updateBookingStatus(3, id)}
        setIsOpen={setIsOpenDelete}
        toggleModal={toggleDeleteModal}
      />
    </section>
  );
};

export default BookingsList;
