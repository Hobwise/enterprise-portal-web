"use client";

import { Skeleton } from "@nextui-org/react";

import { formatNumber, formatPrice } from "@/lib/utils";
import { BookingDetailsSection } from "@/components/ui/dashboard/report/types";

import DashboardCard from "./DashboardCard";

interface BookingHealthCardProps {
  bookings?: BookingDetailsSection;
  isLoading?: boolean;
}

const Row = ({
  label,
  value,
}: {
  label: string;
  value: string;
}) => (
  <li className="flex items-center justify-between py-2.5 border-b border-[#F1F5F9] last:border-0 text-[13px]">
    <span className="text-[#64748B]">{label}</span>
    <span className="text-[#0F172A] font-semibold tabular-nums">{value}</span>
  </li>
);

const formatRate = (value?: number): string =>
  typeof value === "number" ? `${value.toFixed(0)}%` : "—";

const formatDays = (value?: number): string =>
  typeof value === "number"
    ? `${value.toFixed(0)} day${value === 1 ? "" : "s"}`
    : "—";

const BookingHealthCard = ({
  bookings,
  isLoading,
}: BookingHealthCardProps) => {
  if (isLoading) {
    return (
      <DashboardCard className="p-5 flex flex-col gap-3 min-h-[300px]">
        <Skeleton className="h-5 w-40 rounded" />
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Skeleton key={i} className="h-3 w-full rounded" />
        ))}
      </DashboardCard>
    );
  }

  return (
    <DashboardCard className="p-5 flex flex-col gap-2 h-full">
      <div className="flex items-center justify-between">
        <h3 className="text-[15px] font-semibold text-[#0F172A]">
          Booking Health
        </h3>
        <span className="text-[12px] text-[#64748B]">
          {formatNumber(bookings?.allBookingCount ?? 0)} Booking
          {bookings?.allBookingCount === 1 ? "" : "s"}
        </span>
      </div>

      <ul className="flex flex-col">
        <Row label="Cancellation Rate" value={formatRate(bookings?.cancellationRate)} />
        <Row label="Avg. leads time" value={formatDays(bookings?.avgLeadTimeDays)} />
        <Row label="Peak Day" value={bookings?.peakDayOfWeek ?? "—"} />
        <Row
          label="Repeat Guest"
          value={formatNumber(bookings?.uniqueGuests ?? 0).toString()}
        />
        <Row
          label="Average booking fee"
          value={formatPrice(bookings?.averageBookingFee ?? 0, "NGN")}
        />
      </ul>
    </DashboardCard>
  );
};

export default BookingHealthCard;
