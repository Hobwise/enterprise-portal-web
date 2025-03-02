import { deleteUser } from "@/app/api/controllers/auth";
import CustomDelete from "@/components/deleteComponent";
import { useGlobalContext } from "@/hooks/globalProvider";
import usePagination from "@/hooks/usePagination";
import { downloadCSV } from "@/lib/downloadToExcel";
import {
  dynamicExportConfig,
  getJsonItemFromLocalStorage,
  notify,
} from "@/lib/utils";
import {
  Avatar,
  Button,
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
  useDisclosure,
} from "@nextui-org/react";
import moment from "moment";
import React, { useState } from "react";
import toast from "react-hot-toast";
import { HiOutlineDotsVertical } from "react-icons/hi";
import { MdOutlineFileDownload } from "react-icons/md";
import { RiDeleteBin6Line } from "react-icons/ri";
import noImage from "../../../../../public/assets/images/no-image.svg";
import CreateUser from "./createUser";
import usePermission from "@/hooks/cachedEndpoints/usePermission";
import { exportGrid } from "@/app/api/controllers/dashboard/menu";
import { VscLoading } from "react-icons/vsc";
export const columns = [
  { name: "ID", uid: "id" },
  { name: "Name", uid: "firstName" },
  { name: "Date added", uid: "dateCreated" },
  { name: "Role", uid: "role" },
  { name: "", uid: "actions" },
];
const INITIAL_VISIBLE_COLUMNS = ["firstName", "dateCreated", "role", "actions"];

