"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/ui/dashboard/header";
import { CustomInput } from "@/components/CustomInput";
import { CustomButton } from "@/components/customButton";
import Error from "@/components/error";
import CategoryOrdersList from "@/components/ui/business-activities/CategoryOrdersList";
import useCategoryOrders from "@/hooks/cachedEndpoints/useCategoryOrders";
import { useGlobalContext } from "@/hooks/globalProvider";
import useDateFilter from "@/hooks/useDateFilter";
import { Chip } from "@nextui-org/react";
import { IoSearchOutline } from "react-icons/io5";
import { CustomLoading } from "@/components/ui/dashboard/CustomLoading";
import DateRangeDisplay from "@/components/ui/dashboard/DateRangeDisplay";
import { getJsonItemFromLocalStorage, formatPrice } from "@/lib/utils";

const OrderListContent: React.FC = () => {
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
  } = useDateFilter(useCategoryOrders);

  const [searchQuery, setSearchQuery] = useState("");
  const { setPage, setTableStatus, page, tableStatus } = useGlobalContext();

  const userInformation = getJsonItemFromLocalStorage("userInformation");
  const primaryAssignment = userInformation?.primaryAssignment || "";

  useEffect(() => {
    refetch();
    setTableStatus("All Orders");
    setPage(1);
  }, [filterType, startDate, endDate, refetch, setTableStatus, setPage]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const data = { categories, details };

  // Extract pagination info from details response
  const paginationData = React.useMemo(() => {
    console.log("Order List - Details:", details);
    if (details?.data && typeof details.data === "object") {
      return {
        currentPage: details.data.currentPage || page,
        totalPages: details.data.totalPages || 1,
        hasNext: details.data.hasNext || false,
        hasPrevious: details.data.hasPrevious || false,
        totalCount: details.data.totalCount || 0,
        orders: details.data.orders || [],
      };
    }
    return {
      currentPage: page,
      totalPages: 1,
      hasNext: false,
      hasPrevious: false,
      totalCount: 0,
      orders: [],
    };
  }, [details, page]);

  console.log("Order List - Categories:", paginationData);

  // Show loading during initial load
  if (isLoading && categories.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header ispos />
        <CustomLoading />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header ispos />
        <Error onClick={() => refetch()} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header ispos />

      <div className="px-6 py-6">
        {/* Header Section */}
        <div className="flex flex-col text-black md:flex-row gap-4 mb-4 xl:mb-8 items-start md:items-center justify-between w-full">
          <div>
            <div className="text-[24px] leading-8 font-semibold">
              {data?.categories.length > 0 ? (
                <div className="flex items-center">
                  <span>
                    Order List {primaryAssignment && `(${primaryAssignment})`}
                  </span>
                </div>
              ) : (
                <span>
                  Order List {primaryAssignment && `(${primaryAssignment})`}
                </span>
              )}
            </div>
            <p className="text-sm text-grey600 xl:w-[231px] w-full">
              View and manage all orders
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
            {dropdownComponent}
            {data?.categories.length > 0 && (
              <div className="w-full sm:w-auto">
                <CustomInput
                  classnames={"w-full sm:w-[242px]"}
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
            )}
            <CustomButton
              onClick={() => router.push("/business-activities")}
              className="py-2 px-4 mb-0 border border-primaryColor text-primaryColor w-full sm:w-auto"
              backgroundColor="bg-white"
            >
              <div className="flex gap-2 items-center justify-center">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
                <p className="hidden sm:inline">Back to Menu</p>
                <p className="sm:hidden">Back</p>
              </div>
            </CustomButton>
          </div>
        </div>

        <DateRangeDisplay
          startDate={startDate}
          endDate={endDate}
          filterType={filterType}
        />

        {/* Summary Cards */}
        {data.categories && data.categories.length > 0 && (
          <div className="flex lg:grid overflow-x-auto lg:overflow-x-visible lg:grid-cols-4 gap-3 lg:gap-4 mb-6 pb-2 snap-x snap-mandatory lg:snap-none">
            {data.categories.map((category: any) => {
              const isActive =
                tableStatus === category.name ||
                (!tableStatus && category.name === "All Orders");
              return (
                <div
                  key={category.name}
                  onClick={() => {
                    setTableStatus(category.name);
                    setPage(1);
                  }}
                  className={`
                    relative rounded-lg p-4 lg:p-6 cursor-pointer transition-all duration-300
                    min-w-[200px] lg:min-w-0 flex-shrink-0 lg:flex-shrink snap-center lg:snap-align-none
                    ${
                      isActive
                        ? "bg-gradient-to-br from-primaryColor to-secondaryColor text-white shadow-lg scale-105"
                        : "bg-white border border-gray-200 text-gray-900 hover:shadow-md hover:scale-102"
                    }
                  `}
                >
                  <div className="space-y-1 lg:space-y-2">
                    <h3
                      className={`text-xs lg:text-sm font-semibold uppercase tracking-wide ${
                        isActive ? "text-white/90" : "text-gray-500"
                      }`}
                    >
                      {category.name}
                    </h3>
                    <div
                      className={`text-xl lg:text-2xl font-bold ${
                        isActive ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {formatPrice(category.totalAmount, "NGN")}
                    </div>
                    <p
                      className={`text-xs lg:text-sm ${
                        isActive ? "text-white/80" : "text-gray-500"
                      }`}
                    >
                      {category.count}{" "}
                      {category.count === 1 ? "order" : "orders"}
                    </p>
                  </div>
                  {isActive && (
                    <div className="absolute top-2 right-2 w-2 h-2 bg-white rounded-full"></div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {data.categories && data.categories.length > 0 ? (
          <CategoryOrdersList
            orders={paginationData.orders}
            categories={data.categories}
            refetch={refetch}
            searchQuery={searchQuery}
            isLoading={isLoading}
            currentPage={paginationData.currentPage}
            totalPages={paginationData.totalPages}
            hasNext={paginationData.hasNext}
            hasPrevious={paginationData.hasPrevious}
            totalCount={paginationData.totalCount}
          />
        ) : (
          <div className="flex flex-col items-center justify-center py-16 bg-white rounded-lg border border-gray-200">
            <svg
              className="w-16 h-16 text-gray-400 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <p className="text-gray-500 font-medium text-lg">No orders found</p>
            <p className="text-sm text-gray-400 mt-1">
              Orders will appear here when available
            </p>
          </div>
        )}

        {datePickerModal}
      </div>
    </div>
  );
};

const OrderListPage: React.FC = () => {
  return <OrderListContent />;
};

export default OrderListPage;
