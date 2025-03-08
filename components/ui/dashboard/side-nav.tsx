"use client";

import { useState, useEffect } from "react";

import { generateRefreshToken } from "@/app/api/controllers/auth";
import CompanyLogo from "@/components/logo";
import useGetBusiness from "@/hooks/cachedEndpoints/useGetBusiness";
import useGetBusinessByCooperate from "@/hooks/cachedEndpoints/useGetBusinessByCooperate";
import usePermission from "@/hooks/cachedEndpoints/usePermission";
import {
  getJsonItemFromLocalStorage,
  resetLoginInfo,
  saveJsonItemToLocalStorage,
  setTokenCookie,
} from "@/lib/utils";
import {
  Avatar,
  Divider,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Skeleton,
  Spinner,
  useDisclosure,
} from "@nextui-org/react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FiLogOut } from "react-icons/fi";
import { GoPlus } from "react-icons/go";
import { IoIosArrowDown } from "react-icons/io";
import { PiBookOpenTextLight } from "react-icons/pi";
import LogoutModal from "../logoutModal";
import { SIDENAV_ITEMS } from "./constants";
import AddBusiness from "./settings/addBusiness";
import { SideNavItem } from "./types";
import useSubscription from "@/hooks/cachedEndpoints/useSubscription";
import { useQueryClient } from "react-query";

