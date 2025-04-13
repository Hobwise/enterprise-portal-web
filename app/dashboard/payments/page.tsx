"use client";

import React, { useEffect, useMemo, useState } from "react";

import {
  CustomLoading,
  dynamicExportConfig,
  getJsonItemFromLocalStorage,
} from "@/lib/utils";

import { CustomInput } from "@/components/CustomInput";
import Error from "@/components/error";
import NoPaymentsScreen from "@/components/ui/dashboard/payments/noPayments";
import PaymentsList from "@/components/ui/dashboard/payments/payment";
import usePayment from "@/hooks/cachedEndpoints/usePayment";
import { useGlobalContext } from "@/hooks/globalProvider";
import useDateFilter from "@/hooks/useDateFilter";
import { downloadCSV } from "@/lib/downloadToExcel";
import { Button, ButtonGroup, Chip } from "@nextui-org/react";
import { IoSearchOutline } from "react-icons/io5";
import { MdOutlineFileDownload } from "react-icons/md";
import { exportGrid } from "@/app/api/controllers/dashboard/menu";
import toast from "react-hot-toast";
import { VscLoading } from "react-icons/vsc";

const Payments: React.FC = () => {
  const {
    data,
    isLoading,
    isError,
    refetch,
    dropdownComponent,
    datePickerModal,
    filterType,
  } = useDateFilter(usePayment);
  const businessInformation = getJsonItemFromLocalStorage("business");

  const [searchQuery, setSearchQuery] = useState("");
  const [loadingExport, setLoadingExport] = useState(false);
  const { setPage, setTableStatus } = useGlobalContext();

  useEffect(() => {
    refetch()
    setTableStatus("All");
    setPage(1);
  }, []);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value.toLowerCase());
  };

  const filteredItems = useMemo(() => {
    return data?.paymentComposites?.map((item) => ({
      ...item,
      orders: item?.payments?.filter(
        (item) =>
          item?.qrName?.toLowerCase().includes(searchQuery) ||
          String(item?.totalAmount)?.toLowerCase().includes(searchQuery) ||
          item?.dateCreated?.toLowerCase().includes(searchQuery) ||
          item?.reference?.toLowerCase().includes(searchQuery) ||
          item?.treatedBy?.toLowerCase().includes(searchQuery) ||
          item?.paymentReference?.toLowerCase().includes(searchQuery) ||
          item?.customer?.toLowerCase().includes(searchQuery)
      ),
    }));
  }, [data?.paymentComposites, searchQuery]);

  const exportCSV = async () => {
    setLoadingExport(true);
    const response = await exportGrid(
      businessInformation[0]?.businessId,
      5,
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

  return (
    <>
      <div className="flex flex-row flex-wrap  xl:mb-8 mb-4 items-center justify-between">
        <div>
          <div className="text-[24px] leading-8 font-semibold">
            {data?.paymentComposites?.[0]?.payments.length > 0 ? (
              <div className="flex items-center">
                <span>All Payment</span>
                <Chip
                  classNames={{
                    base: ` ml-2 text-xs h-7 font-[600] w-5 bg-[#EAE5FF] text-primaryColor`,
                  }}
                >
                  {data?.paymentComposites[0]?.totalCount}
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
        <div className="flex  gap-3">
          {dropdownComponent}
          {data?.paymentComposites?.[0]?.payments.length > 0 && (
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

      {data?.paymentComposites[0]?.payments.length > 0 ? (
        <PaymentsList
          data={data}
          isLoading={isLoading}
          payments={filteredItems}
          refetch={refetch}
          searchQuery={searchQuery}
        />
      ) : (
        <NoPaymentsScreen />
      )}
      {datePickerModal}
    </>
  );
};

export default Payments;
