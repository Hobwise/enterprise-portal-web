'use client';

import React from 'react';
import moment from 'moment';
import { Skeleton } from '@nextui-org/react';
import { formatPrice } from '@/lib/utils';
import {
  AvailableReportsList,
  BarList,
  StatCards,
} from './SharedPanels';
import { BarRow, PaymentDetailsSection, StatCard } from './types';

interface PaymentOverviewPanelProps {
  data?: PaymentDetailsSection;
  isLoading?: boolean;
}

export const PaymentOverviewPanel: React.FC<PaymentOverviewPanelProps> = ({
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

  const peakDate = data.dayWithHighestPayment?.dateTime
    ? moment(data.dayWithHighestPayment.dateTime).format('ll')
    : '—';

  const stats: StatCard[] = [
    {
      label: 'Total Payments',
      value: formatPrice(data.totalAmount ?? 0, 'NGN'),
      delta: `${data.percentageChange}% change`,
      direction,
    },
    {
      label: 'Confirmed',
      value: formatPrice(data.confirmedAmount ?? 0, 'NGN'),
      footer: 'Settled payments',
      footerTone: 'success',
    },
    {
      label: 'Pending',
      value: formatPrice(data.pendingAmount ?? 0, 'NGN'),
      footer: 'Awaiting confirmation',
      footerTone: 'warning',
    },
    {
      label: 'Peak Day',
      value:
        data.dayWithHighestPayment?.amount != null
          ? formatPrice(data.dayWithHighestPayment.amount, 'NGN')
          : '—',
      footer: peakDate,
      footerTone: 'muted',
    },
  ];

  const partitionRows: BarRow[] = (data.paymentPartitions ?? []).map((p) => ({
    label: p.partitionName,
    value: p.count ?? 0,
    suffix: ' Payments',
  }));

  return (
    <div className="flex flex-col gap-5">
      <StatCards cards={stats} />
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        <BarList
          title="Payments by Time of Day"
          rows={partitionRows}
          className="lg:col-span-3"
          max={Math.max(...partitionRows.map((r) => r.value), 1)}
        />
        <AvailableReportsList
          reports={data.availableReport}
          route="payments"
          className="lg:col-span-2"
          title="Available Payment Reports"
        />
      </div>
    </div>
  );
};
