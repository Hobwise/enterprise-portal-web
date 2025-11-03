"use client";

import BackButton from '@/components/backButton';
import SettingsSidebar from '@/components/settingsSidebar';
import usePermission from '@/hooks/cachedEndpoints/usePermission';
import { Spacer } from '@nextui-org/react';
import { useEffect, useState } from 'react';
import { getJsonItemFromLocalStorage } from '@/lib/utils';
import { isPOSUser, isCategoryUser, getUserHomeRoute } from '@/lib/userTypeUtils';


const SettingsLayout = ({ children }: { children: React.ReactNode }) => {
    const { role } = usePermission();
    const [backUrl, setBackUrl] = useState<string | null>(null);
    const [shouldShowBackButton, setShouldShowBackButton] = useState(false);

    useEffect(() => {
      // Determine back button behavior based on user type
      const userInfo = getJsonItemFromLocalStorage('userInformation');

      if (userInfo) {
        // POS users should go back to /pos
        if (isPOSUser(userInfo)) {
          setBackUrl('/pos');
          setShouldShowBackButton(true);
        }
        // Category users should go back to /business-activities
        else if (isCategoryUser(userInfo)) {
          setBackUrl('/business-activities');
          setShouldShowBackButton(true);
        }
        // Regular staff users (role === 1) should go back to /dashboard/orders
        else if (userInfo.role === 1) {
          setBackUrl('/dashboard/orders');
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

      <h1 className="text-[28px] leading-8 font-bold">Settings</h1>
      <p className="text-sm  text-gray-600 mb-10">
        Take a look at your polices and the new policy to see what is covered
      </p>
      <Spacer y={8} />
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <SettingsSidebar />
        <div className="col-span-1 lg:col-span-9 border border-secondaryGrey rounded-lg p-5">
          {children}
        </div>
      </section>
    </>
  );
};

export default SettingsLayout;
