"use client";

import React, { useEffect } from "react";

import { useGlobalContext } from "@/hooks/globalProvider";
import usePagination from "@/hooks/usePagination";
import { formatPrice } from "@/lib/utils";
import {
  Chip,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@nextui-org/react";
import Image from "next/image";
import Link from "next/link";
import { GrFormView } from "react-icons/gr";
import { HiOutlineDotsVertical } from "react-icons/hi";
import noImage from "../../../../public/assets/images/no-image.svg";
import { columns } from "./data";

const INITIAL_VISIBLE_COLUMNS = [
  "reservationName",
  "reservationDescription",
  "quantityLeft",
  "reservationFee",
  "reservationDuration",
  // "quantity",
  "minimumSpend",
  "actions",
];

const ReservationList = ({ reservation, searchQuery, data }: any) => {
  const [filteredReservation, setFilteredReservation] = React.useState(
    data?.reservations
  );

  useEffect(() => {
    if (reservation && searchQuery) {
      const filteredData = reservation
        ?.filter(
          (item) =>
            item?.reservationName?.toLowerCase().includes(searchQuery) ||
            String(item?.reservationFee)?.toLowerCase().includes(searchQuery) ||
            String(item?.minimumSpend)?.toLowerCase().includes(searchQuery) ||
            String(item?.quantity)?.toLowerCase().includes(searchQuery) ||
            item?.reservationDescription?.toLowerCase().includes(searchQuery)
        )
        .filter((item) => Object.keys(item).length > 0);
      setFilteredReservation(filteredData.length > 0 ? filteredData : []);
    } else {
      setFilteredReservation(reservation);
    }
  }, [searchQuery, reservation]);

  const { page, rowsPerPage } = useGlobalContext();

  const {
    bottomContent,
    headerColumns,
    setSelectedKeys,

    selectedKeys,
    sortDescriptor,
    setSortDescriptor,

    classNames,
  } = usePagination(data, columns, INITIAL_VISIBLE_COLUMNS);

  const renderCell = React.useCallback((reservation, columnKey) => {
    const cellValue = reservation[columnKey];

    const showMinimumSpend = reservation.minimumSpend > 0;
    const showReservationFee = reservation.reservationFee > 0;

    switch (columnKey) {
      case "reservationName":
        return (
          //   <div className='flex text-textGrey text-sm'>{reservation.name}</div>
          <Link
          prefetch={true}
          className="flex cursor-pointer w-full"
          href={{
            pathname: `/dashboard/reservation/${reservation.reservationName}`,
            query: {
              reservationId: reservation.id,
            },
          }}
        >
          <div className="flex ">
            <Image
              className="h-[60px] w-[60px] bg-cover rounded-lg"
              width={60}
              height={60}
              alt="menu"
              aria-label="menu"
              src={
                reservation.image
                  ? `data:image/jpeg;base64,${reservation.image}`
                  : noImage
              }
            />

            <div className="ml-5 gap-1 grid place-content-center">
              <p className="font-medium text-black text-sm mb-[0.5px]">
                {reservation.reservationName}
              </p>

              {showReservationFee ? (
                <div>
                  <p className="text-sm">Reservation Fee</p>
                  <p className="font-medium text-black text-[13px]">
                    {formatPrice(reservation.reservationFee)}
                  </p>
                </div>
              ) : showMinimumSpend ? (
                <div>
                  <p className="text-sm">Minimum Spend</p>
                  <p className="font-medium text-black text-[13px]">
                    {formatPrice(reservation.minimumSpend)}
                  </p>
                </div>
              ) : null}
            </div>
          </div>
          </Link>
        );

      case "quantity":
        return (
          <div className="text-textGrey text-sm">{reservation.quantity}</div>
        );
      case "reservationDescription":
        return (
          <div className="text-textGrey text-sm max-w-[330px]">
            {reservation.reservationDescription}
          </div>
        );

      case "actions":
        return (
          <div className="relative flexjustify-center items-center gap-2">
            <Link
              prefetch={true}
              className="flex w-full"
              href={{
                pathname: `/dashboard/reservation/${reservation.reservationName}`,
                query: {
                  reservationId: reservation.id,
                },
              }}
            >
              <div className={` flex gap-2  items-center text-grey500`}>
                <GrFormView className="text-[20px]" />
                <p>View more</p>
              </div>
            </Link>
            {/* <Dropdown aria-label="drop down" className="">
              <DropdownTrigger aria-label="actions">
                <div className="cursor-pointer flex justify-center items-center text-black">
                  <HiOutlineDotsVertical className="text-[22px] " />
                </div>
              </DropdownTrigger>
              <DropdownMenu className="text-black">
                <DropdownItem aria-label="view">
                  <Link
                    prefetch={true}
                    className="flex w-full"
                    href={{
                      pathname: `/dashboard/reservation/${reservation.reservationName}`,
                      query: {
                        reservationId: reservation.id,
                      },
                    }}
                  >
                    <div className={` flex gap-2  items-center text-grey500`}>
                      <GrFormView className="text-[20px]" />
                      <p>View more</p>
                    </div>
                  </Link>
                </DropdownItem>
              </DropdownMenu>
            </Dropdown> */}
          </div>
        );
      default:
        return cellValue;
    }
  }, []);

  return (
    <section className="border border-primaryGrey rounded-lg">
      <Table
        radius="lg"
        isCompact
        removeWrapper
        allowsSorting
        aria-label="list of reservations"
        bottomContent={bottomContent}
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
          emptyContent={"No reservation found"}
          items={filteredReservation}
        >
          {(item) => (
            <TableRow key={item?.name}>
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

export default ReservationList;
