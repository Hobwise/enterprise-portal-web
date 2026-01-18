"use client";

import { useState, useEffect, useMemo, useCallback, memo } from "react";

import { generateRefreshToken } from "@/app/api/controllers/auth";
import CompanyLogo from "@/components/logo";
import useGetBusiness from "@/hooks/cachedEndpoints/useGetBusiness";
import useGetBusinessByCooperate from "@/hooks/cachedEndpoints/useGetBusinessByCooperate";
import usePermission from "@/hooks/cachedEndpoints/usePermission";
import useSubscription from "@/hooks/cachedEndpoints/useSubscription";
import { decryptPayload } from "@/lib/encrypt-decrypt";
import {
  getJsonItemFromLocalStorage,
  resetLoginInfo,
  saveJsonItemToLocalStorage,
  setTokenCookie,
} from "@/lib/utils";
import { isPOSUser as checkIsPOSUser, isCategoryUser as checkIsCategoryUser } from "@/lib/userTypeUtils";
import {
  Avatar,
  Divider,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Skeleton,
  useDisclosure,
} from "@nextui-org/react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FiLogOut } from "react-icons/fi";
import { GoPlus } from "react-icons/go";
import { IoIosArrowDown } from "react-icons/io";
import { PiBookOpenTextLight } from "react-icons/pi";

import { SIDENAV_ITEMS, SIDENAV_CONFIG } from "./constants";
import AddBusiness from "./settings/addBusiness";
import { SideNavItem, SideNavSection } from "./types";

