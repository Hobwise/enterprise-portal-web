'use client';

import React from 'react';
import { BarList, BreakdownList, StatCards } from './SharedPanels';
import { BarRow, StatCard } from './types';
import { X } from 'lucide-react';

const DEFAULT_STATS: StatCard[] = [
  {
    label: 'Total Orders',
    value: '415',
    delta: '+3% from yesterday',
    direction: 'up',
  },
  {
    label: 'Gross Revenue',
    value: '₦8,896,000',
    delta: '+3% from yesterday value',
    direction: 'up',
  },
  {
    label: 'Average Order Amount',
    value: '₦28,000',
    delta: '-3% from yesterday value',
    direction: 'down',
  },
  {
    label: 'Unique Customers',
    value: '₦186',
    delta: '+2% from yesterday',
    direction: 'up',
  },
];

const DEFAULT_BARS: BarRow[] = [
  { label: 'Mon 09', value: 850, suffix: ' Orders' },
  { label: 'Tue 10', value: 824, suffix: ' Orders' },
  { label: 'Wed 11', value: 844, suffix: ' Orders' },
  { label: 'Thur 12', value: 760, suffix: ' Orders' },
  { label: 'Fri 13', value: 844, suffix: ' Orders' },
  { label: 'Sat 14', value: 1026, suffix: ' Orders' },
  { label: 'Sun 15', value: 1136, suffix: ' Orders' },
];

const DEFAULT_BREAKDOWN = [
  { label: 'Open', value: 841 },
  { label: 'Closed', value: 811 },
  { label: 'Awaiting confirmation', value: 20 },
  { label: 'Cancellation', value: 6 },
  { label: 'Pick Day', value: 'Sun 15, (1136)' },
  { label: 'Refunds', value: 4 },
];

interface FilterChipProps {
  label: string;
  onRemove: () => void;
}

const FilterChip: React.FC<FilterChipProps> = ({ label, onRemove }) => {
  return (
    <span className="inline-flex items-center gap-1 bg-pink200 text-primaryColor px-3 py-1 rounded-md text-xs font-medium">
      {label}
      <button
        type="button"
        onClick={onRemove}
        className="hover:text-primaryColor/80"
        aria-label={`Remove ${label}`}
      >
        <X size={14} />
      </button>
    </span>
  );
};

interface GenericOverviewPanelProps {
  showFilters?: boolean;
}

export const GenericOverviewPanel: React.FC<GenericOverviewPanelProps> = ({
  showFilters = true,
}) => {
  const [filters, setFilters] = React.useState<string[]>(['Active', 'Active']);

  return (
    <div className="flex flex-col gap-5">
      {showFilters && filters.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-semibold text-gray-700">
            Filtered By:
          </span>
          {filters.map((f, i) => (
            <FilterChip
              key={`${f}-${i}`}
              label={f}
              onRemove={() =>
                setFilters((prev) => prev.filter((_, idx) => idx !== i))
              }
            />
          ))}
        </div>
      )}
      <StatCards cards={DEFAULT_STATS} />
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        <BarList
          title="Daily Orders"
          rows={DEFAULT_BARS}
          className="lg:col-span-3"
        />
        <BreakdownList
          title="Order Status Breakdown"
          rows={DEFAULT_BREAKDOWN}
          className="lg:col-span-2"
        />
      </div>
    </div>
  );
};
