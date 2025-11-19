"use client";

import Link from "next/link";
import { cn, getJsonItemFromLocalStorage } from "@/lib/utils";
import { usePathname, useRouter } from "next/navigation";
import { EXCLUDE_SETTINGS_PATHS } from "@/lib/routePermissions";
import { useEffect, useState } from "react";
import { isPOSUser, getAllowedSettingsPaths, canAccessSettingsPath } from "@/lib/userTypeUtils";

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

  return (
    <ul className="col-span-1 lg:col-span-3 border flex flex-col border-secondaryGrey p-3 rounded-lg h-fit">
      {filteredLists.map((item) => (
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
          <Link href={item.href}>{item.title}</Link>
        </li>
      ))}
    </ul>
  );
};

export default SettingsSidebar;
