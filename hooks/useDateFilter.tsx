'use client';
import { formatDateTimeForPayload2 } from '@/lib/utils';
import { getLocalTimeZone, today } from '@internationalized/date';
import {
  Button,
  DateRangePicker,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Modal,
  ModalBody,
  ModalContent,
  useDisclosure,
} from '@nextui-org/react';
import React, { useEffect, useMemo, useState } from 'react';
import { MdKeyboardArrowDown } from 'react-icons/md';

const useDateFilter = (endpoint: any) => {
  const [selectedKeys, setSelectedKeys] = useState(new Set(['This week']));
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();

  const [value, setValue] = React.useState({
    start: null,
    end: null,
  });
  const selectedValue = useMemo(
    () => Array.from(selectedKeys).join(', ').replaceAll('_', ' '),
    [selectedKeys]
  );
  const [previousSelectedValue, setPreviousSelectedValue] =
    useState('This week');

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
  const { data, isError, refetch, isLoading } = endpoint(
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

  const dropdownComponent = (
    <Dropdown isDisabled={isLoading}>
      <DropdownTrigger>
        <Button
          endContent={<MdKeyboardArrowDown />}
          disableRipple
          className='font-[600] bg-transparent p-0 capitalize text-black'
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
  );

  const datePickerModal = (
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
  );

  return {
    data,

    isError,
    refetch,
    isLoading,
    dropdownComponent,
    datePickerModal,
  };
};

export default useDateFilter;
