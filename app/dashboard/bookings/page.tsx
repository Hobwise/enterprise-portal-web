"use client";

import React, { useEffect, useMemo, useState } from "react";

import {
  dynamicExportConfig,
  getJsonItemFromLocalStorage,
  notify,
} from "@/lib/utils";

import { postBookingStatus } from "@/app/api/controllers/dashboard/bookings";
import { CustomInput } from "@/components/CustomInput";
import { CustomButton } from "@/components/customButton";
import Error from "@/components/error";
import BookingDetails from "@/components/ui/dashboard/bookings/bookingDetails";
import BookingsList from "@/components/ui/dashboard/bookings/bookingList";
import ConfirmBooking from "@/components/ui/dashboard/bookings/confirmBooking";
import CreateBooking from "@/components/ui/dashboard/bookings/createBooking";
import CreateReservation from "@/components/ui/dashboard/bookings/createReservation";
import SuccessModal from "@/components/ui/dashboard/bookings/successModal";
import useAllBookingsData from "@/hooks/cachedEndpoints/useAllBookingsData";
import usePermission from "@/hooks/cachedEndpoints/usePermission";
import { useGlobalContext } from "@/hooks/globalProvider";
import { downloadCSV } from "@/lib/downloadToExcel";
import { Button, ButtonGroup, Chip, useDisclosure } from "@nextui-org/react";
import { IoAddCircleOutline, IoSearchOutline } from "react-icons/io5";
import { MdOutlineFileDownload } from "react-icons/md";
import { VscLoading } from "react-icons/vsc";
import { exportGrid } from "@/app/api/controllers/dashboard/menu";
import toast from "react-hot-toast";
import { CustomLoading } from "@/components/ui/dashboard/CustomLoading";

