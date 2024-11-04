'use client';

import React, { useEffect, useMemo, useState } from 'react';

import { CustomLoading } from '@/lib/utils';

import { CustomInput } from '@/components/CustomInput';
import Error from '@/components/error';
import NoPaymentsScreen from '@/components/ui/dashboard/payments/noPayments';
import PaymentsList from '@/components/ui/dashboard/payments/payment';
import usePayment from '@/hooks/cachedEndpoints/usePayment';
import { useGlobalContext } from '@/hooks/globalProvider';
import useDateFilter from '@/hooks/useDateFilter';
import { downloadCSV } from '@/lib/downloadToExcel';
import { Button, ButtonGroup, Chip } from '@nextui-org/react';
import { IoSearchOutline } from 'react-icons/io5';
import { MdOutlineFileDownload } from 'react-icons/md';

const Payments: React.FC = () => {
  const {
    data,
    isLoading,
    isError,
    refetch,
    dropdownComponent,
    datePickerModal,
  } = useDateFilter(usePayment);

  const [searchQuery, setSearchQuery] = useState('');
  const { setPage, setTableStatus } = useGlobalContext();

  useEffect(() => {
    setTableStatus('All');
    setPage(1);
  }, []);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value.toLowerCase());
  };

  const filteredItems = useMemo(() => {
    return data?.paymentComposites?.map((item) => ({
      ...item,
      orders: item?.payments?.filter(
        (item) =>
          item?.qrName?.toLowerCase().includes(searchQuery) ||
          String(item?.totalAmount)?.toLowerCase().includes(searchQuery) ||
          item?.dateCreated?.toLowerCase().includes(searchQuery) ||
          item?.reference?.toLowerCase().includes(searchQuery) ||
          item?.treatedBy?.toLowerCase().includes(searchQuery) ||
          item?.paymentReference?.toLowerCase().includes(searchQuery) ||
          item?.customer?.toLowerCase().includes(searchQuery)
      ),
    }));
  }, [data?.paymentComposites, searchQuery]);

  const getScreens = () => {
    if (data?.paymentComposites?.[0]?.payments.length > 0) {
      return (
        <PaymentsList
          data={data}
          isLoading={isLoading}
          payments={filteredItems}
          refetch={refetch}
          searchQuery={searchQuery}
        />
      );
    } else if (isError) {
      return <Error onClick={() => refetch()} />;
    } else {
      return <NoPaymentsScreen />;
    }
  };

  const newArray = data?.paymentComposites?.flatMap((item) =>
    item?.payments?.map((payment) => ({
      reference: payment.reference,
      totalAmount: payment.totalAmount,
      treatedBy: payment.treatedBy,
      dateCreated: payment.dateCreated,
      paymentReference: payment.paymentReference,
      qrName: payment.qrName,
      customer: payment.customer,
    }))
  );

  return (
    <>
      <div className='flex flex-row flex-wrap  xl:mb-8 mb-4 items-center justify-between'>
        <div>
          <div className='text-[24px] leading-8 font-semibold'>
            {data?.paymentComposites?.[0]?.payments.length > 0 ? (
              <div className='flex items-center'>
                <span>All Payment</span>
                <Chip
                  classNames={{
                    base: ` ml-2 text-xs h-7 font-[600] w-5 bg-[#EAE5FF] text-primaryColor`,
                  }}
                >
                  {data?.paymentComposites[0]?.totalCount}
                </Chip>
              </div>
            ) : (
              <span>Payments</span>
            )}
          </div>
          <p className='text-sm  text-grey600  xl:w-[231px] w-full '>
            Showing all payments
          </p>
        </div>
        <div className='flex  gap-3'>
          {dropdownComponent}
          {data?.paymentComposites?.[0]?.payments.length > 0 && (
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
        </div>
      </div>

      {isLoading ? <CustomLoading /> : <>{getScreens()}</>}
      {datePickerModal}
    </>
  );
};

export default Payments;
