'use client';

import React, { Suspense, useMemo, useState } from 'react';

import ReportDetails from '@/components/ui/dashboard/reports/reports';
import usePermission from '@/hooks/cachedEndpoints/usePermission';
import useQR from '@/hooks/cachedEndpoints/useQRcode';
import { CustomLoading } from '@/lib/utils';
import { getLocalTimeZone, today } from '@internationalized/date';
import {
  Button,
  Chip,
  DateRangePicker,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Modal,
  ModalBody,
  ModalContent,
  Tab,
  Tabs,
  useDisclosure,
} from '@nextui-org/react';
import { useRouter } from 'next/navigation';
import { MdKeyboardArrowDown } from 'react-icons/md';

const Reports: React.FC = () => {
  const router = useRouter();
  const { data, isLoading, isError, refetch } = useQR();
  const { userRolePermissions, role } = usePermission();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [value, setValue] = React.useState({
    start: null,
    end: null,
  });
  const [selectedKeys, setSelectedKeys] = useState(new Set(['Last 7 days']));
  const selectedValue = useMemo(
    () => Array.from(selectedKeys).join(', ').replaceAll('_', ' '),
    [selectedKeys]
  );

  // const getScreens = () => {
  //   if (data?.quickResponses?.length > 0) {
  //     return (
  //       <QrList qr={filteredItems} searchQuery={searchQuery} data={data} />
  //     );
  //   } else if (isError) {
  //     return <Error onClick={() => refetch()} />;
  //   } else {
  //     return <CreateQRcode />;
  //   }
  // };

  let tabs = [
    {
      id: 'orders',
      label: 'Orders',
      content: <ReportDetails />,
    },
    {
      id: 'payments',
      label: 'Payments',
      content: <ReportDetails />,
    },
    {
      id: 'reservations',
      label: 'Reservations',
      content: <ReportDetails />,
    },
    {
      id: 'campaigns',
      label: 'Campaigns',
      content: <ReportDetails />,
    },
  ];

  return (
    <Suspense fallback={<CustomLoading />}>
      <div className='flex flex-row flex-wrap  justify-between'>
        <div>
          <div className='text-[24px] leading-8 font-semibold'>
            {data?.quickResponses?.length > 0 ? (
              <div className='flex items-center'>
                <span>Reports</span>
                <Chip
                  classNames={{
                    base: `ml-2 text-xs h-7 font-[600] w-5 bg-[#EAE5FF] text-primaryColor`,
                  }}
                >
                  {data?.totalCount}
                </Chip>
              </div>
            ) : (
              <span>Reports</span>
            )}
          </div>
          <div className='flex gap-2 items-center mb-4'>
            <p className='text-sm  text-grey600  '>A summary of activities</p>
            <Dropdown>
              <DropdownTrigger>
                <Button
                  variant='light'
                  endContent={<MdKeyboardArrowDown />}
                  className='font-[600] capitalize text-black'
                >
                  {selectedValue}
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                aria-label='Single selection example'
                variant='flat'
                disallowEmptySelection
                selectionMode='single'
                className='text-black'
                selectedKeys={selectedKeys}
                onSelectionChange={setSelectedKeys}
              >
                <DropdownItem key='Today'>Today</DropdownItem>
                <DropdownItem key='This week'>This week</DropdownItem>
                <DropdownItem key='Last 7 days'>Last 7 days</DropdownItem>
                <DropdownItem key='Last 30 days'>Last 30 days</DropdownItem>
                <DropdownItem key='This month'>This month</DropdownItem>
                <DropdownItem onClick={() => onOpen()} key='Custom date'>
                  Custom date
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </div>
        </div>
        <div
        // className='flex items-center flex-wrap gap-3'
        >
          <Tabs
            classNames={
              {
                // tabList: 'active:bg-[#EAE5FF] active:text-primaryColor',
              }
            }
            variant='bordered'
            color='secondary'
            aria-label='report tabs'
            items={tabs}
          >
            {(item) => (
              <Tab key={item.id} title={item.label}>
                <div className='absolute top-[14rem] lg:top-[10.5rem] md:w-[calc(100%-272px)] w-full right-0 lg:px-6 px-4'>
                  {item.content}
                </div>
              </Tab>
            )}
          </Tabs>
        </div>
        {/* </div> */}
        {/* <CreateQRcode /> */}
        {/* {isLoading ? <CustomLoading /> : <>{getScreens()} </>} */}
      </div>
      <Modal
        isDismissable={false}
        classNames={{
          base: 'absolute top-12',
        }}
        size='sm'
        isOpen={isOpen}
        onOpenChange={onOpenChange}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalBody className='px-4 py-6'>
                <DateRangePicker
                  radius='sm'
                  maxValue={today(getLocalTimeZone())}
                  value={value}
                  onChange={setValue}
                  visibleMonths={2}
                  variant='faded'
                  pageBehavior='single'
                  label='Select date range'
                  showMonthAndYearPickers
                  labelPlacement='outside'
                />
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>
    </Suspense>
  );
};

export default Reports;