const Bookings: React.FC = () => {
  const businessInformation = getJsonItemFromLocalStorage("business");

  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const { userRolePermissions, role } = usePermission();
  const [searchQuery, setSearchQuery] = useState("");
  const [loadingExport, setLoadingExport] = useState(false);
  const [openCreateBookingModal, setOpenCreateBookingModal] = useState(false);
  const [openSuccessModal, setOpenSuccessModal] = useState(false);

  const showCreateBookingModal = () => {
    setOpenCreateBookingModal(true);
  };
  const closeCreateBookingModal = () => {
    setOpenCreateBookingModal(false);
  };
  const showSuccessModal = () => {
    setOpenSuccessModal(true);
  };
  const closeSuccessModal = () => {
    setOpenSuccessModal(false);
  };

  const {
    page,
    rowsPerPage,
    tableStatus,
    setPage,
    setTableStatus,
    bookingDetails,
    isBookingDetailsModalOpen,
    openBookingDetailsModal,
    closeBookingDetailsModal,
    setBookingDetails,
  } = useGlobalContext();

  const {
    categories,
    getCategoryDetails,
    isLoadingInitial,
    isError,
    refetch,
  } = useAllBookingsData(page, rowsPerPage);

  useEffect(() => {
    setTableStatus("All Bookings");
    setPage(1);
  }, [setTableStatus, setPage]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value.toLowerCase());
  };

  const currentCategoryName =
    tableStatus || categories?.[0]?.name || "All Bookings";
  const currentCategoryDetails = getCategoryDetails(currentCategoryName);
  const categoryPayload = useMemo(
    () => ({
      bookingCategories: categories || [],
    }),
    [categories]
  );

  const data = {
    categories: categoryPayload,
    details: currentCategoryDetails,
  };

  const [bookingId, setBookingId] = useState("");
  const [loading, setLoading] = useState(false);
  const [completedBooking, setCompletedBooking] = useState<any>(null);

  const updateBookingStatus = async (
    id: number,
    checkingLoading: boolean = true
  ) => {
    setLoading(checkingLoading);
    const response = await postBookingStatus(bookingDetails?.id, id);
    setLoading(false);
    if (response?.data?.isSuccessful) {
      notify({
        title: "Success!",
        text: "Operation successful",
        type: "success",
      });
      refetch();
      setBookingId("");
      closeBookingDetailsModal();
    } else {
      notify({
        title: "Error!",
        text: response?.response?.data?.error?.responseDescription,
        type: "error",
      });
    }
  };

  const exportCSV = async () => {
    setLoadingExport(true);
    const response = await exportGrid(businessInformation[0]?.businessId, 6);
    setLoadingExport(false);

    if (response?.status === 200) {
      dynamicExportConfig(
        response,
        `Bookings-${businessInformation[0]?.businessName}`
      );
      toast.success("Bookings downloaded successfully");
    } else {
      toast.error("Export failed, please try again");
    }
  };

  if (isLoadingInitial) return <CustomLoading />;

  if (isError) return <Error onClick={() => refetch()} />;

  return (
    <>
      <div className="flex flex-row flex-wrap mb-4 xl:mb-8 item-center justify-between">
        <div>
          <div className="text-[24px] leading-8 font-semibold">
            {data?.categories.bookingCategories.length > 0 ? (
              <div className="flex items-center">
                <span> Bookings</span>
              </div>
            ) : (
              <span>Bookings</span>
            )}
          </div>
          <p className="text-sm  text-grey600  xl:w-[231px] w-full ">
          Create and Manage Your Bookings
          </p>
        </div>
        <div className="flex items-center gap-3">
          {data?.categories.bookingCategories.length > 0 && (
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

              <div className="flex items-center gap-2">
                <Button
                  disabled={loadingExport}
                  onClick={exportCSV}
                  className="flex  text-grey600 bg-white border rounded-lg"
                >
                  Export
                  {loadingExport ? (
                    <VscLoading className="animate-spin" />
                  ) : (
                    <MdOutlineFileDownload className="text-[22px]" />
                  )}
                </Button>
                
                {(role === 0 || userRolePermissions?.canEditOrder === true) && (
                  <Button onClick={onOpen} className="flex  text-primaryColor border-primaryColor bg-white border rounded-lg">
                  
  
                    <p>Admit booking</p>
                  </Button>
                )}
                {(role === 0 ||
                  userRolePermissions?.canCreateOrder === true) && (
                  <CustomButton
                    onClick={showCreateBookingModal}
                    className="flex text-white"
                  >
                      <IoAddCircleOutline className="text-[22px]" />
                    <p>Create a booking</p>
                  </CustomButton>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {data.categories.bookingCategories &&
      data.categories?.bookingCategories?.length > 0 ? (
        <BookingsList
          bookings={data.details || []}
          categories={data.categories}
          refetch={refetch}
          searchQuery={searchQuery}
          isLoading={isLoadingInitial}
          isLoadingInitial={isLoadingInitial}
          getCategoryDetails={getCategoryDetails}
        />
      ) : (
        <CreateReservation showCreateBookingModal={showCreateBookingModal} />
      )}
      <CreateBooking
        openCreateBookingModal={openCreateBookingModal}
        closeCreateBookingModal={closeCreateBookingModal}
        showSuccessModal={showSuccessModal}
        refetch={refetch}
        setCompletedBooking={setCompletedBooking}
      />

      <ConfirmBooking
        isOpen={isOpen}
        bookingId={bookingId}
        setBookingId={setBookingId}
        onOpenChange={onOpenChange}
        showBookingModal={openBookingDetailsModal}
        setBookingDetails={setBookingDetails}
      />
      <BookingDetails
        setBookingId={setBookingId}
        openBookingModal={isBookingDetailsModalOpen}
        setOpenBookingModal={closeBookingDetailsModal}
        showBookingModal={openBookingDetailsModal}
        closeBookingModal={closeBookingDetailsModal}
        updateBookingStatus={updateBookingStatus}
        isLoading={loading}
        bookingDetails={bookingDetails}
      />
      <SuccessModal
        bookingDetails={completedBooking}
        showCreateBookingModal={showCreateBookingModal}
        openSuccessModal={openSuccessModal}
        showSuccessModal={showSuccessModal}
        closeSuccessModal={closeSuccessModal}
      />
    </>
  );
};

export default Bookings;
