export type ModuleId =
  | 'sales'
  | 'payments'
  | 'bookings'
  | 'inventory'
  | 'qr'
  | 'users';

export type PeriodId = 'today' | 'week' | 'year';

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
    default:
      return FilterType.Daily;
  }
};

export const filterTypeToComparisonLabel = (filterType: number): string => {
  switch (filterType) {
    case FilterType.Daily:
      return 'from yesterday';
    case FilterType.Weekly:
      return 'from last week';
    case FilterType.Yearly:
      return 'from last year';
    case FilterType.Custom:
    default:
      return 'from previous period';
  }
};

const startOfDay = (d: Date): Date =>
  new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);

const endOfDay = (d: Date): Date =>
  new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);

export const periodToDateRange = (
  period: PeriodId
): { startDate: string; endDate: string } => {
  const now = new Date();
  let start: Date;
  const end: Date = endOfDay(now);

  switch (period) {
    case 'today':
      start = startOfDay(now);
      break;
    case 'week': {
      const day = now.getDay();
      const diffToMonday = (day + 6) % 7;
      start = startOfDay(
        new Date(now.getFullYear(), now.getMonth(), now.getDate() - diffToMonday)
      );
      break;
    }
    case 'year':
      start = startOfDay(new Date(now.getFullYear(), 0, 1));
      break;
    default:
      start = startOfDay(now);
  }
  return { startDate: start.toISOString(), endDate: end.toISOString() };
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

export interface PaymentMethodBreakdownItem {
  method: string;
  count: number;
  amount: number;
  sharePct: number;
}

export interface PaymentDetailsSection {
  totalAmount: number;
  confirmedAmount: number;
  pendingAmount: number;
  percentageChange: string;
  averageTransactionAmount?: number;
  collectionRate?: number;
  refundRate?: number;
  topPaymentMethod?: string | null;
  topPaymentMethodAmount?: number;
  outstandingAmount?: number;
  grossRevenue?: number;
  netRevenue?: number;
  grossProfit?: number;
  dayWithHighestPayment: { dateTime: string | null; amount: number | null };
  availableReport: AvailableReport[];
  paymentPartitions: PartitionPoint[];
  paymentMethodBreakdown?: PaymentMethodBreakdownItem[];
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
  averageBookingFee?: number;
  cancellationRate?: number;
  avgLeadTimeDays?: number;
  peakDayOfWeek?: string | null;
  repeatGuestRate?: number;
  uniqueGuests?: number;
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
  averageOrderValue?: number;
  avgOrdersPerDay?: number;
  completionRate?: number;
  cancellationRate?: number;
  peakHour?: string | null;
  repeatCustomerRate?: number;
  uniqueCustomers?: number;
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
  averageActivitiesPerUser?: number;
  activeDaysInPeriod?: number;
  peakActivityHour?: number | null;
  failedActivityRate?: number;
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

export interface OrderReportItem {
  customerName: string;
  customerPhoneNumber: string;
  orderId: string;
  treatedBy: string | null;
  totalAmount: string;
  comment: string;
  quickResponseName: string;
  paymentMethod: string;
  paymentReference: string | null;
  orderStatus: string;
  dateCreated: string;
}

export interface PopularItem {
  itemName: string;
  menuName: string;
  isCurrentlyAvailable: boolean;
  dateCreated: string;
  totalQuantitySold: number;
  currentPrice: string;
  netSalesAmount: string;
  totalPackagingAmount: string;
  grossSalesAmount: string;
}

export interface EmployeeOrderItem {
  firstName: string;
  lastName: string;
  emailAddress: string;
  numberOfOrders: number;
  pendingSales: string;
  confirmedSales: string;
  totalSales: string;
  dateUpdated: string;
}

export interface CategoryPerformanceItem {
  categoryName: string;
  totalOrders: number;
  totalItemsSold: number;
  totalAmount: string;
  percentageOfTotalSales: string;
}

export interface OrderPaymentItem {
  orderId: string;
  orderDate: string;
  customer: string;
  orderTotal: string;
  totalPaid: string;
  totalRefunded: string;
  outstanding: string;
  paymentStatus: string;
  orderStatus: string;
}

export interface OrderReportResponse {
  orders?: OrderReportItem[] | EmployeeOrderItem[];
  items?: PopularItem[];
  categories?: CategoryPerformanceItem[];
  orderPayments?: OrderPaymentItem[];
  lastRecordDateTime: string | null;
  hasExceededMaximumCount: boolean;
  message: string | null;
  availableReport: AvailableReport[];
}

export interface OrderReportPayload {
  filterType: number;
  startDate?: string;
  endDate?: string;
  reportType?: number;
  paymentMethod?: number;
  status?: number;
}

export interface PaymentReportItem {
  customer: string;
  orderId: string;
  treatedBy: string | null;
  totalAmount: string;
  quickResponseName: string;
  paymentMethod: string;
  paymentDirection: string;
  paymentType: string;
  paymentReference: string;
  confirmedBy: string;
  status: string;
  dateCreated: string;
}

export interface PaymentMethodSummary {
  paymentMethod: string;
  numberOfPayments: number;
  creditCount: number;
  debitCount: number;
  totalCredits: string;
  totalDebits: string;
  netAmountProcessed: string;
  lastRecordDateTime: string;
}

export interface QrRevenueItem {
  quickResponseName: string;
  numberOfOrders: number;
  pendingSalesAmount: string;
  confirmedSalesAmount: string;
  totalSalesAmount: string;
  totalRefundAmount: string;
  grossSalesAmount: string;
  dateUpdated: string;
}

export interface NetRevenueItem {
  period: string;
  netRevenue: string;
  lastRecordDate: string;
}

export interface OutstandingReceivableItem {
  orderId: string;
  customer: string;
  treatedBy: string | null;
  orderTotal: string;
  paidSoFar: string;
  outstanding: string;
  orderDate: string;
  lastRecordDate: string;
}

export interface PaymentReportResponse {
  payments?: PaymentReportItem[] | PaymentMethodSummary[];
  qrOrders?: QrRevenueItem[];
  netRevenues?: NetRevenueItem[];
  outstandingReceivables?: OutstandingReceivableItem[];
  lastRecordDateTime: string | null;
  hasExceededMaximumCount: boolean;
  message: string | null;
  availableReport: AvailableReport[];
}

export interface PaymentReportPayload {
  filterType: number;
  startDate?: string;
  endDate?: string;
  reportType?: number;
  paymentMethod?: number;
  status?: number;
}

export interface BookingReportItem {
  firstName: string;
  lastName: string;
  emailAddress: string;
  phoneNumber: string;
  reference: string | null;
  statusComment: string | null;
  bookingFee: string;
  minimumSpend: string;
  checkInDateTime: string;
  checkOutDateTime: string;
  bookingDateTime: string;
  numberOfGuest: number;
  bookingStatus: string;
  dateCreated: string;
}

export interface ReservationBookingItem {
  reservationName: string;
  totalBookingFee: string;
  totalBookings: number;
  dateUpdated: string;
}

export interface DailyOccupancyUtilizationItem {
  reservationName: string;
  reservationCapacity: number;
  totalBookings: number;
  unusedCapacity: number;
  occupancyRate: string;
  averageDailyUtilization: number;
  lastRecordDateTime: string;
}

export interface BookingReportResponse {
  bookings?: BookingReportItem[];
  reservationBookings?: ReservationBookingItem[];
  dailyOccupancyUtilizations?: DailyOccupancyUtilizationItem[];
  lastRecordDateTime: string | null;
  hasExceededMaximumCount: boolean;
  message: string | null;
  availableReport: AvailableReport[];
}

export interface BookingReportPayload {
  filterType: number;
  startDate?: string;
  endDate?: string;
  reportType?: number;
  bookingStatus?: number;
}

export interface InventoryReportItem {
  itemName: string;
  itemType: string;
  supplierName: string | null;
  unitName: string;
  quantityOnHand: number;
  reorderLevel: number;
  averageCostPerUnit: number;
  stockValue: number;
  daysUntilStockout: number | null;
  status: string;
  lastRestocked: string | null;
  expiryDate: string | null;
}

export interface InventoryReportPayload {
  filterType: number;
  startDate?: string;
  endDate?: string;
  reportType?: number;
  inventoryItemId?: string;
  categoryId?: string;
  supplierId?: string;
}

export interface StockMovementItem {
  dateCreated: string;
  itemName: string;
  movementType: string;
  transactionType: string;
  quantityChange: number;
  costPerUnit: number;
  value: number;
  unitName: string;
  reason: string;
  performedBy: string;
}

export interface PurchaseAdjustmentItem {
  date: string;
  itemName: string;
  quantityWasted: number;
  costImpact: number;
  adjustmentType: string;
  reason: string;
  performedBy: string;
}

export interface UserAuditLogItem {
  userName: string;
  emailAddress: string;
  activity: string;
  role: string;
  activityType: string;
  ipAddress: string | null;
  isSuccessful: boolean;
  dateCreated: string;
}

export interface UserDailyActivePeriod {
  date: string;
  fullName: string;
  emailAddress: string;
  firstLoginTime: string;
  lastSeenTime: string;
  activePeriod: string;
  dateCreated: string;
}

export interface UserReportResponse {
  auditLogs?: UserAuditLogItem[] | null;
  userDailyActivePeriods?: UserDailyActivePeriod[] | null;
  lastRecordDateTime: string | null;
  hasExceededMaximumCount: boolean;
  message: string | null;
  availableReport: AvailableReport[];
}

export interface UserReportPayload {
  filterType: number;
  startDate?: string;
  endDate?: string;
  reportType?: number;
  emailAddress?: string;
}

export interface QrTopItem {
  qrName: string;
  orderCount: number;
  netRevenue: number;
  averageOrderValue: number;
  lastOrderDateTime: string | null;
}

export interface QrDetailsSection {
  totalQRCodes: number;
  activeQRCodes: number;
  idleQRCodes: number;
  totalQROrders: number;
  totalQRRevenue: number;
  averageOrdersPerActiveQR: number;
  topQRConcentrationPct: number;
  topByRevenue: QrTopItem | null;
  topByOrders: QrTopItem | null;
  topByAverageOrderValue: QrTopItem | null;
  percentageChange: string;
  availableReport: AvailableReport[];
}

export interface QrPerformanceItem {
  qrName: string;
  orderCount: number;
  openOrders?: number;
  closedOrders?: number;
  cancelledOrders?: number;
  netRevenue: number;
  averageOrderValue: number;
  refundAmount?: number;
  status?: string;
  lastOrderDateTime?: string | null;
}

export interface QrActivityTimelineItem {
  qrName: string;
  eventType: string;
  occurredAt: string;
  orderId?: string | null;
  amount?: number | null;
  performedBy?: string | null;
}

export interface QrReportResponse {
  qrDetails?: QrDetailsSection;
  qrPerformanceSummaries?: QrPerformanceItem[];
  qrOrderHistories?: OrderReportItem[];
  qrActivityTimelines?: QrActivityTimelineItem[];
  lastRecordDateTime: string | null;
  hasExceededMaximumCount: boolean;
  message: string | null;
  availableReport: AvailableReport[];
}

export interface QrReportPayload {
  filterType: number;
  startDate?: string;
  endDate?: string;
  reportType?: number;
  quickResponseID?: string;
}

export type AlertSeverity = 'critical' | 'warning' | 'info' | string;
export type AlertCategory =
  | 'inventory'
  | 'order'
  | 'payment'
  | 'booking'
  | 'qr'
  | 'audit'
  | string;

export interface SummaryAlert {
  severity: AlertSeverity;
  category: AlertCategory;
  title: string;
  message: string;
  actionLabel?: string | null;
  actionUrl?: string | null;
  metricValue?: number | null;
}

export interface ReportSummary {
  filterType?: number;
  paymentDetails: PaymentDetailsSection;
  bookingDetails: BookingDetailsSection;
  orderDetails: OrderDetailsSection;
  auditDetails: AuditDetailsSection;
  inventoryDetails: InventoryDetailsSection;
  alerts?: SummaryAlert[];
}
