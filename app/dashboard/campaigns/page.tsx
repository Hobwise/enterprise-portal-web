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
import useCampaign from "@/hooks/cachedEndpoints/useCampaign";
import usePermission from "@/hooks/cachedEndpoints/usePermission";
import { useGlobalContext } from "@/hooks/globalProvider";
import { IoMdAdd } from "react-icons/io";
import { CustomLoading } from "@/components/ui/dashboard/CustomLoading";

const Compaigns: React.FC = () => {
  const router = useRouter();

  const { userRolePermissions, role } = usePermission();

  const { data, isLoading, isError, refetch } = useCampaign();

  const { setPage, setTableStatus } = useGlobalContext();

  useEffect(() => {
    setTableStatus("All Campaigns");
    setPage(1);
  }, []);

  const [searchQuery, setSearchQuery] = useState("");

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value.toLowerCase());
  };

  const filteredItems = useMemo(() => {
    return data?.map((item) => ({
      ...item,
      campaigns: item?.campaigns?.filter(
        (item) =>
          item?.campaignName?.toLowerCase().includes(searchQuery) ||
          item?.campaignDescription?.toLowerCase().includes(searchQuery) ||
          item?.dressCode?.toLowerCase().includes(searchQuery)
      ),
    }));
  }, [data, searchQuery]);
 
  if (isLoading) return <CustomLoading />;

  if (isError) return <Error onClick={() => refetch()} />;

  return (
    <>
      <div className="flex flex-row flex-wrap xl:mb-8 mb-4 justify-between">
        <div>
          <div className="text-[24px] leading-8 font-semibold">
            <div className="flex items-center">
              <span>Campaigns</span>

              {data?.[0]?.campaigns?.length > 0 && (
                <Chip
                  classNames={{
                    base: ` ml-2 text-xs h-7 font-[600] w-5 bg-[#EAE5FF] text-primaryColor`,
                  }}
                >
                  {data?.[0]?.totalCount}
                </Chip>
              )}
            </div>
          </div>
          <p className="text-sm  text-grey600  xl:w-[231px] w-full ">
            Showing all campaigns
          </p>
        </div>
        <div className="flex items-center gap-3">
          {data?.[0]?.campaigns?.length > 0 && (
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
              {data?.[0]?.campaigns?.length > 0 && (
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
      {data?.[0]?.campaigns?.length > 0 ? (
        <CampaignList
          campaigns={filteredItems}
          searchQuery={searchQuery}
          refetch={refetch}
        />
      ) : (
        <CreateCampaign />
      )}
    </>
  );
};

export default Compaigns;
