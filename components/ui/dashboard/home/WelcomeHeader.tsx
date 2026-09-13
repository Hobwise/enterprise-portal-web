"use client";

import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from "@nextui-org/react";
import moment from "moment";
import { MdKeyboardArrowDown } from "react-icons/md";

import {
  CustomDateRange,
  DashboardPeriod,
  PERIODS,
} from "./periodUtils";

interface WelcomeHeaderProps {
  firstName?: string;
  periodLabel: string;
  activePeriod: DashboardPeriod;
  onSelectPeriod: (period: DashboardPeriod) => void;
  onOpenCustomRange: () => void;
  customRange: CustomDateRange;
  hasCustomRange: boolean;
}

const formatRange = (
  activePeriod: DashboardPeriod,
  hasCustomRange: boolean,
  customRange: CustomDateRange,
): string => {
  const now = moment();
  if (hasCustomRange && customRange.start && customRange.end) {
    return `${moment(customRange.start).format("MMM D")} to ${moment(
      customRange.end,
    ).format("MMM D, YYYY")}`;
  }
  switch (activePeriod) {
    case "today":
      return now.format("MMM D, YYYY");
    case "year":
      return `${now.startOf("year").format("MMM D")} to ${now
        .endOf("year")
        .format("MMM D, YYYY")}`;
    case "week":
    default: {
      const start = moment().startOf("isoWeek");
      const end = moment().endOf("isoWeek");
      return `${start.format("MMM D")} to ${end.format("MMM D, YYYY")}`;
    }
  }
};

const subtitleFor = (activePeriod: DashboardPeriod, hasCustomRange: boolean) => {
  if (hasCustomRange) return "Performance for selected range";
  switch (activePeriod) {
    case "today":
      return "Today's performance";
    case "year":
      return "This year's performance";
    case "week":
    default:
      return "This week's performance";
  }
};

const WelcomeHeader = ({
  firstName,
  periodLabel,
  activePeriod,
  onSelectPeriod,
  onOpenCustomRange,
  customRange,
  hasCustomRange,
}: WelcomeHeaderProps) => {
  const displayName = firstName?.trim() || "there";
  const range = formatRange(activePeriod, hasCustomRange, customRange);
  const subtitle = subtitleFor(activePeriod, hasCustomRange);

  const handleAction = (key: React.Key) => {
    const id = String(key);
    if (id === "custom") {
      onOpenCustomRange();
      return;
    }
    if (PERIODS.some((p) => p.id === id)) {
      onSelectPeriod(id as DashboardPeriod);
    }
  };

  const selectedKey = hasCustomRange ? "custom" : activePeriod;

  return (
    <header className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
      <div className="flex flex-col gap-1">
        <h1 className="text-[28px] font-semibold text-[#0F172A] leading-tight">
          Welcome Back, {displayName}
        </h1>
        <p className="text-[13px] text-[#64748B]">
          {subtitle} — {range}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Dropdown>
          <DropdownTrigger>
            <Button
              variant="bordered"
              endContent={<MdKeyboardArrowDown />}
              className="bg-white border border-[#E5E7EB] text-[#0F172A] font-medium h-10 rounded-lg"
            >
              {periodLabel}
            </Button>
          </DropdownTrigger>
          <DropdownMenu
            aria-label="Select period"
            selectionMode="single"
            selectedKeys={new Set([selectedKey])}
            onAction={handleAction}
            itemClasses={{
              base: [
                "rounded-md",
                "text-[#0F172A]",
                "data-[hover=true]:bg-[#F3EEFE]",
                "data-[hover=true]:text-primaryColor",
                "data-[selectable=true]:focus:bg-[#F3EEFE]",
                "data-[selectable=true]:focus:text-primaryColor",
                "data-[selected=true]:bg-primaryColor",
                "data-[selected=true]:text-white",
                "data-[selected=true]:data-[hover=true]:bg-primaryColor",
                "data-[selected=true]:data-[hover=true]:text-white",
              ],
            }}
          >
            <DropdownItem key="today">Today</DropdownItem>
            <DropdownItem key="week">This Week</DropdownItem>
            <DropdownItem key="year">This Year</DropdownItem>
            <DropdownItem key="custom">Custom Range</DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </div>
    </header>
  );
};

export default WelcomeHeader;
