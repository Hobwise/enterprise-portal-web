"use client";

import Link from "next/link";
import { cn, getJsonItemFromLocalStorage } from "@/lib/utils";
import { usePathname, useRouter } from "next/navigation";
import { EXCLUDE_SETTINGS_PATHS } from "@/lib/routePermissions";
import { useEffect, useState } from "react";
import { isPOSUser, getAllowedSettingsPaths, canAccessSettingsPath } from "@/lib/userTypeUtils";
import { useDisclosure } from "@nextui-org/react";
import { Menu, X } from "lucide-react";

export const lists = [
  {
    title: "Personal Information",
    subtitle: "See your full personal information",
    href: "/dashboard/settings/personal-information",
  },
  {
    title: "Password Management",
    subtitle: "Update your password and security settings",
    href: "/dashboard/settings/password-management",
  },
  {
    title: "Business Information",
    subtitle: "See your full business information",
    href: "/dashboard/settings/business-information",
  },
  // { title: "KYC Compliance", subtitle: "Complete your KYC verification", href: "/dashboard/settings/kyc-compliance" },
  {
    title: "Payment Management",
    subtitle: "Create and customize your payment account to ease transactions.",
    href: "/dashboard/settings/payment-management",
  },
  {
    title: "Billing & Subscription",
    subtitle: "Manage your subscription and billing details",
    href: "/dashboard/settings/subscriptions",
  },
  {
    title: "Staff Management",
    subtitle: "Manage your team members roles and permissions",
    href: "/dashboard/settings/staff-management",
  },
  {
    title: "Customize Business Display",
    subtitle: "Customize how your business appears to customers",
    href: "/dashboard/settings/customize-business-display",
  },
  // {
  //   title: "Terms and Condition",
  //   subtitle: "View terms and conditions",
  //   href: "/dashboard/settings/business-settings",
  // },
];

const SettingsSidebar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { isOpen, onOpen, onClose } = useDisclosure();

  // Initialize with all lists to match server render
  const [filteredLists, setFilteredLists] = useState(lists);

  useEffect(() => {
    // Access localStorage only on client side after hydration
    const userInfo = getJsonItemFromLocalStorage("userInformation");

    if (userInfo) {
      // Get allowed paths for this user type
      const allowedPaths = getAllowedSettingsPaths(userInfo);

      // Filter lists based on allowed paths
      const filtered = lists.filter((item) =>
        allowedPaths.includes(item.href)
      );

      setFilteredLists(filtered);

      // Redirect users away from restricted paths
      if (!canAccessSettingsPath(userInfo, pathname)) {
        // Redirect to personal information as the default allowed page
        router.push("/dashboard/settings/personal-information");
      }
    }
  }, [pathname, router]);

  const activeItem = filteredLists.find((item) =>
    pathname.startsWith(item.href.split("?")[0])
  );

  const renderNavItem = (item: (typeof lists)[number], onNavigate?: () => void) => (
    <li
      key={item.href}
      className={cn(
        "font-bold p-4 rounded-[4px] text-sm text-[#98A2B3] hover:bg-[#F0F2F5] hover:text-[#1D2739] duration-200",
        {
          "bg-[#F0F2F5] text-[#1D2739]": pathname.startsWith(
            item.href.split("?")[0]
          ),
        }
      )}
    >
      <Link href={item.href} onClick={onNavigate}>
        {item.title}
      </Link>
    </li>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:block lg:col-span-3">
        <ul className="border flex flex-col border-secondaryGrey p-3 rounded-lg h-fit">
          {filteredLists.map((item) => renderNavItem(item))}
        </ul>
      </aside>

      {/* Mobile trigger */}
      <button
        type="button"
        onClick={onOpen}
        className="lg:hidden col-span-1 flex w-full items-center justify-between rounded-lg border border-secondaryGrey bg-white px-4 py-3 text-sm font-bold text-[#1D2739]"
      >
        <span className="flex items-center gap-2">
          <Menu className="h-4 w-4 text-[#98A2B3]" />
          Settings Menu
        </span>
        <span className="truncate pl-3 text-xs font-medium text-[#98A2B3]">
          {activeItem?.title ?? "Settings"}
        </span>
      </button>

      {/* Mobile drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-[70] lg:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={onClose}
            aria-hidden="true"
          />
          <div className="absolute inset-y-0 left-0 flex w-72 max-w-[85%] flex-col overflow-y-auto bg-white p-4 shadow-2xl">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-bold text-[#344054]">Settings</span>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close settings menu"
                className="rounded-full p-1.5 text-[#667085] transition-colors hover:bg-[#F0F2F5]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <ul className="flex flex-col pt-1">
              {filteredLists.map((item) => renderNavItem(item, onClose))}
            </ul>
          </div>
        </div>
      )}
    </>
  );
};

export default SettingsSidebar;
