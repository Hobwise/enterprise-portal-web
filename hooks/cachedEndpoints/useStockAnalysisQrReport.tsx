'use client';
import { getReportQr } from '@/app/api/controllers/dashboard/report';
import { getJsonItemFromLocalStorage } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import {
  AvailableReport,
  QrActivityTimelineItem,
  QrDetailsSection,
  QrPerformanceItem,
  QrReportPayload,
  QrReportResponse,
  QrTopItem,
} from '@/components/ui/dashboard/inventory/stock-analysis/types';
import { OrderReportItem } from '@/components/ui/dashboard/inventory/stock-analysis/types';

interface UseQrReportArgs {
  filterType: number;
  startDate?: string;
  endDate?: string;
  reportType?: number;
  quickResponseID?: string;
}

const safeNumber = (value: unknown): number => {
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0;
  if (value === null || value === undefined) return 0;
  const cleaned = String(value).replace(/[^0-9.\-]+/g, '');
  if (!cleaned) return 0;
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : 0;
};

interface RawQrItem {
  qrName?: string;
  quickResponseName?: string;
  orderCount?: number | string;
  numberOfOrders?: number | string;
  openOrders?: number | string;
  closedOrders?: number | string;
  cancelledOrders?: number | string;
  grossRevenue?: number | string;
  grossSalesAmount?: number | string;
  netRevenue?: number | string;
  totalSalesAmount?: number | string;
  confirmedSalesAmount?: number | string;
  pendingSalesAmount?: number | string;
  averageOrderValue?: number | string;
  refundAmount?: number | string;
  totalRefundAmount?: number | string;
  uniqueCustomers?: number | string;
  status?: string;
  lastOrderDateTime?: string | null;
  dateUpdated?: string | null;
  dateCreated?: string | null;
}

interface RawActivityItem {
  qrName?: string;
  date?: string | null;
  orderCount?: number | string;
  revenue?: number | string;
  lastRecordDate?: string | null;
  eventType?: string;
  occurredAt?: string;
  orderId?: string | null;
  amount?: number | string | null;
  performedBy?: string | null;
}

interface RawQrResponse {
  qrDetails?: QrDetailsSection;
  qRs?: RawQrItem[];
  qrs?: RawQrItem[];
  qrPerformanceSummaries?: RawQrItem[];
  qrOrders?: RawQrItem[];
  qrOrderHistories?: OrderReportItem[];
  orders?: OrderReportItem[];
  activity?: RawActivityItem[];
  activities?: RawActivityItem[];
  qrActivityTimelines?: RawActivityItem[];
  availableReport?: AvailableReport[];
  lastRecordDateTime?: string | null;
  hasExceededMaximumCount?: boolean;
  message?: string | null;
}

const mapPerformanceItem = (raw: RawQrItem): QrPerformanceItem => {
  const orderCount = safeNumber(raw.orderCount ?? raw.numberOfOrders);
  const netRevenue = safeNumber(
    raw.netRevenue ?? raw.totalSalesAmount ?? raw.grossSalesAmount ?? raw.grossRevenue
  );
  const averageOrderValue =
    raw.averageOrderValue !== undefined
      ? safeNumber(raw.averageOrderValue)
      : orderCount > 0
        ? netRevenue / orderCount
        : 0;
  const refundAmount = safeNumber(raw.refundAmount ?? raw.totalRefundAmount);
  const status =
    raw.status ?? (orderCount > 0 ? 'Active' : undefined);
  return {
    qrName: raw.qrName ?? raw.quickResponseName ?? 'Unknown',
    orderCount,
    openOrders:
      raw.openOrders !== undefined ? safeNumber(raw.openOrders) : undefined,
    closedOrders:
      raw.closedOrders !== undefined ? safeNumber(raw.closedOrders) : undefined,
    cancelledOrders:
      raw.cancelledOrders !== undefined
        ? safeNumber(raw.cancelledOrders)
        : undefined,
    netRevenue,
    averageOrderValue,
    refundAmount,
    status,
    lastOrderDateTime: raw.lastOrderDateTime ?? raw.dateUpdated ?? null,
  };
};

const mapActivityItem = (raw: RawActivityItem): QrActivityTimelineItem => {
  const occurredAt =
    raw.occurredAt ?? raw.date ?? raw.lastRecordDate ?? '';
  const orderCount = safeNumber(raw.orderCount);
  const eventType =
    raw.eventType ??
    (orderCount > 0
      ? `${orderCount} ${orderCount === 1 ? 'Order' : 'Orders'}`
      : 'Activity');
  const amount =
    raw.amount !== undefined && raw.amount !== null
      ? safeNumber(raw.amount)
      : raw.revenue !== undefined && raw.revenue !== null
        ? safeNumber(raw.revenue)
        : null;
  return {
    qrName: raw.qrName ?? 'Unknown',
    eventType,
    occurredAt,
    orderId: raw.orderId ?? null,
    amount,
    performedBy: raw.performedBy ?? null,
  };
};

