'use client';

import React, { useEffect, useMemo, useState } from 'react';

import { CustomInput } from '@/components/CustomInput';
import { CustomButton } from '@/components/customButton';
import { downloadCSV } from '@/lib/downloadToExcel';
import { CustomLoading } from '@/lib/utils';
import { Button, ButtonGroup, Chip } from '@nextui-org/react';
import { useRouter } from 'next/navigation';
import { IoAddCircleOutline, IoSearchOutline } from 'react-icons/io5';

import Error from '@/components/error';
import CreateQRcode from '@/components/ui/dashboard/qrCode/createQR';
import QrList from '@/components/ui/dashboard/qrCode/qrCode';
import usePermission from '@/hooks/cachedEndpoints/usePermission';
import useQR from '@/hooks/cachedEndpoints/useQRcode';
import { useGlobalContext } from '@/hooks/globalProvider';
import { MdOutlineFileDownload } from 'react-icons/md';

const QRCode: React.FC = () => {
  const router = useRouter();
  const { data, isLoading, isError, refetch } = useQR();
  const { userRolePermissions, role } = usePermission();

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
    return data?.quickResponses
      ?.filter(
        (item) =>
          item?.name?.toLowerCase().includes(searchQuery) ||
          String(item?.allOrdersCount)?.toLowerCase().includes(searchQuery) ||
          String(item?.openOrdersCount)?.toLowerCase().includes(searchQuery) ||
          item?.dateCreated?.toLowerCase().includes(searchQuery)
      )
      .filter((item) => Object.keys(item).length > 0);
  }, [data, searchQuery]);

  const getScreens = () => {
    if (data?.quickResponses?.length > 0) {
      return (
        <QrList qr={filteredItems} searchQuery={searchQuery} data={data} />
      );
    } else if (isError) {
      return <Error onClick={() => refetch()} />;
    } else {
      return <CreateQRcode />;
    }
  };

  const newArray = data?.quickResponses.map((item) => {
    return {
      allOrder: item.allOrdersCount,
      openOrder: item.openOrdersCount,

      dateCreated: item.dateCreated,

      name: item.name,
    };
  });

  return (
    <>
      <div className='flex flex-row flex-wrap  justify-between'>
        <div>
          <div className='text-[24px] leading-8 font-semibold'>
            {data?.quickResponses?.length > 0 ? (
              <div className='flex items-center'>
                <span>Quick response</span>
                <Chip
                  classNames={{
                    base: ` ml-2 text-xs h-7 font-[600] w-5 bg-[#EAE5FF] text-primaryColor`,
                  }}
                >
                  {data?.totalCount}
                </Chip>
              </div>
            ) : (
              <span>Quick response</span>
            )}
          </div>
          <p className='text-sm  text-grey600  xl:w-[231px] xl:mb-8 w-full mb-4'>
            Showing all QR codes
          </p>
        </div>
        <div className='flex items-center flex-wrap gap-3'>
          {data?.quickResponses?.length > 0 && (
            <>
              <div>
                <CustomInput
                  classnames={'md:w-[242px] w-full'}
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
              <ButtonGroup className='border-2 border-primaryGrey divide-x-2 divide-primaryGrey rounded-lg'>
                <Button
                  onClick={() => downloadCSV(newArray)}
                  className='flex text-grey600 bg-white'
                >
                  <MdOutlineFileDownload className='text-[22px]' />
                  <p>Export csv</p>
                </Button>
              </ButtonGroup>
            </>
          )}

          {(role === 0 || userRolePermissions?.canCreateQR === true) &&
            data?.quickResponses?.length > 0 && (
              <CustomButton
                onClick={() => router.push('/dashboard/qr-code/create-qr')}
                className='py-2 w-full md:w-auto px-4 md:mb-0 mb-4 text-white'
                backgroundColor='bg-primaryColor'
              >
                <div className='flex gap-2 items-center justify-center'>
                  <IoAddCircleOutline className='text-[22px]' />
                  <p>{'Create QR'} </p>
                </div>
              </CustomButton>
            )}
        </div>
      </div>
      {/* <CreateQRcode /> */}
      {isLoading ? <CustomLoading /> : <>{getScreens()} </>}
    </>
  );
};

export default QRCode;
