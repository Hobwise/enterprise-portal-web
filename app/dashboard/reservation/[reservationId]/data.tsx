export const columns = [
  { name: 'Name', uid: 'firstName' },
  { name: 'Booking ID', uid: 'id' },
  { name: 'Time', uid: 'bookingDateTime' },
  { name: 'Status', uid: 'bookingStatus' },
  { name: '', uid: 'actions' },
];

export const statusColorMap: Record<
  number,
  'warning' | 'success' | 'danger' | 'secondary' | 'default'
> = {
  0: 'warning',
  1: 'success',
  2: 'default',
  3: 'danger',
  4: 'success',
  5: 'danger',
  6: 'secondary',
};
export const statusDataMap: Record<
  number,
  | 'pending'
  | 'confirmed'
  | 'admitted'
  | 'cancelled'
  | 'completed'
  | 'failed'
  | 'expired'
> = {
  0: 'pending',
  1: 'confirmed',
  2: 'admitted',
  3: 'cancelled',
  4: 'completed',
  5: 'failed',
  6: 'expired',
};
