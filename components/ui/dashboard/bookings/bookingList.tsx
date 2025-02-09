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
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@nextui-org/react";
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

const BookingsList = ({ bookings, searchQuery, refetch }: any) => {
  const { userRolePermissions, role } = usePermission();
  const [filteredBooking, setFilteredBooking] = React.useState(
    bookings[0]?.bookings
  );
  const [isOpenDelete, setIsOpenDelete] = React.useState<Boolean>(false);
  const [isEditBookingModal, setIsEditBookingModal] =
    React.useState<Boolean>(false);
  const [id, setId] = React.useState<Number>();
  const [eachBooking, setEachBooking] = React.useState<any>(null);

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

  const handleTabClick = (index) => {
    setPage(1);
    const filteredBooking = bookings.filter((item) => item.name === index);
    setTableStatus(filteredBooking[0]?.name);

    setFilteredBooking(filteredBooking[0]?.bookings);
  };

  useEffect(() => {
    if (bookings && searchQuery) {
      const filteredData = bookings
        ?.filter(
          (item) =>
            item?.reservationName?.toLowerCase().includes(searchQuery) ||
            item?.firstName?.toLowerCase().includes(searchQuery) ||
            item?.lastName?.toLowerCase().includes(searchQuery) ||
            item?.reference?.toLowerCase().includes(searchQuery) ||
            item?.emailAddress?.toLowerCase().includes(searchQuery) ||
            item?.phoneNumber?.toLowerCase().includes(searchQuery) ||
            item?.bookingDateTime?.toLowerCase().includes(searchQuery)
        )
        .filter((item) => Object.keys(item).length > 0);
      setFilteredBooking(filteredData.length > 0 ? filteredData : []);
    } else {
      setFilteredBooking(bookings);
    }
  }, [searchQuery, bookings]);

  const matchingObject = bookings?.find(
    (category) => category?.name === tableStatus
  );

  const matchingObjectArray = matchingObject ? matchingObject?.bookings : [];

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
                    booking?.bookingStatus === 1 && (
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
                    )}
                  {(role === 0 || userRolePermissions?.canEditOrder === true) &&
                    booking?.bookingStatus === 0 && (
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
                    )}
                  {/* {(role === 0 || userRolePermissions?.canEditOrder === true) &&
                    booking?.bookingStatus === 0 && ( */}
                  <DropdownItem
                    aria-label="edit booking"
                    onClick={() => toggleEditBookingModal(booking)}
                  >
                    <div className={` flex gap-2  items-center text-grey500`}>
                      <MdOutlineModeEditOutline className="text-[20px]" />

                      <p>Edit booking</p>
                    </div>
                  </DropdownItem>
                  {/* )} */}
                  {(role === 0 || userRolePermissions?.canEditOrder === true) &&
                    (booking?.bookingStatus === 0 ||
                      booking?.bookingStatus === 1) && (
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
                    )}

                  {(role === 0 || userRolePermissions?.canEditOrder === true) &&
                    booking?.bookingStatus === 2 && (
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
                    )}
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
        bookings={bookings}
        handleTabChange={handleTabChange}
        value={value}
        handleTabClick={handleTabClick}
      />
    );
  }, [
    filterValue,
    statusFilter,
    visibleColumns,
    onSearchChange,
    onRowsPerPageChange,
    filteredBooking?.length,
    hasSearchFilter,
  ]);

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
          items={matchingObjectArray}
        >
          {(item) => (
            <TableRow key={item?.id}>
              {(columnKey) => (
                <TableCell>{renderCell(item, columnKey)}</TableCell>
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
