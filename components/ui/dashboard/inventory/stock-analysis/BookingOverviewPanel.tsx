'use client';

import React from 'react';
import moment from 'moment';
import { Skeleton } from '@nextui-org/react';
import { formatPrice } from '@/lib/utils';
import { BarList, BreakdownList, StatCards } from './SharedPanels';
import {
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
  if (isLoading) {
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

  if (!data) {
    return (
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm py-16 flex items-center justify-center">
        <div className="flex flex-col items-center gap-2 text-center px-6">
          <h3 className="text-base font-semibold text-gray-700">
            No booking data
          </h3>
          <p className="text-sm text-gray-500">
            Try a different period or come back later.
          </p>
        </div>
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

  const breakdownRows: BreakdownRow[] = [
    { label: 'Pending', value: safeNumber(data.pendingBookingCount) },
    { label: 'Completed', value: safeNumber(data.completedBookingCount) },
    { label: 'Admitted', value: safeNumber(data.admittedBookingCount) },
    { label: 'Cancelled', value: cancelledCount },
    { label: 'Failed', value: safeNumber(data.failedBookingCount) },
    {
      label: 'Peak Day',
      value:
        peakDayDateTime && moment(peakDayDateTime).isValid()
          ? moment(peakDayDateTime).format('ddd, MMM DD, YYYY')
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

  return (
    <div className="flex flex-col gap-5">
      <StatCards cards={stats} />
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        <BarList
          title="Daily Bookings"
          rows={partitionRows}
          className="lg:col-span-3"
          max={partitionRows.reduce((acc, r) => Math.max(acc, r.value), 1)}
          valueFormatter={(r) => `${r.value.toLocaleString()} Bookings`}
        />
        <BreakdownList
          title="Booking Status Breakdown"
          rows={breakdownRows}
          className="lg:col-span-2"
        />
      </div>
    </div>
  );
};
