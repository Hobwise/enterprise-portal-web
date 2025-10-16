"use client";

import Link from "next/link";
import { cn, getJsonItemFromLocalStorage } from "@/lib/utils";
import { usePathname, useRouter } from "next/navigation";
import { EXCLUDE_SETTINGS_PATHS } from "@/lib/routePermissions";
import { useEffect } from "react";

const lists = [
  {
    title: "Personal Information",
    href: "/dashboard/settings/personal-information",
  },
  {
    title: "Password Management",
    href: "/dashboard/settings/password-management",
  },
  {
    title: "Business Information",
    href: "/dashboard/settings/business-information",
  },
  { title: "KYC Compliance", href: "/dashboard/settings/kyc-compliance" },
  {
    title: "Billing & Subscription",
    href: "/dashboard/settings/subscriptions",
  },
  { title: "Teams Management", href: "/dashboard/settings/teams" },
  {
    title: "Roles and Permissions",
    href: "/dashboard/settings/staff-management",
  },
  {
    title: "Terms and Condition",
    href: "/dashboard/settings/business-settings",
  },
];

const SettingsSidebar = () => {
  const pathname = usePathname();
  const router = useRouter();

  const userInfo = getJsonItemFromLocalStorage("userInformation");
  const filteredLists =
    userInfo.role === 0
      ? lists
      : lists.filter((item) => !EXCLUDE_SETTINGS_PATHS.includes(item.href));

  useEffect(() => {
    if (userInfo.role === 1 && EXCLUDE_SETTINGS_PATHS.includes(pathname)) {
      router.push("/dashboard/settings/personal-information");
    }
  }, [pathname]);

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
