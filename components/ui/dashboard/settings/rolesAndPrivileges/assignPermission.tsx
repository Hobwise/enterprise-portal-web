"use client";
import { configureRole } from "@/app/api/controllers/dashboard/settings";
import useGetRoleByBusiness from "@/hooks/cachedEndpoints/useGetRoleBusiness";
import { SmallLoader, getJsonItemFromLocalStorage } from "@/lib/utils";
import {
  Modal,
  ModalBody,
  ModalContent,
  ScrollShadow,
  Spacer,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@nextui-org/react";
import { useCallback, useEffect, useState } from "react";
import {
  bookingOption,
  businessOption,
  campaignOption,
  columns,
  dashboardOption,
  menuOption,
  orderOption,
  paymentOption,
  qrOption,
  reportOption,
  reservationsOption,
  userOption,
} from "../data";

const AssignPermission = ({ isOpen, onOpenChange }: any) => {
  const { data, isLoading: roleLoading, refetch } = useGetRoleByBusiness();
  const businessInformation = getJsonItemFromLocalStorage("business");
  const userInformation = getJsonItemFromLocalStorage("userInformation");

  const initialState = {
    userRole: {
      cooperateId: userInformation.cooperateID,
      businessId: businessInformation[0]?.businessId,
      canCreateBusiness: false,
      canCreateCampaign: false,
      canCreateMenu: true,
      canCreateOrder: false,
      canCreateQR: false,
      canCreateReservation: false,
      canCreateUser: false,
      canDeleteBusiness: false,
      canDeleteMenu: true,
      canDeleteOrder: true,
      canDeleteQR: false,
      canDeleteReservation: false,
      canDeleteUser: false,
      canEditBooking: true,
      canEditBusiness: false,
      canEditCampaign: false,
      canEditMenu: true,
      canCreateBooking: true,
      canEditOrder: true,
      canEditPayment: false,
      canEditQR: false,
      canEditReport: false,
      canEditReservation: false,
      canEditUser: false,
      canViewBooking: true,
      canViewBusiness: false,
      canViewCampaign: false,
      canViewDashboard: true,
      canViewMenu: true,
      canViewMessages: false,
      canViewOrder: true,
      canViewPayment: false,
      canViewQR: false,
      canViewReport: false,
      canViewReservation: false,
      canViewUser: false,
    },
    managerRole: {
      cooperateId: userInformation.cooperateID,
      businessId: businessInformation[0]?.businessId,
      canCreateBusiness: true,
      canCreateCampaign: true,
      canCreateMenu: true,
      canCreateOrder: true,
      canCreateQR: true,
      canCreateReservation: true,
      canCreateUser: true,
      canDeleteBusiness: true,
      canDeleteMenu: true,
      canDeleteOrder: true,
      canDeleteQR: true,
      canDeleteReservation: true,
      canDeleteUser: true,
      canEditBooking: true,
      canCreateBooking: true,
      canEditBusiness: true,
      canEditCampaign: true,
      canEditMenu: true,
      canEditOrder: true,
      canEditPayment: true,
      canEditQR: true,
      canEditReport: true,
      canEditReservation: true,
      canEditUser: true,
      canViewBooking: true,
      canViewBusiness: true,
      canViewCampaign: true,
      canViewDashboard: true,
      canViewMenu: true,
      canViewMessages: true,
      canViewOrder: true,
      canViewPayment: true,
      canViewQR: true,
      canViewReport: true,
      canViewReservation: true,
      canViewUser: true,
    },
  };

  const [menuRoleSetting, setMenuRoleSettings] = useState(initialState);

  useEffect(() => {
    if (data?.data?.data) {
      setMenuRoleSettings(
        data?.data?.data.managerRole ? data?.data?.data : initialState
      );
    }
  }, [data]);

  const handleCheckboxChange = (role, key, value) => {
    setMenuRoleSettings((prevSettings) => ({
      ...prevSettings,
      [role]: {
        ...prevSettings[role],
        [key]: value,
      },
    }));
  };

  const assignPermission = async () => {
    const response = await configureRole(
      businessInformation[0]?.businessId,
      menuRoleSetting
    );

    if (response?.data?.isSuccessful) {
      refetch();
      console.log("Permission assigned successfully");
    } else if (response?.data?.error) {
      console.log(response?.data?.error, "errrrrrrrror");
    }
  };

  const handleModalClose = () => {
    assignPermission();
    onOpenChange();
  };

  const humanizeKey = (key) => {
    return key
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (str) => str.toUpperCase());
  };

  const renderCell = useCallback(
    (role, permission, columnKey) => {
      const cellValue = permission.actions;
      const isChecked = menuRoleSetting[role][cellValue];

      switch (columnKey) {
        case "manager":
          return (
            <div className="grid place-content-center gap-2">
              <Switch isDisabled size="sm" defaultSelected color="primary" />
            </div>
          );
        case "staff":
          return (
            <div className="grid place-content-center gap-2">
              <span className="cursor-pointer">
                <Switch
                  isDisabled={
                    role === "userRole" && cellValue === "canViewDashboard"
                  }
                  isSelected={
                    role === "userRole" && cellValue === "canViewDashboard"
                      ? true
                      : isChecked
                  }
                  onChange={(e) =>
                    handleCheckboxChange(role, cellValue, e.target.checked)
                  }
                  size="sm"
                  color="primary"
                />
              </span>
            </div>
          );
        case "actions":
          return (
            <div className="w-[230px] flex items-center gap-2">
              <span className="text-sm text-[#5F6D7E] cursor-pointer active:opacity-50">
                {humanizeKey(permission.actions)}
              </span>
            </div>
          );
        default:
          return cellValue;
      }
    },
    [menuRoleSetting]
  );

  return (
    <Modal
      size="2xl"
      isDismissable={false}
      isOpen={isOpen}
      onOpenChange={handleModalClose}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalBody>
              <h2 className="text-[24px] leading-3 mt-8 text-black font-semibold">
                Permissions
              </h2>
              <p className="text-sm  text-grey600">
                Assign the necessary permissions to access specific resources
              </p>
              {roleLoading ? (
                <div className="grid place-content-center">
                  <SmallLoader />
                </div>
              ) : (
                <ScrollShadow size={5} className="w-full h-[400px]">
                  <>
                    <span className="text-[#5F35D2] font-[700] -mb-3 px-3 text-[13px]">
                      MENU
                    </span>

                    <div className="border border-primaryGrey flex flex-col gap-2 rounded-lg">
                      <Table
                        radius="none"
                        shadow="none"
                        removeWrapper={true}
                        classNames={{
                          td: "px-3 py-2 border-b border-b-primaryGrey",
                          table: "p-0 border-none",
                        }}
                        aria-label="Menu table"
                      >
                        <TableHeader columns={columns}>
                          {(column) => (
                            <TableColumn
                              key={column.uid}
                              align={
                                column.uid === "actions" ? "start" : "center"
                              }
                            >
                              {column.name}
                            </TableColumn>
                          )}
                        </TableHeader>
                        <TableBody items={menuOption}>
                          {(item) => (
                            <TableRow className="text-[#5F6D7E]" key={item?.id}>
                              {(columnKey) => (
                                <TableCell>
                                  {renderCell(
                                    item?.role === "manager"
                                      ? "managerRole"
                                      : "userRole",
                                    item,
                                    columnKey
                                  )}
                                </TableCell>
                              )}
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>

                      <span className="text-[#5F35D2] px-3 font-[700] text-[13px] ">
                        CAMPAIGNS
                      </span>
                      <Table
                        radius="none"
                        shadow="none"
                        removeWrapper={true}
                        classNames={{
                          td: "px-3 py-2 border-y border-y-primaryGrey",
                          table: "p-0 border-none",
                        }}
                        aria-label="Campaign table"
                        hideHeader
                      >
                        <TableHeader columns={columns}>
                          {(column) => (
                            <TableColumn
                              key={column.uid}
                              align={
                                column.uid === "actions" ? "start" : "center"
                              }
                            >
                              {column.name}
                            </TableColumn>
                          )}
                        </TableHeader>
                        <TableBody items={campaignOption}>
                          {(item) => (
                            <TableRow className="text-[#5F6D7E]" key={item?.id}>
                              {(columnKey) => (
                                <TableCell>
                                  {renderCell(
                                    item?.role === "manager"
                                      ? "managerRole"
                                      : "userRole",
                                    item,
                                    columnKey
                                  )}
                                </TableCell>
                              )}
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>

                      <p className="text-[#5F35D2] px-3 font-[700] text-[13px] ">
                        RESERVATIONS
                      </p>
                      <Table
                        radius="none"
                        shadow="none"
                        removeWrapper={true}
                        classNames={{
                          td: "px-3 py-2 border-y border-y-primaryGrey",
                          table: "p-0 border-none",
                        }}
                        aria-label="Reservation table"
                        hideHeader
                      >
                        <TableHeader columns={columns}>
                          {(column) => (
                            <TableColumn
                              key={column.uid}
                              align={
                                column.uid === "actions" ? "start" : "center"
                              }
                            >
                              {column.name}
                            </TableColumn>
                          )}
                        </TableHeader>
                        <TableBody items={reservationsOption}>
                          {(item) => (
                            <TableRow className="text-[#5F6D7E]" key={item?.id}>
                              {(columnKey) => (
                                <TableCell>
                                  {renderCell(
                                    item?.role === "manager"
                                      ? "managerRole"
                                      : "userRole",
                                    item,
                                    columnKey
                                  )}
                                </TableCell>
                              )}
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                      <p className="text-[#5F35D2] px-3 font-[700] text-[13px] ">
                        BUSINESS SETTINGS
                      </p>
                      <Table
                        radius="none"
                        shadow="none"
                        removeWrapper={true}
                        classNames={{
                          td: "px-3 py-2 border-y border-y-primaryGrey",
                          table: "p-0 border-none",
                        }}
                        aria-label="Reservation table"
                        hideHeader
                      >
                        <TableHeader columns={columns}>
                          {(column) => (
                            <TableColumn
                              key={column.uid}
                              align={
                                column.uid === "actions" ? "start" : "center"
                              }
                            >
                              {column.name}
                            </TableColumn>
                          )}
                        </TableHeader>
                        <TableBody items={businessOption}>
                          {(item) => (
                            <TableRow className="text-[#5F6D7E]" key={item?.id}>
                              {(columnKey) => (
                                <TableCell>
                                  {renderCell(
                                    item?.role === "manager"
                                      ? "managerRole"
                                      : "userRole",
                                    item,
                                    columnKey
                                  )}
                                </TableCell>
                              )}
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                      <p className="text-[#5F35D2] px-3 font-[700] text-[13px] ">
                        ORDERS
                      </p>
                      <Table
                        radius="none"
                        shadow="none"
                        removeWrapper={true}
                        classNames={{
                          td: "px-3 py-2 border-y border-y-primaryGrey",
                          table: "p-0 border-none",
                        }}
                        aria-label="Reservation table"
                        hideHeader
                      >
                        <TableHeader columns={columns}>
                          {(column) => (
                            <TableColumn
                              key={column.uid}
                              align={
                                column.uid === "actions" ? "start" : "center"
                              }
                            >
                              {column.name}
                            </TableColumn>
                          )}
                        </TableHeader>
                        <TableBody items={orderOption}>
                          {(item) => (
                            <TableRow className="text-[#5F6D7E]" key={item?.id}>
                              {(columnKey) => (
                                <TableCell>
                                  {renderCell(
                                    item?.role === "manager"
                                      ? "managerRole"
                                      : "userRole",
                                    item,
                                    columnKey
                                  )}
                                </TableCell>
                              )}
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                      <p className="text-[#5F35D2] px-3 font-[700] text-[13px] ">
                        QUICK RESPONSE
                      </p>
                      <Table
                        radius="none"
                        shadow="none"
                        removeWrapper={true}
                        classNames={{
                          td: "px-3 py-2 border-y border-y-primaryGrey",
                          table: "p-0 border-none",
                        }}
                        aria-label="Reservation table"
                        hideHeader
                      >
                        <TableHeader columns={columns}>
                          {(column) => (
                            <TableColumn
                              key={column.uid}
                              align={
                                column.uid === "actions" ? "start" : "center"
                              }
                            >
                              {column.name}
                            </TableColumn>
                          )}
                        </TableHeader>
                        <TableBody items={qrOption}>
                          {(item) => (
                            <TableRow className="text-[#5F6D7E]" key={item?.id}>
                              {(columnKey) => (
                                <TableCell>
                                  {renderCell(
                                    item?.role === "manager"
                                      ? "managerRole"
                                      : "userRole",
                                    item,
                                    columnKey
                                  )}
                                </TableCell>
                              )}
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                      <p className="text-[#5F35D2] px-3 font-[700] text-[13px] ">
                        USER
                      </p>
                      <Table
                        radius="none"
                        shadow="none"
                        removeWrapper={true}
                        classNames={{
                          td: "px-3 py-2 border-y border-y-primaryGrey",
                          table: "p-0 border-none",
                        }}
                        aria-label="Reservation table"
                        hideHeader
                      >
                        <TableHeader columns={columns}>
                          {(column) => (
                            <TableColumn
                              key={column.uid}
                              align={
                                column.uid === "actions" ? "start" : "center"
                              }
                            >
                              {column.name}
                            </TableColumn>
                          )}
                        </TableHeader>
                        <TableBody items={userOption}>
                          {(item) => (
                            <TableRow className="text-[#5F6D7E]" key={item?.id}>
                              {(columnKey) => (
                                <TableCell>
                                  {renderCell(
                                    item?.role === "manager"
                                      ? "managerRole"
                                      : "userRole",
                                    item,
                                    columnKey
                                  )}
                                </TableCell>
                              )}
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                      <p className="text-[#5F35D2] px-3 font-[700] text-[13px] ">
                        BOOKINGS
                      </p>
                      <Table
                        radius="none"
                        shadow="none"
                        removeWrapper={true}
                        classNames={{
                          td: "px-3 py-2 border-y border-y-primaryGrey",
                          table: "p-0 border-none",
                        }}
                        aria-label="Reservation table"
                        hideHeader
                      >
                        <TableHeader columns={columns}>
                          {(column) => (
                            <TableColumn
                              key={column.uid}
                              align={
                                column.uid === "actions" ? "start" : "center"
                              }
                            >
                              {column.name}
                            </TableColumn>
                          )}
                        </TableHeader>
                        <TableBody items={bookingOption}>
                          {(item) => (
                            <TableRow className="text-[#5F6D7E]" key={item?.id}>
                              {(columnKey) => (
                                <TableCell>
                                  {renderCell(
                                    item?.role === "manager"
                                      ? "managerRole"
                                      : "userRole",
                                    item,
                                    columnKey
                                  )}
                                </TableCell>
                              )}
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                      <p className="text-[#5F35D2] px-3 font-[700] text-[13px] ">
                        PAYMENTS
                      </p>
                      <Table
                        radius="none"
                        shadow="none"
                        removeWrapper={true}
                        classNames={{
                          td: "px-3 py-2 border-y border-y-primaryGrey",
                          table: "p-0 border-none",
                        }}
                        aria-label="Reservation table"
                        hideHeader
                      >
                        <TableHeader columns={columns}>
                          {(column) => (
                            <TableColumn
                              key={column.uid}
                              align={
                                column.uid === "actions" ? "start" : "center"
                              }
                            >
                              {column.name}
                            </TableColumn>
                          )}
                        </TableHeader>
                        <TableBody items={paymentOption}>
                          {(item) => (
                            <TableRow className="text-[#5F6D7E]" key={item?.id}>
                              {(columnKey) => (
                                <TableCell>
                                  {renderCell(
                                    item?.role === "manager"
                                      ? "managerRole"
                                      : "userRole",
                                    item,
                                    columnKey
                                  )}
                                </TableCell>
                              )}
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                      <p className="text-[#5F35D2] px-3 font-[700] text-[13px] ">
                        REPORTS
                      </p>
                      <Table
                        radius="none"
                        shadow="none"
                        removeWrapper={true}
                        classNames={{
                          td: "px-3 py-2 border-y border-y-primaryGrey",
                          table: "p-0 border-none",
                        }}
                        aria-label="Reservation table"
                        hideHeader
                      >
                        <TableHeader columns={columns}>
                          {(column) => (
                            <TableColumn
                              key={column.uid}
                              align={
                                column.uid === "actions" ? "start" : "center"
                              }
                            >
                              {column.name}
                            </TableColumn>
                          )}
                        </TableHeader>
                        <TableBody items={reportOption}>
                          {(item) => (
                            <TableRow className="text-[#5F6D7E]" key={item?.id}>
                              {(columnKey) => (
                                <TableCell>
                                  {renderCell(
                                    item?.role === "manager"
                                      ? "managerRole"
                                      : "userRole",
                                    item,
                                    columnKey
                                  )}
                                </TableCell>
                              )}
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                      <p className="text-[#5F35D2] px-3 font-[700] text-[13px] ">
                        DASHBOARD
                      </p>
                      <Table
                        radius="none"
                        shadow="none"
                        removeWrapper={true}
                        classNames={{
                          td: "px-3 py-2 border-y border-y-primaryGrey",
                          table: "p-0 border-none",
                        }}
                        aria-label="Reservation table"
                        hideHeader
                      >
                        <TableHeader columns={columns}>
                          {(column) => (
                            <TableColumn
                              key={column.uid}
                              align={
                                column.uid === "actions" ? "start" : "center"
                              }
                            >
                              {column.name}
                            </TableColumn>
                          )}
                        </TableHeader>
                        <TableBody items={dashboardOption}>
                          {(item) => (
                            <TableRow className="text-[#5F6D7E]" key={item?.id}>
                              {(columnKey) => (
                                <TableCell>
                                  {renderCell(
                                    item?.role === "manager"
                                      ? "managerRole"
                                      : "userRole",
                                    item,
                                    columnKey
                                  )}
                                </TableCell>
                              )}
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </>
                </ScrollShadow>
              )}
              <Spacer y={4} />
            </ModalBody>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default AssignPermission;
