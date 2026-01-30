"use client";

import React, { useState, useMemo } from "react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Input,
  Button,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@nextui-org/react";
import { Search } from "lucide-react";
import { Supplier } from "./types";
import { HiOutlineDotsVertical } from "react-icons/hi";
import { SupplierIcon } from "@/public/assets/svg";
import useMobile from "@/hooks/useMobile";
import CustomPagination from "@/components/ui/dashboard/orders/CustomPagination";

interface SuppliersListProps {
  suppliers: Supplier[];
  onAddSupplier: () => void;
  onViewSupplier: (supplier: Supplier) => void;
  onEditSupplier?: (supplier: Supplier) => void;
  onDeleteSupplier?: (supplier: Supplier) => void;
}

const columns = [
  { name: "SUPPLIER NAME", uid: "name" },
  { name: "COMPANY NAME", uid: "companyName" },
  { name: "EMAIL ADDRESS", uid: "email" },
  { name: "ADDRESS", uid: "address" },
  { name: "PHONE NUMBER", uid: "phoneNumber" },
  { name: "STATUS", uid: "status" },
];

const SuppliersList: React.FC<SuppliersListProps> = ({
  suppliers,
  onAddSupplier,
  onViewSupplier,
  onEditSupplier,
  onDeleteSupplier,
}) => {
   const isMobile = useMobile();
  
  const [filterValue, setFilterValue] = useState("");
  const [page, setPage] = useState(1);
  const rowsPerPage = 10;

  const hasSearchFilter = Boolean(filterValue);

  const filteredItems = useMemo(() => {
    let filteredUsers = [...suppliers];

    if (hasSearchFilter) {
      filteredUsers = filteredUsers.filter((user) =>
        user.name.toLowerCase().includes(filterValue.toLowerCase()) ||
        user.companyName.toLowerCase().includes(filterValue.toLowerCase()) ||
        user.supplierId.toLowerCase().includes(filterValue.toLowerCase())
      );
    }

    return filteredUsers;
  }, [suppliers, filterValue]);

  const items = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;

    return filteredItems.slice(start, end);
  }, [page, filteredItems]);

  const renderCell = React.useCallback(
    (user: Supplier, columnKey: React.Key) => {
      const cellValue = user[columnKey as keyof Supplier];

      switch (columnKey) {
        case "name":
          return (
            <div className="flex items-center gap-2">
             
              <span className="text-sm font-semibold text-gray-900">{cellValue}</span>
            </div>
          );
        case "status":
          return (
            <div className="relative flex justify-center items-center gap-2">
              <Dropdown>
                <DropdownTrigger>
                  <Button className="border-gray-200 border" isIconOnly size="sm" variant="light">
                    <HiOutlineDotsVertical className="text-default-300" />
                  </Button>
                </DropdownTrigger>
                <DropdownMenu>
                  <DropdownItem className="text-gray-900" onClick={() => onViewSupplier(user)}>View Details</DropdownItem>
                  <DropdownItem className="text-gray-900" onClick={() => onEditSupplier && onEditSupplier(user)}>Edit</DropdownItem>
                  <DropdownItem className="text-danger" onClick={() => onDeleteSupplier && onDeleteSupplier(user)}>Delete</DropdownItem>
                </DropdownMenu>
              </Dropdown>
            </div>
          );
        default:
          return cellValue;
      }
    },
    [onViewSupplier, onEditSupplier, onDeleteSupplier]
  );

  const onSearchChange = React.useCallback((value?: string) => {
    if (value) {
      setFilterValue(value);
      setPage(1);
    } else {
      setFilterValue("");
    }
  }, []);

  const topContent = React.useMemo(() => {
   
    return (
      <div className="flex flex-col gap-4 mb-12 mt-5">
        <div className="flex justify-between gap-3 items-end">
          <div className="flex gap-4 items-center flex-1">
            <div className="bg-gray-200 p-2 rounded-md">
                <SupplierIcon className="w-5 h-5 text-[#494E58]" />
            </div>
            <span className="text-md text-gray-500">{suppliers.length} Suppliers</span>
          </div>
          <div className="flex gap-3 w-1/2 justify-end">
            <Input
                isClearable
                className="w-full  sm:max-w-[55%]"
                placeholder="Search supplier by name or supplier ID"
                startContent={<Search className="text-default-300" size={16}/>}
                value={filterValue}
                onClear={() => onSearchChange("")}
                onValueChange={onSearchChange}
                classNames={{
                    inputWrapper: "border border-gray-200 rounded-lg bg-white",
                }}
                variant="bordered"
            />
            <Button color="secondary" className="bg-primaryColor rounded-lg text-white font-medium" endContent={<span className="text-lg">+</span>} onPress={onAddSupplier}>
             {isMobile ? "" : "Add New Item"}
            </Button>
          </div>
        </div>
      </div>
    );
  }, [filterValue, onSearchChange, suppliers.length, onAddSupplier, isMobile]);

  return (
    <section >
      {topContent}
      
      <div className="border border-gray-200 rounded-lg overflow-hidden">

     
      <Table
        radius="lg"
        isCompact
        removeWrapper
        aria-label="Suppliers table"
        topContentPlacement="outside"
        classNames={{
          wrapper: ["max-h-[382px]"],
          th: [
            "text-default-500",
            "text-xs",
            "border-b ",
            "border-divider",
            "py-4",
            "rounded-none",
            "bg-gray-100",
          ],
          tr: "border-b border-divider last:border-none rounded-none",
          td: [
            "py-3",
            "text-gray-500",
          ],
        }}
        bottomContent={
            <div className="flex w-full justify-center">
                 <CustomPagination
                    currentPage={page}
                    totalPages={Math.ceil(filteredItems.length / rowsPerPage) || 1}
                    hasNext={page < Math.ceil(filteredItems.length / rowsPerPage)}
                    hasPrevious={page > 1}
                    totalCount={filteredItems.length}
                    pageSize={rowsPerPage}
                    onPageChange={setPage}
                    onNext={() => setPage((p) => (p < Math.ceil(filteredItems.length / rowsPerPage) ? p + 1 : p))}
                    onPrevious={() => setPage((p) => (p > 1 ? p - 1 : p))}
                />
            </div>
        }
      >
        <TableHeader columns={columns}>
          {(column) => (
            <TableColumn key={column.uid} align={column.uid === "status" ? "center" : "start"}>
              {column.name}
            </TableColumn>
          )}
        </TableHeader>
        <TableBody items={items} emptyContent={"No suppliers found"}>
          {(item) => (
            <TableRow key={item.id} className="cursor-pointer hover:bg-gray-50" onClick={() => onViewSupplier(item)}>
              {(columnKey) => (
                <TableCell>{renderCell(item, columnKey)}</TableCell>
              )}
            </TableRow>
          )}
        </TableBody>
      </Table> </div>
    </section>
  );
};

export default SuppliersList;
