"use client";

import React, { useEffect, useState } from "react";

import { repeatCampaign } from "@/app/api/controllers/dashboard/campaigns";
import usePermission from "@/hooks/cachedEndpoints/usePermission";
import useAllCampaignsData from "@/hooks/cachedEndpoints/useAllCampaignsData";
import { useGlobalContext } from "@/hooks/globalProvider";
import usePagination from "@/hooks/usePagination";
import { notify, saveJsonItemToLocalStorage } from "@/lib/utils";
import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownSection,
  DropdownTrigger,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  Chip,
} from "@nextui-org/react";
import moment from "moment";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { FaRegEdit } from "react-icons/fa";
import { HiOutlineDotsVertical } from "react-icons/hi";
import { LuEye } from "react-icons/lu";
import { PiRepeat } from "react-icons/pi";
import { RiDeleteBin6Line } from "react-icons/ri";
import noImage from "../../../../public/assets/images/no-image.svg";
import { columns } from "./data";
import DeleteCampaignModal from "./deleteCampaign";
import Filters from "./filters";
import RepeatCampaignModal from "./repeatCampaign";
import useCampaignCategory from "@/hooks/cachedEndpoints/useCampaignCategory";
import { CustomLoading } from "@/components/ui/dashboard/CustomLoading";
import CreateCampaign from "./createCampaign";
import SpinnerLoader from "@/components/ui/dashboard/menu/SpinnerLoader";

const INITIAL_VISIBLE_COLUMNS = [
  "campaignName",
  "campaignDescription",
  "startDateTime",
  "actions",
];

interface Campaign {
  id: string;
  campaignName: string;
  campaignDescription: string;
  startDateTime: string;
  endDateTime: string;
  dressCode: string;
  isActive: boolean;
  image: string;
  imageReference: string;
}

