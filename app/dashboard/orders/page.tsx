'use client';

import React, { useEffect, useMemo, useState } from 'react';

import { CustomLoading } from '@/lib/utils';

import { CustomInput } from '@/components/CustomInput';
import { CustomButton } from '@/components/customButton';
import Error from '@/components/error';
import CreateOrder from '@/components/ui/dashboard/orders/createOrder';
import OrdersList from '@/components/ui/dashboard/orders/order';
import useOrder from '@/hooks/cachedEndpoints/useOrder';
import usePermission from '@/hooks/cachedEndpoints/usePermission';
import { useGlobalContext } from '@/hooks/globalProvider';
import useDateFilter from '@/hooks/useDateFilter';
import { downloadCSV } from '@/lib/downloadToExcel';
import { Button, ButtonGroup, Chip } from '@nextui-org/react';
import { useRouter } from 'next/navigation';
import { IoAddCircleOutline, IoSearchOutline } from 'react-icons/io5';
import { MdOutlineFileDownload } from 'react-icons/md';

const Orders: React.FC = () => {
  const router = useRouter();

  const {
    data,
    isLoading,
    isError,
    refetch,
    dropdownComponent,
    datePickerModal,
  } = useDateFilter(useOrder);
  const { userRolePermissions, role } = usePermission();

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
    return data?.map((order) => ({
      ...order,
      orders: order?.orders?.filter(
        (item) =>
          item?.placedByName?.toLowerCase().includes(searchQuery) ||
          String(item?.totalAmount)?.toLowerCase().includes(searchQuery) ||
          item?.dateCreated?.toLowerCase().includes(searchQuery) ||
          item?.reference?.toLowerCase().includes(searchQuery) ||
          item?.placedByPhoneNumber?.toLowerCase().includes(searchQuery) ||
          item?.paymentReference?.toLowerCase().includes(searchQuery)
      ),
    }));
  }, [data, searchQuery]);

  const newArray = useMemo(() => {
    return data?.flatMap((item: any) =>
      item.orders.map((order: any) => ({
        placedByName: order.placedByName,
        reference: order.reference,
        totalAmount: order.totalAmount,
        dateCreated: order.dateCreated,
        paymentReference: order.paymentReference,
        placedByPhoneNumber: order.placedByPhoneNumber,
      }))
    );
  }, [data]);

  if (isLoading) return <CustomLoading />;
  if (isError) return <Error onClick={() => refetch()} />;

  return (
    <>
      <div className="flex flex-row flex-wrap mb-4 xl:mb-8 items-center justify-between">
        <div>
          <div className="text-[24px] leading-8 font-semibold">
            {data[0].orders?.length > 0 ? (
              <div className="flex items-center">
                <span>All orders</span>
                <Chip
                  classNames={{
                    base: ` ml-2 text-xs h-7 font-[600] w-5 bg-[#EAE5FF] text-primaryColor`,
                  }}
                >
                  {data[0]?.totalCount}
                </Chip>
              </div>
            ) : (
              <span>Orders</span>
            )}
          </div>
          <p className="text-sm  text-grey600  xl:w-[231px]  w-full ">
            Showing all orders
          </p>
        </div>
        <div className="flex items-center gap-3">
          {dropdownComponent}
          {data[0].orders.length > 0 && (
            <>
              <div>
                <CustomInput
                  classnames={'w-[242px]'}
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
              <ButtonGroup className="border-2 border-primaryGrey divide-x-2 divide-primaryGrey rounded-lg">
                <Button
                  onClick={() => downloadCSV(newArray)}
                  className="flex text-grey600 bg-white"
                >
                  <MdOutlineFileDownload className="text-[22px]" />
                  <p>Export csv</p>
                </Button>
              </ButtonGroup>
            </>
          )}
          {(role === 0 || userRolePermissions?.canCreateOrder === true) && (
            <CustomButton
              onClick={() => router.push('/dashboard/orders/place-order')}
              className="py-2 px-4 mb-0 text-white"
              backgroundColor="bg-primaryColor"
            >
              <div className="flex gap-2 items-center justify-center">
                <IoAddCircleOutline className="text-[22px]" />
                <p>{'Create order'} </p>
              </div>
            </CustomButton>
          )}
        </div>
      </div>
      {data.length > 0 ? (
        <OrdersList
          orders={filteredItems}
          refetch={refetch}
          searchQuery={searchQuery}
        />
      ) : (
        <CreateOrder />
      )}
      {datePickerModal}
    </>
  );
};

export default Orders;
