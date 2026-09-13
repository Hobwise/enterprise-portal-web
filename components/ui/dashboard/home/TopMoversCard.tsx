"use client";

import { Skeleton } from "@nextui-org/react";

import { formatNumber } from "@/lib/utils";
import {
  InventoryDetailsSection,
  MoverItem,
} from "@/components/ui/dashboard/report/types";

import DashboardCard from "./DashboardCard";

interface TopMoversCardProps {
  inventory?: InventoryDetailsSection;
  isLoading?: boolean;
}

const getMoverName = (m: MoverItem): string =>
  m.itemName ?? m.name ?? "Unnamed";

const getMoverQty = (m: MoverItem): number =>
  m.quantityMoved ?? m.quantity ?? m.qty ?? m.movement ?? 0;

const TopMoversCard = ({ inventory, isLoading }: TopMoversCardProps) => {
  if (isLoading) {
    return (
      <DashboardCard className="p-5 flex flex-col gap-3 min-h-[260px]">
        <Skeleton className="h-5 w-32 rounded" />
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-3 w-full rounded" />
        ))}
      </DashboardCard>
    );
  }

  const movers = (inventory?.topMovers ?? []).slice(0, 5);
  const maxQty = movers.reduce(
    (max, m) => Math.max(max, getMoverQty(m)),
    0,
  );

  return (
    <DashboardCard className="p-5 flex flex-col gap-3 h-full">
      <h3 className="text-[15px] font-semibold text-[#0F172A]">Top Movers</h3>

      {movers.length === 0 ? (
        <p className="text-[13px] text-[#64748B] py-6">
          No movement this period
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {movers.map((mover, idx) => {
            const qty = getMoverQty(mover);
            const pct = maxQty > 0 ? (qty / maxQty) * 100 : 0;
            return (
              <li key={`${getMoverName(mover)}-${idx}`} className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-[12px]">
                  <span className="text-[#0F172A] truncate pr-2">
                    {getMoverName(mover)}
                  </span>
                  <span className="text-[#64748B] tabular-nums flex-shrink-0">
                    {formatNumber(qty)}
                  </span>
                </div>
                <div className="h-1.5 w-full bg-[#F1F5F9] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[#5F35D2]"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </DashboardCard>
  );
};

export default TopMoversCard;
