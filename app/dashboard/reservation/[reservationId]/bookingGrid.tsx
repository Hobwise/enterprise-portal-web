"use client";

import React, { useState } from "react";

import { useGlobalContext } from "@/hooks/globalProvider";
import usePagination from "@/hooks/usePagination";
import {
  Chip,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@nextui-org/react";
import moment from "moment";
import { columns, statusColorMap, statusDataMap } from "./data";
import Filters from "./filters";

const INITIAL_VISIBLE_COLUMNS = [
  "reservationName",
  "firstName",
  "lastName",
  "id",
  "emailAddress",
  "phoneNumber",
  "reference",
  "bookingDateTime",
  "bookingStatus",
  "actions",
];

const BookingGrid = ({ data }: any) => {
  const { page, rowsPerPage, setTableStatus, tableStatus, setPage } =
    useGlobalContext();

  const matchingObject = data?.find(
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
  const [filteredBookings, setFilteredBookings] = React.useState(
    data[0]?.bookings
  );
  const handleTabChange = (index) => {
    setValue(index);
  };

  const handleTabClick = (index) => {
    setPage(1);
    const filteredBookings = data.filter((item) => item.name === index);
    setTableStatus(filteredBookings[0]?.name);
    setFilteredBookings(filteredBookings[0]?.bookings);
  };

  const topContent = React.useMemo(() => {
    return (
      <Filters
        bookings={data}
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
    filteredBookings.length,
    hasSearchFilter,
  ]);

  const renderCell = React.useCallback((data, columnKey) => {
    const cellValue = data[columnKey];

    switch (columnKey) {
      case "firstName":
        return (
          <div className="  text-sm">
            <p className="font-medium text-black">
              {data?.firstName} {data?.lastName}
            </p>
            <p className="text-[13px]">{data?.phoneNumber}</p>
          </div>
        );

      case "bookingDateTime":
        return (
          <div className="text-textGrey text-sm">
            {moment(data?.bookingDateTime).format("MMMM Do YYYY, h:mm:ss a")}
          </div>
        );
      case "reference":
        return <p className="text-sm text-textGrey">{data?.reference}</p>;
      case "bookingStatus":
        return (
          <Chip
            className="capitalize"
            color={statusColorMap[data?.bookingStatus]}
            size="sm"
            variant="bordered"
          >
            {statusDataMap[data?.bookingStatus]}
          </Chip>
        );

      default:
        return cellValue;
    }
  }, []);

  return (
    <section className="border w-full border-primaryGrey rounded-lg">
      <Table
        radius="lg"
        isCompact
        removeWrapper
        allowsSorting
        aria-label="list of bookings"
        bottomContent={bottomContent}
        bottomContentPlacement="outside"
        classNames={classNames}
        selectedKeys={selectedKeys}
        topContent={topContent}
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
          emptyContent={"No bookings found"}
          items={matchingObjectArray}
        >
          {(item) => (
            <TableRow key={item?.reference}>
              {(columnKey) => (
                <TableCell>{renderCell(item, columnKey)}</TableCell>
              )}
            </TableRow>
          )}
        </TableBody>
      </Table>
    </section>
  );
};

export default BookingGrid;
