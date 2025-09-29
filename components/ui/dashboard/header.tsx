"use client";

import useNotification from "@/hooks/cachedEndpoints/useNotifications";
import useSubscription from "@/hooks/cachedEndpoints/useSubscription";
import useUser from "@/hooks/cachedEndpoints/useUser";
import useScroll from "@/hooks/use-scroll";
import { cn } from "@/lib/utils";
import {
  Avatar,
  Badge,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Popover,
  PopoverContent,
  PopoverTrigger,
  useDisclosure,
} from "@nextui-org/react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useSelectedLayoutSegment } from "next/navigation";
import { useState, useCallback, useEffect } from "react";
import { FiLogOut } from "react-icons/fi";
import { IoIosArrowDown } from "react-icons/io";
import { MdOutlinePerson } from "react-icons/md";
import { PiBookOpenTextLight } from "react-icons/pi";
import { SlBell } from "react-icons/sl";
import { Skeleton } from "../landingPage/skeleton-loading";
import LogoutModal from "../logoutModal";
import { SIDENAV_ITEMS, headerRouteMapping } from "./constants";
import Notifications from "./notifications/notifications";
import { NavigationBanner, useCheckExpiry } from "./subscription-notification";
import useNotificationCount from "@/hooks/cachedEndpoints/useNotificationCount";
import * as signalR from "@microsoft/signalr";
import useNotifyCount from "@/hooks/cachedEndpoints/useNotificationCount";
import CompanyLogo from "@/components/logo";

// NotificationFetcher: fetches notifications only when mounted (popover open)
const NotificationFetcher = ({ page, pageSize, ...props }: any) => {
  const {
    data: notifData,
    isLoading,
    isError,
    refetch,
  } = useNotification(page, pageSize);

  return (
    <Notifications
      notifData={notifData}
      refetch={refetch}
      loadMore={props.loadMore}
      isLoading={isLoading}
      isError={isError}
    />
  );
};

