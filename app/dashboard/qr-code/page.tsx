'use client';
import Container from '../../../components/dashboardContainer';

import React, { useMemo, useState } from 'react';

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
import useQR from '@/hooks/cachedEndpoints/useQRcode';
import { MdOutlineFileDownload } from 'react-icons/md';

const QRCode: React.FC = () => {
  const router = useRouter();
  const { data, isLoading, isError, refetch } = useQR();

  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value.toLowerCase());
  };

  const filteredItems = useMemo(() => {
    return data
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
    if (data?.length > 0) {
      return <QrList qr={filteredItems} searchQuery={searchQuery} />;
    } else if (isError) {
      return <Error onClick={() => refetch()} />;
    } else {
      return <CreateQRcode />;
    }
  };

  const newArray = data?.map((item) => {
    return {
      allOrder: item.allOrdersCount,
      openOrder: item.openOrdersCount,

      dateCreated: item.dateCreated,

      name: item.name,
    };
  });

  return (
    <Container>
      <div className='flex flex-row flex-wrap  justify-between'>
        <div>
          <div className='text-[24px] leading-8 font-semibold'>
            {data?.length > 0 ? (
              <div className='flex items-center'>
                <span>Quick response</span>
                <Chip
                  classNames={{
                    base: ` ml-2 text-xs h-7 font-[600] w-5 bg-[#EAE5FF] text-primaryColor`,
                  }}
                >
                  {data?.length}
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
        <div className='flex items-center gap-3'>
          {data?.length > 0 && (
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

          {data?.length > 0 && (
            <CustomButton
              onClick={() => router.push('/dashboard/qr-code/create-qr')}
              className='py-2 px-4 md:mb-0 mb-4 text-white'
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
    </Container>
  );
};

export default QRCode;