const toTopItem = (row: QrPerformanceItem | undefined): QrTopItem | null => {
  if (!row) return null;
  return {
    qrName: row.qrName,
    orderCount: safeNumber(row.orderCount),
    netRevenue: safeNumber(row.netRevenue),
    averageOrderValue: safeNumber(row.averageOrderValue),
    lastOrderDateTime: row.lastOrderDateTime ?? null,
  };
};

const buildQrDetails = (
  performance: QrPerformanceItem[],
  availableReport: AvailableReport[]
): QrDetailsSection => {
  const totalQRCodes = performance.length;
  const activeQRCodes = performance.filter((p) => {
    const s = (p.status ?? '').toLowerCase();
    if (s === 'active') return true;
    if (s === 'inactive' || s === 'idle') return false;
    return p.orderCount > 0;
  }).length;
  const idleQRCodes = Math.max(totalQRCodes - activeQRCodes, 0);
  const totalQROrders = performance.reduce(
    (sum, p) => sum + safeNumber(p.orderCount),
    0
  );
  const totalQRRevenue = performance.reduce(
    (sum, p) => sum + safeNumber(p.netRevenue),
    0
  );
  const averageOrdersPerActiveQR =
    activeQRCodes > 0 ? totalQROrders / activeQRCodes : 0;
  const sortedByOrders = [...performance].sort(
    (a, b) => safeNumber(b.orderCount) - safeNumber(a.orderCount)
  );
  const sortedByRevenue = [...performance].sort(
    (a, b) => safeNumber(b.netRevenue) - safeNumber(a.netRevenue)
  );
  const sortedByAov = [...performance].sort(
    (a, b) => safeNumber(b.averageOrderValue) - safeNumber(a.averageOrderValue)
  );
  const topOrders = safeNumber(sortedByOrders[0]?.orderCount);
  const topQRConcentrationPct =
    totalQROrders > 0 ? (topOrders / totalQROrders) * 100 : 0;

  return {
    totalQRCodes,
    activeQRCodes,
    idleQRCodes,
    totalQROrders,
    totalQRRevenue,
    averageOrdersPerActiveQR,
    topQRConcentrationPct,
    topByRevenue: toTopItem(sortedByRevenue[0]),
    topByOrders: toTopItem(sortedByOrders[0]),
    topByAverageOrderValue: toTopItem(sortedByAov[0]),
    percentageChange: '0',
    availableReport,
  };
};

const normalizeQrResponse = (raw: RawQrResponse | null): QrReportResponse | null => {
  if (!raw) return null;

  const rawPerformance: RawQrItem[] =
    raw.qrPerformanceSummaries ??
    raw.qRs ??
    raw.qrs ??
    raw.qrOrders ??
    [];
  const performance = rawPerformance.map(mapPerformanceItem);

  const rawActivity: RawActivityItem[] =
    raw.qrActivityTimelines ?? raw.activity ?? raw.activities ?? [];
  const timelines = rawActivity.map(mapActivityItem);

  const availableReport = raw.availableReport ?? [];
  const qrDetails =
    raw.qrDetails ?? buildQrDetails(performance, availableReport);

  return {
    qrDetails,
    qrPerformanceSummaries: performance,
    qrOrderHistories: raw.qrOrderHistories ?? raw.orders ?? [],
    qrActivityTimelines: timelines,
    lastRecordDateTime: raw.lastRecordDateTime ?? null,
    hasExceededMaximumCount: raw.hasExceededMaximumCount ?? false,
    message: raw.message ?? null,
    availableReport,
  };
};

const useStockAnalysisQrReport = (
  args: UseQrReportArgs,
  options?: { enabled?: boolean }
) => {
  const business = getJsonItemFromLocalStorage('business');

  const fetchQrReport = async ({ queryKey }: any) => {
    const [, payload] = queryKey as [string, QrReportPayload];
    const responseData = await getReportQr(
      business?.[0]?.businessId,
      payload.filterType,
      payload.startDate,
      payload.endDate,
      payload.reportType,
      payload.quickResponseID
    );
    const raw = (responseData?.data?.data ?? null) as RawQrResponse | null;
    return normalizeQrResponse(raw);
  };

  const { data, isLoading, isError, refetch } = useQuery<
    QrReportResponse | null
  >({
    queryKey: ['stockAnalysisQrReport', args],
    queryFn: fetchQrReport,
    refetchOnWindowFocus: false,
    ...options,
  });

  return { data, isLoading, isError, refetch };
};

export default useStockAnalysisQrReport;
