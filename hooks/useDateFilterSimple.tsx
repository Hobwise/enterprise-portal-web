"use client";
import { formatDateTimeForPayload2 } from "@/lib/utils";
import { getLocalTimeZone, today } from "@internationalized/date";
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
} from "@nextui-org/react";
import React, { useEffect, useMemo, useState } from "react";
import { MdKeyboardArrowDown } from "react-icons/md";

const useDateFilterSimple = () => {
  const [selectedKeys, setSelectedKeys] = useState(new Set(["This week"]));
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
  const [isDateChanging, setIsDateChanging] = useState(false);

  const [value, setValue] = React.useState<any>({
    start: null,
    end: null,
  });

  const selectedValue = useMemo(
    () => Array.from(selectedKeys).join(", ").replaceAll("_", " "),
    [selectedKeys]
  );

  const [filterType, setFilterType] = useState(0);
  const [startDate, setStartDate] = useState<string | undefined>(undefined);
  const [endDate, setEndDate] = useState<string | undefined>(undefined);

  // Define date ranges
  const getDateRange = (type: string) => {
    const now = today(getLocalTimeZone());
    let start, end;

    switch (type) {
      case "Today":
        start = end = now;
        break;
      case "Yesterday":
        start = end = now.subtract({ days: 1 });
        break;
      case "This week":
        // Calculate days since Sunday (0 = Sunday, 1 = Monday, etc.)
        const dayOfWeek = (now.toDate(getLocalTimeZone()).getDay());
        start = now.subtract({ days: dayOfWeek });
        end = now;
        break;
      case "Last week":
        const lastWeekDayOfWeek = (now.toDate(getLocalTimeZone()).getDay());
        start = now.subtract({ days: lastWeekDayOfWeek + 7 });
        end = now.subtract({ days: lastWeekDayOfWeek + 1 });
        break;
      case "This month":
        start = now.set({ day: 1 });
        end = now;
        break;
      case "Last month":
        const lastMonth = now.subtract({ months: 1 });
        start = lastMonth.set({ day: 1 });
        end = lastMonth.set({ day: lastMonth.calendar.getDaysInMonth(lastMonth) });
        break;
      case "This year":
        start = now.set({ month: 1, day: 1 });
        end = now;
        break;
      case "Last year":
        const lastYear = now.subtract({ years: 1 });
        start = lastYear.set({ month: 1, day: 1 });
        end = lastYear.set({ month: 12, day: 31 });
        break;
      case "Custom":
        setFilterType(3);
        onOpen();
        return;
      default:
        start = end = now;
    }

    setFilterType(type === "Custom" ? 3 : 0);
    setStartDate(formatDateTimeForPayload2(start.toString()));
    setEndDate(formatDateTimeForPayload2(end.toString()));
  };

  useEffect(() => {
    if (selectedValue !== "Custom") {
      getDateRange(selectedValue);
    }
  }, [selectedValue]);

  const handleDateRangeChange = (newValue: any) => {
    setValue(newValue);
    if (newValue?.start && newValue?.end) {
      setStartDate(formatDateTimeForPayload2(newValue.start.toString()));
      setEndDate(formatDateTimeForPayload2(newValue.end.toString()));
      setFilterType(3);
    }
  };

  const applyCustomRange = () => {
    setIsDateChanging(true);
    onClose();
    setTimeout(() => setIsDateChanging(false), 500);
  };

  const dropdownComponent = (
    <Dropdown>
      <DropdownTrigger>
        <Button
          endContent={<MdKeyboardArrowDown />}
          variant="bordered"
          className="capitalize border-primaryGrey"
          isLoading={isDateChanging}
        >
          {selectedValue}
        </Button>
      </DropdownTrigger>
      <DropdownMenu
        aria-label="Filter selection"
        variant="flat"
        disallowEmptySelection
        selectionMode="single"
        selectedKeys={selectedKeys}
        onSelectionChange={(keys) => setSelectedKeys(keys as Set<string>)}
      >
        <DropdownItem key="Today">Today</DropdownItem>
        <DropdownItem key="Yesterday">Yesterday</DropdownItem>
        <DropdownItem key="This week">This week</DropdownItem>
        <DropdownItem key="Last week">Last week</DropdownItem>
        <DropdownItem key="This month">This month</DropdownItem>
        <DropdownItem key="Last month">Last month</DropdownItem>
        <DropdownItem key="This year">This year</DropdownItem>
        <DropdownItem key="Last year">Last year</DropdownItem>
        <DropdownItem key="Custom">Custom</DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );

  const datePickerModal = (
    <Modal size="md" isOpen={isOpen} onOpenChange={onOpenChange}>
      <ModalContent>
        <ModalBody className="p-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Select Date Range</h3>
            <DateRangePicker
              label="Date Range"
              value={value}
              onChange={handleDateRangeChange}
              className="w-full"
            />
            <div className="flex justify-end gap-2">
              <Button variant="flat" onPress={onClose}>
                Cancel
              </Button>
              <Button
                color="primary"
                onPress={applyCustomRange}
                isDisabled={!value?.start || !value?.end}
              >
                Apply
              </Button>
            </div>
          </div>
        </ModalBody>
      </ModalContent>
    </Modal>
  );

  return {
    dropdownComponent,
    datePickerModal,
    filterType,
    startDate,
    endDate,
  };
};

export default useDateFilterSimple;