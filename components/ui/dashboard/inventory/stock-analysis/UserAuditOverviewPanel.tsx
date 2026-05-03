'use client';

import React from 'react';
import { Skeleton } from '@nextui-org/react';
import {
  AvailableReportsList,
  BreakdownList,
  StatCards,
} from './SharedPanels';
import {
  AuditDetailsSection,
  BreakdownRow,
  StatCard,
} from './types';

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

  const insightRows: BreakdownRow[] = [
    {
      label: 'Total Activities',
      value: totalActivities.toLocaleString(),
    },
    {
      label: 'Active Days In Period',
      value: safeNumber(data.activeDaysInPeriod),
    },
    {
      label: 'Avg. Activities Per User',
      value: safeNumber(data.averageActivitiesPerUser),
    },
    {
      label: 'Peak Activity Hour',
      value: peakActivityHour,
    },
    {
      label: 'Failed Activity Rate',
      value: `${failedRate}%`,
    },
  ];

  return (
    <div className="flex flex-col gap-5">
      <StatCards cards={stats} />
      <BreakdownList title="Activity Insights" rows={insightRows} />
      <AvailableReportsList
        reports={data.availableReport}
        route="users"
        title="Available User Reports"
      />
    </div>
  );
};
