"use client";

import { useState, useEffect, useMemo, useCallback, memo } from "react";

import { generateRefreshToken } from "@/app/api/controllers/auth";
import useGetBusiness from "@/hooks/cachedEndpoints/useGetBusiness";
import useGetBusinessByCooperate from "@/hooks/cachedEndpoints/useGetBusinessByCooperate";
import usePermission from "@/hooks/cachedEndpoints/usePermission";
import useUser from "@/hooks/cachedEndpoints/useUser";
import { useSubscriptionContext } from "@/hooks/providers/SubscriptionProvider";
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
import {
  FiLock,
  FiLogOut,
  FiSearch,
  FiChevronDown,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";
import { GoPlus } from "react-icons/go";
import { PiBookOpenTextLight } from "react-icons/pi";

import LogoutModal from "@/components/ui/logoutModal";
import { getPlanLabel } from "@/lib/planLabels";
import { routePermissions } from "@/lib/routePermissions";
import { SIDENAV_ITEMS, SIDENAV_CONFIG } from "./constants";
import AddBusiness from "./settings/addBusiness";
import { SideNavItem, SideNavSection } from "./types";

const SIDEBAR_BG = "bg-[#0B1320]";
const SIDEBAR_BORDER = "border-[#1E293B]";
const SECTION_LABEL = "text-[11px] tracking-[0.12em] text-[#64748B]";
const ITEM_INACTIVE =
  "text-[#CBD5E1] hover:bg-[#111B2E] hover:text-white";
const ITEM_ACTIVE =
  "relative bg-gradient-to-r from-[#3D1E8E] via-[#1F1547] to-[#0B1320] text-white shadow-md before:content-[''] before:absolute before:-left-3 before:top-1/2 before:-translate-y-1/2 before:w-1 before:h-2/3 before:bg-[#A78BFA] before:rounded-md";

const getBusinessInitials = (name?: string): string => {
  if (!name) return "B";
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "B";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
};

interface SideNavProps {
  isCollapsed?: boolean;
  onToggleCollapsed?: () => void;
}

const SideNav = ({ isCollapsed = false, onToggleCollapsed }: SideNavProps) => {
  const { isOpen, onOpenChange } = useDisclosure();
  const {
    isOpen: isLogoutOpen,
    onOpenChange: onLogoutOpenChange,
  } = useDisclosure();
  const [isMounted, setIsMounted] = useState(false);
  const [isPOSUserState, setIsPOSUserState] = useState(false);
  const [isCategoryUserState, setIsCategoryUserState] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const { data: businessDetails, isLoading } = useGetBusiness();
  const { data: businessDetailsList, refetch } = useGetBusinessByCooperate();
  const { data: userData } = useUser();
  const { subscription } = useSubscriptionContext();

  useEffect(() => {
    setIsMounted(true);
    const userInfo = getJsonItemFromLocalStorage("userInformation");
    setIsPOSUserState(checkIsPOSUser(userInfo));
    setIsCategoryUserState(checkIsCategoryUser(userInfo));
  }, []);

  const {
    userRolePermissions,
    role,
    isLoading: isPermissionsLoading,
  } = usePermission();

  const business = useMemo(
    () => getJsonItemFromLocalStorage("business") || [],
    [],
  );
  const userInformation = useMemo(
    () => getJsonItemFromLocalStorage("userInformation"),
    [],
  );

  const refreshToken = useCallback(async () => {
    const localUserData = getJsonItemFromLocalStorage("userInformation");
    const businesses = getJsonItemFromLocalStorage("business");

    if (!localUserData) return null;

    const { refreshToken, email } = localUserData;
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
          ...localUserData,
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

  const toggleBtwBusiness = useCallback(
    async (businessInfo: any) => {
      const exists = business?.some(
        (comparisonItem: any) => comparisonItem.businessId === businessInfo.id,
      );

      if (exists) return;

      const transformedArray = [
        {
          businessId: businessInfo.id,
          businessAddress: businessInfo.address,
          state: businessInfo.state,
          city: businessInfo.city,
          businessName: businessInfo.name,
          primaryColor: businessInfo.primaryBrandColour,
          secondaryColor: businessInfo.secondaryBrandColour,
          businessContactEmail: businessInfo.contactEmailAddress,
          businessContactNumber: businessInfo.contactPhoneNumber,
        },
      ];

      saveJsonItemToLocalStorage("business", transformedArray);
      await refreshToken();
      window.location.reload();
    },
    [business, refreshToken],
  );

  const [isOpenBusinessModal, setIsOpenBusinessModal] = useState(false);
  const toggleBusinessModal = useCallback(() => {
    setIsOpenBusinessModal((prev) => !prev);
  }, []);

  const pathname = usePathname();

  const { planCapabilities, hasCapability } = useSubscriptionContext();
  const canAccessMultipleLocations = hasCapability(
    "canAccessMultipleLocations",
  );

  // True when the user's subscription plan doesn't cover this route.
  const isPlanLockedPath = useCallback(
    (path: string): boolean => {
      // Longest-matching prefix in routePermissions.
      let match: { key: string; capability: string } | null = null;
      for (const [route, capability] of Object.entries(routePermissions)) {
        if (path === route || path.startsWith(route + "/")) {
          if (!match || route.length > match.key.length) {
            match = { key: route, capability };
          }
        }
      }
      if (!match) return false;
      return !planCapabilities[match.capability];
    },
    [planCapabilities],
  );

  const decorateItemsForSection = useCallback(
    (items: SideNavItem[], section: SideNavSection) => {
      // Section is locked if its requiredRole/requiredCapability isn't satisfied.
      const sectionLockedByRole =
        section.requiredRole !== undefined &&
        Number(role) !== section.requiredRole;
      const sectionLockedByPlan = Boolean(
        section.requiredCapability &&
          !planCapabilities[section.requiredCapability],
      );
      const sectionLocked = sectionLockedByRole || sectionLockedByPlan;

      // RBAC map (Staff only)
      const rbacMap: Record<string, boolean | undefined> = {
        Menu: userRolePermissions?.canViewMenu,
        Campaigns: userRolePermissions?.canViewCampaign,
        Reservation: userRolePermissions?.canViewReservation,
        Payments: userRolePermissions?.canViewPayment,
        Orders: userRolePermissions?.canViewOrder,
        Reports: userRolePermissions?.canViewReport,
        Bookings: userRolePermissions?.canViewBooking,
        Dashboard: userRolePermissions?.canViewDashboard,
        "Quick Response": userRolePermissions?.canViewQR,
      };

      return items.map((item) => {
        const rbacLocked = role === 1 && rbacMap[item.title] === false;
        const planLocked = isPlanLockedPath(item.path);
        return {
          ...item,
          locked: sectionLocked || rbacLocked || planLocked,
        };
      });
    },
    [role, userRolePermissions, planCapabilities, isPlanLockedPath],
  );

  const filteredSections = useMemo(() => {
    if (isPermissionsLoading || !isMounted) return [];

    // POS/Category users have entirely separate nav handled below
    if (isCategoryUserState) return [];
    if (isPOSUserState) return [];

    return SIDENAV_CONFIG.map((section) => ({
      ...section,
      items: decorateItemsForSection(section.items, section),
    })).filter((section) => section.items.length > 0);
  }, [
    isPermissionsLoading,
    isMounted,
    isPOSUserState,
    isCategoryUserState,
    decorateItemsForSection,
  ]);

  // Apply client-side search filter on top of permission-filtered sections
  const visibleSections = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return filteredSections;
    return filteredSections
      .map((section) => ({
        ...section,
        items: section.items.filter((item) =>
          item.title.toLowerCase().includes(q),
        ),
      }))
      .filter((section) => section.items.length > 0);
  }, [filteredSections, searchQuery]);

  // POS users get a flat nav with no sections
  const filteredItems = useMemo(() => {
    if (isPermissionsLoading || !isMounted) return [];
    if (isCategoryUserState) return [];

    if (isPOSUserState) {
      return [
        {
          title: "POS",
          path: "/pos",
          icon: SIDENAV_ITEMS.find((item) => item.title === "Orders")?.icon,
        },
        {
          title: "Orders",
          path: "/dashboard/orders",
          icon: SIDENAV_ITEMS.find((item) => item.title === "Orders")?.icon,
        },
      ];
    }

    return [];
  }, [isPermissionsLoading, isMounted, isPOSUserState, isCategoryUserState]);

  const planLabel = getPlanLabel(subscription?.plan);

  const businessName = business?.[0]?.businessName || "Your business";
  const businessInitials = getBusinessInitials(businessName);

  const fullName = `${userData?.firstName ?? ""} ${userData?.lastName ?? ""}`.trim();
  const displayName = fullName || userInformation?.email || "User";
  const displayEmail = userData?.email || userInformation?.email || "";
  const avatarSrc = userData?.image
    ? `data:image/jpeg;base64,${userData.image}`
    : undefined;

  return (
    <div
      className={`${isCollapsed ? "md:w-[72px]" : "md:w-[272px]"} ${SIDEBAR_BG} h-screen flex-1 fixed z-30 hidden md:flex flex-col border-r ${SIDEBAR_BORDER} transition-[width] duration-200 ease-in-out`}
    >
      {/* Collapse / expand toggle — floats on right edge */}
      {onToggleCollapsed ? (
        <button
          type="button"
          onClick={onToggleCollapsed}
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="hidden md:flex absolute -right-3 top-16 z-40 w-6 h-6 items-center justify-center rounded-full bg-[#1A2236] border border-[#2B3550] text-[#94A3B8] hover:text-white hover:bg-[#2B3550] shadow-md transition-colors"
        >
          {isCollapsed ? (
            <FiChevronRight className="text-[12px]" />
          ) : (
            <FiChevronLeft className="text-[12px]" />
          )}
        </button>
      ) : null}

      <div className="flex flex-col w-full h-full">
        {/* Business header */}
        <div
          className={`flex-shrink-0 ${isCollapsed ? "px-2" : "px-4"} pt-5`}
        >
          <Dropdown
            placement="bottom-start"
            classNames={{ content: "bg-[#1A2236] border border-[#2B3550]" }}
          >
            <DropdownTrigger>
              <button
                type="button"
                aria-label="Switch business"
                title={
                  userInformation?.isOwner && canAccessMultipleLocations
                    ? `Switch business — ${businessName}`
                    : businessName
                }
                className={`w-full flex items-center rounded-lg py-2 transition hover:bg-[#111B2E] ${
                  isCollapsed
                    ? "justify-center px-1"
                    : "gap-2 px-1.5"
                }`}
              >
                <BusinessAvatar
                  initials={businessInitials}
                  imageBase64={businessDetails?.logoImage}
                  isLoading={isLoading}
                />
                {!isCollapsed && (
                  <>
                    <div className="flex flex-col items-start flex-1 min-w-0">
                      <span className="text-[13px] font-semibold text-white truncate w-full text-left leading-tight">
                        {businessName}
                      </span>
                      <PoweredByBadge planLabel={planLabel} />
                    </div>
                    {userInformation?.isOwner && canAccessMultipleLocations ? (
                      <FiChevronDown
                        aria-hidden="true"
                        className="text-[#94A3B8] text-[14px] flex-shrink-0"
                      />
                    ) : null}
                  </>
                )}
              </button>
            </DropdownTrigger>
            <DropdownMenu
              variant="light"
              aria-label="Switch business"
              className="max-h-[300px] overflow-y-auto"
            >
              {userInformation?.isOwner &&
                canAccessMultipleLocations &&
                (businessDetailsList ?? []).map((item: any) => (
                  <DropdownItem
                    classNames={{
                      base: "hover:bg-[#111B2E] max-h-[100px] overflow-scroll",
                    }}
                    key={item?.id}
                    onClick={() => toggleBtwBusiness(item)}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar
                        showFallback
                        src={`data:image/jpeg;base64,${item?.logoImage}`}
                        name={item?.name}
                        size="sm"
                      />
                      <div className="flex flex-col">
                        <span className="font-medium text-[14px] text-white">
                          {item?.name}
                        </span>
                        <span className="text-xs text-[#94A3B8]">
                          {item?.city}
                        </span>
                      </div>
                    </div>
                  </DropdownItem>
                ))}

              {userInformation?.isOwner && canAccessMultipleLocations && (
                <DropdownItem
                  key="add another business"
                  onClick={toggleBusinessModal}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-md bg-[#5F35D2]">
                      <GoPlus className="text-[18px] text-white" />
                    </div>
                    <span className="font-medium text-[14px] text-white">
                      Add another business
                    </span>
                  </div>
                </DropdownItem>
              )}
            </DropdownMenu>
          </Dropdown>
        </div>

        {/* Search */}
        {isCollapsed ? (
          <div className="flex-shrink-0 px-2 pt-4 pb-2">
            <button
              type="button"
              onClick={onToggleCollapsed}
              aria-label="Expand sidebar to search"
              title="Search"
              className="w-full flex items-center justify-center rounded-lg border border-[#27314A] py-2 text-[#64748B] hover:text-white hover:border-[#5F35D2] transition-colors"
            >
              <FiSearch className="text-[16px]" />
            </button>
          </div>
        ) : (
          <div className="flex-shrink-0 px-4 pt-4 pb-2">
            <label className="flex items-center gap-2 bg-transparent border border-[#27314A] rounded-lg px-3 py-2 focus-within:border-[#5F35D2] transition-colors">
              <FiSearch className="text-[#64748B] text-[16px]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search here..."
                className="bg-transparent text-[13px] text-white placeholder:text-[#64748B] outline-none flex-1 min-w-0"
                aria-label="Search navigation"
              />
            </label>
          </div>
        )}

        {/* Scrollable nav */}
        <nav
          className={`overflow-y-auto flex-1 ${isCollapsed ? "px-2" : "px-3"} py-3`}
          aria-label="Primary navigation"
        >
          <div className="flex flex-col gap-1">
            {isPermissionsLoading || !isMounted ? (
              <NavSkeleton isCollapsed={isCollapsed} />
            ) : isPOSUserState ? (
              filteredItems.map((item, idx) => (
                <MenuItem
                  key={idx}
                  item={item}
                  pathname={pathname}
                  isCollapsed={isCollapsed}
                />
              ))
            ) : visibleSections.length === 0 ? (
              !isCollapsed ? (
                <p className="px-4 py-6 text-[12px] text-[#64748B]">
                  No matches.
                </p>
              ) : null
            ) : (
              visibleSections.map((section) => (
                <SectionGroup
                  key={section.sectionTitle}
                  section={section}
                  pathname={pathname}
                  isCollapsed={isCollapsed}
                />
              ))
            )}
          </div>
        </nav>

        {/* User profile footer */}
        <div
          className={`flex-shrink-0 border-t ${SIDEBAR_BORDER} ${
            isCollapsed ? "px-2 py-3" : "px-4 py-4"
          }`}
        >
          {!isMounted ? (
            isCollapsed ? (
              <div className="flex justify-center">
                <Skeleton className="rounded-md w-10 h-10" />
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Skeleton className="rounded-md w-10 h-10" />
                <div className="flex-1 flex flex-col gap-2">
                  <Skeleton className="h-2 w-3/5 rounded" />
                  <Skeleton className="h-2 w-4/5 rounded" />
                </div>
              </div>
            )
          ) : isCollapsed ? (
            <div className="flex flex-col items-center gap-2">
              <Avatar
                radius="md"
                src={avatarSrc}
                showFallback
                name={displayName}
                title={displayName}
                className="w-10 h-10 flex-shrink-0"
              />
              <button
                type="button"
                onClick={onLogoutOpenChange}
                aria-label="Log out"
                title="Log out"
                className="text-[#94A3B8] hover:text-white p-2 rounded-md transition-colors"
              >
                <FiLogOut className="text-[18px]" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Avatar
                radius="md"
                src={avatarSrc}
                showFallback
                name={displayName}
                className="w-10 h-10 flex-shrink-0"
              />
              <div className="flex flex-col flex-1 min-w-0">
                <span className="text-[13px] font-semibold text-white truncate">
                  {displayName}
                </span>
                {displayEmail ? (
                  <span className="text-[11px] text-[#94A3B8] truncate">
                    {displayEmail}
                  </span>
                ) : null}
              </div>
              <button
                type="button"
                onClick={onLogoutOpenChange}
                aria-label="Log out"
                className="text-[#94A3B8] hover:text-white p-2 rounded-md transition-colors"
              >
                <FiLogOut className="text-[18px]" />
              </button>
            </div>
          )}
        </div>
      </div>

      <AddBusiness
        refetch={refetch}
        toggleBusinessModal={toggleBusinessModal}
        isOpenBusinessModal={isOpenBusinessModal}
      />
      <LogoutModal isOpen={isLogoutOpen} onOpenChange={onLogoutOpenChange} />
    </div>
  );
};

export default SideNav;

// Business avatar — uses logo if available, otherwise gradient + initials
const BusinessAvatar = memo(
  ({
    initials,
    imageBase64,
    isLoading,
  }: {
    initials: string;
    imageBase64?: string;
    isLoading?: boolean;
  }) => {
    if (isLoading) {
      return <Skeleton className="w-10 h-10 rounded-md" />;
    }

    if (imageBase64) {
      return (
        <div className="w-10 h-10 rounded-md overflow-hidden flex-shrink-0">
          <img
            src={`data:image/jpeg;base64,${imageBase64}`}
            alt="Business logo"
            className="w-full h-full object-cover"
          />
        </div>
      );
    }

    return (
      <div className="w-10 h-10 rounded-md flex-shrink-0 flex items-center justify-center bg-gradient-to-br from-[#7C3AED] to-[#4C1D95]">
        <span className="text-[12px] font-bold text-white tracking-tight">
          {initials}
        </span>
      </div>
    );
  },
);
BusinessAvatar.displayName = "BusinessAvatar";

// "Powered by Hobwise · <plan>" badge below business name
const PoweredByBadge = memo(({ planLabel }: { planLabel: string }) => (
  <span className="flex items-center gap-1 text-[10px] text-[#94A3B8] mt-0.5 w-full min-w-0 whitespace-nowrap overflow-hidden">
    <span className="w-1.5 h-1.5 rounded-full bg-[#A855F7] flex-shrink-0" />
    <span className="truncate">Powered by Hobwise</span>
    <span aria-hidden="true" className="flex-shrink-0">·</span>
    <span className="text-[#C4B5FD] font-medium flex-shrink-0">{planLabel}</span>
  </span>
));
PoweredByBadge.displayName = "PoweredByBadge";

// Skeleton placeholder for the nav list
const NavSkeleton = ({ isCollapsed = false }: { isCollapsed?: boolean }) => (
  <div className="flex flex-col gap-4 px-2 pt-2">
    {[1, 2, 3, 4, 5, 6, 7].map((item) => (
      <div
        key={item}
        className={`flex items-center ${isCollapsed ? "justify-center" : "gap-3"}`}
      >
        <Skeleton className="w-5 h-5 rounded-md" />
        {!isCollapsed ? <Skeleton className="h-3 w-32 rounded" /> : null}
      </div>
    ))}
  </div>
);

// Section group — non-collapsible label + items
const SectionGroup = memo(
  ({
    section,
    pathname,
    isCollapsed = false,
  }: {
    section: SideNavSection;
    pathname: string;
    isCollapsed?: boolean;
  }) => (
    <div className="mt-3 first:mt-0">
      {isCollapsed ? (
        <div
          className="mx-auto my-2 h-px w-6 bg-[#1E293B]"
          aria-hidden="true"
        />
      ) : (
        <div className={`${SECTION_LABEL} font-semibold uppercase px-3 py-2`}>
          {section.sectionTitle}
        </div>
      )}
      <div className="flex flex-col gap-1">
        {section.items.map((item, idx) => (
          <MenuItem
            key={idx}
            item={item}
            pathname={pathname}
            isCollapsed={isCollapsed}
          />
        ))}
      </div>
    </div>
  ),
);
SectionGroup.displayName = "SectionGroup";

// Individual menu item — supports active state and optional submenu
// "/dashboard" should match only its exact pathname; deeper paths use prefix match
const isItemPathActive = (itemPath: string, pathname: string): boolean => {
  if (itemPath === "/dashboard") return pathname === "/dashboard";
  return itemPath === pathname || pathname.startsWith(itemPath + "/");
};

const MenuItem = memo(
  ({
    item,
    pathname,
    isCollapsed = false,
  }: {
    item: SideNavItem;
    pathname: string;
    isCollapsed?: boolean;
  }) => {
    const isItemActive = isItemPathActive(item.path, pathname);
    const isSubItemActive =
      item.submenu &&
      item.subMenuItems?.some(
        (sub) => sub.path === pathname || pathname.startsWith(sub.path + "/"),
      );
    const [subMenuOpen, setSubMenuOpen] = useState(!!isSubItemActive);

    useEffect(() => {
      if (isSubItemActive) setSubMenuOpen(true);
    }, [isSubItemActive]);

    const toggleSubMenu = useCallback(() => {
      setSubMenuOpen((prev) => !prev);
    }, []);

    const renderIcon = () => {
      if (item.title === "Menu") {
        return <PiBookOpenTextLight className="text-[20px]" />;
      }
      if (typeof item.icon === "string" || (item.icon as any)?.src) {
        return (
          <Image
            src={item.icon}
            alt=""
            width={20}
            height={20}
            className="w-5 h-5"
          />
        );
      }
      return item.icon;
    };

    if (item.submenu) {
      // When collapsed, treat submenu parents as direct links (we have no room
      // for the expanded sub-list) and rely on the icon + tooltip.
      if (isCollapsed) {
        const targetPath = item.locked ? "/dashboard/unauthorized" : item.path;
        return (
          <Link
            prefetch
            href={targetPath}
            aria-disabled={item.locked ? true : undefined}
            title={
              item.locked
                ? `${item.title} — no access`
                : item.title
            }
            className={`flex items-center justify-center px-2 py-2.5 rounded-lg transition-colors ${
              isSubItemActive || isItemActive ? ITEM_ACTIVE : ITEM_INACTIVE
            } ${item.locked ? "opacity-60" : ""}`}
          >
            <span className="flex-shrink-0">{renderIcon()}</span>
          </Link>
        );
      }

      return (
        <div>
          <button
            type="button"
            onClick={toggleSubMenu}
            className={`flex items-center gap-3 w-full px-3 py-3 rounded-lg text-[13px] font-medium transition-colors ${
              isSubItemActive ? ITEM_ACTIVE : ITEM_INACTIVE
            } ${item.locked ? "opacity-60" : ""}`}
          >
            <span className="flex-shrink-0">{renderIcon()}</span>
            <span className="flex-1 text-left">{item.title}</span>
            {item.locked ? (
              <FiLock
                aria-label="No access"
                className="text-[13px] text-[#94A3B8] flex-shrink-0"
              />
            ) : null}
          </button>
          {subMenuOpen && (
            <div className="flex flex-col ml-6 mt-1 border-l border-[#1E293B]">
              {item.subMenuItems?.map((subItem, idx) => {
                const isActive = subItem.path === pathname;
                return (
                  <Link
                    prefetch
                    key={idx}
                    href={subItem.path}
                    className={`pl-4 pr-3 py-2 text-[12px] rounded-r-md transition-colors ${
                      isActive
                        ? "text-white bg-[#111B2E] font-medium"
                        : "text-[#94A3B8] hover:text-white hover:bg-[#111B2E]"
                    }`}
                  >
                    {subItem.title}
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      );
    }

    const targetPath = item.locked ? "/dashboard/unauthorized" : item.path;

    return (
      <Link
        prefetch
        href={targetPath}
        aria-disabled={item.locked ? true : undefined}
        title={
          item.locked
            ? `${item.title} — no access`
            : isCollapsed
              ? item.title
              : undefined
        }
        className={`flex items-center rounded-lg text-[13px] font-medium transition-colors ${
          isCollapsed
            ? "justify-center px-2 py-2.5"
            : "gap-3 px-3 py-3"
        } ${isItemActive ? ITEM_ACTIVE : ITEM_INACTIVE} ${
          item.locked ? "opacity-60" : ""
        }`}
      >
        <span className="flex-shrink-0">{renderIcon()}</span>
        {!isCollapsed && (
          <>
            <span className="flex-1 truncate">{item.title}</span>
            {item.locked ? (
              <FiLock
                aria-label="No access"
                className="text-[13px] text-[#94A3B8] flex-shrink-0"
              />
            ) : null}
          </>
        )}
      </Link>
    );
  },
);
MenuItem.displayName = "MenuItem";
