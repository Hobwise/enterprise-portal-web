"use client";

import Link from "next/link";
import { HiArrowRight } from "react-icons/hi";

import {
  InventoryDetailsSection,
  OrderDetailsSection,
  PaymentDetailsSection,
} from "@/components/ui/dashboard/inventory/stock-analysis/types";

interface AlertCardsProps {
  inventory?: InventoryDetailsSection;
  payments?: PaymentDetailsSection;
  orders?: OrderDetailsSection;
}

interface AlertTile {
  id: string;
  tone: "inventory" | "payments" | "orders";
  label: string;
  headline: string;
  body: string;
  linkLabel: string;
  linkHref: string;
}

const REFUND_THRESHOLD = 5; // percent
const ORDER_GROWTH_THRESHOLD = 20; // percent

const parsePercentage = (value?: string | number): number => {
  if (typeof value === "number") return value;
  if (!value) return 0;
  const cleaned = value.toString().replace(/[%\s]/g, "");
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : 0;
};

const tones: Record<
  AlertTile["tone"],
  { bar: string; chip: string; chipText: string; bg: string; body: string }
> = {
  inventory: {
    bar: "bg-[#F97316]",
    chip: "bg-[#FED7AA]",
    chipText: "text-[#9A3412]",
    bg: "bg-[#FFF7ED]",
    body: "text-[#7C2D12]",
  },
  payments: {
    bar: "bg-[#EF4444]",
    chip: "bg-[#FECACA]",
    chipText: "text-[#991B1B]",
    bg: "bg-[#FEF2F2]",
    body: "text-[#7F1D1D]",
  },
  orders: {
    bar: "bg-[#10B981]",
    chip: "bg-[#D1FAE5]",
    chipText: "text-[#065F46]",
    bg: "bg-[#ECFDF5]",
    body: "text-[#064E3B]",
  },
};

const buildAlerts = (
  inventory?: InventoryDetailsSection,
  payments?: PaymentDetailsSection,
  orders?: OrderDetailsSection,
): AlertTile[] => {
  const tiles: AlertTile[] = [];

  const out = inventory?.itemsOutOfStock ?? 0;
  if (out > 0) {
    tiles.push({
      id: "inventory",
      tone: "inventory",
      label: "INVENTORY",
      headline: `${out} item${out === 1 ? "" : "s"} out of stock`,
      body: "Sales may be lost. Restock the affected items as soon as possible.",
      linkLabel: "View stock level report",
      linkHref: "/dashboard/inventory/items",
    });
  }

  const refundRate = payments?.refundRate ?? 0;
  if (refundRate > REFUND_THRESHOLD) {
    tiles.push({
      id: "payments",
      tone: "payments",
      label: "PAYMENTS",
      headline: "High refund rate",
      body: `Refund rate is ${refundRate.toFixed(
        2,
      )}% — above the ${REFUND_THRESHOLD}% healthy threshold. Investigate dispute / quality issues.`,
      linkLabel: "View refund report",
      linkHref: "/dashboard/payments",
    });
  }

  const growth = parsePercentage(orders?.percentageChange);
  if (growth > ORDER_GROWTH_THRESHOLD) {
    tiles.push({
      id: "orders",
      tone: "orders",
      label: "ORDERS",
      headline: "Sharp rise in order volume",
      body: `Orders rose ${growth.toFixed(
        0,
      )}% vs previous period. Investigate marketing, staffing, or operational issues.`,
      linkLabel: "View Order report",
      linkHref: "/dashboard/orders",
    });
  }

  return tiles;
};

const AlertCard = ({ tile }: { tile: AlertTile }) => {
  const tone = tones[tile.tone];
  return (
    <div
      className={`flex flex-1 min-w-[260px] rounded-xl overflow-hidden ${tone.bg}`}
    >
      <span className={`w-1.5 ${tone.bar}`} aria-hidden="true" />
      <div className="flex flex-col gap-2 px-4 py-4 flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wider ${tone.chip} ${tone.chipText}`}
          >
            {tile.label}
          </span>
          <span className="text-[13px] font-semibold text-[#0F172A]">
            {tile.headline}
          </span>
        </div>
        <p className={`text-[12px] leading-snug ${tone.body}`}>{tile.body}</p>
        <Link
          href={tile.linkHref}
          className="inline-flex items-center gap-1 text-[12px] font-medium text-[#0F172A] hover:underline underline-offset-2 mt-1"
        >
          {tile.linkLabel}
          <HiArrowRight className="text-[14px]" />
        </Link>
      </div>
    </div>
  );
};

const AlertCards = ({ inventory, payments, orders }: AlertCardsProps) => {
  const tiles = buildAlerts(inventory, payments, orders);
  if (tiles.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-4">
      {tiles.map((tile) => (
        <AlertCard key={tile.id} tile={tile} />
      ))}
    </div>
  );
};

export default AlertCards;
