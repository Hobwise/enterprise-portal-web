"use client";

import React, { useEffect, useState } from "react";

import { CustomInput } from "@/components/CustomInput";
import { CustomButton } from "@/components/customButton";
import Error from "@/components/error";
import CreateOrder from "@/components/ui/dashboard/orders/createOrder";
import OrdersList from "@/components/ui/dashboard/orders/order";
import useOrder from "@/hooks/cachedEndpoints/useOrder";
import usePermission from "@/hooks/cachedEndpoints/usePermission";
import { useGlobalContext } from "@/hooks/globalProvider";
import useDateFilter from "@/hooks/useDateFilter";
import { Chip } from "@nextui-org/react";
import { useRouter } from "next/navigation";
import { IoAddCircleOutline, IoSearchOutline } from "react-icons/io5";
import { CustomLoading } from "@/components/ui/dashboard/CustomLoading";
import DateRangeDisplay from "@/components/ui/dashboard/DateRangeDisplay";

// Type definitions are handled in the component files

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

  const [searchQuery, setSearchQuery] = useState("");
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


      <DateRangeDisplay
        startDate={startDate}
        endDate={endDate}
        filterType={filterType}
      />

      {data.categories && data.categories.length > 0 ? (
        <OrdersList
          orders={details?.data || []}
          categories={data.categories}
          refetch={refetch}
          searchQuery={searchQuery}
          isLoading={isLoading}
          filterType={filterType}
          startDate={startDate}
          endDate={endDate}
        />
      ) : (
        <CreateOrder />
      )}
      {datePickerModal}
    </>
  );
};

export default Orders;