'use client';

import React from 'react';
import moment from 'moment';
import { Button, Chip, Skeleton } from '@nextui-org/react';
import { IoIosArrowBack, IoIosArrowForward } from 'react-icons/io';
import {
  AvailableReportsList,
  BarList,
  BreakdownList,
  StatCards,
} from './SharedPanels';
import { BarRow, BreakdownRow, OrderDetailsSection, StatCard } from './types';

interface SalesOverviewPanelProps {
  data?: OrderDetailsSection;
  isLoading?: boolean;
}

export const SalesOverviewPanel: React.FC<SalesOverviewPanelProps> = ({
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
      label: 'All Orders',
      value: String(data.allOrdersCount ?? 0),
      delta: `${data.percentageChange}% change`,
      direction,
    },
    {
      label: 'Open Orders',
      value: String(data.openOrdersCount ?? 0),
      footer: 'Currently active',
      footerTone: 'muted',
    },
    {
      label: 'Closed Orders',
      value: String(data.closedOrdersCount ?? 0),
      footer: 'Successfully fulfilled',
      footerTone: 'success',
    },
    {
      label: 'Cancelled Orders',
      value: String(data.cancelledOrdersCount ?? 0),
      footer:
        data.cancelledOrdersCount > 0
          ? 'Review cancellation reasons'
          : 'No cancellations',
      footerTone: data.cancelledOrdersCount > 0 ? 'danger' : 'muted',
    },
  ];

  const partitionRows: BarRow[] = (data.orderPartitions ?? []).map((p) => ({
    label: p.partitionName,
    value: p.count ?? 0,
    suffix: ' Orders',
  }));

  const breakdownRows: BreakdownRow[] = [
    { label: 'Open', value: data.openOrdersCount ?? 0 },
    { label: 'Closed', value: data.closedOrdersCount ?? 0 },
    {
      label: 'Awaiting confirmation',
      value: data.awaitingConfirmationOrdersCount ?? 0,
    },
    { label: 'Cancelled', value: data.cancelledOrdersCount ?? 0 },
    {
      label: 'Peak Day',
      value: data.dayWithHighestOrder?.dateTime
        ? `${moment(data.dayWithHighestOrder.dateTime).format('ll')} (${
            data.dayWithHighestOrder.count ?? 0
          })`
        : '—',
    },
  ];

  return (
    <div className="flex flex-col gap-5">
      <StatCards cards={stats} />
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        <BarList
          title="Orders by Time of Day"
          rows={partitionRows}
          className="lg:col-span-3"
          max={Math.max(...partitionRows.map((r) => r.value), 1)}
        />
        <BreakdownList
          title="Order Status Breakdown"
          rows={breakdownRows}
          className="lg:col-span-2"
        />
      </div>
      <AvailableReportsList
        reports={data.availableReport}
        route="orders"
        title="Available Order Reports"
      />
    </div>
  );
};

interface PillTabsProps {
  tabs: { id: string; label: string; count: number }[];
  active: string;
  onChange: (id: string) => void;
}

export const PillTabs: React.FC<PillTabsProps> = ({
  tabs,
  active,
  onChange,
}) => {
  return (
    <div className="px-4 md:px-6 pt-4 border-b border-gray-100">
      <div className="flex gap-6 overflow-x-auto scrollbar-hide">
        {tabs.map((tab) => {
          const isActive = active === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onChange(tab.id)}
              className={`flex items-center gap-2 pb-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                isActive
                  ? 'text-primaryColor border-primaryColor'
                  : 'text-gray-500 border-transparent hover:text-gray-700'
              }`}
            >
              <span>{tab.label}</span>
              <Chip
                size="sm"
                classNames={{
                  base: `h-5 min-w-5 px-2 ${
                    isActive
                      ? 'bg-pink200 text-primaryColor'
                      : 'bg-gray-100 text-gray-500'
                  }`,
                  content: 'text-[11px] font-semibold px-0',
                }}
              >
                {tab.count}
              </Chip>
            </button>
          );
        })}
      </div>
    </div>
  );
};

interface TablePaginationProps {
  currentPage: number;
  totalPages: number;
  onChange: (page: number) => void;
}

export const TablePagination: React.FC<TablePaginationProps> = ({
  currentPage,
  totalPages,
  onChange,
}) => {
  const pageNumbers: (number | string)[] = (() => {
    if (totalPages <= 6) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    if (currentPage <= 3) {
      return [1, 2, 3, '...', totalPages - 2, totalPages - 1, totalPages];
    }
    if (currentPage >= totalPages - 2) {
      return [1, 2, 3, '...', totalPages - 2, totalPages - 1, totalPages];
    }
    return [
      1,
      '...',
      currentPage - 1,
      currentPage,
      currentPage + 1,
      '...',
      totalPages,
    ];
  })();

  return (
    <div className="flex items-center justify-between flex-wrap gap-4 px-4 md:px-6 py-4 border-t border-gray-100">
      <span className="text-sm text-gray-600">
        Page {currentPage} of {totalPages}
      </span>
      <div className="flex items-center gap-1">
        {pageNumbers.map((page, index) => {
          if (page === '...') {
            return (
              <span
                key={`ellipsis-${index}`}
                className="px-2 text-gray-400 text-sm"
              >
                ...
              </span>
            );
          }
          const num = page as number;
          const isActive = num === currentPage;
          return (
            <button
              key={num}
              type="button"
              onClick={() => onChange(num)}
              className={`min-w-[32px] h-8 px-2 rounded-md text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-pink200 text-primaryColor'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              {num}
            </button>
          );
        })}
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="bordered"
          size="sm"
          isDisabled={currentPage <= 1}
          onPress={() => onChange(Math.max(1, currentPage - 1))}
          startContent={<IoIosArrowBack />}
          className="border border-gray-200 text-gray-700 rounded-lg"
        >
          Previous
        </Button>
        <Button
          variant="bordered"
          size="sm"
          isDisabled={currentPage >= totalPages}
          onPress={() => onChange(Math.min(totalPages, currentPage + 1))}
          endContent={<IoIosArrowForward />}
          className="border border-gray-200 text-gray-700 rounded-lg"
        >
          Next
        </Button>
      </div>
    </div>
  );
};
