"use client";

import React, { useEffect, useState } from "react";

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
import EditReservation from "@/app/dashboard/reservation/[reservationId]/editReservation";
import DeleteReservation from "@/app/dashboard/reservation/[reservationId]/deleteReservation";

const INITIAL_VISIBLE_COLUMNS = [
  "reservationName",
  "reservationDescription",
  "quantity",
  "minimumSpend",
  "actions",
];

const ReservationList = ({ reservation, searchQuery, data, refetch }: any) => {
  const [filteredReservation, setFilteredReservation] = React.useState(
    data?.reservations
  );
  const [isOpenEdit, setIsOpenEdit] = useState(false);
  const [isOpenDelete, setIsOpenDelete] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState(null);

  const toggleModalEdit = () => {
    setIsOpenEdit(!isOpenEdit);
  };

  const toggleModalDelete = () => {
    setIsOpenDelete(!isOpenDelete);
  };

  const handleEdit = (reservationItem: any) => {
    setSelectedReservation(reservationItem);
    setIsOpenEdit(true);
  };

  const handleDelete = (reservationItem: any) => {
    setSelectedReservation(reservationItem);
    setIsOpenDelete(true);
  };

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
    displayData,
    isMobile,
  } = usePagination(data, columns, INITIAL_VISIBLE_COLUMNS);

  const renderCell = React.useCallback((reservation, columnKey) => {
    const cellValue = reservation[columnKey];


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
            <div className="gap-1 grid place-content-center">
              <p className="font-medium text-black text-sm mb-[0.5px]">
                {reservation.reservationName}
              </p>

              
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

          <div className="text-textGrey text-sm max-w-[330px]">
            {reservation.reservationDescription}
          </div>
        </Link>
        );
      case "minimumSpend":
        return (
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

          <div className="text-textGrey text-sm">
            {reservation.minimumSpend > 0
              ? formatPrice(reservation.minimumSpend)
              : '-'}
          </div>
              </Link>
        );

      case "actions":
        return (
          <div className="relative flex justify-center items-center gap-2">
            <Dropdown aria-label="drop down" className="">
              <DropdownTrigger aria-label="actions">
                <div className="cursor-pointer flex justify-center items-center text-black">
                  <HiOutlineDotsVertical className="text-[22px]" />
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
                    <div className="flex gap-2 items-center text-grey500">
                      <GrFormView className="text-[20px]" />
                      <p>View</p>
                    </div>
                  </Link>
                </DropdownItem>
                <DropdownItem
                  aria-label="edit"
                  onClick={() => handleEdit(reservation)}
                >
                  <div className="flex gap-2 items-center text-grey500">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                    <p>Edit</p>
                  </div>
                </DropdownItem>
                <DropdownItem
                  aria-label="delete"
                  onClick={() => handleDelete(reservation)}
                >
                  <div className="flex gap-2 items-center text-danger-500">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                    <p>Delete</p>
                  </div>
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </div>
        );
      default:
        return cellValue;
    }
  }, []);

  return (
    <section className="border border-primaryGrey rounded-lg overflow-hidden">
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
          items={displayData || filteredReservation}
        >
          {(item, index) => (
            <TableRow
              key={item?.id || item?.name || `reservation-row-${index}`}
              className="cursor-pointer hover:bg-gray-50 transition-colors"
            >
              {(columnKey) => (
                <TableCell>{renderCell(item, columnKey)}</TableCell>
              )}
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* Edit Reservation Modal */}
      {selectedReservation && (
        <EditReservation
          isOpenEdit={isOpenEdit}
          toggleModalEdit={toggleModalEdit}
          reservationItem={selectedReservation}
          getReservation={refetch}
        />
      )}

      {/* Delete Reservation Modal */}
      {selectedReservation && (
        <DeleteReservation
          isOpenDelete={isOpenDelete}
          toggleModalDelete={toggleModalDelete}
          reservationItem={selectedReservation}
        />
      )}
    </section>
  );
};

export default ReservationList;
