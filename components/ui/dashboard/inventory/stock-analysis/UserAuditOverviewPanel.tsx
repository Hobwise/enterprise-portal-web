'use client';

import React from 'react';
import { Skeleton } from '@nextui-org/react';
import { AvailableReportsList, StatCards } from './SharedPanels';
import { AuditDetailsSection, StatCard } from './types';

interface UserAuditOverviewPanelProps {
  data?: AuditDetailsSection;
  isLoading?: boolean;
}

export const UserAuditOverviewPanel: React.FC<UserAuditOverviewPanelProps> = ({
  data,
  isLoading,
}) => {
  if (isLoading || !data) {
    return (
      <div className="flex flex-col gap-5">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-28 rounded-2xl" />
          ))}
        </div>
        <Skeleton className="h-48 rounded-2xl" />
      </div>
    );
  }

  const stats: StatCard[] = [
    {
      label: 'Total Users',
      value: String(data.totalUsersCount ?? 0),
      footer: 'Registered users',
      footerTone: 'muted',
    },
    {
      label: 'Total Activities',
      value: String(data.totalActivitiesCount ?? 0),
      footer: 'All recorded actions',
      footerTone: 'muted',
    },
    {
      label: 'Most Active User',
      value: data.mostActiveUser?.name ?? '—',
      footer: data.mostActiveUser
        ? `${data.mostActiveUser.activityCount} activities`
        : 'No activity recorded',
      footerTone: 'success',
    },
  ];

  return (
    <div className="flex flex-col gap-5">
      <StatCards cards={stats} />
      <AvailableReportsList
        reports={data.availableReport}
        route="users"
        title="Available User Reports"
      />
    </div>
  );
};
