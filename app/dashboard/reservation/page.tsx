"use client";

import React, { useEffect, useMemo, useState } from "react";

import { CustomInput } from "@/components/CustomInput";
import { CustomButton } from "@/components/customButton";
import {
  Button,
  ButtonGroup,
  Chip,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@nextui-org/react";
import { useRouter } from "next/navigation";
import { IoAddCircleOutline, IoSearchOutline } from "react-icons/io5";

import Error from "@/components/error";
import CreateReservation from "@/components/ui/dashboard/reservations/createReservations";
import ReservationList from "@/components/ui/dashboard/reservations/reservation";
import usePermission from "@/hooks/cachedEndpoints/usePermission";
import useReservation, { ReservationData } from "@/hooks/cachedEndpoints/useReservation";
import { useGlobalContext } from "@/hooks/globalProvider";
import useTextCopy from "@/hooks/useTextCopy";
import { companyInfo } from "@/lib/companyInfo";
import {
  dynamicExportConfig,
  getJsonItemFromLocalStorage,
} from "@/lib/utils";
import { generateShortReservationUrlBrowser } from "@/lib/urlShortener";
import { VscCopy, VscLoading } from "react-icons/vsc";
import { MdOutlineFileDownload } from "react-icons/md";
import toast from "react-hot-toast";
import { exportGrid } from "@/app/api/controllers/dashboard/menu";
import { CustomLoading } from "@/components/ui/dashboard/CustomLoading";

// Define TypeScript interfaces for the data structures
interface ReservationItem {
  reservationName: string;
  reservationFee: number;
  minimumSpend: number;
  quantity: number;
  reservationDescription: string;
  [key: string]: any;
}



interface BusinessInfo {
  businessName: string;
  businessId: string;
  [key: string]: any;
}

interface UserInfo {
  cooperateID: string;
  [key: string]: any;
}

const Reservation: React.FC = () => {
  const router = useRouter();

  const { userRolePermissions, role } = usePermission();

  const business = getJsonItemFromLocalStorage("business") as BusinessInfo[];
  const userInformation = getJsonItemFromLocalStorage("userInformation") as UserInfo;
  const { data, isLoading, isError, refetch } = useReservation<ReservationData>();

  const [loadingExport, setLoadingExport] = useState<boolean>(false);

  const { setPage, setTableStatus } = useGlobalContext();

  useEffect(() => {
    refetch();
    setTableStatus("All");
    setPage(1);
  }, [setTableStatus, setPage]);

  const [searchQuery, setSearchQuery] = useState<string>("");

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value.toLowerCase());
  };

  const filteredItems = useMemo(() => {
    if (!data?.reservations) return [] as ReservationItem[];
    
    return data.reservations
      .filter(
        (item) =>
          item?.reservationName?.toLowerCase().includes(searchQuery) ||
          String(item?.reservationFee)?.toLowerCase().includes(searchQuery) ||
          String(item?.minimumSpend)?.toLowerCase().includes(searchQuery) ||
          String(item?.quantity)?.toLowerCase().includes(searchQuery) ||
          item?.reservationDescription?.toLowerCase().includes(searchQuery)
      )
      .filter((item) => Object.keys(item).length > 0);
  }, [data, searchQuery]);

  // Generate shortened URL for all reservations
  const shortReservationUrl = useMemo(() => {
    if (!business?.[0]?.businessId) return "";

    return generateShortReservationUrlBrowser(
      typeof window !== 'undefined' ? window.location.origin : companyInfo.webUrl,
      {
        businessId: business[0]?.businessId,
        cooperateID: userInformation?.cooperateID,
        businessName: business[0]?.businessName,
      }
    );
  }, [business, userInformation]);

  const { handleCopyClick, isOpen, setIsOpen } = useTextCopy(shortReservationUrl);

  const exportCSV = async (): Promise<void> => {
    setLoadingExport(true);
    const response = await exportGrid(business[0]?.businessId, 4);
    setLoadingExport(false);

    if (response?.status === 200) {
      dynamicExportConfig(
        response,
        `Reservations-${business[0]?.businessName}`
      );
      toast.success("Reservations downloaded successfully");
    } else {
      toast.error("Export failed, please try again");
    }
  };

  // Handle loading state
  if (isLoading) return <CustomLoading />;
  // Handle error state or undefined data
  if (isError || !data) return <Error onClick={() => refetch()} />;

  // Check if reservations array exists and has items
  const hasReservations = Array.isArray(data.reservations) && data.reservations.length > 0;

  return (
    <>
      <div className="flex flex-row flex-wrap xl:mb-8 mb-4 justify-between">
        <div>
          <div className="text-[24px] leading-8 font-semibold">
            <div className="flex items-center">
              <span>Reservation</span>
            </div>
          </div>
          <p className="text-sm  text-grey600  xl:w-[231px] w-full ">
            Showing all Reservations
          </p>
        </div>
        <div className="flex items-center gap-3">
          {hasReservations && (
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
              <ButtonGroup className="border-2 border-primaryGrey divide-x-2 divide-primaryGrey rounded-xl">
                <Button
                  disabled={loadingExport}
                  onClick={exportCSV}
                  className="flex text-grey600 bg-white"
                  title="Export"
                  aria-label="Export"
                >
                  {loadingExport ? (
                    <VscLoading className="animate-spin" />
                  ) : (
                    <MdOutlineFileDownload className="text-[22px]" />
                  )}
                </Button>
                <Popover
                  showArrow={true}
                  isOpen={isOpen}
                  onOpenChange={(open) => setIsOpen(open)}
                >
                  <PopoverTrigger>
                    <Button
                      onClick={handleCopyClick}
                      className="flex text-grey600 bg-white"
                    >
                      <VscCopy />
                      <p>Copy link</p>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent>
                    <div className="text-small text-black">
                      Reservation url copied!
                    </div>
                  </PopoverContent>
                </Popover>
              </ButtonGroup>
            </>
          )}

          {(role === 0 ||
            userRolePermissions?.canCreateReservation === true) && (
            <>
              {hasReservations && (
                <CustomButton
                  onClick={() =>
                    router.push("/dashboard/reservation/create-reservation")
                  }
                  className="py-2 px-4 md:mb-0 mb-4 text-white"
                  backgroundColor="bg-primaryColor"
                >
                  <div className="flex gap-2 items-center justify-center">
                    <IoAddCircleOutline className="text-[22px]" />

                    <p>Add reservation</p>
                  </div>
                </CustomButton>
              )}
            </>
          )}
        </div>
      </div>
      {hasReservations ? (
        <ReservationList
          data={data}
          reservation={filteredItems}
          searchQuery={searchQuery}
          refetch={refetch}
        />
      ) : (
        <CreateReservation />
      )}
    </>
  );
};

export default Reservation;