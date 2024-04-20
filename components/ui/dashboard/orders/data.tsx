import React from 'react';
const columns = [
  { name: 'ID', uid: 'menuID' },
  { name: 'Name', uid: 'name' },
  { name: 'amount', uid: 'amount' },
  { name: 'Order ID', uid: 'orderID' },
  { name: 'Phone number', uid: 'placedByPhoneNumber' },
  { name: 'Payment', uid: 'payment' },
  { name: 'Status', uid: 'status' },
  { name: '', uid: 'actions' },
];
export const statusColorMap: Record<number, 'warning' | 'success' | 'danger'> =
  {
    0: 'warning',
    1: 'success',
    2: 'danger',
  };

export const statusDataMap: Record<number, 'open' | 'closed' | 'cancelled'> = {
  0: 'open',
  1: 'closed',
  2: 'cancelled',
};

const getTableClasses = () => {
  return React.useMemo(
    () => ({
      wrapper: ['max-h-[382px]', 'max-w-3xl'],
      //   thead: 'bg-[#E4E7EC] !rounded-[0px]',
      th: [
        'bg-transparent',
        'text-default-500',
        'border-b',
        'border-[#E4E7EC]',
      ],
      tr: ' border-b border-[#E4E7EC]',
      td: [
        // changing the rows border radius
        // first
        'py-3',
        'group-data-[first=true]:first:before:rounded-none',
        'group-data-[first=true]:last:before:rounded-none',
        // middle
        'group-data-[middle=true]:before:rounded-none',
        // last
        'group-data-[last=true]:first:before:rounded-none',
        'group-data-[last=true]:last:before:rounded-none',
      ],
    }),
    []
  );
};

export { columns, getTableClasses };
