'use client';

import React, { useEffect } from 'react';

import { useGlobalContext } from '@/hooks/globalProvider';
import usePagination from '@/hooks/usePagination';
import { saveJsonItemToLocalStorage } from '@/lib/utils';
import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
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
import { FaRegEdit } from 'react-icons/fa';
import { HiOutlineDotsVertical } from 'react-icons/hi';
import { LuEye } from 'react-icons/lu';
import { RiDeleteBin6Line } from 'react-icons/ri';
import noImage from '../../../../public/assets/images/no-image.svg';
import { columns } from './data';
import DeleteCampaignModal from './deleteCampaign';

const INITIAL_VISIBLE_COLUMNS = [
  'campaignName',
  'campaignDescription',
  'startDateTime',
  'image',
  'actions',
];

const CampaignList = ({ campaign, searchQuery, data }: any) => {
  const [filteredCampaigns, setFilteredCampaigns] = React.useState(
    data?.campaigns
  );

  useEffect(() => {
    if (campaign && searchQuery) {
      const filteredData = campaign
        ?.filter(
          (item) =>
            item?.campaignName?.toLowerCase().includes(searchQuery) ||
            item?.campaignDescription?.toLowerCase().includes(searchQuery) ||
            item?.dressCode?.toLowerCase().includes(searchQuery)
        )
        .filter((item) => Object.keys(item).length > 0);
      setFilteredCampaigns(filteredData.length > 0 ? filteredData : []);
    } else {
      setFilteredCampaigns(campaign);
    }
  }, [searchQuery, campaign]);

  const { page, rowsPerPage } = useGlobalContext();

  const {
    bottomContent,
    headerColumns,
    setSelectedKeys,

    selectedKeys,
    sortDescriptor,
    setSortDescriptor,

    classNames,
  } = usePagination(data, columns, INITIAL_VISIBLE_COLUMNS);

  const [isOpenDelete, setIsOpenDelete] = React.useState<Boolean>(false);

  const toggleCampaignModal = () => {
    setIsOpenDelete(!isOpenDelete);
  };
  const router = useRouter();

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
        return <div className='w-[300px]'>{campaign.campaignDescription}</div>;
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
                <DropdownItem aria-label='preview campaign'>
                  <Link
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
              </DropdownMenu>
            </Dropdown>
          </div>
        );
      default:
        return cellValue;
    }
  }, []);

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
        <TableBody emptyContent={'No campaign found'} items={filteredCampaigns}>
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
    </section>
  );
};

export default CampaignList;
