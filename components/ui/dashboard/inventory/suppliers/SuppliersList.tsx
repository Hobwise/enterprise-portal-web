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

interface SuppliersListProps {
  suppliers: Supplier[];
  onAddSupplier: () => void;
  onViewSupplier: (supplier: Supplier) => void;
  onEditSupplier?: (supplier: Supplier) => void;
  onDeleteSupplier?: (supplier: Supplier) => void;
}

const columns = [
  { name: "Supplier ID", uid: "supplierId" },
  { name: "Supplier Name", uid: "name" },
  { name: "Company Name", uid: "companyName" },
  { name: "Email Address", uid: "email" },
  { name: "Address", uid: "address" },
  { name: "Phone Number", uid: "phoneNumber" },
  { name: "Status", uid: "status" },
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
        case "status":
          return (
            <div className="relative flex justify-end items-center gap-2">
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
  }, [filterValue, onSearchChange, suppliers.length, onAddSupplier]);

  return (
    <div className="space-y-4">
      {topContent}
      <Table
        aria-label="Suppliers table"
        classNames={{
          wrapper: "p-0 shadow-none rounded-none",
          th: "bg-[#F9FAFB] text-[#475467] font-medium text-xs py-4 rounded-none",
          td: "py-3 text-sm",
          tr: "border-b border-gray-100",
        }}
      >
        <TableHeader columns={columns}>
          {(column) => (
            <TableColumn key={column.uid} align={column.uid === "status" ? "center" : "start"}>
              {column.name}
            </TableColumn>
          )}
        </TableHeader>
        <TableBody items={items}>
          {(item) => (
            <TableRow key={item.id} className="cursor-pointer hover:bg-gray-50" onClick={() => onViewSupplier(item)}>
              {(columnKey) => (
                <TableCell>{renderCell(item, columnKey)}</TableCell>
              )}
            </TableRow>
          )}
        </TableBody>
      </Table>
      
      {/* Pagination */}
      <div className="flex w-full p-4 justify-between items-center bg-gray-50">
        <span className="text-sm text-gray-500">
          Page {page} of {Math.ceil(filteredItems.length / rowsPerPage) || 1}
        </span>
        <div className="flex items-center gap-1">
          {/* Page numbers */}
          {Array.from({ length: Math.min(Math.ceil(filteredItems.length / rowsPerPage), 5) }, (_, i) => i + 1).map((num) => (
            <Button
              key={num}
              size="sm"
              variant={page === num ? "solid" : "flat"}
              className={page === num ? "bg-primaryColor text-white min-w-8" : "bg-transparent min-w-8"}
              onPress={() => setPage(num)}
            >
              {num}
            </Button>
          ))}
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="bordered"
            onPress={() => setPage((p) => (p > 1 ? p - 1 : p))}
            isDisabled={page === 1}
            className="border-gray-300 cursor-pointer"
          >
            ← Previous
          </Button>
          <Button
            size="sm"
            variant="bordered"
            onPress={() => setPage((p) => (p < Math.ceil(filteredItems.length / rowsPerPage) ? p + 1 : p))}
            isDisabled={page >= Math.ceil(filteredItems.length / rowsPerPage)}
            className="border-gray-300 cursor-pointer"
          >
            Next →
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SuppliersList;
