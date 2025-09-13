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

const useDateFilter = (endpoint: any) => {
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
  const [previousSelectedValue, setPreviousSelectedValue] =
    useState("This week");

  const logIndexForSelectedKey = (key: string) => {
    switch (key) {
      case "Today":
        return 0;
      case "This week":
        return 1;
      case "This year":
        return 2;
      case "Custom date":
        return 3;
      default:
        console.log("Unknown key");
        return -1;
    }
  };

  const checkValue = () => {
    return value.start !== null && value.end !== null;
  };

  const shouldFetchReport =
    selectedValue !== "Custom date" ||
    (selectedValue === "Custom date" && checkValue());

  const effectiveSelectedValue = shouldFetchReport
    ? selectedValue
    : previousSelectedValue;

  const startDate = value.start
    ? `${formatDateTimeForPayload2(value.start)}Z`
    : undefined;
  const endDate = value.end
    ? `${formatDateTimeForPayload2(value.end)}Z`
    : undefined;
  const {  categories, details, isError, refetch, isLoading } = endpoint(
    logIndexForSelectedKey(effectiveSelectedValue),
    startDate,
    endDate,
    { enabled: true }
  );

  // Combined loading state that includes both API loading and date changing
  const combinedIsLoading = isLoading || isDateChanging;

  useEffect(() => {
    if (shouldFetchReport && selectedValue !== "Custom date") {
      setPreviousSelectedValue(selectedValue);
    }
  }, [shouldFetchReport, selectedValue]);

  const handleDateChange = (newValue: any) => {
    setValue(newValue);
    if (newValue.start && newValue.end) {
      setIsDateChanging(true);
      onClose();
      // Immediately trigger refetch without delay
      refetch().finally(() => {
        setIsDateChanging(false);
      });
    }
  };

  // Handle dropdown selection changes
  const handleDropdownSelectionChange = (keys: any) => {
    const newKeys = new Set(Array.from(keys) as string[]);
    const newValue = Array.from(newKeys).join(", ").replaceAll("_", " ");
    
    // Only set loading if it's not "Custom date" (which opens modal)
    if (newValue !== "Custom date") {
      setIsDateChanging(true);
      // Use a short timeout to allow loading state to show, then refetch
      setTimeout(() => {
        refetch().finally(() => {
          setIsDateChanging(false);
        });
      }, 50);
    }
    
    setSelectedKeys(newKeys);
  };

  const dropdownComponent = (
    <Dropdown isDisabled={combinedIsLoading}>
      <DropdownTrigger>
        <Button
          endContent={<MdKeyboardArrowDown />}
          disableRipple
          className="font-[600] bg-transparent p-0 capitalize text-black"
          isLoading={combinedIsLoading}
        >
          {combinedIsLoading ? "Loading..." : selectedValue}
        </Button>
      </DropdownTrigger>
      <DropdownMenu
        aria-label="Single selection example"
        variant="flat"
        disallowEmptySelection
        selectionMode="single"
        className="text-black"
        selectedKeys={selectedKeys}
        onSelectionChange={handleDropdownSelectionChange}
      >
        <DropdownItem key="Today">Today</DropdownItem>
        <DropdownItem key="This week">This week</DropdownItem>
        <DropdownItem key="This year">This year</DropdownItem>
        <DropdownItem onClick={() => onOpen()} key="Custom date">
          Custom date
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );

  const datePickerModal = (
    <Modal
      isDismissable={false}
      classNames={{
        base: "absolute top-12",
      }}
      size="sm"
      isOpen={isOpen}
      onOpenChange={onOpenChange}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalBody className="px-4 py-6">
              <DateRangePicker
                radius="sm"
                maxValue={today(getLocalTimeZone())}
                value={value}
                onChange={handleDateChange}
                visibleMonths={2}
                variant="faded"
                pageBehavior="single"
                label="Select date range"
                showMonthAndYearPickers
                labelPlacement="outside"
                isDisabled={isDateChanging}
              />
              {isDateChanging && (
                <div className="text-center text-sm text-gray-500 mt-2">
                  Applying date filter...
                </div>
              )}
            </ModalBody>
          </>
        )}
      </ModalContent>
    </Modal>
  );
  const filterType = logIndexForSelectedKey(effectiveSelectedValue);
  return {
    categories, details,
    isError,
    refetch,
    isLoading: combinedIsLoading,
  
    dropdownComponent,
    datePickerModal,
    filterType,
    startDate,
    endDate,
  };
};

export default useDateFilter;
