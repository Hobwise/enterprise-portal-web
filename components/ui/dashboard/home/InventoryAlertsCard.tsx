"use client";

import { Skeleton } from "@nextui-org/react";
import { HiOutlineExclamation } from "react-icons/hi";

import { formatNumber, formatPrice } from "@/lib/utils";
import { InventoryDetailsSection } from "@/components/ui/dashboard/report/types";

import DashboardCard from "./DashboardCard";

interface InventoryAlertsCardProps {
  inventory?: InventoryDetailsSection;
  isLoading?: boolean;
}

interface AlertRow {
  id: string;
  title: string;
  subtitle: string;
  count: number;
  bg: string;
  icon: string;
}

const InventoryAlertsCard = ({
  inventory,
  isLoading,
}: InventoryAlertsCardProps) => {
  if (isLoading) {
    return (
      <DashboardCard className="p-5 flex flex-col gap-4 min-h-[300px]">
        <Skeleton className="h-5 w-40 rounded" />
        <Skeleton className="h-16 w-full rounded-lg" />
        <Skeleton className="h-16 w-full rounded-lg" />
      </DashboardCard>
    );
  }

  const outOfStock = inventory?.itemsOutOfStock ?? 0;
  const belowReorder = inventory?.itemsBelowReorder ?? 0;
  const totalValue = inventory?.totalStockValue ?? 0;
  const wastage = inventory?.wastageCost ?? 0;
  const daysOnHand = inventory?.daysOfInventoryOnHand ?? 0;

  const rows: AlertRow[] = [
    {
      id: "out-of-stock",
      title: "High refund rate",
      subtitle: "Sales at Risk",
      count: outOfStock,
      bg: "bg-[#FEF2F2]",
      icon: "text-[#DC2626]",
    },
    {
      id: "below-reorder",
      title: "Below reorder",
      subtitle: "Restock soon",
      count: belowReorder,
      bg: "bg-[#FFFBEB]",
      icon: "text-[#D97706]",
    },
  ];

  return (
    <DashboardCard className="p-5 flex flex-col gap-4 h-full">
      <div className="flex items-center justify-between">
        <h3 className="text-[15px] font-semibold text-[#0F172A]">Inventory</h3>
        <span className="text-[12px] font-semibold text-[#0F172A] tabular-nums">
          {formatPrice(totalValue, "NGN")}
        </span>
      </div>

      <div className="flex flex-col gap-2.5">
        {rows.map((row) => (
          <div
            key={row.id}
            className={`flex items-center justify-between rounded-lg px-4 py-3 ${row.bg}`}
          >
            <div className="flex items-center gap-3">
              <span
                className={`flex items-center justify-center w-7 h-7 rounded-md bg-white/70 ${row.icon}`}
              >
                <HiOutlineExclamation className="text-[16px]" />
              </span>
              <div className="flex flex-col">
                <span className="text-[13px] font-semibold text-[#0F172A]">
                  {row.title}
                </span>
                <span className="text-[11px] text-[#64748B]">
                  {row.subtitle}
                </span>
              </div>
            </div>
            <span className="text-[18px] font-bold text-[#0F172A] tabular-nums">
              {formatNumber(row.count)}
            </span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4 pt-2 mt-auto border-t border-[#F1F5F9]">
        <div className="flex flex-col gap-0.5 pt-3">
          <span className="text-[11px] text-[#64748B]">Wastage</span>
          <span className="text-[14px] font-semibold text-[#0F172A]">
            N {formatNumber(wastage)}
          </span>
        </div>
        <div className="flex flex-col gap-0.5 pt-3">
          <span className="text-[11px] text-[#64748B]">Days on Hand</span>
          <span className="text-[14px] font-semibold text-[#0F172A]">
            {formatNumber(daysOnHand)}
          </span>
        </div>
      </div>
    </DashboardCard>
  );
};

export default InventoryAlertsCard;
