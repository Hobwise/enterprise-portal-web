"use client";

import { Skeleton } from "@nextui-org/react";
import { ArcElement, Chart as ChartJS, Legend, Tooltip } from "chart.js";
import { Doughnut } from "react-chartjs-2";

import { formatNumber } from "@/lib/utils";
import {
  PaymentDetailsSection,
  PaymentMethodBreakdownItem,
} from "@/components/ui/dashboard/report/types";

import DashboardCard from "./DashboardCard";

ChartJS.register(ArcElement, Tooltip, Legend);

interface PaymentStatusDonutProps {
  payments?: PaymentDetailsSection;
  isLoading?: boolean;
}

const SEGMENT_COLORS = ["#5F35D2", "#F59E0B", "#3B82F6", "#10B981", "#EC4899"];

const friendlyMethodLabel = (method: string): string => {
  switch (method) {
    case "Pos":
      return "POS";
    case "BankTransfer":
      return "Transfer";
    case "CheckOut":
      return "Others";
    default:
      return method;
  }
};

const PaymentStatusDonut = ({
  payments,
  isLoading,
}: PaymentStatusDonutProps) => {
  const breakdown: PaymentMethodBreakdownItem[] =
    payments?.paymentMethodBreakdown ?? [];
  const hasData = breakdown.some((item) => item.count > 0);

  const totalCount = breakdown.reduce((sum, item) => sum + item.count, 0);

  const data = {
    labels: breakdown.map((b) => friendlyMethodLabel(b.method)),
    datasets: [
      {
        data: breakdown.map((b) => b.count),
        backgroundColor: SEGMENT_COLORS.slice(0, breakdown.length),
        borderWidth: 0,
        hoverOffset: 4,
      },
    ],
  };

  const options = {
    cutout: "72%",
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx: any) =>
            `${ctx.label}: ${formatNumber(Number(ctx.parsed))}`,
        },
      },
    },
  };

  if (isLoading) {
    return (
      <DashboardCard className="p-5 flex flex-col gap-4 min-h-[360px]">
        <Skeleton className="h-5 w-40 rounded" />
        <div className="flex flex-col items-center gap-4">
          <Skeleton className="w-40 h-40 rounded-full" />
          <div className="flex flex-col gap-2 w-full">
            <Skeleton className="h-3 w-full rounded" />
            <Skeleton className="h-3 w-full rounded" />
            <Skeleton className="h-3 w-full rounded" />
          </div>
        </div>
      </DashboardCard>
    );
  }

  return (
    <DashboardCard className="p-5 flex flex-col gap-4 h-full">
      <div className="flex flex-col gap-0.5">
        <h3 className="text-[15px] font-semibold text-[#0F172A]">
          Payment Status
        </h3>
        <p className="text-[12px] text-[#64748B]">Payment method breakdown</p>
      </div>

      {!hasData ? (
        <div className="flex items-center justify-center flex-1 min-h-[220px] text-[13px] text-[#64748B]">
          No payments this period
        </div>
      ) : (
        <div className="flex flex-col items-center gap-5 flex-1">
          <div className="relative w-[180px] h-[180px]">
            <Doughnut data={data} options={options} />
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-[20px] font-semibold text-[#0F172A] leading-none">
                {formatNumber(totalCount)}
              </span>
              <span className="text-[11px] text-[#64748B] mt-1">
                Transactions
              </span>
            </div>
          </div>

          <ul className="flex flex-col gap-2.5 w-full">
            {breakdown.map((item, idx) => (
              <li
                key={item.method}
                className="flex items-center gap-3 text-[13px]"
              >
                <span
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{
                    backgroundColor:
                      SEGMENT_COLORS[idx % SEGMENT_COLORS.length],
                  }}
                />
                <span className="text-[#0F172A] flex-1 min-w-0 truncate">
                  {friendlyMethodLabel(item.method)}
                </span>
                <span className="text-[#0F172A] font-medium tabular-nums">
                  {item.sharePct?.toFixed(0) ?? 0}%
                </span>
                <span className="text-[#94A3B8] tabular-nums w-12 text-right">
                  {formatNumber(item.count)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </DashboardCard>
  );
};

export default PaymentStatusDonut;
