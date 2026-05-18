"use client";

import { Skeleton } from "@nextui-org/react";
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Tooltip,
} from "chart.js";
import { Bar } from "react-chartjs-2";

import {
  OrderDetailsSection,
  PaymentDetailsSection,
} from "@/components/ui/dashboard/inventory/stock-analysis/types";

import DashboardCard from "./DashboardCard";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

interface RevenueOrdersTrendChartProps {
  payments?: PaymentDetailsSection;
  orders?: OrderDetailsSection;
  isLoading?: boolean;
}

const CURRENCY_SYMBOL = "₦";

const formatRevenue = (value: number): string => {
  if (value >= 1_000_000)
    return `${CURRENCY_SYMBOL}${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000)
    return `${CURRENCY_SYMBOL}${(value / 1_000).toFixed(0)}k`;
  return `${CURRENCY_SYMBOL}${value.toString()}`;
};

const formatRevenueExact = (value: number): string =>
  `${CURRENCY_SYMBOL}${value.toLocaleString("en-NG", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;

const RevenueOrdersTrendChart = ({
  payments,
  orders,
  isLoading,
}: RevenueOrdersTrendChartProps) => {
  const labels =
    payments?.paymentPartitions?.map((p) => p.partitionName) ??
    orders?.orderPartitions?.map((p) => p.partitionName) ??
    [];

  const revenueSeries =
    payments?.paymentPartitions?.map((p) => p.count) ?? [];
  const ordersSeries = orders?.orderPartitions?.map((p) => p.count) ?? [];

  const data = {
    labels,
    datasets: [
      {
        label: "Revenue",
        data: revenueSeries,
        backgroundColor: "#7DD3C0",
        borderRadius: 4,
        barThickness: 10,
        yAxisID: "y",
        order: 1,
      },
      {
        label: "Orders",
        data: ordersSeries,
        backgroundColor: "#5F35D2",
        borderRadius: 4,
        barThickness: 10,
        yAxisID: "y1",
        order: 0,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx: any) => {
            const value = Number(ctx.parsed.y) || 0;
            if (ctx.dataset.yAxisID === "y") {
              return `${ctx.dataset.label}: ${formatRevenueExact(value)}`;
            }
            return `${ctx.dataset.label}: ${value.toLocaleString()} ${
              value === 1 ? "order" : "orders"
            }`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        border: { display: false },
        ticks: { color: "#64748B", font: { size: 11 } },
      },
      y: {
        position: "left" as const,
        title: {
          display: true,
          text: `Revenue (${CURRENCY_SYMBOL})`,
          color: "#7DD3C0",
          font: { size: 11 },
        },
        grid: { color: "#F1F5F9" },
        border: { display: false },
        ticks: {
          color: "#64748B",
          font: { size: 11 },
          callback: (value: any) => formatRevenue(Number(value)),
        },
      },
      y1: {
        position: "right" as const,
        title: {
          display: true,
          text: "Orders (count)",
          color: "#5F35D2",
          font: { size: 11 },
        },
        grid: { display: false },
        border: { display: false },
        ticks: {
          color: "#64748B",
          font: { size: 11 },
          precision: 0,
        },
      },
    },
  };

  if (isLoading) {
    return (
      <DashboardCard className="p-5 flex flex-col gap-4 min-h-[340px]">
        <Skeleton className="h-5 w-40 rounded" />
        <Skeleton className="flex-1 rounded-lg" />
      </DashboardCard>
    );
  }

  const isEmpty = labels.length === 0;

  return (
    <DashboardCard className="p-5 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="text-[15px] font-semibold text-[#0F172A]">
          Revenue & Orders Trend
        </h3>
        <span className="text-[12px] text-[#64748B]">Period Overview</span>
      </div>
      <div className="h-[280px] w-full">
        {isEmpty ? (
          <div className="flex items-center justify-center h-full text-[13px] text-[#64748B]">
            No data this period
          </div>
        ) : (
          <Bar data={data} options={options} />
        )}
      </div>
    </DashboardCard>
  );
};

export default RevenueOrdersTrendChart;
