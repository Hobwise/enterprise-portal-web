import React from 'react';
import { formatDate } from '@/lib/utils';

interface DateRangeDisplayProps {
  startDate?: string;
  endDate?: string;
  filterType: number;
}

const DateRangeDisplay: React.FC<DateRangeDisplayProps> = ({
  startDate,
  endDate,
  filterType
}) => {
  // Only show for custom date range (filterType === 3) when both dates exist
  if (filterType !== 3 || !startDate || !endDate) {
    return null;
  }

  const formattedStartDate = formatDate(startDate);
  const formattedEndDate = formatDate(endDate);

  return (
    <div className="mb-4">
      <div className="text-sm text-grey600">
        <span className="font-medium">Custom date range:</span>{' '}
        <span className="text-black">{formattedStartDate} - {formattedEndDate}</span>
      </div>
    </div>
  );
};

export default DateRangeDisplay;