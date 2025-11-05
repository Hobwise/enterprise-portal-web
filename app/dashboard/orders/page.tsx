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
import CustomPagination from "@/components/ui/dashboard/settings/BillingsComponents/CustomPagination";
import { getJsonItemFromLocalStorage, formatPrice } from "@/lib/utils";

// Type definitions are handled in the component files

const OrdersContent: React.FC = () => {
  const router = useRouter();

  const {
    categories,
    details,
    salesSummary,
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
  const { setPage, setTableStatus, page, tableStatus } = useGlobalContext();

  useEffect(() => {
    refetch();
    setTableStatus("All");
    setPage(1);
  }, [filterType, startDate, endDate, refetch]); // Add date dependencies to reset when date changes

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value.toLowerCase());
  };

  // Detect if user is POS user using primaryAssignment
  const userInformation = getJsonItemFromLocalStorage('userInformation');
  const isPOSUser = userInformation?.primaryAssignment === "POS Operator" ||
                    userInformation?.primaryAssignment === "Point of Sales" ||
                    (userInformation?.assignedCategoryId && userInformation?.assignedCategoryId === "POS");

  // Handle create order click with conditional routing
  const handleCreateOrderClick = () => {
    if (isPOSUser) {
      router.push('/pos');
    } else {
      router.push('/dashboard/orders/place-order');
    }
  };

  const data = { categories, details };

  // Extract pagination info from details response
  const paginationData = React.useMemo(() => {
    if (details?.data && typeof details.data === 'object') {
      return {
        currentPage: details.data.currentPage || page,
        totalPages: details.data.totalPages || 1,
        hasNext: details.data.hasNext || false,
        hasPrevious: details.data.hasPrevious || false,
        totalCount: details.data.totalCount || 0,
        orders: details.data.orders || []
      };
    }
    return {
      currentPage: page,
      totalPages: 1,
      hasNext: false,
      hasPrevious: false,
      totalCount: 0,
      orders: []
    };
  }, [details, page]);

  // Pagination handlers
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleNext = () => {
    if (paginationData.hasNext) {
      setPage(page + 1);
    }
  };

  const handlePrevious = () => {
    if (paginationData.hasPrevious) {
      setPage(page - 1);
    }
  };

  // Show loading during initial load (when loading and no data yet)
  // Skip loading for empty state refetches to show illustration immediately
  if (isLoading && categories.length === 0) {
    return <CustomLoading />;
  }
  if (isError) return <Error onClick={() => refetch()} />;

  return (
    <>
      <div className="flex flex-col md:flex-row gap-4 mb-4 xl:mb-8 items-start md:items-center justify-between w-full">
        <div>
          <div className="text-[24px] leading-8 font-semibold">
            {data?.categories.length > 0 ? (
              <div className="flex items-center">
                <span>All orders</span>
           
              </div>
            ) : (
              <span>Orders</span>
            )}
          </div>
          <p className="text-sm  text-grey600  xl:w-[231px]  w-full ">
            Showing all orders
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
          {dropdownComponent}
          {data?.categories.length > 0 && (
            <>
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
            
            </>
          )}
          {(role === 0 || isPOSUser || userRolePermissions?.canCreateOrder === true) && (
            <CustomButton
              onClick={handleCreateOrderClick}
              className="py-2 px-4 mb-0 text-white w-full sm:w-auto"
              backgroundColor="bg-primaryColor"
            >
              <div className="flex gap-2 items-center justify-center">
                <IoAddCircleOutline className="text-[22px]" />
                <p className="hidden sm:inline">Create Order</p>
                <p className="sm:hidden">Create Order</p>
              </div>
            </CustomButton>
          )}
        </div>
      </div>

      {/* Sales Summary - Only for POS Users */}
      {isPOSUser && salesSummary && (
        <div className="rounded-md bg-[#F7F6FA] p-4 md:p-6 mb-6 grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-12">
          <div>
            <div className="text-grey600 text-sm md:text-base mb-1">Total Sales</div>
            <div className="text-lg md:text-xl font-bold text-black">
              ₦{salesSummary.totalSales?.toLocaleString() || '0'}
            </div>
          </div>
          <div>
            <div className="text-grey600 text-sm md:text-base mb-1">Confirmed Sales</div>
            <div className="text-lg md:text-xl font-bold text-black">
              ₦{salesSummary.confirmedSales?.toLocaleString() || '0'}
            </div>
          </div>
          <div>
            <div className="text-grey600 text-sm md:text-base mb-1">Pending Sales</div>
            <div className="text-lg md:text-xl font-bold text-black">
              ₦{salesSummary.pendingSales?.toLocaleString() || '0'}
            </div>
          </div>
          <div>
            <div className="text-grey600 text-sm md:text-base mb-1">Cancelled Sales</div>
            <div className="text-lg md:text-xl font-bold text-black">
              ₦{salesSummary.cancelledSales?.toLocaleString() || '0'}
            </div>
          </div>
        </div>
      )}

      <DateRangeDisplay
        startDate={startDate}
        endDate={endDate}
        filterType={filterType}
      />

      {/* Summary Cards */}
      {data.categories && data.categories.length > 0 && (
        <div className="flex w-full overflow-x-auto p-3 gap-4 mb-6 pb-2 snap-x snap-mandatory ">
          {data.categories.map((category: any) => {
            const currentStatus = tableStatus || 'All Orders';
            const isActive = currentStatus === category.name || (!currentStatus && category.name === 'All');
            return (
              <div
                key={category.name}
                onClick={() => {
                  setTableStatus(category.name);
                  setPage(1);
                }}
                className={`
                  relative rounded-lg p-4 w-auto lg:p-6 cursor-pointer transition-all duration-300
                   lg:min-w-0 flex-shrink-0 lg:flex-shrink snap-center lg:snap-align-none
                  ${isActive
                    ? 'bg-gradient-to-br from-primaryColor to-secondaryColor text-white shadow-lg scale-105'
                    : 'bg-white border border-gray-200 text-gray-900 hover:shadow-md hover:scale-102'
                  }
                `}
              >
                <div className="space-y-1 lg:space-y-2">
                  <h3 className={`text-xs lg:text-sm font-semibold uppercase tracking-wide ${isActive ? 'text-white/90' : 'text-gray-500'}`}>
                    {category.name}
                  </h3>
                  <div className={`text-2xl lg:text-3xl font-bold ${isActive ? 'text-white' : 'text-gray-900'}`}>
                    {formatPrice(category.totalAmount, 'NGN')}
                  </div>
                  <p className={`text-xs lg:text-sm ${isActive ? 'text-white/80' : 'text-gray-500'}`}>
                    {category.count} {category.count === 1 ? 'order' : 'orders'}
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
        <>
          <OrdersList
            orders={paginationData.orders}
            categories={data.categories}
            refetch={refetch}
            searchQuery={searchQuery}
            isLoading={isLoading}
            filterType={filterType}
            startDate={startDate}
            endDate={endDate}
            currentPage={paginationData.currentPage}
            totalPages={paginationData.totalPages}
            hasNext={paginationData.hasNext}
            hasPrevious={paginationData.hasPrevious}
            totalCount={paginationData.totalCount}
          />

          {/* Pagination at page level */}
          {/* {paginationData.totalPages > 1 && (
            <div className="mt-4">
              <CustomPagination
                currentPage={paginationData.currentPage}
                totalPages={paginationData.totalPages}
                onPageChange={handlePageChange}
                onNext={handleNext}
                onPrevious={handlePrevious}
              />
            </div>
          )} */}
        </>
      ) : (
        // <CreateOrder />"
        // ""
        ""
      )}
      {datePickerModal}
    </>
  );
};

const Orders: React.FC = () => {
  return <OrdersContent />;
};

export default Orders;