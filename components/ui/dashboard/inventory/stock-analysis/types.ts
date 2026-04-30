export type ModuleId =
  | 'sales'
  | 'payments'
  | 'bookings'
  | 'inventory'
  | 'qr'
  | 'campaigns'
  | 'users';

export type PeriodId = 'today' | 'week' | 'year' | 'all';

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

export const FilterType = {
  Daily: 0,
  Weekly: 1,
  Yearly: 2,
  Custom: 3,
  All: 4,
} as const;

export type FilterTypeValue = (typeof FilterType)[keyof typeof FilterType];

export const periodToFilterType = (period: PeriodId): FilterTypeValue => {
  switch (period) {
    case 'today':
      return FilterType.Daily;
    case 'week':
      return FilterType.Weekly;
    case 'year':
      return FilterType.Yearly;
    case 'all':
      return FilterType.All;
    default:
      return FilterType.Daily;
  }
};

export interface AvailableReport {
  reportType: number;
  reportName: string;
}

export interface PartitionPoint {
  partitionName: string;
  count: number;
}

export interface DayPoint<T> {
  dateTime: string | null;
  count?: T | null;
  amount?: T | null;
}

export interface PaymentDetailsSection {
  totalAmount: number;
  confirmedAmount: number;
  pendingAmount: number;
  percentageChange: string;
  dayWithHighestPayment: { dateTime: string | null; amount: number | null };
  availableReport: AvailableReport[];
  paymentPartitions: PartitionPoint[];
}

export interface BookingDetailsSection {
  pendingBookingCount: number;
  completedBookingCount: number;
  admittedBookingCount: number;
  cancelledBookingCount: number;
  confirmedBookingCount: number;
  allBookingCount: number;
  failedBookingCount: number;
  expiredBookingCount: number;
  percentageChange: string;
  dayWithHighestBooking: { dateTime: string | null; count: number | null };
  availableReport: AvailableReport[];
  bookingPartitions: PartitionPoint[];
}

export interface OrderDetailsSection {
  allOrdersCount: number;
  openOrdersCount: number;
  closedOrdersCount: number;
  cancelledOrdersCount: number;
  awaitingConfirmationOrdersCount: number;
  percentageChange: string;
  dayWithHighestOrder: { dateTime: string | null; count: number | null };
  availableReport: AvailableReport[];
  orderPartitions: PartitionPoint[];
}

export interface MostActiveUser {
  name: string;
  emailAddress: string;
  activityCount: number;
}

export interface AuditDetailsSection {
  totalUsersCount: number;
  totalActivitiesCount: number;
  mostActiveUser: MostActiveUser | null;
  availableReport: AvailableReport[];
}

export interface MoverItem {
  name?: string;
  itemName?: string;
  qty?: number;
  quantity?: number;
  movement?: number;
  value?: number;
}

export interface DailyValuePoint {
  date?: string;
  partitionName?: string;
  value?: number;
  count?: number;
}

export interface InventoryDetailsSection {
  totalStockValue: number;
  stockValuePercentageChange: string;
  itemsBelowReorder: number;
  itemsOutOfStock: number;
  stockTurnoverRate: number;
  daysOfInventoryOnHand: number;
  wastageCost: number;
  wastagePercentageChange: string;
  totalCogs: number;
  dailyStockValue: DailyValuePoint[];
  dailyConsumption: DailyValuePoint[];
  topMovers: MoverItem[];
  slowMovers: MoverItem[];
  availableReport: AvailableReport[];
}

export interface ReportSummary {
  filterType?: number;
  paymentDetails: PaymentDetailsSection;
  bookingDetails: BookingDetailsSection;
  orderDetails: OrderDetailsSection;
  auditDetails: AuditDetailsSection;
  inventoryDetails: InventoryDetailsSection;
}
