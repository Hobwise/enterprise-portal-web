'use client';

import React from 'react';
import moment from 'moment';
import { Skeleton } from '@nextui-org/react';
import { formatPrice } from '@/lib/utils';
import {
  AvailableReportsList,
  BarList,
  BreakdownList,
  StatCards,
} from './SharedPanels';
import {
  AvailableReport,
  BarRow,
  BookingDetailsSection,
  BreakdownRow,
  PartitionPoint,
  StatCard,
} from './types';

interface BookingOverviewPanelProps {
  data?: BookingDetailsSection | null;
  isLoading?: boolean;
}

const safeNumber = (value: unknown): number => {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
};

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

  const percentageChange = data.percentageChange ?? '0';
  const direction: StatCard['direction'] =
    safeNumber(percentageChange) > 0
      ? 'up'
      : safeNumber(percentageChange) < 0
      ? 'down'
      : 'neutral';

  const allBookings = safeNumber(data.allBookingCount);
  const cancelledCount = safeNumber(data.cancelledBookingCount);
  const averageBookingFee = safeNumber(data.averageBookingFee);
  const uniqueGuests = safeNumber(data.uniqueGuests);

  const formatChange = (value: string | undefined, suffix: string = '') => {
    const n = safeNumber(value);
    const sign = n > 0 ? '+' : '';
    return `${sign}${n}% from yesterday${suffix}`;
  };

  const stats: StatCard[] = [
    {
      label: 'Total Bookings',
      value: allBookings.toLocaleString(),
      delta: formatChange(percentageChange),
      direction,
    },
    {
      label: 'Confirmed',
      value: safeNumber(data.confirmedBookingCount).toLocaleString(),
      footer: 'Awaiting check-in',
      footerTone: 'muted',
    },
    {
      label: 'Average Booking Fee',
      value: formatPrice(averageBookingFee, 'NGN'),
      footer: 'Per booking',
      footerTone: 'muted',
    },
    {
      label: 'Unique Guests',
      value: uniqueGuests.toLocaleString(),
      footer: 'In period',
      footerTone: 'muted',
    },
  ];

  const peakDay = data.dayWithHighestBooking ?? null;
  const peakDayDateTime = peakDay?.dateTime ?? null;
  const peakDayCount = safeNumber(peakDay?.count);

  const breakdownRows: BreakdownRow[] = [
    { label: 'Pending', value: safeNumber(data.pendingBookingCount) },
    { label: 'Completed', value: safeNumber(data.completedBookingCount) },
    { label: 'Admitted', value: safeNumber(data.admittedBookingCount) },
    { label: 'Cancelled', value: cancelledCount },
    { label: 'Failed', value: safeNumber(data.failedBookingCount) },
    {
      label: 'Pick Day',
      value: peakDayDateTime
        ? `${moment(peakDayDateTime).format('ddd DD')}, (${peakDayCount})`
        : '—',
    },
  ];

  const partitions: PartitionPoint[] = Array.isArray(data.bookingPartitions)
    ? data.bookingPartitions
    : [];
  const partitionRows: BarRow[] = partitions.map((p) => ({
    label: p?.partitionName ?? 'Unknown',
    value: safeNumber(p?.count),
    suffix: ' Bookings',
  }));

  const reports: AvailableReport[] = Array.isArray(data.availableReport)
    ? data.availableReport
    : [];

  return (
    <div className="flex flex-col gap-5">
      <StatCards cards={stats} />
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        <BarList
          title="Daily Bookings"
          rows={partitionRows}
          className="lg:col-span-3"
          max={Math.max(...partitionRows.map((r) => r.value), 1)}
          valueFormatter={(r) => `${r.value.toLocaleString()} Bookings`}
        />
        <BreakdownList
          title="Booking Status Breakdown"
          rows={breakdownRows}
          className="lg:col-span-2"
        />
      </div>
      <AvailableReportsList
        reports={reports}
        route="bookings"
        title="Available Booking Reports"
      />
    </div>
  );
};
