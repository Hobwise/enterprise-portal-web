"use client";

import BackButton from '@/components/backButton';
import SettingsSidebar from '@/components/settingsSidebar';
import usePermission from '@/hooks/cachedEndpoints/usePermission';
import { Spacer } from '@nextui-org/react';


const SettingsLayout = ({ children }: { children: React.ReactNode }) => {
    const { role } = usePermission();
  
  return (
    <>
   {role === 1 && <BackButton url="/dashboard/orders" />}
    
      <h1 className="text-[28px] leading-8 font-bold">Settings</h1>
      <p className="text-sm  text-gray-600 mb-10">
        Take a look at your polices and the new policy to see what is covered
      </p>
      <Spacer y={8} />
      <section className="grid grid-cols-12 gap-4">
        <SettingsSidebar />
        <div className="col-span-9 border border-secondaryGrey rounded-lg p-5">
          {children}
        </div>
      </section>
    </>
  );
};

export default SettingsLayout;
