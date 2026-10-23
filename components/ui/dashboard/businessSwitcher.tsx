"use client";

import { useState, useEffect, useMemo, useCallback, memo } from "react";

import { generateRefreshToken } from "@/app/api/controllers/auth";
import useGetBusiness from "@/hooks/cachedEndpoints/useGetBusiness";
import useGetBusinessByCooperate from "@/hooks/cachedEndpoints/useGetBusinessByCooperate";
import { useSubscriptionContext } from "@/hooks/providers/SubscriptionProvider";
import { decryptPayload } from "@/lib/encrypt-decrypt";
import { getPlanLabel } from "@/lib/planLabels";
import {
  getJsonItemFromLocalStorage,
  resetLoginInfo,
  saveJsonItemToLocalStorage,
  setTokenCookie,
} from "@/lib/utils";
import {
  Avatar,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Skeleton,
} from "@nextui-org/react";
import { FiChevronDown } from "react-icons/fi";
import { GoPlus } from "react-icons/go";

import AddBusiness from "./settings/addBusiness";

const getBusinessInitials = (name?: string): string => {
  if (!name) return "B";
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "B";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
};

interface BusinessSwitcherProps {
  /** Desktop sidebar collapsed mode — shows avatar only */
  isCollapsed?: boolean;
  /** "sidebar" matches the dark desktop sidebar; "mobile" suits the mobile nav overlay */
  variant?: "sidebar" | "mobile";
}

const BusinessSwitcher = ({
  isCollapsed = false,
  variant = "sidebar",
}: BusinessSwitcherProps) => {
  const isMobile = variant === "mobile";

  const { data: businessDetails, isLoading } = useGetBusiness();
  const { data: businessDetailsList, refetch } = useGetBusinessByCooperate();
  const { subscription, hasCapability } = useSubscriptionContext();

  const canAccessMultipleLocations = hasCapability(
    "canAccessMultipleLocations",
  );

  const business = useMemo(
    () => getJsonItemFromLocalStorage("business") || [],
    [],
  );
  const userInformation = useMemo(
    () => getJsonItemFromLocalStorage("userInformation"),
    [],
  );

  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

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

  const businessName = business?.[0]?.businessName || "Your business";
  const businessInitials = getBusinessInitials(businessName);
  const planLabel = getPlanLabel(subscription?.plan);
  const canSwitch =
    Boolean(userInformation?.isOwner) && canAccessMultipleLocations;

  // Avoid rendering dropdown data from localStorage during SSR/hydration
  if (!isMounted) {
    return (
      <div
        className={
          isMobile
            ? "flex items-center gap-3 px-2 py-3"
            : `flex-shrink-0 ${isCollapsed ? "px-2" : "px-4"} pt-5`
        }
      >
        <Skeleton className="w-10 h-10 rounded-md" />
        {!isCollapsed ? (
          <div className="flex-1 flex flex-col gap-2">
            <Skeleton className="h-2 w-3/5 rounded" />
            <Skeleton className="h-2 w-4/5 rounded" />
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div
      className={
        isMobile
          ? "w-full"
          : `flex-shrink-0 ${isCollapsed ? "px-2" : "px-4"} pt-5`
      }
    >
      <Dropdown
        placement={isMobile ? "bottom" : "bottom-start"}
        classNames={{ content: "bg-[#1A2236] border border-[#2B3550]" }}
      >
        <DropdownTrigger>
          <button
            type="button"
            aria-label="Switch business"
            title={canSwitch ? `Switch business — ${businessName}` : businessName}
            className={`w-full flex items-center rounded-lg transition ${
              isMobile
                ? "gap-3 px-2 py-3 hover:bg-white/10 text-white"
                : `hover:bg-[#111B2E] ${isCollapsed ? "justify-center px-1 py-2" : "gap-2 px-1.5 py-2"}`
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
                  <span
                    className={`font-semibold truncate w-full text-left leading-tight ${
                      isMobile
                        ? "text-[15px] text-white"
                        : "text-[13px] text-white"
                    }`}
                  >
                    {businessName}
                  </span>
                  <PoweredByBadge planLabel={planLabel} />
                </div>
                {canSwitch ? (
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
          {canSwitch &&
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

          {canSwitch && (
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

      <AddBusiness
        refetch={refetch}
        toggleBusinessModal={toggleBusinessModal}
        isOpenBusinessModal={isOpenBusinessModal}
      />
    </div>
  );
};

export default BusinessSwitcher;

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
