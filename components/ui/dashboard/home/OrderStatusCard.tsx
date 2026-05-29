"use client";

import { Skeleton } from "@nextui-org/react";

import { formatNumber } from "@/lib/utils";
import { OrderDetailsSection } from "@/components/ui/dashboard/report/types";

import DashboardCard from "./DashboardCard";

interface OrderStatusCardProps {
  orders?: OrderDetailsSection;
  isLoading?: boolean;
}

interface Row {
  label: string;
  count: number;
  color: string;
}

const OrderStatusCard = ({ orders, isLoading }: OrderStatusCardProps) => {
  if (isLoading) {
    return (
      <DashboardCard className="p-5 flex flex-col gap-4 min-h-[300px]">
        <Skeleton className="h-5 w-40 rounded" />
        <Skeleton className="h-3 w-full rounded" />
        <Skeleton className="h-3 w-full rounded" />
        <Skeleton className="h-3 w-full rounded" />
        <Skeleton className="h-3 w-full rounded" />
      </DashboardCard>
    );
  }

  const rows: Row[] = [
    {
      label: "Closed",
      count: orders?.closedOrdersCount ?? 0,
      color: "#16A34A",
    },
    { label: "Open", count: orders?.openOrdersCount ?? 0, color: "#F59E0B" },
    {
      label: "Awaiting",
      count: orders?.awaitingConfirmationOrdersCount ?? 0,
      color: "#3B82F6",
    },
    {
      label: "Cancelled",
      count: orders?.cancelledOrdersCount ?? 0,
      color: "#EF4444",
    },
  ];

  const total = orders?.allOrdersCount ?? 0;
  const completion =
    total > 0 ? Math.round(((orders?.closedOrdersCount ?? 0) / total) * 100) : 0;
  const peakHour = orders?.peakHour ?? "—";
  const repeatCustomers = orders?.uniqueCustomers ?? 0;

  return (
    <DashboardCard className="p-5 flex flex-col gap-4 h-full">
      <div className="flex items-center justify-between">
        <h3 className="text-[15px] font-semibold text-[#0F172A]">
          Order Status
        </h3>
        <span className="text-[12px] text-[#64748B]">{completion}% completion</span>
      </div>

      <ul className="flex flex-col gap-3.5">
        {rows.map((row) => {
          const pct = total > 0 ? (row.count / total) * 100 : 0;
          return (
            <li key={row.label} className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-[12px]">
                <span className="text-[#0F172A]">{row.label}</span>
                <span className="text-[#64748B]">
                  {formatNumber(row.count)} Orders
                </span>
              </div>
              <div className="h-1.5 w-full bg-[#F1F5F9] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${pct}%`, backgroundColor: row.color }}
                />
              </div>
            </li>
          );
        })}
      </ul>

      <div className="grid grid-cols-2 gap-4 pt-2 mt-auto">
        <div className="flex flex-col gap-0.5">
          <span className="text-[11px] text-[#64748B]">Peak Hour</span>
          <span className="text-[14px] font-semibold text-[#0F172A]">
            {peakHour}
          </span>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-[11px] text-[#64748B]">Repeat Customer</span>
          <span className="text-[14px] font-semibold text-[#0F172A]">
            {formatNumber(repeatCustomers)}
          </span>
        </div>
      </div>
    </DashboardCard>
  );
};

export default OrderStatusCard;
