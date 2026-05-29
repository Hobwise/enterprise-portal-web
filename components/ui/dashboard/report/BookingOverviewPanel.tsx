'use client';

import React from 'react';
import { Skeleton } from '@nextui-org/react';
import { formatPrice } from '@/lib/utils';
import {
  BarList,
  DistributionDonut,
  DistributionSegment,
  StatCards,
} from './SharedPanels';
import {
  BarRow,
  BookingDetailsSection,
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
  const changeNumber = safeNumber(percentageChange);
  const direction: StatCard['direction'] =
    changeNumber > 0 ? 'up' : changeNumber < 0 ? 'down' : 'neutral';

  const allBookings = safeNumber(data.allBookingCount);
  const confirmedCount = safeNumber(data.confirmedBookingCount);
  const cancelledCount = safeNumber(data.cancelledBookingCount);
  const averageBookingFee = safeNumber(data.averageBookingFee);
  const totalBookingFees = averageBookingFee * allBookings;

  const formatChange = (
    value: string | undefined,
    suffix: string = ' Increase'
  ) => {
    const n = safeNumber(value);
    const sign = n > 0 ? '+' : '';
    const tone = n > 0 ? suffix : n < 0 ? ' Decrease' : ' Change';
    return `${sign}${n}%${tone}`;
  };

  const cancelledChange = -Math.abs(changeNumber);
  const cancelledDelta = `${cancelledChange}% Decrease`;
  const cancelledDirection: StatCard['direction'] =
    cancelledChange < 0 ? 'down' : 'neutral';

  const stats: StatCard[] = [
    {
      label: 'Total Bookings',
      value: allBookings.toLocaleString(),
      delta: formatChange(percentageChange),
      direction,
    },
    {
      label: 'Confirmed Bookings',
      value: confirmedCount.toLocaleString(),
      delta: formatChange(percentageChange),
      direction,
    },
    {
      label: 'Cancelled Bookings',
      value: cancelledCount.toLocaleString(),
      delta: cancelledDelta,
      direction: cancelledDirection,
    },
    {
      label: 'Total Booking fees',
      value: formatPrice(totalBookingFees, 'NGN'),
      delta: formatChange(percentageChange),
      direction,
    },
  ];

  const bookingSegments: DistributionSegment[] = [
    { label: 'Confirmed', value: confirmedCount, color: '#10B981' },
    {
      label: 'Pending',
      value: safeNumber(data.pendingBookingCount),
      color: '#F59E0B',
    },
    {
      label: 'Completed',
      value: safeNumber(data.completedBookingCount),
      color: '#7C5BE6',
    },
    {
      label: 'Admitted',
      value: safeNumber(data.admittedBookingCount),
      color: '#3B82F6',
    },
    { label: 'Cancellation', value: cancelledCount, color: '#EF4444' },
    {
      label: 'Expired/Failed',
      value:
        safeNumber(data.expiredBookingCount) +
        safeNumber(data.failedBookingCount),
      color: '#9CA3AF',
    },
  ];
  const bookingTotal = bookingSegments.reduce((sum, seg) => sum + seg.value, 0);

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
          title="Daily Orders"
          rows={partitionRows}
          className="lg:col-span-3"
          max={partitionRows.reduce((acc, r) => Math.max(acc, r.value), 1)}
          valueFormatter={(r) => `${r.value.toLocaleString()} Bookings`}
        />
        <DistributionDonut
          title="Booking Status Breakdown"
          segments={bookingSegments}
          centerLabel="Total"
          centerValue={bookingTotal.toLocaleString()}
          className="lg:col-span-2"
        />
      </div>
    </div>
  );
};
