'use client';
import OrdersOverview from '@/components/ui/dashboard/home/OrdersOverview';
import ModulesOverview from '@/components/ui/dashboard/home/modulesOverview';
import useDashboardReport from '@/hooks/cachedEndpoints/useDashboard';
import { formatDateTimeForPayload2 } from '@/lib/utils';
import { getLocalTimeZone, today } from '@internationalized/date';
import {
  DateRangePicker,
  Modal,
  ModalBody,
  ModalContent,
  useDisclosure,
} from '@nextui-org/react';
import React, { useEffect, useMemo, useState } from 'react';

const Dashboard: React.FC = () => {
  const [selectedKeys, setSelectedKeys] = useState(new Set(['Daily']));
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const selectedValue = useMemo(
    () => Array.from(selectedKeys).join(', ').replaceAll('_', ' '),
    [selectedKeys]
  );

  const logIndexForSelectedKey = (key: string) => {
    switch (key) {
      case 'Daily':
        return 0;
      case 'This week':
        return 1;
      case 'Yearly':
        return 2;
      case 'Custom date':
        return 3;
      default:
        console.log('Unknown key');
        return -1;
    }
  };

  const [value, setValue] = React.useState({
    start: null,
    end: null,
  });
  const checkValue = () => {
    if (value.start !== null && value.end !== null) {
      return true;
    }
    return false;
  };
  const shouldFetchReport =
    selectedValue !== 'Custom date' || checkValue() === true;

  const startDate = value.start
    ? `${formatDateTimeForPayload2(value.start)}Z`
    : undefined;
  const endDate = value.end
    ? `${formatDateTimeForPayload2(value.end)}Z`
    : undefined;
  const {
    data: response,

    isLoading,
  } = useDashboardReport(
    shouldFetchReport ? logIndexForSelectedKey(selectedValue) : -1,
    startDate,
    endDate,
    { enabled: shouldFetchReport }
  );

  useEffect(() => {
    if (selectedValue === 'Custom date') {
      onOpenChange();
    }
  }, [value.start, value.end, selectedValue]);

  return (
    <>
      <div className='flex flex-col xl:gap-5 gap-3'>
        <OrdersOverview
          selectedKeys={selectedKeys}
          setSelectedKeys={setSelectedKeys}
          response={response}
          onOpen={onOpen}
          value={value}
          selectedValue={selectedValue}
          isLoading={isLoading}
        />
        <ModulesOverview response={response} isLoading={isLoading} />
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
    </>
  );
};

export default Dashboard;
