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
import useBookings from "@/hooks/cachedEndpoints/useBookings";
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
  const { categories, details, isLoading, isError, refetch } = useBookings();
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
    setPage,
    setTableStatus,
    bookingDetails,
    isBookingDetailsModalOpen,
    openBookingDetailsModal,
    closeBookingDetailsModal,
    setBookingDetails,
  } = useGlobalContext();

  useEffect(() => {
    refetch();
    setTableStatus("All Bookings");
    setPage(1);
  }, [refetch]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value.toLowerCase());
  };

  const data = { categories, details };

  const [bookingId, setBookingId] = useState("");
  const [loading, setLoading] = useState(false);
  const [completedBooking, setCompletedBooking] = useState<any>(null);

  const updateBookingStatus = async (
    id: number,
    checkingLoading: boolean = true
  ) => {
    setLoading(checkingLoading);
    const data = await postBookingStatus(bookingDetails?.id, id);
    setLoading(false);
    if (data?.data?.isSuccessful) {
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
        text: data?.response?.data?.error?.responseDescription,
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

  if (isLoading) return <CustomLoading />;

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
            Showing all bookings
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

              <ButtonGroup className="border-2 border-primaryGrey divide-x-2 divide-primaryGrey rounded-lg">
                <Button
                  disabled={loadingExport}
                  onClick={exportCSV}
                  className="flex text-grey600 bg-white"
                  title="Export"
                  aria-label="Export"
                >
                  Export
                  {loadingExport ? (
                    <VscLoading className="animate-spin" />
                  ) : (
                    <MdOutlineFileDownload className="text-[22px]" />
                  )}
                </Button>
                {(role === 0 ||
                  userRolePermissions?.canCreateOrder === true) && (
                  <Button
                    onClick={showCreateBookingModal}
                    className="flex text-grey600 bg-white"
                  >
                    <p>Create a booking</p>
                  </Button>
                )}
              </ButtonGroup>
              {(role === 0 || userRolePermissions?.canEditOrder === true) && (
                <CustomButton onClick={onOpen} className="flex text-white">
                  <IoAddCircleOutline className="text-[22px]" />

                  <p>Admit booking</p>
                </CustomButton>
              )}
            </>
          )}
        </div>
      </div>

      {data.categories.bookingCategories &&
      data.categories?.bookingCategories?.length > 0 ? (
        <BookingsList
          bookings={details?.data || []}
          categories={data.categories}
          refetch={refetch}
          searchQuery={searchQuery}
          isLoading={isLoading}
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
