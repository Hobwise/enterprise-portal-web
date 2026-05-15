"use client";

import { Skeleton } from "@nextui-org/react";

import { formatNumber, formatPrice } from "@/lib/utils";
import {
  BookingDetailsSection,
  OrderDetailsSection,
  PaymentDetailsSection,
} from "@/components/ui/dashboard/inventory/stock-analysis/types";

import DashboardCard from "./DashboardCard";
import LockedCardOverlay from "./LockedCardOverlay";

interface KpiTilesProps {
  payments?: PaymentDetailsSection;
  orders?: OrderDetailsSection;
  bookings?: BookingDetailsSection;
  comparisonLabel: string;
  isLoading?: boolean;
  planAllowsBookings?: boolean;
}

interface Tile {
  id: string;
  label: string;
  value: string;
  delta: number;
  highlight?: boolean;
  locked?: boolean;
}

const parsePercentage = (value?: string | number): number => {
  if (typeof value === "number") return value;
  if (!value) return 0;
  const cleaned = value.toString().replace(/[%\s]/g, "");
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : 0;
};

const formatDelta = (delta: number, comparisonLabel: string) => {
  const sign = delta > 0 ? "+" : delta < 0 ? "" : "";
  return `${sign}${delta.toFixed(0)}% ${comparisonLabel}`;
};

const deltaToneClass = (delta: number, highlight?: boolean): string => {
  if (highlight) return "text-[#DC2626]";
  if (delta > 0) return "text-[#16A34A]";
  if (delta < 0) return "text-[#DC2626]";
  return "text-[#64748B]";
};

const TileSkeleton = () => (
  <DashboardCard className="px-4 py-4 flex flex-col gap-2">
    <Skeleton className="h-3 w-20 rounded" />
    <Skeleton className="h-6 w-28 rounded" />
    <Skeleton className="h-3 w-24 rounded" />
  </DashboardCard>
);

const Tile = ({
  label,
  value,
  delta,
  comparisonLabel,
  highlight,
}: Tile & { comparisonLabel: string }) => (
  <DashboardCard className="px-4 py-4 flex flex-col gap-1.5">
    <span className="text-[12px] text-[#64748B]">{label}</span>
    <span
      className={`text-[22px] font-bold leading-tight tabular-nums break-words ${
        highlight ? "text-[#DC2626]" : "text-[#0F172A]"
      }`}
    >
      {value}
    </span>
    <span
      className={`text-[11px] font-medium ${deltaToneClass(delta, highlight)}`}
    >
      {formatDelta(delta, comparisonLabel)}
    </span>
  </DashboardCard>
);

const KpiTiles = ({
  payments,
  orders,
  bookings,
  comparisonLabel,
  isLoading,
  planAllowsBookings = true,
}: KpiTilesProps) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <TileSkeleton />
        <TileSkeleton />
        <TileSkeleton />
        <TileSkeleton />
      </div>
    );
  }

  const paymentDelta = parsePercentage(payments?.percentageChange);
  const netRevenue = payments?.netRevenue ?? payments?.totalAmount ?? 0;

  const tiles: Tile[] = [
    {
      id: "net-revenue",
      label: "Net Revenue",
      value: formatPrice(netRevenue, "NGN"),
      delta: paymentDelta,
    },
    {
      id: "orders",
      label: "Total Orders",
      value: formatNumber(orders?.allOrdersCount ?? 0).toString(),
      delta: parsePercentage(orders?.percentageChange),
    },
    {
      id: "bookings",
      label: "Total Bookings",
      value: formatNumber(bookings?.allBookingCount ?? 0).toString(),
      delta: parsePercentage(bookings?.percentageChange),
      locked: !planAllowsBookings,
    },
    {
      id: "outstanding",
      label: "Outstanding Payments",
      value: formatPrice(payments?.outstandingAmount ?? 0, "NGN"),
      delta: paymentDelta,
      highlight: true,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {tiles.map((tile) =>
        tile.locked ? (
          <LockedCardOverlay key={tile.id} variant="tile">
            <Tile {...tile} comparisonLabel={comparisonLabel} />
          </LockedCardOverlay>
        ) : (
          <Tile
            key={tile.id}
            {...tile}
            comparisonLabel={comparisonLabel}
          />
        ),
      )}
    </div>
  );
};

export default KpiTiles;