const Users = ({ data, refetch }: any) => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const { page, rowsPerPage } = useGlobalContext();
  const { userRolePermissions, role } = usePermission();
  const [loadingExport, setLoadingExport] = useState(false);
  const businessInformation = getJsonItemFromLocalStorage("business");
  const {
    bottomContent,
    headerColumns,
    setSelectedKeys,

    selectedKeys,
    sortDescriptor,
    setSortDescriptor,

    classNames,
  } = usePagination(data, columns, INITIAL_VISIBLE_COLUMNS);
  const userInformation = getJsonItemFromLocalStorage("userInformation");
  const [isOpenEdit, setIsOpenEdit] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpenDelete, setIsOpenDelete] = useState(false);
  const [user, setUser] = useState<any>({});

  const toggleEdit = (user: any) => {
    setUser(user);
    setIsOpenEdit(!isOpenEdit);
  };

  const toggleDelete = (user?: any) => {
    setUser(user);
    setIsOpenDelete(!isOpenDelete);
  };

  const removeUser = async () => {
    setIsLoading(true);
    const data = await deleteUser(user?.id);
    setIsLoading(false);
    if (data?.data?.isSuccessful) {
      toggleDelete();
      toast.success("Deleted successfully");
      refetch();
    } else if (data?.data?.error) {
      notify({
        title: "Error!",
        text: data?.data?.error,
        type: "error",
      });
    }
  };

  const renderCell = React.useCallback((user, columnKey) => {
    const cellValue = user[columnKey];

    switch (columnKey) {
      case "firstName":
        return (
          <div className="flex ">
            <Avatar
              showFallback
              name={user?.firstName}
              src={
                user.image ? `data:image/jpeg;base64,${user?.image}` : noImage
              }
            />
            <div className="ml-3 gap-1 grid place-content-center">
              <span className="font-semibold  text-sm">
                {user?.firstName} {user?.lastName}
              </span>
              <span className="text-grey400 text-xs">{user?.email}</span>
            </div>
          </div>
        );

      case "dateCreated":
        return (
          <div className="text-textGrey text-sm">
            {moment(user?.dateCreated).format("MMMM Do YYYY, h:mm:ss a")}
          </div>
        );
      case "role":
        return (
          <Chip
            classNames={{
              base: ` text-xs h-6 capitalize font-[700] w-5 bg-[#EAE5FF] text-primaryColor`,
            }}
            size="sm"
          >
            {user?.role === 0 ? "Manager" : "Staff"}
          </Chip>
        );

      case "actions":
        return (
          <div className="relative flexjustify-center items-center gap-2">
            {user?.email !== userInformation.email && (
              <Dropdown aria-label="drop down" className="">
                <DropdownTrigger aria-label="actions">
                  <span className="text-lg border rounded-md p-1 border-primaryGrey text-default-400 cursor-pointer active:opacity-50">
                    <HiOutlineDotsVertical />
                  </span>
                </DropdownTrigger>
                <DropdownMenu className="text-black">
                  {/* <DropdownItem
                  aria-label='edit user'
                  onClick={() => toggleEdit(user)}
                >
                  <div className={` flex gap-2  items-center text-grey500`}>
                    <MdEdit className='text-[20px]' />
                    <p>Edit user</p>
                  </div>
                </DropdownItem> */}
                  <DropdownSection>
                    {(role === 0 ||
                      userRolePermissions?.canDeleteUser === true) && (
                      <DropdownItem
                        onClick={() => toggleDelete(user)}
                        aria-label="delete user"
                      >
                        <div className={` flex gap-2  items-center`}>
                          <RiDeleteBin6Line className="text-[20px] text-danger-500" />
                          <p className=" text-grey500">Delete user</p>
                        </div>
                      </DropdownItem>
                    )}
                  </DropdownSection>
                </DropdownMenu>
              </Dropdown>
            )}
          </div>
        );
      default:
        return cellValue;
    }
  }, []);

  const exportCSV = async () => {
    setLoadingExport(true);
    const response = await exportGrid(businessInformation[0]?.businessId, 7);
    setLoadingExport(false);

    if (response?.status === 200) {
      dynamicExportConfig(
        response,
        `Team-members-${businessInformation[0]?.businessName}`
      );
      toast.success("Team members downloaded successfully");
    } else {
      toast.error("Export failed, please try again");
    }
  };
  return (
    <section>
      <div className="flex justify-between">
        <div className="w-[220px]">
          <h1 className="text-[16px] leading-8 font-semibold">Team members</h1>
          <p className="text-sm  text-grey600 md:mb-10 mb-4">
            Invite your colleagues to work faster and collaborate together
          </p>
        </div>
        <div className=" flex gap-3 pt-5">
          <Button
            disabled={loadingExport}
            onClick={exportCSV}
            className="flex text-grey600 bg-white"
          >
            {loadingExport ? (
              <VscLoading className="animate-spin" />
            ) : (
              <MdOutlineFileDownload className="text-[22px]" />
            )}

            <p>Export csv</p>
          </Button>
          {(role === 0 || userRolePermissions?.canCreateUser === true) && (
            <Button
              onPress={onOpen}
              className="text-white bg-primaryColor rounded-lg"
            >
              Invite new member
            </Button>
          )}
        </div>
      </div>

      <Table
        radius="lg"
        isCompact
        removeWrapper
        allowsSorting
        aria-label="list of reservations"
        bottomContentPlacement="outside"
        classNames={{
          td: "h-[70px]",
        }}
        // classNames={classNames}
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
        <TableBody emptyContent={"No reservation found"} items={data}>
          {(item) => (
            <TableRow key={item?.id}>
              {(columnKey) => (
                <TableCell>{renderCell(item, columnKey)}</TableCell>
              )}
            </TableRow>
          )}
        </TableBody>
      </Table>
      <CreateUser isOpen={isOpen} onOpenChange={onOpenChange} />
      {/* <EditUser user={user} toggleEdit={toggleEdit} isOpenEdit={isOpenEdit} /> */}
      <CustomDelete
        title={
          <span>
            Are you sure you want to remove{" "}
            <span className="font-bold">
              {user?.firstName} {user?.lastName}
            </span>{" "}
            from your team?
          </span>
        }
        isLoading={isLoading}
        action={removeUser}
        toggleDelete={toggleDelete}
        isOpen={isOpenDelete}
      />
    </section>
  );
};

export default Users;
