"use client";

import React, { useEffect, useState } from "react";

import { dynamicExportConfig, getJsonItemFromLocalStorage } from "@/lib/utils";

import { CustomInput } from "@/components/CustomInput";
import Error from "@/components/error";
import NoPaymentsScreen from "@/components/ui/dashboard/payments/noPayments";
import PaymentsList from "@/components/ui/dashboard/payments/payment";
import usePayment from "@/hooks/cachedEndpoints/usePayment";
import usePermission from "@/hooks/cachedEndpoints/usePermission";
import { useGlobalContext } from "@/hooks/globalProvider";
import useDateFilter from "@/hooks/useDateFilter";
import { Button, ButtonGroup, Chip } from "@nextui-org/react";
import { IoAddCircleOutline, IoSearchOutline } from "react-icons/io5";
import { MdOutlineFileDownload } from "react-icons/md";
import { exportGrid } from "@/app/api/controllers/dashboard/menu";
import toast from "react-hot-toast";
import { VscLoading } from "react-icons/vsc";
import { CustomLoading } from "@/components/ui/dashboard/CustomLoading";
import { CustomButton } from "@/components/customButton";
import DateRangeDisplay from "@/components/ui/dashboard/DateRangeDisplay";

const Payments: React.FC = () => {
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
  } = useDateFilter(usePayment);
  const { userRolePermissions, role } = usePermission();
  const businessInformation = getJsonItemFromLocalStorage("business");

  const [searchQuery, setSearchQuery] = useState("");
  const [loadingExport, setLoadingExport] = useState(false);
  const { setPage, setTableStatus } = useGlobalContext();

  useEffect(() => {
    refetch();
    setTableStatus("All");
    setPage(1);
  }, [filterType, startDate, endDate, refetch]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value.toLowerCase());
  };

  const data = { categories, details };

  const exportCSV = async () => {
    setLoadingExport(true);
    const response = await exportGrid(
      businessInformation[0]?.businessId,
      5, // 5 for payments
      filterType
    );
    setLoadingExport(false);

    if (response?.status === 200) {
      dynamicExportConfig(
        response,
        `Payments-${businessInformation[0]?.businessName}`
      );
      toast.success("Payments downloaded successfully");
    } else {
      toast.error("Export failed, please try again");
    }
  };

  if (isLoading) return <CustomLoading />;
  if (isError) return <Error onClick={() => refetch()} />;

  // Payment summary values (adjust keys if needed)


  return (
    <>
      {/* Payment Summary Card */}

      {/* Existing filters/search UI */}
      <div className="flex flex-row flex-wrap mb-4 xl:mb-8 items-center justify-between">
        <div>
          <div className="text-[24px] leading-8 font-semibold">
            {data?.categories.data.categoryCount > 0 ? (
              <div className="flex items-center">
                <span> Payments</span>
                <Chip
                  classNames={{
                    base: ` ml-2 text-xs h-7 font-[600] w-5 bg-[#EAE5FF] text-primaryColor`,
                  }}
                >
                  {data?.categories.data.categoryCount}
                </Chip>
              </div>
            ) : (
              <span>Payments</span>
            )}
          </div>
          <p className="text-sm  text-grey600  xl:w-[231px] w-full ">
            Showing all payments
          </p>
        </div>
        <div className="flex items-center gap-3">
          {dropdownComponent}
          {data?.categories.data.paymentCategories.length > 0 && (
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
        </div>
      </div>
          <div className=" rounded-md bg-[#F7F6FA] p-6 mb-6 flex flex-row gap-12 items-center">
            {
              data?.categories.data.paymentCategories.map((item:any, idx:any) => (
            <div className="flex-1" key={idx}>
              <div className="text-grey600 text-lg mb-1">{item.name}</div>
              <div className="text-3xl font-bold text-black">
                ₦{item.totalAmount.toLocaleString()}
              </div>
            </div>

              ))
            }
        
          </div>

      <DateRangeDisplay 
        startDate={startDate}
        endDate={endDate}
        filterType={filterType}
      />

      {data?.categories.data.paymentCategories &&
      data?.categories.data.paymentCategories.length > 0 ? (
        <PaymentsList
          payments={data.details.data || []}
          categories={data?.categories.data.paymentCategories}
          refetch={refetch}
          searchQuery={searchQuery}
          isLoading={isLoading}
        />
      ) : (
        <NoPaymentsScreen />
      )}
      {datePickerModal}
    </>
  );
};

export default Payments;