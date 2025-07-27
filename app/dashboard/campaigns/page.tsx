"use client";

import React, { useEffect, useMemo, useState } from "react";
import { CustomInput } from "@/components/CustomInput";
import { CustomButton } from "@/components/customButton";
import { Chip } from "@nextui-org/react";
import { useRouter } from "next/navigation";
import { IoSearchOutline } from "react-icons/io5";

import Error from "@/components/error";
import CampaignList from "@/components/ui/dashboard/campaign/campaignList";
import CreateCampaign from "@/components/ui/dashboard/campaign/createCampaign";
import usePermission from "@/hooks/cachedEndpoints/usePermission";
import { useGlobalContext } from "@/hooks/globalProvider";
import { IoMdAdd } from "react-icons/io";
import { CustomLoading } from "@/components/ui/dashboard/CustomLoading";

const Compaigns: React.FC = () => {
  const router = useRouter();

  const { userRolePermissions, role } = usePermission();

  // Data fetching is now handled by CampaignList component internally  

  const { setPage, setTableStatus } = useGlobalContext();

  useEffect(() => {
    setTableStatus("All Campaigns");
    setPage(1);
  }, [setTableStatus, setPage]);



  const [searchQuery, setSearchQuery] = useState("");

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value.toLowerCase());
  };


 
  // Loading and error states are now handled by CampaignList component

  return (
    <>
      <div className="flex flex-row flex-wrap xl:mb-8 mb-4 justify-between">
        <div>
          <div className="text-[24px] leading-8 font-semibold">
            <div className="flex items-center">
              <span>Campaigns</span>

              {/* Campaign count will be handled by CampaignList component */}
            </div>
          </div>
          <p className="text-sm  text-grey600  xl:w-[231px] w-full ">
            Showing all campaigns
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Always show search input */ true && (
            <>
              <div>
                <CustomInput
                  classnames={"w-[242px]"}
                  label=""
                  size="md"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  isRequired={false}
                  startContent={<IoSearchOutline />}
                  type="text"
                  placeholder="Search here..."
                />
              </div>
            </>
          )}

          {(role === 0 || userRolePermissions?.canCreateCampaign === true) && (
            <>
              {/* Always show create button */ true && (
                <CustomButton
                  onClick={() =>
                    router.push("/dashboard/campaigns/create-campaign")
                  }
                  className="py-2 px-4 md:mb-0 mb-4 text-white"
                  backgroundColor="bg-primaryColor"
                >
                  <div className="flex gap-2 items-center justify-center">
                    <IoMdAdd className="text-[22px]" />

                    <p>Add campaign</p>
                  </div>
                </CustomButton>
              )}
            </>
          )}
        </div>
      </div>
      <CampaignList
        searchQuery={searchQuery}
      />
    </>
  );
};

export default Compaigns;
