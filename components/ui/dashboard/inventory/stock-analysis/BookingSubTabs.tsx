'use client';

import React, { useMemo, useState } from 'react';
import moment from 'moment';
import { Button, Skeleton } from '@nextui-org/react';
import { FiDownload } from 'react-icons/fi';
import { formatPrice } from '@/lib/utils';
import { SortableTH, StatCards, useTableSort } from './SharedPanels';
import { TablePagination } from './SalesPanels';
import { ExportType } from './exportHelpers';
import {
  BookingReportItem,
  BookingReportResponse,
  DailyOccupancyUtilizationItem,
  ReservationBookingItem,
  StatCard,
} from './types';

const PAGE_SIZE = 10;

const safeNumber = (value: unknown): number => {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
};

const parseAmount = (formatted: unknown): number => {
  if (formatted === null || formatted === undefined || formatted === '') return 0;
  if (typeof formatted === 'number') return safeNumber(formatted);
  const cleaned = String(formatted).replace(/[^0-9.-]+/g, '');
  return safeNumber(cleaned);
};

const formatNgn = (value: number): string => formatPrice(value, 'NGN');

const fullName = (item: BookingReportItem): string => {
  const name = `${item.firstName ?? ''} ${item.lastName ?? ''}`.trim();
  return name || 'Unknown';
};

const isValidDate = (value: string | null | undefined): boolean => {
  if (!value) return false;
  return moment(value).year() > 1;
};

interface BookingSubTabPanelProps {
  data?: BookingReportResponse;
  isLoading?: boolean;
  onExport?: (exportType: number) => void | Promise<void>;
  isExporting?: boolean;
}

interface ExportButtonsProps {
  onExportExcel?: () => void;
  onExportPdf?: () => void;
  isLoading?: boolean;
}

const ExportButtons: React.FC<ExportButtonsProps> = ({
  onExportExcel,
  onExportPdf,
  isLoading,
}) => (
  <div className="flex items-center gap-2 px-5 py-4">
    <Button
      variant="bordered"
      onPress={onExportExcel}
      isLoading={isLoading}
      startContent={isLoading ? null : <FiDownload size={14} />}
      className="border border-gray-200 text-gray-700 bg-white rounded-lg text-xs h-9"
    >
      Exp Excel
    </Button>
    <Button
      onPress={onExportPdf}
      isLoading={isLoading}
      startContent={isLoading ? null : <FiDownload size={14} />}
      className="bg-primaryColor text-white rounded-lg text-xs h-9"
    >
      Exp PDF
    </Button>
  </div>
);

const buildExportHandlers = (
  onExport?: (exportType: number) => void | Promise<void>
) => ({
  onExportExcel: onExport ? () => onExport(ExportType.Excel) : undefined,
  onExportPdf: onExport ? () => onExport(ExportType.Pdf) : undefined,
});

const SubTabSkeleton: React.FC = () => (
  <div className="flex flex-col gap-5">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {[0, 1, 2, 3].map((i) => (
        <Skeleton key={i} className="h-28 rounded-2xl" />
      ))}
    </div>
    <Skeleton className="h-80 rounded-2xl" />
  </div>
);

const NoBookingsMessage: React.FC<{ label?: string; colSpan?: number }> = ({
  label,
  colSpan = 9,
}) => (
  <tr>
    <td
      colSpan={colSpan}
      className="px-5 py-8 text-center text-sm text-gray-500"
    >
      {label ?? 'No bookings for this period'}
    </td>
  </tr>
);

const statusColor = (status: string): string => {
  const s = (status ?? '').toLowerCase();
  if (s === 'confirmed' || s === 'completed' || s === 'admitted')
    return 'text-emerald-600';
  if (s === 'cancelled' || s === 'failed' || s === 'expired')
    return 'text-red-500';
  if (s === 'pending') return 'text-amber-500';
  return 'text-gray-700';
};