const Header = ({ ispos }: any) => {
  const page = 1;
  const [pageSize, setPageSize] = useState(10);
  const [unreadNotCount, setUnreadNotCount] = useState(0);
  const [notifPopoverOpen, setNotifPopoverOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  const { data: unreadCount = 0 } = useNotifyCount();
  const { isOpen, onOpenChange } = useDisclosure();
  const { data } = useUser();

  const pathname = usePathname();
  const scrolled = useScroll(5);
  const selectedLayout = useSelectedLayoutSegment();
  const navItem = SIDENAV_ITEMS.filter((item) => item.path === pathname)[0];

  const routeOutsideSidebar = () => {
    for (const [key, value] of Object.entries(headerRouteMapping)) {
      if (pathname.includes(key)) {
        return value;
      }
    }
  };

  const loadMore = useCallback(() => {
    setPageSize((prevSize) => prevSize + 10);
  }, []);

  const { data: subscription } = useSubscription();

  const { message, showBanner } = useCheckExpiry(
    subscription?.nextPaymentDate,
    7
  );
  const isActive = subscription?.isActive;
  const onTrialVersion = subscription?.onTrialVersion;

  // Set mounted state for client-side rendering
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // SignalR connection for real-time notifications
  useEffect(() => {
    const userInfoString = localStorage.getItem("userInformation");
    if (!userInfoString) {
      console.warn("No user information found in localStorage");
      return;
    }

    const userInfo = JSON.parse(userInfoString);
    if (!userInfo.token) {
      console.warn("No token found in user information");
      return;
    }

    const connection = new signalR.HubConnectionBuilder()
      .withUrl("https://sandbox-api.hobwise.com/notificationHub", {
        accessTokenFactory: () => userInfo.token,
      })
      .configureLogging(signalR.LogLevel.Information)
      .build();

    connection.on("ReceiveNotification", (data) => {
      if (data && typeof data.unreadCount !== "undefined") {
        setUnreadNotCount(data.unreadCount);
        console.log("jhg", data.unreadCount);
      }
    });

    connection
      .start()
      .then(() => {
        console.log("SignalR connected.");
      })
      .catch((err) => {
        console.error(err);
      });

    return () => {
      connection.stop();
    };
  }, []);

  // When popover opens, refetch unread count

  return (
    <div
      className={cn(
        `sticky inset-x-0 top-0 z-50 w-full  transition-all ${ispos ? "": "border-b"}  border-primaryGrey`,
        {
          "border-b  border-primaryGrey bg-white/75 backdrop-blur-lg": scrolled,
          "border-b  border-primaryGrey bg-white": selectedLayout,
        }
      )}
    >
      <div className="w-full">
        {onTrialVersion === false && isActive === false && (
          <NavigationBanner
            title="Your subscription has expired!"
            desc="Upgrade to a paid plan to continue enjoying uninterrupted access"
          />
        )}
        {onTrialVersion && isActive === false && showBanner && (
          <NavigationBanner
            title="Trial Expiry Notice!"
            desc={
              <div>
                Your trial period will expire{" "}
                <span className="font-bold">{message}</span> . To continue
                enjoying uninterrupted access, please upgrade to a plan.
              </div>
            }
          />
        )}
        <div className={`flex h-[64px] bg-white text-black ${ispos ? "": "border-b"} border-primaryGrey items-center justify-between px-6`}>
          {ispos && (
            <CompanyLogo
              textColor="text-black font-lexend text-[28px] font-[600]"
              containerClass="flex gap-2 items-center"
            />
          )}
          <div className="flex items-center space-x-4">
            <div className="flex items-center gap-2">
              {navItem ? (
                <>
                  {navItem?.title === "Menu" ? (
                    <PiBookOpenTextLight className="font-bold text-grey500 text-xl" />
                  ) : (
                    <Image
                      className={"dashboardLogo"}
                      src={navItem?.icon}
                      alt={navItem?.title}
                    />
                  )}
                  <span className="text-[#494E58] font-[600]">
                    {navItem?.title}
                  </span>
                </>
              ) : (
                <>
                  {routeOutsideSidebar()?.icon}
                  <span className="text-[#494E58] font-[600]">
                    {routeOutsideSidebar()?.title}
                  </span>
                </>
              )}
            </div>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            <div className="flex items-center space-x-4">
              <Popover
                placement="bottom"
                onOpenChange={setNotifPopoverOpen}
                isOpen={notifPopoverOpen}
              >
                <PopoverTrigger>
                  {unreadCount === 0 ? (
                    <SlBell className="text-[#494E58] h-5 w-5 cursor-pointer" />
                  ) : (
                    <Badge
                      className="cursor-pointer h-6 w-6 flex justify-center items-center rounded-full"
                      size="sm"
                      color="danger"
                      content={
                        unreadNotCount !== 0
                          ? unreadNotCount
                          : unreadCount > 0
                          ? unreadCount
                          : undefined
                      }
                    >
                      <SlBell className="text-[#494E58] h-5 w-5 cursor-pointer" />
                    </Badge>
                  )}
                </PopoverTrigger>
                <PopoverContent className="">
                  {notifPopoverOpen && (
                    <NotificationFetcher
                      page={page}
                      pageSize={pageSize}
                      loadMore={loadMore}
                    />
                  )}
                </PopoverContent>
              </Popover>

              {/* <span>
                <IoChatbubblesOutline className="text-[#494E58]  h-5 w-5 cursor-pointer" />
              </span> */}

              {!isMounted ? (
                <div className=" flex items-center gap-2 border border-gray-200 rounded-full py-1 px-2">
                  <div className="w-full flex flex-col gap-1">
                    <Skeleton className="h-2 w-16 rounded-lg" />
                    <Skeleton className="h-2 w-16 rounded-lg" />
                  </div>
                  <div>
                    <Skeleton className="flex rounded-full w-8 h-8" />
                  </div>
                </div>
              ) : (
                <Dropdown placement="bottom-end">
                  <DropdownTrigger>
                    {data ? (
                      <div className="flex items-center py-2 px-4 rounded-full border border-gray-300 gap-2 cursor-pointer">
                        <div className="flex flex-col leading-4 ">
                          <span className="text-xs font-bold">
                            {data?.firstName} {data?.lastName}
                          </span>
                          <span className="text-xs text-gray-500">
                            {data?.role === 0 ? "Manager" : "Staff"}
                          </span>
                        </div>
                        <Avatar
                          size="sm"
                          src={
                            data?.image &&
                            `data:image/jpeg;base64,${data?.image}`
                          }
                        />
                        <IoIosArrowDown />
                      </div>
                    ) : (
                      <div className=" flex items-center gap-2 border border-gray-200 rounded-full py-1 px-2">
                        <div className="w-full flex flex-col gap-1">
                          <Skeleton className="h-2 w-16 rounded-lg" />
                          <Skeleton className="h-2 w-16 rounded-lg" />
                        </div>
                        <div>
                          <Skeleton className="flex rounded-full w-8 h-8" />
                        </div>
                      </div>
                    )}
                  </DropdownTrigger>
                  <DropdownMenu aria-label="settings Actions" variant="flat">
                    <DropdownItem key="Profile Management">
                      <Link
                        prefetch={true}
                        href={"/dashboard/settings/personal-information"}
                        className="flex cursor-pointer text-[#475367] transition-all hover:rounded-md px-2 py-2 items-center gap-2"
                      >
                        <MdOutlinePerson className="text-[22px]" />
                        <span className="  text-sm font-md">
                          Profile Management
                        </span>
                      </Link>
                    </DropdownItem>
                    <DropdownItem key="logout">
                      <div
                        onClick={onOpenChange}
                        className="flex cursor-pointer text-danger-500 transition-all hover:rounded-md px-2 py-2 items-center gap-2"
                      >
                        <FiLogOut className="text-[20px]" />
                        <span className="  text-sm font-md"> Log out</span>
                      </div>
                    </DropdownItem>
                  </DropdownMenu>
                </Dropdown>
              )}
            </div>
          </div>
        </div>

        <LogoutModal onOpenChange={onOpenChange} isOpen={isOpen} />
      </div>
    </div>
  );
};

export default Header;
