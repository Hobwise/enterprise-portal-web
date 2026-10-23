"use client";

import React from "react";
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
  Chip,
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
  totalCount: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
  search: string;
  onSearchChange: (value: string) => void;
}

const columns = [
  { name: "SUPPLIER NAME", uid: "name" },
  { name: "COMPANY NAME", uid: "companyName" },
  { name: "EMAIL ADDRESS", uid: "email" },
  { name: "PHONE NUMBER", uid: "phoneNumber" },
  { name: "STATUS", uid: "status" },
  { name: "", uid: "actions" },
];

const SuppliersList: React.FC<SuppliersListProps> = ({
  suppliers,
  onAddSupplier,
  onViewSupplier,
  onEditSupplier,
  onDeleteSupplier,
  totalCount,
  totalPages,
  currentPage,
  pageSize,
  onPageChange,
  isLoading = false,
  search,
  onSearchChange: onSearchChangeProp,
}) => {
   const isMobile = useMobile();

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
            <Chip
              size="sm"
              variant="flat"
              color={user.status === "active" ? "success" : "danger"}
              classNames={{ base: "h-6 px-2", content: "text-xs font-medium" }}
            >
              {user.status === "active" ? "Active" : "Inactive"}
            </Chip>
          );
        case "actions":
          return (
            <div className="relative flex justify-center items-center gap-2" onClick={(e) => e.stopPropagation()}>
              <Dropdown>
                <DropdownTrigger aria-label="actions">
                  <div className="cursor-pointer flex justify-center items-center text-black">
                    <HiOutlineDotsVertical className="text-[22px]" />
                  </div>
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
          return typeof cellValue === "string" ? cellValue : "—";
      }
    },
    [onViewSupplier, onEditSupplier, onDeleteSupplier]
  );

  const onSearchChange = React.useCallback((value?: string) => {
    onSearchChangeProp(value || "");
    if (currentPage !== 1) {
      onPageChange(1);
    }
  }, [onSearchChangeProp, onPageChange, currentPage]);

  const topContent = React.useMemo(() => {

    return (
      <div className="flex flex-col gap-4 mb-12 mt-5">
        <div className="flex flex-col sm:flex-row justify-between gap-3 sm:items-end">
          <div className="flex gap-4 items-center flex-1">
            <div className="bg-gray-200 p-2 rounded-md">
                <SupplierIcon className="w-5 h-5 text-[#494E58]" />
            </div>
            <span className="text-md text-gray-500">{totalCount} Suppliers</span>
          </div>
          <div className="flex flex-wrap sm:flex-nowrap gap-3 w-full sm:w-auto justify-start sm:justify-end">
            <Input
                isClearable
                className="w-full  sm:max-w-[55%]"
                placeholder="Search supplier by name or supplier ID"
                startContent={<Search className="text-default-300" size={16}/>}
                value={search}
                onClear={() => onSearchChange("")}
                onValueChange={onSearchChange}
                classNames={{
                    inputWrapper: "border border-gray-200 rounded-lg bg-white",
                }}
                variant="bordered"
            />
            <Button color="secondary" className="bg-primaryColor rounded-lg text-white font-medium" endContent={<span className="text-lg">+</span>} onPress={onAddSupplier}>
             {isMobile ? "" : "Add New Supplier"}
            </Button>
          </div>
        </div>
      </div>
    );
  }, [search, onSearchChange, totalCount, onAddSupplier, isMobile]);

  return (
    <section >
      {topContent}
      {isMobile ? (
        <div className="divide-y divide-primaryGrey border border-gray-200 rounded-lg overflow-hidden">
          {suppliers.length === 0 && (
            <div className="flex justify-center items-center py-16 text-textGrey">
              No suppliers found
            </div>
          )}
          
          {suppliers.map((item) => (
            <article
              key={item.id}
              className="p-4 cursor-pointer hover:bg-gray-50 active:bg-gray-100 transition-colors"
              onClick={() => onViewSupplier(item)}
            >
              <div className="flex items-end justify-end mb-3 mt-2">
                <div className="ml-2" onClick={(e) => e.stopPropagation()}>
                  {renderCell(item, "actions")}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-black text-[15px]">
                      {renderCell(item, "name")}
                    </span>
                  </div>
                </div>
                <div>
                  <div className="text-[11px] text-textGrey uppercase mb-1">
                    Company Name
                  </div>
                  <div className="text-black font-semibold text-[15px]">
                    {renderCell(item, "companyName")}
                  </div>
                </div>
                <div>
                  <div className="text-[11px] text-textGrey uppercase mb-1">
                    Phone
                  </div>
                  <div className="text-black text-[13px] truncate">
                    {renderCell(item, "phoneNumber")}
                  </div>
                </div>
                <div>
                  <div className="text-[11px] text-textGrey uppercase mb-1">
                    Email
                  </div>
                  <div className="text-black text-[13px] truncate">
                    {renderCell(item, "email")}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                {renderCell(item, "status")}
              </div>
            </article>
          ))}
        </div>
      ) : (
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
                "border-b",
                "border-divider",
                "py-4",
                "rounded-none",
                "bg-grey300",
              ],
              tr: "border-b border-divider rounded-none",
              td: [
                "py-3",
                "text-textGrey",
                "group-data-[first=true]:first:before:rounded-none",
                "group-data-[first=true]:last:before:rounded-none",
                "group-data-[middle=true]:before:rounded-none",
                "group-data-[last=true]:first:before:rounded-none",
                "group-data-[last=true]:last:before:rounded-none",
              ],
            }}
          >
            <TableHeader columns={columns}>
              {(column) => (
                <TableColumn key={column.uid} align={column.uid === "actions" ? "center" : "start"}>
                  {column.name}
                </TableColumn>
              )}
            </TableHeader>
            <TableBody items={suppliers} emptyContent={"No suppliers found"}>
              {(item) => (
                <TableRow key={item.id} className="cursor-pointer hover:bg-gray-50" onClick={() => onViewSupplier(item)}>
                  {(columnKey) => (
                    <TableCell>{renderCell(item, columnKey)}</TableCell>
                  )}
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}
      <CustomPagination
        currentPage={currentPage}
        totalPages={totalPages}
        hasNext={currentPage < totalPages}
        hasPrevious={currentPage > 1}
        totalCount={totalCount}
        pageSize={pageSize}
        onPageChange={onPageChange}
        onNext={() => onPageChange(currentPage + 1)}
        onPrevious={() => onPageChange(currentPage - 1)}
        isLoading={isLoading}
      />
    </section>
  );
};

export default SuppliersList;