export const BookingSummaryPanel: React.FC<BookingSubTabPanelProps> = ({
  data,
  isLoading,
  onExport,
  isExporting,
}) => {
  const [statusTab, setStatusTab] = useState<string>('all');
  const [page, setPage] = useState(1);
  const exportHandlers = buildExportHandlers(onExport);

  const bookings: BookingReportItem[] = Array.isArray(data?.bookings)
    ? (data?.bookings as BookingReportItem[])
    : [];

  const counts = useMemo(() => {
    let total = 0;
    let confirmed = 0;
    let pending = 0;
    let failed = 0;
    let cancelled = 0;
    let completed = 0;
    let totalSpend = 0;
    let totalGuests = 0;
    bookings.forEach((b) => {
      total += 1;
      const s = (b.bookingStatus ?? '').toLowerCase();
      if (s === 'confirmed') confirmed += 1;
      else if (s === 'pending') pending += 1;
      else if (s === 'failed' || s === 'expired') failed += 1;
      else if (s === 'cancelled') cancelled += 1;
      else if (s === 'completed' || s === 'admitted') completed += 1;
      totalSpend += parseAmount(b.minimumSpend);
      totalGuests += safeNumber(b.numberOfGuest);
    });
    return {
      total,
      confirmed,
      pending,
      failed,
      cancelled,
      completed,
      totalSpend,
      totalGuests,
    };
  }, [bookings]);

  const filtered = useMemo(() => {
    if (statusTab === 'all') return bookings;
    return bookings.filter(
      (b) => (b.bookingStatus ?? '').toLowerCase() === statusTab
    );
  }, [bookings, statusTab]);

  const toTime = (value: string | null | undefined): number => {
    if (!value) return 0;
    const m = moment(value);
    return m.isValid() ? m.valueOf() : 0;
  };

  const getBookingValue = React.useCallback(
    (
      b: BookingReportItem,
      key:
        | 'bookingDateTime'
        | 'firstName'
        | 'emailAddress'
        | 'phoneNumber'
        | 'numberOfGuest'
        | 'bookingFee'
        | 'minimumSpend'
        | 'checkInDateTime'
        | 'bookingStatus'
    ) => {
      switch (key) {
        case 'bookingDateTime':
          return toTime(b.bookingDateTime || b.dateCreated);
        case 'firstName':
          return `${b.firstName ?? ''} ${b.lastName ?? ''}`.trim();
        case 'numberOfGuest':
          return safeNumber(b.numberOfGuest);
        case 'bookingFee':
          return parseAmount(b.bookingFee);
        case 'minimumSpend':
          return parseAmount(b.minimumSpend);
        case 'checkInDateTime':
          return toTime(b.checkInDateTime);
        default:
          return (b[key] ?? '') as string;
      }
    },
    []
  );

  const { sort, sorted, toggleSort } = useTableSort(filtered, getBookingValue, {
    key: 'bookingDateTime',
    direction: 'desc',
  });

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageRows = sorted.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE
  );

  if (isLoading) return <SubTabSkeleton />;

  const stats: StatCard[] = [
    {
      label: 'Total Bookings',
      value: counts.total.toLocaleString(),
      footer: 'In period',
      footerTone: 'muted',
    },
    {
      label: 'Confirmed',
      value: counts.confirmed.toLocaleString(),
      footer: `${counts.completed} completed`,
      footerTone: 'success',
    },
    {
      label: 'Pending',
      value: counts.pending.toLocaleString(),
      footer: 'Awaiting confirmation',
      footerTone: 'warning',
    },
    {
      label: 'Total Revenue',
      value: formatNgn(counts.totalSpend),
      footer: `${counts.totalGuests} guests`,
      footerTone: 'muted',
    },
  ];

  const tabs = [
    { id: 'all', label: 'All', count: counts.total },
    { id: 'confirmed', label: 'Confirmed', count: counts.confirmed },
    { id: 'pending', label: 'Pending', count: counts.pending },
    { id: 'completed', label: 'Completed', count: counts.completed },
    { id: 'cancelled', label: 'Cancelled', count: counts.cancelled },
    { id: 'failed', label: 'Failed', count: counts.failed },
  ];

  return (
    <div className="flex flex-col gap-5">
      <StatCards cards={stats} />
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm">
        <div className="flex items-center justify-between flex-wrap gap-3 pr-5">
          <div className="flex items-center gap-6 px-5 pt-4 border-b border-gray-100 overflow-x-auto scrollbar-hide flex-1">
            {tabs.map((tab) => {
              const isActive = statusTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    setStatusTab(tab.id);
                    setPage(1);
                  }}
                  className={`flex items-center gap-2 pb-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                    isActive
                      ? 'text-primaryColor border-primaryColor'
                      : 'text-gray-500 border-transparent hover:text-gray-700'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`h-5 min-w-5 px-2 inline-flex items-center justify-center rounded-full text-[11px] font-semibold ${
                      isActive
                        ? 'bg-pink200 text-primaryColor'
                        : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>
          <ExportButtons {...exportHandlers} isLoading={isExporting} />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <SortableTH
                  label="Booking Date"
                  sortKey="bookingDateTime"
                  active={sort.key}
                  direction={sort.direction}
                  onSort={toggleSort}
                />
                <SortableTH
                  label="Customer"
                  sortKey="firstName"
                  active={sort.key}
                  direction={sort.direction}
                  onSort={toggleSort}
                />
                <SortableTH
                  label="Email"
                  sortKey="emailAddress"
                  active={sort.key}
                  direction={sort.direction}
                  onSort={toggleSort}
                />
                <SortableTH
                  label="Phone"
                  sortKey="phoneNumber"
                  active={sort.key}
                  direction={sort.direction}
                  onSort={toggleSort}
                />
                <SortableTH
                  label="Guests"
                  sortKey="numberOfGuest"
                  active={sort.key}
                  direction={sort.direction}
                  onSort={toggleSort}
                />
                <SortableTH
                  label="Booking Fee"
                  sortKey="bookingFee"
                  active={sort.key}
                  direction={sort.direction}
                  onSort={toggleSort}
                />
                <SortableTH
                  label="Minimum Spend"
                  sortKey="minimumSpend"
                  active={sort.key}
                  direction={sort.direction}
                  onSort={toggleSort}
                />
                <SortableTH
                  label="Check-In"
                  sortKey="checkInDateTime"
                  active={sort.key}
                  direction={sort.direction}
                  onSort={toggleSort}
                />
                <SortableTH
                  label="Status"
                  sortKey="bookingStatus"
                  active={sort.key}
                  direction={sort.direction}
                  onSort={toggleSort}
                />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {pageRows.length === 0 ? (
                <NoBookingsMessage />
              ) : (
                pageRows.map((b, index) => (
                  <tr
                    key={`${b.emailAddress}-${b.bookingDateTime}-${index}`}
                    className="hover:bg-gray-50"
                    title={b.statusComment || undefined}
                  >
                    <td className="px-5 py-4 text-gray-700">
                      {b.bookingDateTime
                        ? moment(b.bookingDateTime).format('MMM DD, hh:mma')
                        : '—'}
                    </td>
                    <td className="px-5 py-4 text-gray-900 font-medium">
                      {fullName(b)}
                    </td>
                    <td className="px-5 py-4 text-gray-700">
                      {b.emailAddress || '—'}
                    </td>
                    <td className="px-5 py-4 text-gray-700">
                      {b.phoneNumber || '—'}
                    </td>
                    <td className="px-5 py-4 text-gray-700">
                      {safeNumber(b.numberOfGuest).toLocaleString()}
                    </td>
                    <td className="px-5 py-4 text-gray-700">
                      {b.bookingFee || '—'}
                    </td>
                    <td className="px-5 py-4 text-gray-900 font-semibold">
                      {b.minimumSpend || '—'}
                    </td>
                    <td className="px-5 py-4 text-gray-700">
                      {isValidDate(b.checkInDateTime)
                        ? moment(b.checkInDateTime).format('MMM DD, hh:mma')
                        : '—'}
                    </td>
                    <td
                      className={`px-5 py-4 font-medium ${statusColor(
                        b.bookingStatus
                      )}`}
                    >
                      {b.bookingStatus || '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {sorted.length > 0 && (
          <TablePagination
            currentPage={safePage}
            totalPages={totalPages}
            onChange={setPage}
          />
        )}
      </div>
    </div>
  );
};

export const ReservationSummaryPanel: React.FC<BookingSubTabPanelProps> = ({
  data,
  isLoading,
  onExport,
  isExporting,
}) => {
  const exportHandlers = buildExportHandlers(onExport);
  const [page, setPage] = useState(1);
  const reservations: ReservationBookingItem[] = Array.isArray(
    data?.reservationBookings
  )
    ? (data?.reservationBookings as ReservationBookingItem[])
    : [];

  const totals = useMemo(() => {
    let totalBookings = 0;
    let totalFee = 0;
    reservations.forEach((r) => {
      totalBookings += safeNumber(r.totalBookings);
      totalFee += parseAmount(r.totalBookingFee);
    });
    return { totalBookings, totalFee };
  }, [reservations]);

  const getReservationValue = React.useCallback(
    (
      r: ReservationBookingItem,
      key:
        | 'reservationName'
        | 'totalBookings'
        | 'totalBookingFee'
        | 'dateUpdated'
    ) => {
      switch (key) {
        case 'totalBookings':
          return safeNumber(r.totalBookings);
        case 'totalBookingFee':
          return parseAmount(r.totalBookingFee);
        case 'dateUpdated':
          return r.dateUpdated ? moment(r.dateUpdated).valueOf() : 0;
        default:
          return r.reservationName ?? '';
      }
    },
    []
  );

  const { sort, sorted, toggleSort } = useTableSort(
    reservations,
    getReservationValue,
    { key: 'totalBookings', direction: 'desc' }
  );

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageRows = sorted.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE
  );

  if (isLoading) return <SubTabSkeleton />;

  const top = sorted[0] ?? null;

  const stats: StatCard[] = [
    {
      label: 'Reservations',
      value: sorted.length.toLocaleString(),
      footer: 'Active reservations',
      footerTone: 'success',
    },
    {
      label: 'Top Reservation',
      value: top?.reservationName ?? '—',
      footer: top
        ? `${safeNumber(top.totalBookings)} bookings`
        : 'No data',
      footerTone: 'success',
    },
    {
      label: 'Total Bookings',
      value: totals.totalBookings.toLocaleString(),
      footer: 'Across reservations',
      footerTone: 'muted',
    },
    {
      label: 'Total Booking Fees',
      value: formatNgn(totals.totalFee),
      footer: 'In period',
      footerTone: 'muted',
    },
  ];

  return (
    <div className="flex flex-col gap-5">
      <StatCards cards={stats} />
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm">
        <div className="flex items-center justify-between flex-wrap gap-3 pr-5">
          <h3 className="px-5 py-4 text-base font-semibold text-gray-900">
            Reservation Summary
          </h3>
          <ExportButtons {...exportHandlers} isLoading={isExporting} />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <SortableTH
                  label="Reservation Name"
                  sortKey="reservationName"
                  active={sort.key}
                  direction={sort.direction}
                  onSort={toggleSort}
                />
                <SortableTH
                  label="Total Bookings"
                  sortKey="totalBookings"
                  active={sort.key}
                  direction={sort.direction}
                  onSort={toggleSort}
                />
                <SortableTH
                  label="Total Booking Fee"
                  sortKey="totalBookingFee"
                  active={sort.key}
                  direction={sort.direction}
                  onSort={toggleSort}
                />
                <SortableTH
                  label="Last Activity"
                  sortKey="dateUpdated"
                  active={sort.key}
                  direction={sort.direction}
                  onSort={toggleSort}
                />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {pageRows.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-5 py-8 text-center text-sm text-gray-500"
                  >
                    No reservations for this period
                  </td>
                </tr>
              ) : (
                pageRows.map((r, index) => (
                  <tr
                    key={`${r.reservationName}-${index}`}
                    className="hover:bg-gray-50"
                  >
                    <td className="px-5 py-4 text-gray-900 font-medium">
                      {r.reservationName || '—'}
                    </td>
                    <td className="px-5 py-4 text-gray-700">
                      {safeNumber(r.totalBookings).toLocaleString()}
                    </td>
                    <td className="px-5 py-4 text-gray-900 font-semibold">
                      {r.totalBookingFee ?? '—'}
                    </td>
                    <td className="px-5 py-4 text-gray-700">
                      {r.dateUpdated
                        ? moment(r.dateUpdated).format('MMM DD, YYYY')
                        : '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {sorted.length > 0 && (
          <TablePagination
            currentPage={safePage}
            totalPages={totalPages}
            onChange={setPage}
          />
        )}
      </div>
    </div>
  );
};

const parseOccupancyRate = (rate: unknown): number => {
  if (rate === null || rate === undefined || rate === '') return 0;
  if (typeof rate === 'number') return safeNumber(rate);
  const cleaned = String(rate).replace(/[^0-9.-]+/g, '');
  return safeNumber(cleaned);
};

const occupancyRateClass = (rate: unknown): string => {
  const value = parseOccupancyRate(rate);
  if (value >= 70) return 'text-emerald-600 font-semibold';
  if (value >= 30) return 'text-amber-500 font-semibold';
  return 'text-red-500 font-semibold';
};

export const OccupancyUtilizationPanel: React.FC<BookingSubTabPanelProps> = ({
  data,
  isLoading,
  onExport,
  isExporting,
}) => {
  const exportHandlers = buildExportHandlers(onExport);
  const [page, setPage] = useState(1);
  const [rangeFilter, setRangeFilter] = useState<string>('all');
  const occupancies: DailyOccupancyUtilizationItem[] = Array.isArray(
    data?.dailyOccupancyUtilizations
  )
    ? (data?.dailyOccupancyUtilizations as DailyOccupancyUtilizationItem[])
    : [];

  const rangeCounts = useMemo(() => {
    let high = 0;
    let mid = 0;
    let low = 0;
    occupancies.forEach((r) => {
      const rate = parseOccupancyRate(r.occupancyRate);
      if (rate >= 70) high += 1;
      else if (rate >= 30) mid += 1;
      else low += 1;
    });
    return { high, mid, low };
  }, [occupancies]);

  const filteredOccupancies = useMemo(() => {
    if (rangeFilter === 'all') return occupancies;
    return occupancies.filter((r) => {
      const rate = parseOccupancyRate(r.occupancyRate);
      if (rangeFilter === 'high') return rate >= 70;
      if (rangeFilter === 'mid') return rate >= 30 && rate < 70;
      if (rangeFilter === 'low') return rate < 30;
      return true;
    });
  }, [occupancies, rangeFilter]);

  const totals = useMemo(() => {
    return occupancies.reduce(
      (acc, r) => ({
        capacity: acc.capacity + safeNumber(r.reservationCapacity),
        bookings: acc.bookings + safeNumber(r.totalBookings),
        unused: acc.unused + safeNumber(r.unusedCapacity),
      }),
      { capacity: 0, bookings: 0, unused: 0 }
    );
  }, [occupancies]);

  const getOccupancyValue = React.useCallback(
    (
      r: DailyOccupancyUtilizationItem,
      key:
        | 'reservationName'
        | 'reservationCapacity'
        | 'totalBookings'
        | 'unusedCapacity'
        | 'occupancyRate'
        | 'averageDailyUtilization'
        | 'lastRecordDateTime'
    ) => {
      switch (key) {
        case 'reservationCapacity':
          return safeNumber(r.reservationCapacity);
        case 'totalBookings':
          return safeNumber(r.totalBookings);
        case 'unusedCapacity':
          return safeNumber(r.unusedCapacity);
        case 'occupancyRate':
          return parseOccupancyRate(r.occupancyRate);
        case 'averageDailyUtilization':
          return safeNumber(r.averageDailyUtilization);
        case 'lastRecordDateTime':
          return r.lastRecordDateTime
            ? moment(r.lastRecordDateTime).valueOf()
            : 0;
        default:
          return r.reservationName ?? '';
      }
    },
    []
  );

  const { sort, sorted, toggleSort } = useTableSort(
    filteredOccupancies,
    getOccupancyValue,
    { key: 'occupancyRate', direction: 'desc' }
  );

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageRows = sorted.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE
  );

  if (isLoading) return <SubTabSkeleton />;

  const overallUtilization =
    totals.capacity > 0
      ? Math.round((totals.bookings / totals.capacity) * 10000) / 100
      : 0;

  const top = sorted[0] ?? null;

  const stats: StatCard[] = [
    {
      label: 'Reservations Tracked',
      value: sorted.length.toLocaleString(),
      footer: 'Daily occupancy',
      footerTone: 'muted',
    },
    {
      label: 'Total Capacity',
      value: totals.capacity.toLocaleString(),
      footer: `${totals.bookings.toLocaleString()} booked`,
      footerTone: 'muted',
    },
    {
      label: 'Unused Capacity',
      value: totals.unused.toLocaleString(),
      footer: 'Available slots',
      footerTone: totals.unused > 0 ? 'warning' : 'success',
    },
    {
      label: 'Top Reservation',
      value: top?.reservationName ?? '—',
      footer: top?.occupancyRate ? String(top.occupancyRate) : 'No data',
      footerTone: 'success',
    },
  ];

  return (
    <div className="flex flex-col gap-5">
      <StatCards cards={stats} />
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm">
        <div className="flex items-center justify-between flex-wrap gap-3 px-5 py-4">
          <div className="flex items-center gap-3 flex-wrap">
            <h3 className="text-base font-semibold text-gray-900">
              Daily Occupancy & Utilization
            </h3>
            <select
              value={rangeFilter}
              onChange={(e) => {
                setRangeFilter(e.target.value);
                setPage(1);
              }}
              className="text-xs h-9 px-3 rounded-lg border border-gray-200 text-gray-700 bg-white focus:outline-none focus:border-primaryColor"
            >
              <option value="all">All occupancy</option>
              <option value="high">High (≥70%) ({rangeCounts.high})</option>
              <option value="mid">
                Medium (30 – 69%) ({rangeCounts.mid})
              </option>
              <option value="low">Low (&lt;30%) ({rangeCounts.low})</option>
            </select>
          </div>
          <ExportButtons {...exportHandlers} isLoading={isExporting} />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <SortableTH
                  label="Reservation"
                  sortKey="reservationName"
                  active={sort.key}
                  direction={sort.direction}
                  onSort={toggleSort}
                />
                <SortableTH
                  label="Capacity"
                  sortKey="reservationCapacity"
                  active={sort.key}
                  direction={sort.direction}
                  onSort={toggleSort}
                />
                <SortableTH
                  label="Total Bookings"
                  sortKey="totalBookings"
                  active={sort.key}
                  direction={sort.direction}
                  onSort={toggleSort}
                />
                <SortableTH
                  label="Unused Capacity"
                  sortKey="unusedCapacity"
                  active={sort.key}
                  direction={sort.direction}
                  onSort={toggleSort}
                />
                <SortableTH
                  label="Occupancy Rate"
                  sortKey="occupancyRate"
                  active={sort.key}
                  direction={sort.direction}
                  onSort={toggleSort}
                />
                <SortableTH
                  label="Avg. Daily Utilization"
                  sortKey="averageDailyUtilization"
                  active={sort.key}
                  direction={sort.direction}
                  onSort={toggleSort}
                />
                <SortableTH
                  label="Last Activity"
                  sortKey="lastRecordDateTime"
                  active={sort.key}
                  direction={sort.direction}
                  onSort={toggleSort}
                />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {pageRows.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-5 py-8 text-center text-sm text-gray-500"
                  >
                    No occupancy data for this period
                  </td>
                </tr>
              ) : (
                pageRows.map((row, index) => (
                  <tr
                    key={`${row.reservationName}-${index}`}
                    className="hover:bg-gray-50"
                  >
                    <td className="px-5 py-4 text-gray-900 font-medium">
                      {row.reservationName || '—'}
                    </td>
                    <td className="px-5 py-4 text-gray-700">
                      {safeNumber(row.reservationCapacity).toLocaleString()}
                    </td>
                    <td className="px-5 py-4 text-gray-700">
                      {safeNumber(row.totalBookings).toLocaleString()}
                    </td>
                    <td className="px-5 py-4 text-gray-700">
                      {safeNumber(row.unusedCapacity).toLocaleString()}
                    </td>
                    <td
                      className={`px-5 py-4 ${occupancyRateClass(
                        row.occupancyRate
                      )}`}
                    >
                      {row.occupancyRate ?? '—'}
                    </td>
                    <td className="px-5 py-4 text-gray-700">
                      {safeNumber(row.averageDailyUtilization).toLocaleString(
                        undefined,
                        { maximumFractionDigits: 2 }
                      )}
                    </td>
                    <td className="px-5 py-4 text-gray-700">
                      {row.lastRecordDateTime
                        ? moment(row.lastRecordDateTime).format('MMM DD, YYYY')
                        : '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {sorted.length > 0 && (
          <TablePagination
            currentPage={safePage}
            totalPages={totalPages}
            onChange={setPage}
          />
        )}
      </div>
    </div>
  );
};