const SideNav = () => {
  const { isOpen, onOpenChange } = useDisclosure();

  const { data: businessDetails, isLoading } = useGetBusiness();
  const { data: businessDetailsList, refetch } = useGetBusinessByCooperate();

  const {
    userRolePermissions,
    role,
    isLoading: isPermissionsLoading,
  } = usePermission();

  const business = getJsonItemFromLocalStorage("business") || [];
  const userInformation = getJsonItemFromLocalStorage("userInformation");

  const refreshToken = async () => {
    const userData = getJsonItemFromLocalStorage("userInformation");
    const businesses = getJsonItemFromLocalStorage("business");

    if (!userData) return null;

    const { refreshToken, email } = userData;
    const businessId = businesses[0].businessId;

    try {
      const response = await generateRefreshToken({
        refreshToken,
        businessId,
        email,
      });

      const {
        token: newToken,
        refreshToken: newRefreshToken,
        tokenExpiration,
      } = response?.data?.data;

      saveJsonItemToLocalStorage("userInformation", {
        ...userData,
        token: newToken,
        refreshToken: newRefreshToken,
        tokenExpiration,
      });
      setTokenCookie("token", newToken);
      return newToken;
    } catch (error) {
      resetLoginInfo();
      console.log(error);
    }
  };

  const toggleBtwBusiness = async (businessInfo: any) => {
    const exists = business?.some(
      (comparisonItem: any) => comparisonItem.businessId === businessInfo.id
    );

    const transformedArray = [businessInfo].map((item) => ({
      businessId: item.id,
      businessAddress: item.address,
      state: item.state,
      city: item.city,
      businessName: item.name,
      primaryColor: item.primaryBrandColour,
      secondaryColor: item.secondaryBrandColour,
      businessContactEmail: item.contactEmailAddress,
      businessContactNumber: item.contactPhoneNumber,
    }));

    if (!exists) {
      saveJsonItemToLocalStorage("business", transformedArray);

      await refreshToken();
      window.location.reload();
    }
  };

  const [isOpenBusinessModal, setIsOpenBusinessModal] = useState(false);
  const toggleBusinessModal = () => {
    setIsOpenBusinessModal(!isOpenBusinessModal);
  };

  const { data: subscription } = useSubscription();
  const canAccessMultipleLocations =
    subscription?.planCapabilities?.canAccessMultipleLocations;

  const filteredItems = isPermissionsLoading
    ? []
    : SIDENAV_ITEMS.filter((item) => {
        if (
          item.title === "Menu" &&
          role === 1 &&
          userRolePermissions?.canViewMenu === false
        )
          return false;
        if (
          item.title === "Campaigns" &&
          role === 1 &&
          userRolePermissions?.canViewCampaign === false
        )
          return false;
        if (
          item.title === "Reservation" &&
          role === 1 &&
          userRolePermissions?.canViewReservation === false
        )
          return false;
        if (
          item.title === "Payments" &&
          userRolePermissions?.canViewPayment === false &&
          role === 1
        )
          return false;
        if (
          item.title === "Orders" &&
          userRolePermissions?.canViewOrder === false &&
          role === 1
        )
          return false;
        if (
          item.title === "Reports" &&
          userRolePermissions?.canViewReport === false &&
          role === 1
        )
          return false;
        if (
          item.title === "Bookings" &&
          userRolePermissions?.canViewBooking === false &&
          role === 1
        )
          return false;
        if (
          item.title === "Dashboard" &&
          userRolePermissions?.canViewDashboard === false &&
          role === 1
        )
          return false;
        if (
          item.title === "Quick Response" &&
          userRolePermissions?.canViewQR === false &&
          role === 1
        )
          return false;
        return true;
      });

  return (
    <div className="md:w-[272px] bg-black h-screen flex-1 fixed z-30 hidden md:flex">
      <div className="flex flex-col  w-full">
        <div className=" scrollbarstyles mb-3 overflow-y-scroll">
          <Link
            prefetch={true}
            href="/dashboard"
            className="flex flex-row  items-center justify-center md:justify-start md:px-8 md:py-10   w-full"
          >
            <CompanyLogo
              textColor="text-white font-lexend text-[28px] font-[600]"
              containerClass="flex gap-2 items-center "
            />
          </Link>

          <div className="flex flex-col space-y-1  md:px-2 ">
            {isPermissionsLoading ? (
              <div className="grid place-content-center mt-6">
                <div className="space-y-2 flex justify-center flex-col">
                  <Spinner size="sm" />
                  <p className="italic text-gray-400">Fetching side menu...</p>
                </div>
              </div>
            ) : (
              filteredItems.map((item, idx) => {
                return <MenuItem key={idx} item={item} />;
              })
            )}
          </div>
        </div>

        <div className="absolute bottom-0 bg-black w-full ">
          <Divider className="bg-[#27272A] mx-auto h-[1px] w-[90%]" />
          <Dropdown
            style={{
              width: "245px",
            }}
            classNames={{
              content: "bg-[#2B3342] mb-3",
            }}
          >
            <DropdownTrigger>
              {isLoading ? (
                <div className="w-full flex items-center gap-3   px-5 py-8">
                  <div>
                    <Skeleton className="animate-pulse flex rounded-full w-12 h-12" />
                  </div>
                  <div className="w-full flex flex-col gap-2 ">
                    <Skeleton className="animate-pulse h-2 w-3/5 rounded-lg" />
                    <Skeleton className="animate-pulse h-2 w-4/5 rounded-lg" />
                  </div>
                </div>
              ) : (
                <div className="flex cursor-pointer justify-center items-center px-5 py-8 gap-4 w-full ">
                  <div>
                    <Avatar
                      isBordered
                      src={`data:image/jpeg;base64,${businessDetails?.logoImage}`}
                      showFallback={true}
                      name={business[0]?.businessName}
                    />
                  </div>
                  <div className="flex flex-col w-[45%]">
                    <span className="text-[14px] font-[600]">
                      {business[0]?.businessName}
                    </span>
                    <div className="text-[12px]  font-[400] pr-5">
                      {business[0]?.city}
                      {business[0]?.city && ","} {business[0]?.state}
                    </div>
                  </div>
                  <div className="cursor-pointer">
                    <IoIosArrowDown className="text-[20px]" />
                  </div>
                </div>
              )}
            </DropdownTrigger>
            <DropdownMenu
              variant="light"
              aria-label="Dropdown menu to switch businesses"
            >
              {userInformation?.isOwner &&
                canAccessMultipleLocations &&
                businessDetailsList?.map((item: any) => {
                  return (
                    <DropdownItem
                      classNames={{
                        base: "hover:bg-none max-h-[100px] overflow-scroll",
                      }}
                      key={item?.id}
                      onClick={() => toggleBtwBusiness(item)}
                    >
                      <div className="flex items-center gap-3">
                        <Avatar
                          showFallback={true}
                          src={`data:image/jpeg;base64,${item?.logoImage}`}
                          name={item?.name}
                        />
                        <div className="flex flex-col">
                          <span className="font-[500] text-[14px]">
                            {item?.name}
                          </span>

                          <span className="text-xs text-secondaryGrey">
                            {item?.city}
                          </span>
                        </div>
                      </div>
                    </DropdownItem>
                  );
                })}

              {userInformation?.isOwner && canAccessMultipleLocations && (
                <DropdownItem
                  key="add another business"
                  onClick={toggleBusinessModal}
                >
                  <div className="flex items-center gap-3 ">
                    <div className="p-2 rounded-md bg-[#7182A3]">
                      <GoPlus className="text-[20px] font-[700]" />
                    </div>
                    <span className="font-[500] text-[14px]">
                      Add another business
                    </span>
                  </div>
                </DropdownItem>
              )}
              <DropdownItem
                key="logout"
                className="text-danger"
                color="danger"
                onClick={onOpenChange}
              >
                <div className="flex items-center gap-3 ">
                  <div className="p-2 rounded-md">
                    <FiLogOut className="text-[20px]" />
                  </div>
                  <span className="font-[500] text-[14px]">Logout</span>
                </div>
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </div>
      </div>
      <AddBusiness
        refetch={refetch}
        toggleBusinessModal={toggleBusinessModal}
        isOpenBusinessModal={isOpenBusinessModal}
      />
      <LogoutModal onOpenChange={onOpenChange} isOpen={isOpen} />
    </div>
  );
};

