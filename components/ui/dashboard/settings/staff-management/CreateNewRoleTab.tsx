"use client";

import { CustomButton } from "@/components/customButton";
import useRoleCount from "@/hooks/cachedEndpoints/useRoleCount";
import usePermission from "@/hooks/cachedEndpoints/usePermission";
import { SmallLoader, getJsonItemFromLocalStorage } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  useDisclosure,
} from "@nextui-org/react";
import { useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { HiOutlineDotsVertical } from "react-icons/hi";

const CreateNewRoleTab = () => {
  const { data, isLoading, refetch } = useRoleCount();
  const {
    userRolePermissions,
    role,
    isLoading: isPermissionsLoading,
  } = usePermission();
  const router = useRouter();
  const userInformation = getJsonItemFromLocalStorage("userInformation") || [];
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const columns = [
    { name: "Role", uid: "role" },
    { name: "Members", uid: "count" },
    { name: "", uid: "actions" },
  ];

  const renderCell = useCallback((user, columnKey) => {
    const cellValue = user[columnKey];

    switch (columnKey) {
      case "actions":
        return (
          <div className="inline-flex p-0.5 gap-2 border border-primaryGrey rounded-md">
            <span className="text-lg text-default-400 cursor-pointer active:opacity-50">
              <HiOutlineDotsVertical />
            </span>
          </div>
        );
      default:
        return cellValue;
    }
  }, []);

  // Check permissions before rendering
  useEffect(() => {
    if (
      !isPermissionsLoading &&
      role !== 0 &&
      !userRolePermissions?.canViewUser
    ) {
      router.push("/dashboard/unauthorized");
    }
  }, [isPermissionsLoading, role, userRolePermissions, router]);

  // Check if user has permission to view users/staff
  if (role !== 0 && !userRolePermissions?.canViewUser) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="pt-2">
      <div className="flex md:flex-row flex-col justify-between md:items-center items-start mb-6">
        <div>
          <h1 className="text-[16px] leading-8 font-semibold">Team Roles</h1>
          <p className="text-sm text-grey600 w-full mb-4">
            {/* Create new roles for your team members
             */}
            Manage roles assigned to your team members
          </p>
        </div>
      </div>

      {isLoading && !data ? (
        <div className="grid mt-3 place-content-center">
          <SmallLoader />
        </div>
      ) : (
        <div className="border border-primaryGrey flex flex-col gap-2 rounded-lg">
          <Table removeWrapper={true} shadow="none" aria-label="Roles table">
            <TableHeader columns={columns}>
              {(column) => (
                <TableColumn
                  align={column.uid === "actions" ? "center" : "start"}
                  key={column.uid}
                >
                  {column.name}
                </TableColumn>
              )}
            </TableHeader>
            <TableBody
              loadingContent={<SmallLoader />}
              emptyContent={"No data to display."}
              items={data || []}
            >
              {(item) => (
                <TableRow key={item?.role}>
                  {(columnKey) => (
                    <TableCell>{renderCell(item, columnKey)}</TableCell>
                  )}
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default CreateNewRoleTab;