interface CampaignGroup {
  name: string;
  campaigns: Campaign[];
  totalCount: number;
  pageSize: number;
  currentPage: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

const CampaignList = ({ searchQuery }: any) => {
  const { userRolePermissions, role } = usePermission();
  const { setTableStatus, tableStatus, page, setPage } = useGlobalContext();

  const [isOpenDelete, setIsOpenDelete] = React.useState(false);
  const [isOpenRepeat, setIsOpenRepeat] = React.useState(false);
  const [singleCampaign, setSingleCampaign] = React.useState<any>({});

  // Use the new hook for fetching all data
  const { 
    getCategoryDetails, 
    isLoadingInitial, 
    isLoadingAll,
    isLoadingCurrent,
    campaigns: allCampaigns,
    categories
  } = useAllCampaignsData(tableStatus);

  // Get data for current category from the new hook
  const rawCategoryData = getCategoryDetails(tableStatus || 'All Campaigns');
  
  
  // Create pagination data structure for usePagination hook (matching Orders page)
  // Note: API returns all campaigns (pageSize 100), so we use client-side pagination via usePagination
  const paginationData = React.useMemo(() => {
    if (rawCategoryData && typeof rawCategoryData === 'object') {
      return {
        data: rawCategoryData.data || [],
        totalCount: rawCategoryData.totalCount || 0,
      };
    }
    return {
      data: [],
      totalCount: 0,
    };
  }, [rawCategoryData]);
  
  const {
    bottomContent,
    headerColumns,
    setSelectedKeys,
    selectedKeys,
    sortDescriptor,
    setSortDescriptor,
    filterValue,
    statusFilter,
    visibleColumns,
    onSearchChange,
    onRowsPerPageChange,
    classNames,
    hasSearchFilter,
    displayData,
    isMobile,
  } = usePagination(paginationData, columns, INITIAL_VISIBLE_COLUMNS);

  const toggleCampaignModal = () => {
    setIsOpenDelete(!isOpenDelete);
  };

  const toggleRepeatModal = (campaign?: any) => {
    setSingleCampaign(campaign);
    setIsOpenRepeat(!isOpenRepeat);
  };

  const router = useRouter();

  const handleTabClick = (categoryName: string) => {
    setTableStatus(categoryName);
    setPage(1);
  };

  const handleTabChange = (_: any) => {
    // Not used for filtering, but kept for compatibility
  };

  // Function to check if campaign is in completed array (you'll need to implement this)
  const isItemInCompletedArray = (campaign: Campaign, campaigns: any) => {
    // Add your logic here to check if campaign is completed
    // This is a placeholder - replace with your actual logic
    return true;
  };

  const [isLoading, setIsLoading] = useState(false);
  const restartCampaign = async (campaign: any) => {
    setIsLoading(true);
    const data = await repeatCampaign(campaign.id);
    setIsLoading(false);
    if (data?.data?.isSuccessful) {
      // Refetch campaigns - will be handled by the new hook
      toast.success("Campaign repeated successfully");
      toggleRepeatModal();
    } else if (data?.data?.error) {
      notify({
        title: "Error!",
        text: data?.data?.error,
        type: "error",
      });
    }
  };

  

  const renderCell = React.useCallback(
    (campaign: Campaign, columnKey: string) => {

      const cellValue = campaign[columnKey as keyof Campaign];
      switch (columnKey) {
        case "campaignDescription":
          return (
            <div className="md:w-[250px] text-textGrey text-sm w-[150px]">
              {campaign.campaignDescription}
            </div>
          );
        case "campaignName":
          return (
            <div className="font-medium text-black text-sm">
              {campaign.campaignName}
            </div>
          );
        case "startDateTime":
          return (
            <div className="text-textGrey text-sm">
              {moment(campaign?.startDateTime).format(
                "MMMM Do YYYY, h:mm:ss a"
              )}
            </div>
          );
        case "actions":
          return (
            <div className="relative flexjustify-center items-center gap-2">
              <Dropdown aria-label="drop down" className="">
                <DropdownTrigger aria-label="actions">
                  <div className="cursor-pointer flex justify-center items-center text-black">
                    <HiOutlineDotsVertical className="text-[22px] " />
                  </div>
                </DropdownTrigger>
                <DropdownMenu className="text-black">
                  <DropdownSection>
                    <DropdownItem aria-label="preview campaign">
                      <Link
                        prefetch={true}
                        className="flex w-full"
                        href={{
                          pathname: `/dashboard/campaigns/${campaign.id}`,
                          query: {
                            campaignId: campaign.id,
                          },
                        }}
                      >
                        <div
                          className={` flex gap-2  items-center text-grey500`}
                        >
                          <LuEye />
                          <p>Preview campaign</p>
                        </div>
                      </Link>
                    </DropdownItem>
                    {isItemInCompletedArray(campaign, allCampaigns) ? (
                      <DropdownItem
                        aria-label="repeat campaign"
                        onClick={() => toggleRepeatModal(campaign)}
                      >
                        <div
                          className={` flex gap-2  items-center text-grey500`}
                        >
                          <PiRepeat />
                          <p>Repeat campaign</p>
                        </div>
                      </DropdownItem>
                    ) : <></>}
                    {(role === 0 ||
                      userRolePermissions?.canEditCampaign === true) ? (
                      <DropdownItem
                        aria-label="edit campaign"
                        onClick={() => {
                          saveJsonItemToLocalStorage("campaign", campaign);
                          router.push("/dashboard/campaigns/edit-campaign");
                        }}
                      >
                        <div
                          className={` flex gap-2  items-center text-grey500`}
                        >
                          <FaRegEdit />
                          <p>Edit campaign</p>
                        </div>
                      </DropdownItem>
                    ) : <></>}
                    {(role === 0 ||
                      userRolePermissions?.canDeleteCampaign === true) ? (
                      <DropdownItem
                        aria-label="delete campaign"
                        onClick={() => {
                          toggleCampaignModal();
                          saveJsonItemToLocalStorage("campaign", campaign);
                        }}
                      >
                        <div
                          className={` flex gap-2  items-center text-grey500`}
                        >
                          <RiDeleteBin6Line />
                          <p>Delete campaign</p>
                        </div>
                      </DropdownItem>
                    ) : <></>}
                  </DropdownSection>
                </DropdownMenu>
              </Dropdown>
            </div>
          );
        default:
          return cellValue;
      }
    },
    [ role, userRolePermissions, router]
  );

  const topContent = React.useMemo(() => {
    return (
      <Filters
        campaigns={{ campaignCategories: categories }}
        handleTabChange={handleTabChange}
        value={tableStatus}
        handleTabClick={handleTabClick}
      />
    );
  }, [categories, tableStatus]);

  const renderMobileCard = React.useCallback(
    (campaign: Campaign) => (
      <article
        key={campaign.id}
        className="p-4 cursor-pointer hover:bg-gray-50 active:bg-gray-100 transition-colors"
        onClick={() => {
          saveJsonItemToLocalStorage("campaign", campaign);
          router.push(`/dashboard/campaigns/${campaign.id}`);
        }}
      >
        <div className="flex items-end justify-end mb-3 mt-2">
          <div className="ml-2" onClick={(e) => e.stopPropagation()}>
            <Dropdown aria-label="campaign actions" className="">
              <DropdownTrigger aria-label="actions">
                <div className="cursor-pointer flex justify-center items-center text-black p-2 -m-2">
                  <HiOutlineDotsVertical className="text-[20px]" />
                </div>
              </DropdownTrigger>
              <DropdownMenu className="text-black">
                <DropdownSection>
                  <DropdownItem
                    key="preview"
                    onClick={() => {
                      saveJsonItemToLocalStorage("campaign", campaign);
                      router.push(`/dashboard/campaigns/${campaign.id}`);
                    }}
                    aria-label="Preview campaign"
                  >
                    <div className="flex gap-3 items-center text-grey500">
                      <LuEye />
                      <p>Preview campaign</p>
                    </div>
                  </DropdownItem>
                  {isItemInCompletedArray(campaign, allCampaigns) ? (
                    <DropdownItem
                      key="repeat"
                      onClick={() => toggleRepeatModal(campaign)}
                      aria-label="Repeat campaign"
                    >
                      <div className="flex gap-3 items-center text-grey500">
                        <PiRepeat />
                        <p>Repeat campaign</p>
                      </div>
                    </DropdownItem>
                  ) : null}
                  {(role === 0 ||
                    userRolePermissions?.canEditCampaign === true) && (
                    <DropdownItem
                      key="edit"
                      onClick={() => {
                        saveJsonItemToLocalStorage("campaign", campaign);
                        router.push("/dashboard/campaigns/edit-campaign");
                      }}
                      aria-label="Edit campaign"
                    >
                      <div className="flex gap-3 items-center text-grey500">
                        <FaRegEdit />
                        <p>Edit campaign</p>
                      </div>
                    </DropdownItem>
                  )}
                  {(role === 0 ||
                    userRolePermissions?.canDeleteCampaign === true) && (
                    <DropdownItem
                      key="delete"
                      onClick={() => {
                        toggleCampaignModal();
                        saveJsonItemToLocalStorage("campaign", campaign);
                      }}
                      aria-label="Delete campaign"
                    >
                      <div className="text-danger-500 flex items-center gap-3">
                        <RiDeleteBin6Line />
                        <p>Delete campaign</p>
                      </div>
                    </DropdownItem>
                  )}
                </DropdownSection>
              </DropdownMenu>
            </Dropdown>
          </div>
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-semibold text-black text-[15px]">
              {campaign.campaignName}
            </span>
          </div>
          <div className="text-textGrey text-[13px] line-clamp-2">
            {campaign.campaignDescription}
          </div>
        </div>

        <div className="flex items-center justify-between mt-3">
          <div className="text-textGrey text-[12px]">
            {moment(campaign.startDateTime).format("MMM DD, YYYY h:mm A")}
          </div>
          <Chip
            className="capitalize"
            color={campaign.isActive ? "success" : "secondary"}
            size="sm"
            variant="bordered"
          >
            {campaign.isActive ? "Active" : "Inactive"}
          </Chip>
        </div>
      </article>
    ),
    [role, userRolePermissions, router, allCampaigns]
  );

  // Use displayData which contains accumulated data on mobile, current page on desktop
  let campaignsToDisplay = displayData && Array.isArray(displayData) ? displayData : [];

  // Filter campaigns based on searchQuery
  if (searchQuery && searchQuery.trim() && Array.isArray(campaignsToDisplay)) {
    const lowerSearch = searchQuery.toLowerCase();
    campaignsToDisplay = campaignsToDisplay.filter(
      (item: any) =>
        item?.campaignName?.toLowerCase().includes(lowerSearch) ||
        item?.campaignDescription?.toLowerCase().includes(lowerSearch)
    );
  }

  // Final safety check to ensure campaignsToDisplay is always an array
  if (!Array.isArray(campaignsToDisplay)) {
    campaignsToDisplay = [];
  }

  // Show loading state
  if ((isLoadingInitial && (!categories || categories.length === 0)) || isLoadingCurrent) {
    return (
      <section className="border border-primaryGrey rounded-lg overflow-hidden p-8">
        <div className="flex justify-center items-center">
          <CustomLoading />
        </div>
      </section>
    );
  }
  
// Show empty state if no campaigns and not loading
  if (!isLoadingInitial && allCampaigns.length === 0 && categories.length === 0) {
    return <CreateCampaign />;
  }


  return (
    <section className="border border-primaryGrey rounded-lg overflow-hidden">
      {/* Filters - shown on both mobile and desktop */}
      {topContent}

      {/* Mobile Card Layout */}
      {isMobile ? (
        <div className="divide-y divide-primaryGrey">
          {/* Loading state */}
          {isLoadingCurrent && (
            <div className="flex justify-center items-center py-16">
              <SpinnerLoader size="md" />
            </div>
          )}

          {/* Empty state */}
          {!isLoadingCurrent && campaignsToDisplay.length === 0 && (
            <div className="flex justify-center items-center py-16 text-textGrey">
              {searchQuery ? "No campaigns match your search" : "No campaign found"}
            </div>
          )}

          {/* Campaign Cards */}
          {!isLoadingCurrent &&
            campaignsToDisplay.map((campaign: Campaign) =>
              renderMobileCard(campaign)
            )}

          {/* Infinite Scroll Sentinel & Loading Indicator from usePagination */}
          {bottomContent}
        </div>
      ) : (
        /* Desktop Table Layout */
        <Table
          radius="lg"
          isCompact
          removeWrapper
          aria-label="list of campaign"
          bottomContent={bottomContent}
          bottomContentPlacement="outside"
          classNames={classNames}
          topContent={null}
          sortDescriptor={sortDescriptor as any}
          topContentPlacement="outside"
          onSortChange={setSortDescriptor as any}
        >
          <TableHeader columns={headerColumns}>
            {(column) => (
              <TableColumn
                key={column.uid}
                align={column.uid === "actions" ? "center" : "start"}
              >
                {column.name}
              </TableColumn>
            )}
          </TableHeader>
          <TableBody
            emptyContent={
              isLoadingInitial ? (
                <CustomLoading />
              ) : (
                searchQuery ? "No campaigns match your search" : "No campaign found"
              )
            }
            items={campaignsToDisplay || []}
          >
            {(item: Campaign) => (
              <TableRow
                key={item.id || JSON.stringify(item)}
                className="cursor-pointer hover:bg-gray-50 transition-colors"
              >
                {(columnKey) => (
                  <TableCell>{renderCell(item, columnKey as string)}</TableCell>
                )}
              </TableRow>
            )}
          </TableBody>
        </Table>
      )}

      <DeleteCampaignModal
        isOpenDelete={isOpenDelete}
        setIsOpenDelete={setIsOpenDelete}
        toggleCampaignModal={toggleCampaignModal}
      />
      <RepeatCampaignModal
        isLoading={isLoading}
        isOpenRepeat={isOpenRepeat}
        singleCampaign={singleCampaign}
        restartCampaign={restartCampaign}
        toggleRepeatModal={toggleRepeatModal}
      />
    </section>
  );
};

export default CampaignList;
