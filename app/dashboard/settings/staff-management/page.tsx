'use client';

import { useState } from "react";
import { Tabs, Tab } from "@nextui-org/react";
import TeamMembersTab from "@/components/ui/dashboard/settings/staff-management/TeamMembersTab";
import CreateNewRoleTab from "@/components/ui/dashboard/settings/staff-management/CreateNewRoleTab";
import RolesPermissionTab from "@/components/ui/dashboard/settings/staff-management/RolesPermissionTab";
import useMobile from "@/hooks/useMobile";

const StaffManagementPage = () => {
  const [selectedTab, setSelectedTab] = useState("team-members");
  const isMobile = useMobile();

  return (
    <section className="mb-6 p-3 sm:p-5">
      <Tabs
        selectedKey={selectedTab}
        onSelectionChange={setSelectedTab}
        variant="light"
        fullWidth={!isMobile}
        classNames={{
          base: "w-full",
          tabList: isMobile
            ? "gap-1 w-full relative rounded-lg p-1 bg-gray-100 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            : "gap-0 w-full relative rounded-lg p-0 bg-gray-100",
          cursor: isMobile
            ? "bg-primaryColor/10"
            : "w-full bg-primaryColor/10",
          tab: isMobile
            ? "h-10 rounded-lg px-4 whitespace-nowrap data-[selected=true]:bg-primaryColor/10"
            : "flex-1 h-12 rounded-lg data-[selected=true]:bg-primaryColor/10",
          tabContent:
            "group-data-[selected=true]:text-primaryColor font-semibold text-grey500 text-sm",
        }}
      >
        <Tab className="px-3 sm:px-5" key="team-members" title="Team Members">
          {selectedTab === "team-members" && <TeamMembersTab />}
        </Tab>
        <Tab className="px-3 sm:px-5" key="create-role" title="Role Management">
          {selectedTab === "create-role" && <CreateNewRoleTab />}
        </Tab>
        <Tab
          className="px-3 sm:px-5"
          key="roles-permission"
          title="Permission Management"
        >
          {selectedTab === "roles-permission" && <RolesPermissionTab />}
        </Tab>
      </Tabs>
    </section>
  );
};

export default StaffManagementPage;
