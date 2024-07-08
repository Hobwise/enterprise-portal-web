'use client';

import React, { useEffect, useMemo, useState } from 'react';

import { CustomInput } from '@/components/CustomInput';
import { CustomButton } from '@/components/customButton';
import { Chip } from '@nextui-org/react';
import { useRouter } from 'next/navigation';
import { IoSearchOutline } from 'react-icons/io5';

import Error from '@/components/error';
import CampaignList from '@/components/ui/dashboard/campaign/campaignList';
import CreateCampaign from '@/components/ui/dashboard/campaign/createCampaign';
import useCampaign from '@/hooks/cachedEndpoints/useCampaign';
import { useGlobalContext } from '@/hooks/globalProvider';
import { CustomLoading, getJsonItemFromLocalStorage } from '@/lib/utils';
import { IoMdAdd } from 'react-icons/io';

const Compaigns: React.FC = () => {
  const router = useRouter();
  const business = getJsonItemFromLocalStorage('business');
  const userInformation = getJsonItemFromLocalStorage('userInformation');
  const { data, isLoading, isError, refetch } = useCampaign();

  const { setPage, setTableStatus } = useGlobalContext();

  useEffect(() => {
    setTableStatus('All');
    setPage(1);
  }, []);

  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value.toLowerCase());
  };

  const filteredItems = useMemo(() => {
    return data?.campaigns
      ?.filter(
        (item) =>
          item?.campaignName?.toLowerCase().includes(searchQuery) ||
          item?.campaignDescription?.toLowerCase().includes(searchQuery) ||
          item?.dressCode?.toLowerCase().includes(searchQuery)
      )
      .filter((item) => Object.keys(item).length > 0);
  }, [data, searchQuery]);

  const getScreens = () => {
    if (data?.campaigns?.length > 0) {
      return (
        <CampaignList
          data={data}
          campaign={filteredItems}
          searchQuery={searchQuery}
        />
      );
    } else if (isError) {
      return <Error onClick={() => refetch()} />;
    } else {
      return <CreateCampaign />;
    }
  };

  return (
    <>
      <div className='flex flex-row flex-wrap xl:mb-8 mb-4 justify-between'>
        <div>
          <div className='text-[24px] leading-8 font-semibold'>
            <div className='flex items-center'>
              <span>Campaigns</span>

              {data?.campaigns?.length > 0 && (
                <Chip
                  classNames={{
                    base: ` ml-2 text-xs h-7 font-[600] w-5 bg-[#EAE5FF] text-primaryColor`,
                  }}
                >
                  {data?.totalCount}
                </Chip>
              )}
            </div>
          </div>
          <p className='text-sm  text-grey600  xl:w-[231px] w-full '>
            Showing all campaigns
          </p>
        </div>
        <div className='flex items-center gap-3'>
          {data?.campaigns?.length > 0 && (
            <>
              <div>
                <CustomInput
                  classnames={'w-[242px]'}
                  label=''
                  size='md'
                  value={searchQuery}
                  onChange={handleSearchChange}
                  isRequired={false}
                  startContent={<IoSearchOutline />}
                  type='text'
                  placeholder='Search here...'
                />
              </div>
            </>
          )}

          {data?.campaigns?.length > 0 && (
            <CustomButton
              onClick={() =>
                router.push('/dashboard/campaigns/create-campaign')
              }
              className='py-2 px-4 md:mb-0 mb-4 text-white'
              backgroundColor='bg-primaryColor'
            >
              <div className='flex gap-2 items-center justify-center'>
                <IoMdAdd className='text-[22px]' />

                <p>Add campaign</p>
              </div>
            </CustomButton>
          )}
        </div>
      </div>

      {isLoading ? <CustomLoading /> : <>{getScreens()} </>}
    </>
  );
};

export default Compaigns;
