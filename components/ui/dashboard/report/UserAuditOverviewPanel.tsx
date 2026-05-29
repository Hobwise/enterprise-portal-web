'use client';

import React from 'react';
import { Skeleton } from '@nextui-org/react';
import { InsightBars, InsightMetric, StatCards } from './SharedPanels';
import { AuditDetailsSection, StatCard } from './types';

interface UserAuditOverviewPanelProps {
  data?: AuditDetailsSection;
  isLoading?: boolean;
}

const safeNumber = (value: unknown): number => {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
};

export const UserAuditOverviewPanel: React.FC<UserAuditOverviewPanelProps> = ({
  data,
  isLoading,
}) => {
  if (isLoading || !data) {
    return (
      <div className="flex flex-col gap-5">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-28 rounded-2xl" />
          ))}
        </div>
        <Skeleton className="h-64 rounded-2xl" />
      </div>
    );
  }

  const totalActivities = safeNumber(data.totalActivitiesCount);
  const failedRate = safeNumber(data.failedActivityRate);
  const peakActivityHour =
    data.peakActivityHour != null ? `${data.peakActivityHour}:00` : '—';

  const stats: StatCard[] = [
    {
      label: 'Total Staffs',
      value: safeNumber(data.totalUsersCount).toLocaleString(),
      footer: 'Active Staffs',
      footerTone: 'success',
    },
    {
      label: 'Activities Today',
      value: totalActivities.toLocaleString(),
      footer: `${safeNumber(data.activeDaysInPeriod)} active days`,
      footerTone: 'muted',
    },
    {
      label: 'Most Active',
      value: data.mostActiveUser?.name ?? '—',
      footer: data.mostActiveUser
        ? `${safeNumber(data.mostActiveUser.activityCount)} Activities`
        : 'No activity recorded',
      footerTone: 'success',
    },
    {
      label: 'Failed Activity Rate',
      value: `${failedRate}%`,
      footer: failedRate > 0 ? 'Investigate' : 'All actions successful',
      footerTone: failedRate > 0 ? 'danger' : 'muted',
    },
  ];

  const activeDays = safeNumber(data.activeDaysInPeriod);
  const totalUsers = safeNumber(data.totalUsersCount);
  const avgPerUser = safeNumber(data.averageActivitiesPerUser);
  const peakHour =
    data.peakActivityHour != null ? safeNumber(data.peakActivityHour) : null;

  const peakHourFill = peakHour != null ? (peakHour / 24) * 100 : 0;
  const avgPerUserMax = Math.max(totalUsers, 1) * Math.max(activeDays, 1);
  const avgPerUserFill =
    avgPerUserMax > 0
      ? Math.min(100, (avgPerUser / avgPerUserMax) * 100)
      : Math.min(100, avgPerUser);

  const insightRows: InsightMetric[] = [
    {
      label: 'Total Activities',
      displayValue: totalActivities.toLocaleString(),
      fillPct: 100,
      tone: 'primary',
    },
    {
      label: 'Active Days In Period',
      displayValue: activeDays.toLocaleString(),
      fillPct: Math.min(100, (activeDays / 365) * 100),
      tone: 'primary',
      caption: 'out of 365 day window',
    },
    {
      label: 'Avg. Activities Per User',
      displayValue: avgPerUser.toLocaleString(undefined, {
        maximumFractionDigits: 2,
      }),
      fillPct: avgPerUserFill,
      tone: 'primary',
    },
    {
      label: 'Peak Activity Hour',
      displayValue: peakActivityHour,
      fillPct: peakHourFill,
      tone: 'success',
      caption: peakHour != null ? '24-hour clock' : undefined,
    },
    {
      label: 'Failed Activity Rate',
      displayValue: `${failedRate}%`,
      fillPct: Math.min(100, failedRate),
      tone:
        failedRate >= 5 ? 'danger' : failedRate > 0 ? 'warning' : 'success',
    },
  ];

  return (
    <div className="flex flex-col gap-5">
      <StatCards cards={stats} />
      <InsightBars title="Activity Insights" rows={insightRows} />
    </div>
  );
};
