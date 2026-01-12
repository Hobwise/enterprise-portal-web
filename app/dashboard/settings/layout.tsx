"use client";

import BackButton from "@/components/backButton";
import SettingsSidebar, { lists } from "@/components/settingsSidebar";
import { Spacer } from "@nextui-org/react";
import { useEffect, useState, useMemo } from "react";
import { getJsonItemFromLocalStorage } from "@/lib/utils";
import { isPOSUser, isCategoryUser } from "@/lib/userTypeUtils";
import { usePathname } from "next/navigation";

const SettingsLayout = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const [backUrl, setBackUrl] = useState<string | null>(null);
  const [shouldShowBackButton, setShouldShowBackButton] = useState(false);

  // Find current route info based on pathname
  const currentRoute = useMemo(() => {
    return (
      lists.find((item) => pathname.startsWith(item.href)) || {
        title: "Settings",
        subtitle: "Manage your account and preferences",
      }
    );
  }, [pathname]);

  useEffect(() => {
    // Determine back button behavior based on user type
    const userInfo = getJsonItemFromLocalStorage("userInformation");

    if (userInfo) {
      // POS users should go back to /pos
      if (isPOSUser(userInfo)) {
        setBackUrl("/pos");
        setShouldShowBackButton(true);
      }
      // Category users should go back to /business-activities
      else if (isCategoryUser(userInfo)) {
        setBackUrl("/business-activities");
        setShouldShowBackButton(true);
      }
      // Regular staff users (role === 1) should go back to /dashboard/orders
      else if (userInfo.role === 1) {
        setBackUrl("/dashboard/orders");
        setShouldShowBackButton(true);
      }
      // Admin users (role === 0) don't need a back button
      else {
        setShouldShowBackButton(false);
      }
    }
  }, []);

  return (
    <>
      {shouldShowBackButton && backUrl && <BackButton url={backUrl} />}

      <h1 className="text-[28px] leading-8 font-bold">{currentRoute.title}</h1>
      <p className="text-sm text-gray-600 mb-10">{currentRoute.subtitle}</p>
      <Spacer y={8} />
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <SettingsSidebar />
        <div className="col-span-1 lg:col-span-9 border border-secondaryGrey rounded-lg">
          {children}
        </div>
      </section>
    </>
  );
};

export default SettingsLayout;
