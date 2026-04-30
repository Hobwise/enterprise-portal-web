'use client';

import React from 'react';
import moment from 'moment';
import { Skeleton } from '@nextui-org/react';
import {
  AvailableReportsList,
  BarList,
  BreakdownList,
  StatCards,
} from './SharedPanels';
import {
  BarRow,
  BookingDetailsSection,
  BreakdownRow,
  StatCard,
} from './types';

interface BookingOverviewPanelProps {
  data?: BookingDetailsSection;
  isLoading?: boolean;
}

export const BookingOverviewPanel: React.FC<BookingOverviewPanelProps> = ({
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

  const direction: StatCard['direction'] =
    Number(data.percentageChange) > 0
      ? 'up'
      : Number(data.percentageChange) < 0
      ? 'down'
      : 'neutral';

  const stats: StatCard[] = [
    {
      label: 'All Bookings',
      value: String(data.allBookingCount ?? 0),
      delta: `${data.percentageChange}% change`,
      direction,
    },
    {
      label: 'Completed',
      value: String(data.completedBookingCount ?? 0),
      footer: 'Successfully fulfilled',
      footerTone: 'success',
    },
    {
      label: 'Confirmed',
      value: String(data.confirmedBookingCount ?? 0),
      footer: 'Awaiting check-in',
      footerTone: 'muted',
    },
    {
      label: 'Cancelled',
      value: String(data.cancelledBookingCount ?? 0),
      footer:
        data.cancelledBookingCount > 0
          ? 'Review cancellation reasons'
          : 'No cancellations',
      footerTone: data.cancelledBookingCount > 0 ? 'danger' : 'muted',
    },
  ];

  const breakdownRows: BreakdownRow[] = [
    { label: 'Pending', value: data.pendingBookingCount ?? 0 },
    { label: 'Admitted', value: data.admittedBookingCount ?? 0 },
    { label: 'Failed', value: data.failedBookingCount ?? 0 },
    { label: 'Expired', value: data.expiredBookingCount ?? 0 },
    {
      label: 'Peak Day',
      value: data.dayWithHighestBooking?.dateTime
        ? `${moment(data.dayWithHighestBooking.dateTime).format('ll')} (${
            data.dayWithHighestBooking.count ?? 0
          })`
        : '—',
    },
  ];

  const partitionRows: BarRow[] = (data.bookingPartitions ?? []).map((p) => ({
    label: p.partitionName,
    value: p.count ?? 0,
    suffix: ' Bookings',
  }));

  return (
    <div className="flex flex-col gap-5">
      <StatCards cards={stats} />
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        <BarList
          title="Bookings by Time of Day"
          rows={partitionRows}
          className="lg:col-span-3"
          max={Math.max(...partitionRows.map((r) => r.value), 1)}
        />
        <BreakdownList
          title="Status Breakdown"
          rows={breakdownRows}
          className="lg:col-span-2"
        />
      </div>
      <AvailableReportsList
        reports={data.availableReport}
        route="bookings"
        title="Available Booking Reports"
      />
    </div>
  );
};
