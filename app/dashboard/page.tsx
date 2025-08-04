'use client';
import Error from '@/components/error';
import OrdersOverview from '@/components/ui/dashboard/home/OrdersOverview';
import ModulesOverview from '@/components/ui/dashboard/home/modulesOverview';
import useDashboardReport from '@/hooks/cachedEndpoints/useDashboard';
import { formatDateTimeForPayload2 } from '@/lib/utils';
import { getLocalTimeZone, today, DateValue } from '@internationalized/date';
import {
  DateRangePicker,
  Modal,
  ModalBody,
  ModalContent,
  useDisclosure,
} from '@nextui-org/react';
import React, { useEffect, useMemo, useState } from 'react';

const Dashboard: React.FC = () => {
  const [selectedKeys, setSelectedKeys] = useState(new Set(['This week']));
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();

  const initialDate = today(getLocalTimeZone());
  const [value, setValue] = React.useState<{ start: DateValue; end: DateValue }>({
    start: initialDate,
    end: initialDate,
  });
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
  const {
    data: response,
    isError,
    refetch,
    isLoading,
  } = useDashboardReport(
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



  if (isError) {
    return <Error onClick={() => refetch()} />;
  }

  const handleDateChange = (newValue: { start: DateValue; end: DateValue }) => {
    setValue(newValue);
    if (newValue.start && newValue.end) {
      onClose();
      // Trigger refetch to ensure data is updated with new date range
      setTimeout(() => refetch(), 100);
    }
  };
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
    </>
  );
};

export default Dashboard;
