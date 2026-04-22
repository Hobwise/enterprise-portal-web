export type ModuleId =
  | 'sales'
  | 'payments'
  | 'bookings'
  | 'inventory'
  | 'qr'
  | 'campaigns'
  | 'users';

export type PeriodId =
  | 'today'
  | 'yesterday'
  | 'week'
  | 'month'
  | 'quarter'
  | 'year';

export interface StatCard {
  label: string;
  value: string;
  delta?: string;
  direction?: 'up' | 'down' | 'neutral';
  footer?: string;
  footerTone?: 'success' | 'danger' | 'muted' | 'warning';
}

export interface BarRow {
  label: string;
  value: number;
  suffix?: string;
  color?: string;
}

export interface BreakdownRow {
  label: string;
  value: string | number;
  valueClass?: string;
}
