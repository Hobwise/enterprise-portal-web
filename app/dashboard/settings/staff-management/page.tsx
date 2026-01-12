'use client';

import { useState } from "react";
import { Tabs, Tab } from "@nextui-org/react";
import TeamMembersTab from "@/components/ui/dashboard/settings/staff-management/TeamMembersTab";
import CreateNewRoleTab from "@/components/ui/dashboard/settings/staff-management/CreateNewRoleTab";
import RolesPermissionTab from "@/components/ui/dashboard/settings/staff-management/RolesPermissionTab";

const StaffManagementPage = () => {
  const [selectedTab, setSelectedTab] = useState("team-members");

  return (
    <section className="mb-6  p-5">
      <Tabs
        selectedKey={selectedTab}
        onSelectionChange={setSelectedTab}
        variant="light"
        classNames={{
          base: "w-full",
          tabList: "gap-0 w-full relative rounded-lg p-0 bg-gray-100",
          cursor: "w-full bg-primaryColor/10",
          tab: "flex-1 h-12 rounded-lg data-[selected=true]:bg-primaryColor/10",
          tabContent:
            "group-data-[selected=true]:text-primaryColor font-semibold text-grey500",
        }}
        fullWidth
      >
        <Tab className="px-5" key="team-members" title="Team Members">
          <TeamMembersTab />
        </Tab>
        <Tab className="px-5" key="create-role" title="Role Management">
          <CreateNewRoleTab />
        </Tab>
        <Tab
          className="px-5"
          key="roles-permission"
          title="Permission Management"
        >
          <RolesPermissionTab />
        </Tab>
      </Tabs>
    </section>
  );
};

export default StaffManagementPage;
