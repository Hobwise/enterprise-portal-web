"use client";

import React, { useEffect, useMemo, useState } from "react";

import { dynamicExportConfig, getJsonItemFromLocalStorage } from "@/lib/utils";
import { CustomInput } from "@/components/CustomInput";
import { CustomButton } from "@/components/customButton";
import Error from "@/components/error";
import CreateOrder from "@/components/ui/dashboard/orders/createOrder";
import OrdersList from "@/components/ui/dashboard/orders/order";
import useOrder from "@/hooks/cachedEndpoints/useOrder";
import usePermission from "@/hooks/cachedEndpoints/usePermission";
import { useGlobalContext } from "@/hooks/globalProvider";
import useDateFilter from "@/hooks/useDateFilter";
import { downloadCSV } from "@/lib/downloadToExcel";
import { Button, ButtonGroup, Chip } from "@nextui-org/react";
import { useRouter } from "next/navigation";
import { IoAddCircleOutline, IoSearchOutline } from "react-icons/io5";
import { MdOutlineFileDownload } from "react-icons/md";
import toast from "react-hot-toast";
import { exportGrid } from "@/app/api/controllers/dashboard/menu";
import { VscLoading } from "react-icons/vsc";
import { CustomLoading } from "@/components/ui/dashboard/CustomLoading";

// Type definitions
interface OrderItem {
  id: string;
  placedByName: string;
  placedByPhoneNumber: string;
  reference: string;
  treatedBy: string;
  totalAmount: number;
  qrReference: string;
  paymentMethod: number;
  paymentReference: string;
  status: 0 | 1 | 2 | 3;
  dateCreated: string;
  comment?: string;
}

const Orders: React.FC = () => {
  const router = useRouter();

  const {
    categories,
    details,
    isLoading,
    isError,
    refetch,
    dropdownComponent,
    datePickerModal,
    filterType,
    startDate,
    endDate,
  } = useDateFilter(useOrder);
  const { userRolePermissions, role } = usePermission();
  const businessInformation = getJsonItemFromLocalStorage("business");

  const [searchQuery, setSearchQuery] = useState("");
  const [loadingExport, setLoadingExport] = useState(false);
  const { setPage, setTableStatus } = useGlobalContext();

  useEffect(() => {
    refetch();
    setTableStatus("All");
    setPage(1);
  }, [filterType, startDate, endDate, refetch]); // Add date dependencies to reset when date changes

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value.toLowerCase());
  };
  const data = { categories, details };


  const exportCSV = async () => {
    setLoadingExport(true);
    const response = await exportGrid(
      businessInformation[0]?.businessId,
      1,
      filterType
    );
    setLoadingExport(false);

    if (response?.status === 200) {
      dynamicExportConfig(
        response,
        `Orders-${businessInformation[0]?.businessName}`
      );
      toast.success("Orders downloaded successfully");
    } else {
      toast.error("Export failed, please try again");
    }
  };

  if (isLoading) return <CustomLoading />;
  if (isError) return <Error onClick={() => refetch()} />;

  return (
    <>
      <div className="flex flex-row flex-wrap mb-4 xl:mb-8 items-center justify-between">
        <div>
          <div className="text-[24px] leading-8 font-semibold">
            {data?.categories.length > 0 ? (
              <div className="flex items-center">
                <span>All orders</span>
                <Chip
                  classNames={{
                    base: ` ml-2 text-xs h-7 font-[600] w-5 bg-[#EAE5FF] text-primaryColor`,
                  }}
                >
                  {data?.categories.length}
                </Chip>
              </div>
            ) : (
              <span>Orders</span>
            )}
          </div>
          <p className="text-sm  text-grey600  xl:w-[231px]  w-full ">
            Showing all orders
          </p>
        </div>
        <div className="flex items-center gap-3">
          {dropdownComponent}
          {data?.categories.length > 0 && (
            <>
              <div>
                <CustomInput
                  classnames={"w-[242px]"}
                  label=""
                  size="md"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  isRequired={false}
                  startContent={<IoSearchOutline />}
                  type="text"
                  placeholder="Search here..."
                />
              </div>
              <ButtonGroup className="border-2 border-primaryGrey divide-x-2 divide-primaryGrey rounded-lg">
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
              </ButtonGroup>
            </>
          )}
          {(role === 0 || userRolePermissions?.canCreateOrder === true) && (
            <CustomButton
              onClick={() => router.push("/dashboard/orders/place-order")}
              className="py-2 px-4 mb-0 text-white"
              backgroundColor="bg-primaryColor"
            >
              <div className="flex gap-2 items-center justify-center">
                <IoAddCircleOutline className="text-[22px]" />
                <p>{"Create order"} </p>
              </div>
            </CustomButton>
          )}
        </div>
      </div>
      {data.categories && data.categories.length > 0 ? (
        <OrdersList
          orders={details?.data || []}
          categories={data.categories}
          refetch={refetch}
          searchQuery={searchQuery}
        />
      ) : (
        <CreateOrder />
      )}
      {datePickerModal}
    </>
  );
};

export default Orders;