const SideNav = () => {
  const { isOpen, onOpenChange } = useDisclosure();
  const [isMounted, setIsMounted] = useState(false);
  const [isPOSUserState, setIsPOSUserState] = useState(false);
  const [isCategoryUserState, setIsCategoryUserState] = useState(false);

  const { data: businessDetails, isLoading } = useGetBusiness();
  const { data: businessDetailsList, refetch } = useGetBusinessByCooperate();

  useEffect(() => {
    setIsMounted(true);
    // Check if user is POS user or Category user after component mounts using centralized utility
    const userInfo = getJsonItemFromLocalStorage('userInformation');
    setIsPOSUserState(checkIsPOSUser(userInfo));
    setIsCategoryUserState(checkIsCategoryUser(userInfo));
  }, []);

  const {
    userRolePermissions,
    role,
    isLoading: isPermissionsLoading,
  } = usePermission();

  const business = useMemo(() => getJsonItemFromLocalStorage("business") || [], []);
  const userInformation = useMemo(() => getJsonItemFromLocalStorage("userInformation"), []);

  const refreshToken = useCallback(async () => {
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

      if (response?.data?.response) {
        const decryptedData = decryptPayload(response?.data?.response);

        const {
          token: newToken,
          refreshToken: newRefreshToken,
          tokenExpiration,
        } = decryptedData?.data;

        saveJsonItemToLocalStorage("userInformation", {
          ...userData,
          token: newToken,
          refreshToken: newRefreshToken,
          tokenExpiration,
        });
        setTokenCookie("token", newToken);
        return newToken;
      } else {
        resetLoginInfo();
      }
    } catch (error) {
      resetLoginInfo();
      console.log(error);
    }
  }, []);

  const toggleBtwBusiness = useCallback(async (businessInfo: any) => {
    const exists = business?.some(
      (comparisonItem: any) => comparisonItem.businessId === businessInfo.id
    );

    if (exists) return; // Early return if business already selected

    const transformedArray = [{
      businessId: businessInfo.id,
      businessAddress: businessInfo.address,
      state: businessInfo.state,
      city: businessInfo.city,
      businessName: businessInfo.name,
      primaryColor: businessInfo.primaryBrandColour,
      secondaryColor: businessInfo.secondaryBrandColour,
      businessContactEmail: businessInfo.contactEmailAddress,
      businessContactNumber: businessInfo.contactPhoneNumber,
    }];

    saveJsonItemToLocalStorage("business", transformedArray);
    await refreshToken();
    window.location.reload();
  }, [business, refreshToken]);

  const [isOpenBusinessModal, setIsOpenBusinessModal] = useState(false);
  const toggleBusinessModal = useCallback(() => {
    setIsOpenBusinessModal(!isOpenBusinessModal);
  }, [isOpenBusinessModal]);

  const pathname = usePathname();

  const { data: subscription } = useSubscription();
  const canAccessMultipleLocations =
    subscription?.planCapabilities?.canAccessMultipleLocations;

  // Filter items based on permissions
  const filterItemsByPermission = useCallback((items: SideNavItem[]) => {
    if (role !== 1) return items; // Admin (role 0) sees all items

    const permissionMap: Record<string, boolean | undefined> = {
      "Menu": userRolePermissions?.canViewMenu,
      "Campaigns": userRolePermissions?.canViewCampaign,
      "Reservation": userRolePermissions?.canViewReservation,
      "Payments": userRolePermissions?.canViewPayment,
      "Orders": userRolePermissions?.canViewOrder,
      "Reports": userRolePermissions?.canViewReport,
      "Bookings": userRolePermissions?.canViewBooking,
      "Dashboard": userRolePermissions?.canViewDashboard,
      "Quick Response": userRolePermissions?.canViewQR,
    };

    return items.filter((item) => {
      const hasPermission = permissionMap[item.title];
      return hasPermission !== false;
    });
  }, [role, userRolePermissions]);

  // Filter sections based on role and permissions
  const filteredSections = useMemo(() => {
    if (isPermissionsLoading || !isMounted) return [];

    // If Category user, don't show any sidebar items
    if (isCategoryUserState) {
      return [];
    }

    // If POS user, show only POS and Orders navigation (no sections)
    if (isPOSUserState) {
      return [];
    }

    // Filter sections based on role requirement
    return SIDENAV_CONFIG
      .filter((section) => {
        // Check if section requires specific role
        if (section.requiredRole !== undefined && Number(role) !== section.requiredRole) {
          return false;
        }
        return true;
      })
      .map((section) => ({
        ...section,
        items: filterItemsByPermission(section.items),
      }))
      .filter((section) => section.items.length > 0); // Only show sections with items
  }, [isPermissionsLoading, role, isMounted, isPOSUserState, isCategoryUserState, filterItemsByPermission]);

  // Legacy flat items for POS users
  const filteredItems = useMemo(() => {
    if (isPermissionsLoading || !isMounted) return [];

    // If Category user, don't show any sidebar items (sidebar should be hidden)
    if (isCategoryUserState) {
      return [];
    }

    // If POS user, show only POS and Orders navigation
    if (isPOSUserState) {
      return [
        {
          title: 'POS',
          path: '/pos',
          icon: SIDENAV_ITEMS.find(item => item.title === 'Orders')?.icon,
        },
        {
          title: 'Orders',
          path: '/dashboard/orders',
          icon: SIDENAV_ITEMS.find(item => item.title === 'Orders')?.icon,
        }
      ];
    }

    return [];
  }, [isPermissionsLoading, isMounted, isPOSUserState, isCategoryUserState]);

  return (
    <div className="md:w-[272px] bg-black h-screen flex-1 fixed z-30 hidden md:flex flex-col">
      <div className="flex flex-col w-full h-full relative">
        <div className="flex-shrink-0">
          <Link
            prefetch={true}
            href={isMounted && isPOSUserState ? "/pos" : "/dashboard"}
            className="flex flex-row items-center justify-center md:justify-start md:px-8 md:py-10 w-full"
          >
            <CompanyLogo
              textColor="text-white font-lexend text-[28px] font-[600]"
              containerClass="flex gap-2 items-center"
            />
          </Link>
        </div>

        <div
          className="overflow-y-auto flex-grow"
          style={{
            height: "calc(100vh - 200px)",
            maxHeight: "calc(100vh - 200px)",
          }}
        >
          <div className="flex flex-col space-y-1 md:px-2 pb-10">
            {isPermissionsLoading ? (
              <div className="md:w-[272px] bg-black h-screen flex-1 fixed z-30 hidden md:flex flex-col">
              <div className="flex flex-col gap-4 w-full h-full relative">

                <div className="space-y-4 px-4 mt-4">
                  {[1, 2, 3, 4, 5, 6,7,8,9].map((item) => (
                    <div key={item} className="flex items-center gap-6">
                      <Skeleton className="w-6 h-6 rounded-md" />
                      <Skeleton className="h-4 w-32 rounded-lg" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
            ) : isPOSUserState ? (
              // Render flat items for POS users
              filteredItems.map((item, idx) => {
                return <MenuItem key={idx} item={item} pathname={pathname} />;
              })
            ) : (
              // Render section-based navigation for regular users
              filteredSections.map((section, idx) => (
                <SectionGroup key={idx} section={section} pathname={pathname} />
              ))
            )}
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 bg-black">
          <Divider className="bg-[#27272A] mx-auto h-[1px] w-[90%]" />
          {!isMounted ? (
            <div className="w-full flex items-center gap-3 px-5 py-8">
              <div>
                <Skeleton className="animate-pulse flex rounded-full w-12 h-12" />
              </div>
              <div className="w-full flex flex-col gap-2">
                <Skeleton className="animate-pulse h-2 w-3/5 rounded-lg" />
                <Skeleton className="animate-pulse h-2 w-4/5 rounded-lg" />
              </div>
            </div>
          ) : (
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
                <div className="flex cursor-pointer justify-center items-center px-2 py-8 gap-4 w-full ">
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
              className="max-h-[300px] overflow-y-auto"
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

            </DropdownMenu>
          </Dropdown>
          )}
        </div>
      </div>
      <AddBusiness
        refetch={refetch}
        toggleBusinessModal={toggleBusinessModal}
        isOpenBusinessModal={isOpenBusinessModal}
      />

    </div>
  );
};

export default SideNav;

// SectionGroup component for collapsible sidebar sections
const SectionGroup = memo(({ section, pathname }: { section: SideNavSection; pathname: string }) => {
  // Initialize state from localStorage or default
  const [isExpanded, setIsExpanded] = useState(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(`sidebar-section-${section.sectionTitle}`);
      if (stored !== null) {
        return stored === 'true';
      }
    }
    return section.defaultExpanded ?? true;
  });

  const toggleSection = useCallback(() => {
    const newState = !isExpanded;
    setIsExpanded(newState);
    // Persist to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem(`sidebar-section-${section.sectionTitle}`, String(newState));
    }
  }, [isExpanded, section.sectionTitle]);

  // Check if any item in this section is active
  const hasActiveItem = section.items.some(item => pathname === item.path || pathname.startsWith(item.path + '/'));

  return (
    <div className="mb-2">
      {/* Section Header */}
      <button
        onClick={section.collapsible ? toggleSection : undefined}
        className={`flex items-center justify-between w-full px-6 py-2 text-xs font-semibold uppercase tracking-wider transition-colors ${
          hasActiveItem ? 'text-white bg-[#5F35D2]' : 'text-gray-400 hover:text-white'
        } ${section.collapsible ? 'cursor-pointer' : 'cursor-default'}`}
      >
        <span>{section.sectionTitle}</span>
        {section.collapsible && (
          <IoIosArrowDown
            className={`transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
          />
        )}
      </button>

      {/* Section Items */}
      {isExpanded && (
        <div className="flex flex-col space-y-1 mt-1">
          {section.items.map((item, idx) => (
            <MenuItem key={idx} item={item} pathname={pathname} />
          ))}
        </div>
      )}
    </div>
  );
});

SectionGroup.displayName = 'SectionGroup';

const MenuItem = memo(({ item, pathname }: { item: SideNavItem; pathname: string }) => {
  const [subMenuOpen, setSubMenuOpen] = useState(false);
  const toggleSubMenu = useCallback(() => {
    setSubMenuOpen(!subMenuOpen);
  }, [subMenuOpen]);

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
          ) : typeof item.icon === 'string' || (item.icon as any)?.src ? (
            <Image src={item.icon} alt={item.title} />
          ) : (
            item.icon
          )}

          <span className="font-[400] text-[14px] flex">{item.title}</span>
        </Link>
      )}
    </div>
  );
});