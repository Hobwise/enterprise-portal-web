'use client';

import React, { useEffect, useState } from 'react';

import { repeatCampaign } from '@/app/api/controllers/dashboard/campaigns';
import usePermission from '@/hooks/cachedEndpoints/usePermission';
import { useGlobalContext } from '@/hooks/globalProvider';
import usePagination from '@/hooks/usePagination';
import { notify, saveJsonItemToLocalStorage } from '@/lib/utils';
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
} from '@nextui-org/react';
import moment from 'moment';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { FaRegEdit } from 'react-icons/fa';
import { HiOutlineDotsVertical } from 'react-icons/hi';
import { LuEye } from 'react-icons/lu';
import { PiRepeat } from 'react-icons/pi';
import { RiDeleteBin6Line } from 'react-icons/ri';
import noImage from '../../../../public/assets/images/no-image.svg';
import { columns } from './data';
import DeleteCampaignModal from './deleteCampaign';
import Filters from './filters';
import RepeatCampaignModal from './repeatCampaign';

const INITIAL_VISIBLE_COLUMNS = [
  'campaignName',
  'campaignDescription',
  'startDateTime',
  'image',

  'actions',
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

function isItemInCompletedArray(
  item: Campaign,
  array: CampaignGroup[]
): boolean {
  const completedGroup = array.find((group) => group.name === 'Completed');
  return completedGroup
    ? completedGroup.campaigns.some((campaign) => campaign.id === item.id)
    : false;
}

const CampaignList = ({ campaigns, searchQuery, refetch }: any) => {
  const [filteredCampaigns, setFilteredCampaigns] = React.useState(
    campaigns[0]?.campaigns
  );

  const { userRolePermissions, role } = usePermission();

  useEffect(() => {
    if (campaigns && searchQuery) {
      const filteredData = campaigns.map((campaign) => ({
        ...campaign,
        campaigns: campaign?.campaigns?.filter(
          (item) =>
            item?.campaignName?.toLowerCase().includes(searchQuery) ||
            item?.campaignDescription?.toLowerCase().includes(searchQuery) ||
            item?.dressCode?.toLowerCase().includes(searchQuery)
        ),
      }));
      setFilteredCampaigns(
        filteredData.length > 0 ? filteredData[0].campaigns : []
      );
    } else {
      setFilteredCampaigns(campaigns?.[0]?.campaigns);
    }
  }, [searchQuery, campaigns]);

  const { setTableStatus, tableStatus, setPage } = useGlobalContext();

  const [isOpenDelete, setIsOpenDelete] = React.useState<Boolean>(false);
  const [isOpenRepeat, setIsOpenRepeat] = React.useState<Boolean>(false);
  const [singleCampaign, setSingleCampaign] = React.useState<Boolean>({});

  const toggleCampaignModal = () => {
    setIsOpenDelete(!isOpenDelete);
  };
  const toggleRepeatModal = (campaign?: any) => {
    setSingleCampaign(campaign);
    setIsOpenRepeat(!isOpenRepeat);
  };
  const router = useRouter();

  const matchingObject = campaigns?.find(
    (category) => category?.name === tableStatus
  );
  const matchingObjectArray = matchingObject ? matchingObject?.campaigns : [];

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
  } = usePagination(matchingObject, columns, INITIAL_VISIBLE_COLUMNS);

  const handleTabClick = (index) => {
    setPage(1);
    const filteredCampaigns = campaigns.filter((item) => item.name === index);
    setTableStatus(filteredCampaigns[0]?.name);
    setFilteredCampaigns(filteredCampaigns[0]?.campaigns);
  };
  const [isLoading, setIsLoading] = useState(false);
  const restartCampaign = async (campaign: any) => {
    setIsLoading(true);
    const data = await repeatCampaign(campaign.id);
    setIsLoading(false);
    if (data?.data?.isSuccessful) {
      refetch();
      toast.success('Campaign repeated successfully');
      toggleRepeatModal();
    } else if (data?.data?.error) {
      notify({
        title: 'Error!',
        text: data?.data?.error,
        type: 'error',
      });
    }
  };

  const renderCell = React.useCallback((campaign, columnKey) => {
    const cellValue = campaign[columnKey];

    switch (columnKey) {
      case 'image':
        return (
          <div className='flex '>
            <Image
              className='h-[60px] w-[120px] bg-cover rounded-lg'
              width={120}
              height={60}
              alt='campaign'
              aria-label='campaign'
              src={
                campaign?.image
                  ? `data:image/jpeg;base64,${campaign?.image}`
                  : noImage
              }
            />
          </div>
        );
      case 'campaignDescription':
        return (
          <div className='md:w-[250px] text-textGrey w-[150px]'>
            {campaign.campaignDescription}
          </div>
        );
      case 'campaignName':
        return (
          <div className='font-medium text-black'>{campaign.campaignName}</div>
        );
      case 'startDateTime':
        return (
          <div className='text-textGrey text-sm'>
            {moment(campaign?.startDateTime).format('MMMM Do YYYY, h:mm:ss a')}
          </div>
        );

      case 'actions':
        return (
          <div className='relative flexjustify-center items-center gap-2'>
            <Dropdown aria-label='drop down' className=''>
              <DropdownTrigger aria-label='actions'>
                <div className='cursor-pointer flex justify-center items-center text-black'>
                  <HiOutlineDotsVertical className='text-[22px] ' />
                </div>
              </DropdownTrigger>
              <DropdownMenu className='text-black'>
                <DropdownSection>
                  <DropdownItem aria-label='preview campaign'>
                    <Link
                      prefetch={true}
                      className='flex w-full'
                      href={{
                        pathname: `/dashboard/campaigns/${campaign.id}`,
                        query: {
                          campaignId: campaign.id,
                        },
                      }}
                    >
                      <div className={` flex gap-2  items-center text-grey500`}>
                        <LuEye />
                        <p>Preview campaign</p>
                      </div>
                    </Link>
                  </DropdownItem>
                  {isItemInCompletedArray(campaign, campaigns) && (
                    <DropdownItem
                      aria-label='repeat campaign'
                      onClick={() => toggleRepeatModal(campaign)}
                    >
                      <div className={` flex gap-2  items-center text-grey500`}>
                        <PiRepeat />
                        <p>Repeat campaign</p>
                      </div>
                    </DropdownItem>
                  )}
                  {(role === 0 ||
                    userRolePermissions?.canEditCampaign === true) && (
                    <DropdownItem
                      aria-label='edit campaign'
                      onClick={() => {
                        saveJsonItemToLocalStorage('campaign', campaign);
                        router.push('/dashboard/campaigns/edit-campaign');
                      }}
                    >
                      <div className={` flex gap-2  items-center text-grey500`}>
                        <FaRegEdit />

                        <p>Edit campaign</p>
                      </div>
                    </DropdownItem>
                  )}
                  {(role === 0 ||
                    userRolePermissions?.canDeleteCampaign === true) && (
                    <DropdownItem
                      aria-label='delete campaign'
                      onClick={() => {
                        toggleCampaignModal();
                        saveJsonItemToLocalStorage('campaign', campaign);
                      }}
                    >
                      <div className={` flex gap-2  items-center text-grey500`}>
                        <RiDeleteBin6Line />

                        <p>Delete campaign</p>
                      </div>
                    </DropdownItem>
                  )}
                </DropdownSection>
              </DropdownMenu>
            </Dropdown>
          </div>
        );
      default:
        return cellValue;
    }
  }, []);

  const [value, setValue] = useState('');

  const handleTabChange = (index) => {
    setValue(index);
  };

  const topContent = React.useMemo(() => {
    return (
      <Filters
        campaigns={campaigns}
        handleTabChange={handleTabChange}
        value={value}
        handleTabClick={handleTabClick}
      />
    );
  }, [
    filterValue,
    statusFilter,
    visibleColumns,
    onSearchChange,
    onRowsPerPageChange,
    filteredCampaigns.length,
    hasSearchFilter,
  ]);

  return (
    <section className='border border-primaryGrey rounded-lg'>
      <Table
        radius='lg'
        isCompact
        removeWrapper
        allowsSorting
        aria-label='list of campaign'
        bottomContent={bottomContent}
        bottomContentPlacement='outside'
        classNames={classNames}
        selectedKeys={selectedKeys}
        // selectionMode='multiple'
        topContent={topContent}
        sortDescriptor={sortDescriptor}
        topContentPlacement='outside'
        onSelectionChange={setSelectedKeys}
        onSortChange={setSortDescriptor}
      >
        <TableHeader columns={headerColumns}>
          {(column) => (
            <TableColumn
              key={column.uid}
              align={column.uid === 'actions' ? 'center' : 'start'}
              allowsSorting={column.sortable}
            >
              {column.name}
            </TableColumn>
          )}
        </TableHeader>
        <TableBody
          emptyContent={'No campaign found'}
          items={matchingObjectArray}
        >
          {(item) => (
            <TableRow key={item?.id}>
              {(columnKey) => (
                <TableCell>{renderCell(item, columnKey)}</TableCell>
              )}
            </TableRow>
          )}
        </TableBody>
      </Table>

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
