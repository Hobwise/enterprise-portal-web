"use client";

import { useMemo, useState } from "react";

import {
  FilterType,
  PeriodId,
  filterTypeToComparisonLabel as upstreamFilterTypeToComparisonLabel,
  periodToFilterType as upstreamPeriodToFilterType,
} from "@/components/ui/dashboard/report/types";

export type DashboardPeriod = PeriodId;

export const PERIODS: { id: PeriodId; label: string }[] = [
  { id: "today", label: "Today" },
  { id: "week", label: "This Week" },
  { id: "year", label: "This Year" },
];

export const periodToFilterType = upstreamPeriodToFilterType;
export const filterTypeToComparisonLabel = upstreamFilterTypeToComparisonLabel;

export interface CustomDateRange {
  start?: string; // YYYY-MM-DD
  end?: string;
}

interface PeriodFilterState {
  activePeriod: PeriodId;
  setActivePeriod: (period: PeriodId) => void;
  customRange: CustomDateRange;
  setCustomRange: (range: CustomDateRange) => void;
  clearCustomRange: () => void;
  hasCustomRange: boolean;
  filterType: number;
  startDate?: string;
  endDate?: string;
  comparisonLabel: string;
  periodLabel: string;
}

const periodLabel = (period: PeriodId, hasCustomRange: boolean): string => {
  if (hasCustomRange) return "Custom Range";
  const match = PERIODS.find((p) => p.id === period);
  return match?.label ?? "This Week";
};

export const usePeriodFilter = (
  initial: PeriodId = "week",
): PeriodFilterState => {
  const [activePeriod, setActivePeriod] = useState<PeriodId>(initial);
  const [customRange, setCustomRangeState] = useState<CustomDateRange>({});

  const hasCustomRange = Boolean(customRange.start && customRange.end);

  const filterType = hasCustomRange
    ? FilterType.Custom
    : periodToFilterType(activePeriod);

  const startDate = useMemo(() => {
    if (!hasCustomRange || !customRange.start) return undefined;
    return new Date(`${customRange.start}T00:00:00`).toISOString();
  }, [hasCustomRange, customRange.start]);

  const endDate = useMemo(() => {
    if (!hasCustomRange || !customRange.end) return undefined;
    return new Date(`${customRange.end}T23:59:59.999`).toISOString();
  }, [hasCustomRange, customRange.end]);

  const setCustomRange = (range: CustomDateRange) => {
    setCustomRangeState(range);
  };

  const clearCustomRange = () => setCustomRangeState({});

  return {
    activePeriod,
    setActivePeriod,
    customRange,
    setCustomRange,
    clearCustomRange,
    hasCustomRange,
    filterType,
    startDate,
    endDate,
    comparisonLabel: filterTypeToComparisonLabel(filterType),
    periodLabel: periodLabel(activePeriod, hasCustomRange),
  };
};
