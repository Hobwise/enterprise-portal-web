"use client";

import Error from "@/components/error";
import usePermission from "@/hooks/cachedEndpoints/usePermission";
import useSingleReservation from "@/hooks/cachedEndpoints/useSingleReservation";
import { useGlobalContext } from "@/hooks/globalProvider";
import useTextCopy from "@/hooks/useTextCopy";
import { companyInfo } from "@/lib/companyInfo";
import {
  formatPrice,
  getJsonItemFromLocalStorage,
} from "@/lib/utils";
import { generateShortSingleReservationUrlBrowser } from "@/lib/urlShortener";
import { CustomLoading } from "@/components/ui/dashboard/CustomLoading";
import {
  Button,
  ButtonGroup,
  Chip,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Spacer,
} from "@nextui-org/react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import { FaEdit } from "react-icons/fa";
import { IoIosArrowRoundBack } from "react-icons/io";
import { RiDeleteBin6Line } from "react-icons/ri";
import { VscCopy } from "react-icons/vsc";
import noImage from "../../../../public/assets/images/no-image.svg";
import Booking from "./booking";
import DeleteReservation from "./deleteReservation";
import EditReservation from "./editReservation";

const ReservationDetails = () => {
  const searchParams = useSearchParams();
  const business = getJsonItemFromLocalStorage("business");

  const { userRolePermissions, role } = usePermission();

  const userInformation = getJsonItemFromLocalStorage("userInformation");
  const [isOpenDelete, setIsOpenDelete] = useState(false);
  const [isOpenEdit, setIsOpenEdit] = useState(false);
  const reservationId = searchParams.get("reservationId") || null;

  const { data, isLoading, isError, refetch } =
    useSingleReservation(reservationId);

  const { setPage, setTableStatus } = useGlobalContext();

  useEffect(() => {
    setTableStatus("All");
    setPage(1);
  }, []);

  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      // Prevent going back by pushing the same state
      history.pushState(null, "", location.href);
    };

    history.pushState(null, "", location.href);
    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  const toggleModalDelete = () => {
    setIsOpenDelete(!isOpenDelete);
  };
  const toggleModalEdit = () => {
    setIsOpenEdit(!isOpenEdit);
  };

  if (isError) {
    return <Error onClick={() => refetch()} />;
  }

  // Generate shortened URL for single reservation
  const shortReservationUrl = useMemo(() => {
    if (!reservationId) return "";

    return generateShortSingleReservationUrlBrowser(
      typeof window !== "undefined"
        ? window.location.origin
        : companyInfo.webUrl,
      {
        reservationId: reservationId,
      }
    );
  }, [reservationId]);

  const { handleCopyClick, isOpen, setIsOpen } =
    useTextCopy(shortReservationUrl);

  const formatTimeWithAMPM = (time: string | null | undefined): string => {
    // Return a placeholder if time is null or undefined
    if (!time) return "N/A";

    const [hours, minutes] = time.split(":").map(Number);
    const period = hours >= 12 ? "PM" : "AM";
    const formattedHours = hours % 12 || 12; // Convert 0 to 12 for 12-hour format
    return `${formattedHours}:${minutes.toString().padStart(2, "0")} ${period}`;
  };

  return (
    <>
      <div className="lg:flex block justify-between">
        <Link
          prefetch={true}
          href={"/dashboard/reservation"}
          className={`cursor-pointer text-primaryColor flex gap-2  lg:mb-0 mb-2 text-sm items-center`}
        >
          <IoIosArrowRoundBack className="text-[22px]" />
          <span className="text-sm">Back to reservations</span>
        </Link>
        <div className="gap-6 lg:flex block">
          <ButtonGroup className="border-2 border-primaryGrey divide-x-2 divide-primaryGrey rounded-lg">
            {(role === 0 ||
              userRolePermissions?.canEditReservation === true) && (
              <Button
                onClick={toggleModalEdit}
                className="flex text-grey600 bg-white"
              >
                <FaEdit className="text-[18px]" />
                <p>Edit</p>
              </Button>
            )}

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
            {(role === 0 ||
              userRolePermissions?.canDeleteReservation === true) && (
              <Button
                onClick={toggleModalDelete}
                className="flex text-grey600 bg-white"
              >
                <RiDeleteBin6Line className="text-[18px]" />
                <p>Delete</p>
              </Button>
            )}
          </ButtonGroup>
        </div>
      </div>
      <Spacer y={5} />
      {isLoading ? (
        <CustomLoading />
      ) : (
        <section className="flex flex-col flex-grow">
          <div className="flex lg:flex-row flex-col gap-3 ">
            <div>
              <Image
                src={
                  data?.image
                    ? `data:image/jpeg;base64,${data?.image}`
                    : noImage
                }
                width={60}
                height={60}
                style={{
                  objectFit: data?.image ? "cover" : "contain",
                }}
                className={"bg-cover border  h-[150px] rounded-lg w-[159px]"}
                aria-label="reservation image"
                alt="reservation image"
              />
            </div>
            <div className="space-y-2 lg:w-[900px] w-full">
              <h2 className="text-black font-[600]  text-[28px]">
                {data?.reservationName}
              </h2>
              {/* <div className="text-[#3D424A] text-[14px] font-[400] gap-2 flex">
                <p>{data?.reservationDescription} </p>{" "}
                <Chip
                  classNames={{
                    base: ` text-xs h-6 capitalize font-[700] w-5 bg-[#EAE5FF] text-primaryColor`,
                  }}
                  size="sm"
                >
                  {data?.quantityLeft} remaining
                </Chip>
              </div> */}

              <div className="flex gap-2 flex-col  text-[14px] font-[400]">
                <p className="text-[#828282]">{data?.reservationDescription}</p>
              </div>
              <div>
                {data?.allowSystemAdvert && (
                  <Chip
                    classNames={{
                      base: ` text-xs text-black bg-success-200`,
                    }}
                    size="sm"
                  >
                    Advertisement enabled
                  </Chip>
                )}
              </div>
              <div className="flex w-full lg:gap-3 gap-0 lg:flex-row flex-col">
                <div className="flex gap-2 flex-col  text-[14px] font-[400]">
                  <p className="text-[#828282]">Reservation Fee:</p>
                  <p className="text-[#3D424A] font-bold">
                    {data?.reservationFee
                      ? formatPrice(data?.reservationFee)
                      : formatPrice(0)}
                  </p>
                </div>
                <div className="flex gap-2 flex-col  text-[14px] font-[400]">
                  <p className="text-[#828282]">Minimum Spend:</p>
                  <p className="text-[#3D424A] font-bold">
                    {data?.minimumSpend
                      ? formatPrice(data?.minimumSpend)
                      : formatPrice(0)}
                  </p>
                </div>
                <div className="flex gap-2 flex-col  text-[14px] font-[400]">
                  <p className="text-[#828282]">Available Booking Time:</p>
                  <p className="text-[#3D424A] font-bold">
                    {data?.startTime && data?.endTime
                      ? `${formatTimeWithAMPM(
                          data?.startTime
                        )} - ${formatTimeWithAMPM(data?.endTime)}`
                      : "Time not available"}{" "}
                  </p>
                </div>
                <div className="flex gap-2 flex-col  text-[14px] font-[400]">
                  <p className="text-[#828282]">Number of seats:</p>
                  <p className="text-[#3D424A] font-bold">
                    {data?.numberOfSeat}
                  </p>
                </div>
                <div className="flex gap-2 flex-col  text-[14px] font-[400]">
                  <p className="text-[#828282]">Quantity</p>
                  <p className="text-[#3D424A] font-bold">{data?.quantity}</p>
                </div>
              </div>
            </div>
          </div>
          <Spacer y={5} />
          <Booking
            isLoading={isLoading}
            isError={isError}
            reservationItem={data}
            getSingleReservation={refetch}
          />
        </section>
      )}
      <DeleteReservation
        reservationItem={data}
        isOpenDelete={isOpenDelete}
        toggleModalDelete={toggleModalDelete}
      />
      <EditReservation
        getReservation={refetch}
        reservationItem={data}
        isOpenEdit={isOpenEdit}
        toggleModalEdit={toggleModalEdit}
      />
    </>
  );
};

export default ReservationDetails;
