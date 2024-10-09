'use client';

import React, { Suspense, useEffect, useMemo, useState } from 'react';

import Error from '@/components/error';
import AuditReportDetails from '@/components/ui/dashboard/reports/auditReport';
import BookingReportDetails from '@/components/ui/dashboard/reports/bookingReport';
import OrderReportDetails from '@/components/ui/dashboard/reports/orderReports';
import PaymentReportDetails from '@/components/ui/dashboard/reports/paymentReports';
import usePermission from '@/hooks/cachedEndpoints/usePermission';
import useReport from '@/hooks/cachedEndpoints/useReport';
import { CustomLoading, formatDateTimeForPayload2 } from '@/lib/utils';
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

  const { userRolePermissions, role } = usePermission();
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
  const [value, setValue] = React.useState({
    start: null,
    end: null,
  });
  const [selectedKeys, setSelectedKeys] = useState(new Set(['Today']));
  const selectedValue = useMemo(
    () => Array.from(selectedKeys).join(', ').replaceAll('_', ' '),
    [selectedKeys]
  );
  const [previousSelectedValue, setPreviousSelectedValue] = useState('Today');

  const logIndexForSelectedKey = (key: string) => {
    switch (key) {
      case 'Today':
        return 0;
      case 'This week':
        return 1;
      case 'This year':
        return 2;
      case 'Custom date':
        return 3;
      default:
        console.log('Unknown key');
        return -1;
    }
  };

  const checkValue = () => {
    return value.start !== null && value.end !== null;
  };

  const shouldFetchReport =
    selectedValue !== 'Custom date' ||
    (selectedValue === 'Custom date' && checkValue());

  const effectiveSelectedValue = shouldFetchReport
    ? selectedValue
    : previousSelectedValue;

  const startDate = value.start
    ? `${formatDateTimeForPayload2(value.start)}Z`
    : undefined;
  const endDate = value.end
    ? `${formatDateTimeForPayload2(value.end)}Z`
    : undefined;
  const { data, isError, refetch, isLoading } = useReport(
    logIndexForSelectedKey(effectiveSelectedValue),
    startDate,
    endDate,
    { enabled: true }
  );

  useEffect(() => {
    if (shouldFetchReport && selectedValue !== 'Custom date') {
      setPreviousSelectedValue(selectedValue);
    }
  }, [shouldFetchReport, selectedValue]);

  const handleDateChange = (newValue: any) => {
    setValue(newValue);
    if (newValue.start && newValue.end) {
      onClose();
    }
  };

  if (isError) {
    return <Error onClick={() => refetch()} />;
  }

  interface TabItem {
    id: string;
    label: string;
    content: React.ReactNode;
  }
  const [selectedTab, setSelectedTab] = useState<string>('orders');
  let tabs: TabItem[] = [
    {
      id: 'orders',
      label: 'Orders',
      content: <OrderReportDetails report={data?.orderDetails} />,
    },
    {
      id: 'payments',
      label: 'Payments',
      content: <PaymentReportDetails report={data?.paymentDetails} />,
    },
    {
      id: 'bookings',
      label: 'Bookings',
      content: <BookingReportDetails report={data?.bookingDetails} />,
    },
    {
      id: 'audits',
      label: 'Audits',
      content: <AuditReportDetails report={data?.auditDetails} />,
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
            <Dropdown isDisabled={isLoading}>
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
                <DropdownItem key='This year'>This year</DropdownItem>

                <DropdownItem onClick={() => onOpen()} key='Custom date'>
                  Custom date
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </div>
        </div>

        {isLoading ? (
          <CustomLoading />
        ) : (
          <div>
            <Tabs
              size={'sm'}
              variant='bordered'
              color='secondary'
              aria-label='report tabs'
              items={tabs}
              selectedKey={selectedTab}
              onSelectionChange={(key) => setSelectedTab(key as string)}
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
        )}
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
                  onChange={handleDateChange}
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
