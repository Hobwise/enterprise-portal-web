"use client";

import Link from "next/link";
import { HiArrowRight } from "react-icons/hi";

import { SummaryAlert } from "@/components/ui/dashboard/inventory/stock-analysis/types";

interface AlertCardsProps {
  alerts?: SummaryAlert[];
}

type ToneKey = "critical" | "warning" | "info" | "success";

const toneByKey: Record<
  ToneKey,
  { bar: string; chip: string; chipText: string; bg: string; body: string }
> = {
  critical: {
    bar: "bg-[#EF4444]",
    chip: "bg-[#FECACA]",
    chipText: "text-[#991B1B]",
    bg: "bg-[#FEF2F2]",
    body: "text-[#7F1D1D]",
  },
  warning: {
    bar: "bg-[#F97316]",
    chip: "bg-[#FED7AA]",
    chipText: "text-[#9A3412]",
    bg: "bg-[#FFF7ED]",
    body: "text-[#7C2D12]",
  },
  info: {
    bar: "bg-[#3B82F6]",
    chip: "bg-[#DBEAFE]",
    chipText: "text-[#1E40AF]",
    bg: "bg-[#EFF6FF]",
    body: "text-[#1E3A8A]",
  },
  success: {
    bar: "bg-[#10B981]",
    chip: "bg-[#D1FAE5]",
    chipText: "text-[#065F46]",
    bg: "bg-[#ECFDF5]",
    body: "text-[#064E3B]",
  },
};

const severityToTone = (severity: string | undefined): ToneKey => {
  const s = (severity ?? "").toLowerCase();
  if (s === "critical" || s === "error" || s === "danger") return "critical";
  if (s === "warning" || s === "warn") return "warning";
  if (s === "success" || s === "ok") return "success";
  return "info";
};

const categoryLabel = (category: string | undefined): string => {
  if (!category) return "ALERT";
  return category.toUpperCase();
};

const SEVERITY_RANK: Record<ToneKey, number> = {
  critical: 0,
  warning: 1,
  info: 2,
  success: 3,
};

const AlertCard = ({ alert }: { alert: SummaryAlert }) => {
  const toneKey = severityToTone(alert.severity);
  const tone = toneByKey[toneKey];
  return (
    <div
      className={`flex shrink-0 w-[340px] rounded-xl overflow-hidden ${tone.bg}`}
    >
      <span className={`w-1.5 ${tone.bar}`} aria-hidden="true" />
      <div className="flex flex-col gap-2 px-4 py-4 flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wider ${tone.chip} ${tone.chipText}`}
          >
            {categoryLabel(alert.category)}
          </span>
          <span className="text-[13px] font-semibold text-[#0F172A] truncate">
            {alert.title}
          </span>
        </div>
        <p className={`text-[12px] leading-snug ${tone.body} line-clamp-2`}>
          {alert.message}
        </p>
        {alert.actionLabel && alert.actionUrl ? (
          <Link
            href={alert.actionUrl}
            className="inline-flex items-center gap-1 text-[12px] font-medium text-[#0F172A] hover:underline underline-offset-2 mt-1"
          >
            {alert.actionLabel}
            <HiArrowRight className="text-[14px]" />
          </Link>
        ) : null}
      </div>
    </div>
  );
};

const AlertCards = ({ alerts }: AlertCardsProps) => {
  if (!alerts || alerts.length === 0) return null;

  const sorted = [...alerts].sort(
    (a, b) =>
      SEVERITY_RANK[severityToTone(a.severity)] -
      SEVERITY_RANK[severityToTone(b.severity)]
  );

  return (
    <div
      className="flex gap-4 overflow-x-auto pb-2 -mx-1 px-1 [scrollbar-width:thin]"
      role="region"
      aria-label="Dashboard alerts"
    >
      {sorted.map((alert, idx) => (
        <AlertCard
          key={`${alert.category}-${alert.title}-${idx}`}
          alert={alert}
        />
      ))}
    </div>
  );
};

export default AlertCards;