export default SideNav;

const MenuItem = ({ item }: { item: SideNavItem }) => {
  const pathname = usePathname();
  const [subMenuOpen, setSubMenuOpen] = useState(false);
  const toggleSubMenu = () => {
    setSubMenuOpen(!subMenuOpen);
  };

  return (
    <div>
      {item.submenu ? (
        <>
          <button
            onClick={toggleSubMenu}
            className={`flex flex-row items-center p-2 rounded-lg  w-full justify-between  ${
              pathname.includes(item.path) ? "bg-zinc-100" : ""
            }`}
          >
            <div className="flex flex-row space-x-4 items-center">
              {item.icon}
              <span className="font-semibold text-xl  flex">{item.title}</span>
            </div>

            <div className={`${subMenuOpen ? "rotate-180" : ""} flex`}>
              {/* <Icon icon='lucide:chevron-down' width='24' height='24' /> */}
            </div>
          </button>

          {subMenuOpen && (
            <div className="my-2 ml-12 flex flex-col space-y-4">
              {item.subMenuItems?.map((subItem, idx) => {
                return (
                  <Link
                    prefetch={true}
                    key={idx}
                    href={subItem.path}
                    className={`text-white ${
                      subItem.path === pathname ? "font-bold" : ""
                    }`}
                  >
                    <span>{subItem.title}</span>
                  </Link>
                );
              })}
            </div>
          )}
        </>
      ) : (
        <Link
          prefetch={true}
          href={item.path}
          className={`text-white flex flex-row space-x-4 items-center py-[13px] px-6 rounded-[4px] transition hover:bg-[#2B3342] ${
            item.path === pathname ? "bg-[#2B3342]" : ""
          }`}
        >
          {item.title === "Menu" ? (
            <PiBookOpenTextLight className="font-bold text-xl" />
          ) : (
            <Image src={item.icon} alt={item.title} />
          )}

          <span className="font-[400] text-[14px] flex">{item.title}</span>
        </Link>
      )}
    </div>
  );
};
