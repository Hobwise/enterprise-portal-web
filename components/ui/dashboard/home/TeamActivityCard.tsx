"use client";

import { Avatar, Skeleton } from "@nextui-org/react";

import { formatNumber } from "@/lib/utils";
import { AuditDetailsSection } from "@/components/ui/dashboard/inventory/stock-analysis/types";

import DashboardCard from "./DashboardCard";

interface TeamActivityCardProps {
  audit?: AuditDetailsSection;
  isLoading?: boolean;
}

const formatHours = (avgPerUser?: number): string => {
  if (typeof avgPerUser !== "number") return "—";
  return `${avgPerUser.toFixed(1)}hrs`;
};

const formatHour = (hour?: number | null): string => {
  if (hour === null || hour === undefined) return "—";
  const h = Math.max(0, Math.min(23, Math.floor(hour)));
  if (h === 0) return "12am";
  if (h === 12) return "12pm";
  if (h < 12) return `${h}am`;
  return `${h - 12}pm`;
};

const TeamActivityCard = ({ audit, isLoading }: TeamActivityCardProps) => {
  if (isLoading) {
    return (
      <DashboardCard className="p-5 flex flex-col gap-4 min-h-[300px]">
        <Skeleton className="h-5 w-40 rounded" />
        <Skeleton className="h-20 w-full rounded-lg" />
        <Skeleton className="h-3 w-full rounded" />
        <Skeleton className="h-3 w-full rounded" />
      </DashboardCard>
    );
  }

  const user = audit?.mostActiveUser;
  const userInitials = user?.name
    ? user.name
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((s) => s[0]?.toUpperCase() ?? "")
        .join("")
    : "?";

  return (
    <DashboardCard className="p-5 flex flex-col gap-4 h-full">
      <h3 className="text-[15px] font-semibold text-[#0F172A]">
        Team Activity
      </h3>

      <div className="rounded-lg border border-[#E5E7EB] p-4 flex flex-col gap-3">
        <span className="text-[11px] text-[#64748B]">Most Active</span>
        {user ? (
          <div className="flex items-start gap-3">
            <Avatar
              radius="full"
              name={userInitials}
              className="bg-[#5F35D2] text-white w-10 h-10 flex-shrink-0"
            />
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-[14px] font-semibold text-[#0F172A] truncate">
                {user.name}
              </span>
              <span className="text-[11px] text-[#64748B] truncate">
                {user.emailAddress}
              </span>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-[20px] font-bold text-[#5F35D2]">
                {formatNumber(user.activityCount)}
              </span>
              <span className="text-[10px] text-[#64748B]">Actions</span>
            </div>
          </div>
        ) : (
          <p className="text-[13px] text-[#64748B]">
            No activity recorded this period
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 text-[13px]">
        <div className="flex flex-col gap-0.5">
          <span className="text-[11px] text-[#64748B]">Active Users</span>
          <span className="font-semibold text-[#0F172A]">
            {formatNumber(audit?.totalUsersCount ?? 0)}
          </span>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-[11px] text-[#64748B]">Active Days</span>
          <span className="font-semibold text-[#0F172A]">
            {formatNumber(audit?.activeDaysInPeriod ?? 0)}
          </span>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-[11px] text-[#64748B]">Avg. User Hours</span>
          <span className="font-semibold text-[#0F172A]">
            {formatHours(audit?.averageActivitiesPerUser)}
          </span>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-[11px] text-[#64748B]">Peak Hour</span>
          <span className="font-semibold text-[#0F172A]">
            {formatHour(audit?.peakActivityHour ?? null)}
          </span>
        </div>
      </div>
    </DashboardCard>
  );
};

export default TeamActivityCard;
