'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Chip } from '@nextui-org/react';
import { IoIosArrowBack, IoIosArrowForward } from 'react-icons/io';
import {
  HiOutlineCreditCard,
  HiOutlineCube,
  HiOutlineQrcode,
} from 'react-icons/hi';
import {
  MdOutlineBarChart,
  MdOutlineBookmark,
  MdOutlineBookmarkBorder,
  MdOutlineCategory,
  MdOutlineCheckCircle,
  MdOutlineEventNote,
  MdOutlinePeopleAlt,
  MdOutlinePayments,
  MdOutlineStar,
  MdOutlineGridView,
  MdOutlineSupervisorAccount,
  MdOutlineHistory,
} from 'react-icons/md';
import { TbReportSearch } from 'react-icons/tb';
import { LuPackage } from 'react-icons/lu';
import { getJsonItemFromLocalStorage } from '@/lib/utils';
import { SalesOverviewPanel } from '@/components/ui/dashboard/report/SalesPanels';
import {
  ComingSoonPanel,
  GenericReportPanel,
} from '@/components/ui/dashboard/report/SharedPanels';
import { InventoryOverviewPanel } from '@/components/ui/dashboard/report/InventoryOverviewPanel';
import { PaymentOverviewPanel } from '@/components/ui/dashboard/report/PaymentOverviewPanel';
import { UserAuditOverviewPanel } from '@/components/ui/dashboard/report/UserAuditOverviewPanel';
import {
  CategoryPerformancePanel,
  EmployeePerformancePanel,
  OrderPaymentSummaryPanel,
  OrdersVolumesPanel,
  PopularItemsPanel,
} from '@/components/ui/dashboard/report/SalesSubTabs';
import {
  NetRevenueSubPanel,
  OutstandingReceivablesSubPanel,
  PaymentMethodsSubPanel,
  PaymentSummarySubPanel,
} from '@/components/ui/dashboard/report/PaymentSubTabs';
import {
  QrActivityTimelinePanel,
  QrDetailsPanel,
  QrOrderHistoryPanel,
  QrOverviewPanel,
  QrRevenueByCodePanel,
} from '@/components/ui/dashboard/report/QrPanels';
import { BookingOverviewPanel } from '@/components/ui/dashboard/report/BookingOverviewPanel';
import {
  BookingSummaryPanel,
  OccupancyUtilizationPanel,
  ReservationSummaryPanel,
} from '@/components/ui/dashboard/report/BookingSubTabs';
import {
  StockLevelPanel,
  StockTransferPanel,
} from '@/components/ui/dashboard/report/InventorySubTabs';
import {
  ActivityAuditPanel,
  DailySessionsPanel,
} from '@/components/ui/dashboard/report/UserSubTabs';
import {
  AvailableReport,
  BookingReportResponse,
  FilterType,
  ModuleId,
  OrderReportResponse,
  PaymentReportResponse,
  PeriodId,
  QrReportResponse,
  ReportSummary,
  UserReportResponse,
  filterTypeToComparisonLabel,
  periodToDateRange,
  periodToFilterType,
  StockMovementItem,
} from '@/components/ui/dashboard/report/types';
import useStockAnalysisSummary from '@/hooks/cachedEndpoints/useStockAnalysisSummary';
import useStockAnalysisOrderReport from '@/hooks/cachedEndpoints/useStockAnalysisOrderReport';
import useStockAnalysisPaymentReport from '@/hooks/cachedEndpoints/useStockAnalysisPaymentReport';
import useStockAnalysisInventoryReport from '@/hooks/cachedEndpoints/useStockAnalysisInventoryReport';
import useStockAnalysisUserReport from '@/hooks/cachedEndpoints/useStockAnalysisUserReport';
import useStockAnalysisQrReport from '@/hooks/cachedEndpoints/useStockAnalysisQrReport';
import useStockAnalysisBookingReport from '@/hooks/cachedEndpoints/useStockAnalysisBookingReport';
import { useStockAnalysisExport } from '@/components/ui/dashboard/report/exportHelpers';

interface ModuleTab {
  id: ModuleId;
  label: string;
  icon: React.ReactNode;
  badge?: { value: string; variant: 'count' | 'alert' };
  subTabs: SubTab[];
}

interface SubTab {
  id: string;
  label: string;
  icon: React.ReactNode;
  reportType?: number;
}

const MODULES: ModuleTab[] = [
  {
    id: 'sales',
    label: 'Sales & Orders',
    icon: <MdOutlineBarChart size={18} />,
    subTabs: [
      { id: 'overview', label: 'Overview', icon: <MdOutlineGridView size={16} /> },
      {
        id: 'order-volumes',
        label: 'Orders Volumes',
        icon: <MdOutlineBarChart size={16} />,
        reportType: 0,
      },
      {
        id: 'popular-items',
        label: 'Popular Items',
        icon: <MdOutlineStar size={16} />,
        reportType: 1,
      },
      {
        id: 'employee-performance',
        label: 'Employee Performance',
        icon: <MdOutlinePeopleAlt size={16} />,
        reportType: 3,
      },
      {
        id: 'category-performance',
        label: 'Category Performance',
        icon: <MdOutlineCategory size={16} />,
        reportType: 14,
      },
      {
        id: 'order-payment-summary',
        label: 'Order Payment Summary',
        icon: <MdOutlinePayments size={16} />,
        reportType: 15,
      },
    ],
  },
  {
    id: 'payments',
    label: 'Payment & Revenue',
    icon: <HiOutlineCreditCard size={18} />,
    subTabs: [
      { id: 'overview', label: 'Overview', icon: <MdOutlineGridView size={16} /> },
      {
        id: 'payment-summary',
        label: 'Payment Summary',
        icon: <MdOutlinePayments size={16} />,
        reportType: 4,
      },
      {
        id: 'payment-methods',
        label: 'Payment Methods',
        icon: <HiOutlineCreditCard size={16} />,
        reportType: 5,
      },
      {
        id: 'net-revenue',
        label: 'Net Revenue',
        icon: <MdOutlineBarChart size={16} />,
        reportType: 19,
      },
      {
        id: 'outstanding-receivables',
        label: 'Outstanding Receivables',
        icon: <TbReportSearch size={16} />,
        reportType: 20,
      },
    ],
  },
  {
    id: 'bookings',
    label: 'Bookings & Reservation',
    icon: <MdOutlineBookmarkBorder size={18} />,
    subTabs: [
      { id: 'overview', label: 'Overview', icon: <MdOutlineGridView size={16} /> },
      {
        id: 'booking-summary',
        label: 'Booking Summary',
        icon: <MdOutlineBookmark size={16} />,
        reportType: 7,
      },
      {
        id: 'reservation-summary',
        label: 'Reservation Summary',
        icon: <MdOutlineEventNote size={16} />,
        reportType: 8,
      },
      {
        id: 'occupancy-utilization',
        label: 'Occupancy Utilization',
        icon: <MdOutlineCheckCircle size={16} />,
        reportType: 10,
      },
    ],
  },
  {
    id: 'inventory',
    label: 'Inventory',
    icon: <HiOutlineCube size={18} />,
    subTabs: [
      { id: 'overview', label: 'Overview', icon: <MdOutlineGridView size={16} /> },
      {
        id: 'stock-level',
        label: 'Stock Level',
        icon: <MdOutlineBarChart size={16} />,
        reportType: 21,
      },
      {
        id: 'stock-transfer',
        label: 'Stock Transfer',
        icon: <MdOutlineStar size={16} />,
        reportType: 22,
      },
      {
        id: 'purchase-order',
        label: 'Purchase Order',
        icon: <LuPackage size={16} />,
        reportType: 23,
      },
    ],
  },
  {
    id: 'qr',
    label: 'QR Code',
    icon: <HiOutlineQrcode size={18} />,
    subTabs: [
      { id: 'overview', label: 'Overview', icon: <MdOutlineGridView size={16} /> },
      {
        id: 'qr-details',
        label: 'QR Performance Summary',
        icon: <HiOutlineQrcode size={16} />,
        reportType: 30,
      },
      {
        id: 'qr-order-history',
        label: 'QR Order History',
        icon: <MdOutlineHistory size={16} />,
        reportType: 31,
      },
      {
        id: 'qr-revenue-by-code',
        label: 'Revenue by QR Code',
        icon: <MdOutlinePayments size={16} />,
        reportType: 6,
      },
      {
        id: 'qr-activity-timeline',
        label: 'QR Activity Timeline',
        icon: <MdOutlineBarChart size={16} />,
        reportType: 32,
      },
    ],
  },
  {
    id: 'users',
    label: 'Users & Audits',
    icon: <MdOutlineSupervisorAccount size={18} />,
    subTabs: [
      { id: 'overview', label: 'Overview', icon: <MdOutlineGridView size={16} /> },
      {
        id: 'activity-audit',
        label: 'Activity Audit',
        icon: <MdOutlineBarChart size={16} />,
        reportType: 11,
      },
      {
        id: 'daily-sessions',
        label: 'Daily Sessions',
        icon: <MdOutlineHistory size={16} />,
        reportType: 12,
      },
    ],
  },
];

const PERIODS: { id: PeriodId; label: string }[] = [
  { id: 'today', label: 'Today' },
  { id: 'week', label: 'This week' },
  { id: 'year', label: 'Year' },
];

const SUB_TAB_REPORT_TYPE: Record<string, number | undefined> = {
  'order-volumes': 0,
  'popular-items': 1,
  'employee-performance': 3,
  'category-performance': 14,
  'order-payment-summary': 15,
};

const PAYMENT_SUB_TAB_REPORT_TYPE: Record<string, number | undefined> = {
  'payment-summary': 4,
  'payment-methods': 5,
  'net-revenue': 19,
  'outstanding-receivables': 20,
};

const BOOKING_SUB_TAB_REPORT_TYPE: Record<string, number | undefined> = {
  'booking-summary': 7,
  'reservation-summary': 8,
  'occupancy-utilization': 10,
};

const INVENTORY_SUB_TAB_REPORT_TYPE: Record<string, number | undefined> = {
  'stock-level': 21,
  'stock-transfer': 22,
  'purchase-order': 23,
};

const USER_SUB_TAB_REPORT_TYPE: Record<string, number | undefined> = {
  'activity-audit': 11,
  'daily-sessions': 12,
};

const QR_SUB_TAB_REPORT_TYPE: Record<string, number | undefined> = {
  overview: 30,
  'qr-details': 30,
  'qr-order-history': 31,
  'qr-revenue-by-code': 6,
  'qr-activity-timeline': 32,
};

const slugifyReportName = (name: string): string =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const mergeSubTabsWithReports = (
  baseSubTabs: SubTab[],
  availableReports: AvailableReport[]
): SubTab[] => {
  const usedTypes = new Set<number>(
    baseSubTabs
      .map((t) => t.reportType)
      .filter((t): t is number => typeof t === 'number')
  );
  const usedIds = new Set<string>(baseSubTabs.map((t) => t.id));

  const extras: SubTab[] = [];
  availableReports.forEach((report) => {
    if (typeof report.reportType !== 'number') return;
    if (usedTypes.has(report.reportType)) return;
    const slug = slugifyReportName(report.reportName ?? '') ||
      `report-${report.reportType}`;
    if (usedIds.has(slug)) return;
    usedTypes.add(report.reportType);
    usedIds.add(slug);
    extras.push({
      id: slug,
      label: report.reportName,
      icon: <TbReportSearch size={16} />,
      reportType: report.reportType,
    });
  });

  return [...baseSubTabs, ...extras];
};

interface PanelErrorBoundaryState {
  hasError: boolean;
}

class PanelErrorBoundary extends React.Component<
  { children: React.ReactNode; resetKey?: string },
  PanelErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode; resetKey?: string }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): PanelErrorBoundaryState {
    return { hasError: true };
  }

  componentDidUpdate(prevProps: { resetKey?: string }) {
    if (prevProps.resetKey !== this.props.resetKey && this.state.hasError) {
      this.setState({ hasError: false });
    }
  }

  componentDidCatch(error: Error) {
    if (typeof window !== 'undefined') {
      console.error('Stock analysis panel error:', error);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm py-16 flex items-center justify-center">
          <div className="flex flex-col items-center gap-2 text-center px-6">
            <h3 className="text-base font-semibold text-gray-700">
              Unable to load this report
            </h3>
            <p className="text-sm text-gray-500">
              Please try a different period or come back later.
            </p>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const SUB_TAB_ALIASES: Record<string, string> = {
  'stock-levels': 'stock-level',
  'stock-transfers': 'stock-transfer',
  'purchase-orders': 'purchase-order',
};

const resolveModuleAndSubTab = (
  moduleParam: string | null,
  subParam: string | null
): { module?: ModuleId; sub?: string } => {
  if (!moduleParam) return {};
  const module = MODULES.find((m) => m.id === moduleParam);
  if (!module) return {};
  if (!subParam) return { module: module.id };
  const normalizedSub = SUB_TAB_ALIASES[subParam] ?? subParam;
  const matched = module.subTabs.find((t) => t.id === normalizedSub);
  return { module: module.id, sub: matched?.id ?? module.subTabs[0]?.id };
};

const StockAnalysisPage: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialModuleParam = searchParams?.get('module') ?? null;
  const initialSubParam = searchParams?.get('sub') ?? null;
  const initial = resolveModuleAndSubTab(initialModuleParam, initialSubParam);
  const [hasAccess, setHasAccess] = useState(false);
  const [activeModule, setActiveModule] = useState<ModuleId>(
    initial.module ?? 'sales'
  );
  const [activeSubTab, setActiveSubTab] = useState<string>(
    initial.sub ?? 'overview'
  );
  const [activePeriod, setActivePeriod] = useState<PeriodId>('today');
  const [customStart, setCustomStart] = useState<string>('');
  const [customEnd, setCustomEnd] = useState<string>('');

  useEffect(() => {
    const userInfo = getJsonItemFromLocalStorage('userInformation');
    const role = userInfo?.role;
    if (Number(role) !== 0) {
      router.replace('/dashboard/unauthorized');
      return;
    }
    setHasAccess(true);
  }, [router]);

  useEffect(() => {
    const next = resolveModuleAndSubTab(
      searchParams?.get('module') ?? null,
      searchParams?.get('sub') ?? null
    );
    if (next.module && next.module !== activeModule) {
      setActiveModule(next.module);
    }
    if (next.sub && next.sub !== activeSubTab) {
      setActiveSubTab(next.sub);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const currentModule = MODULES.find((m) => m.id === activeModule) ?? MODULES[0];

  const availableReportsForModule = (
    moduleId: ModuleId,
    summaryData?: ReportSummary,
    activeReports?: AvailableReport[]
  ): AvailableReport[] => {
    const fromActive = activeReports ?? [];
    let fromSummary: AvailableReport[] = [];
    switch (moduleId) {
      case 'sales':
        fromSummary = summaryData?.orderDetails?.availableReport ?? [];
        break;
      case 'payments':
        fromSummary = summaryData?.paymentDetails?.availableReport ?? [];
        break;
      case 'bookings':
        fromSummary = summaryData?.bookingDetails?.availableReport ?? [];
        break;
      case 'inventory':
        fromSummary = summaryData?.inventoryDetails?.availableReport ?? [];
        break;
      case 'users':
        fromSummary = summaryData?.auditDetails?.availableReport ?? [];
        break;
      case 'qr':
        fromSummary = [];
        break;
      default:
        fromSummary = [];
    }
    const merged = new Map<number, AvailableReport>();
    [...fromSummary, ...fromActive].forEach((r) => {
      if (r && typeof r.reportType === 'number') {
        merged.set(r.reportType, r);
      }
    });
    return Array.from(merged.values());
  };

  const handleModuleChange = (id: ModuleId) => {
    setActiveModule(id);
    const next = MODULES.find((m) => m.id === id);
    if (next && !next.subTabs.find((t) => t.id === activeSubTab)) {
      setActiveSubTab(next.subTabs[0]?.id ?? 'overview');
    }
  };

  const hasCustomRange = Boolean(customStart && customEnd);
  const filterType = hasCustomRange
    ? FilterType.Custom
    : periodToFilterType(activePeriod);
  const startDate = hasCustomRange
    ? new Date(`${customStart}T00:00:00`).toISOString()
    : undefined;
  const endDate = hasCustomRange
    ? new Date(`${customEnd}T23:59:59.999`).toISOString()
    : undefined;

  const { data: summary, isLoading: summaryLoading } = useStockAnalysisSummary(
    filterType,
    startDate,
    endDate,
    { enabled: hasAccess }
  );

  const summaryAvailableReports = React.useMemo(
    () => availableReportsForModule(activeModule, summary ?? undefined, undefined),
    [activeModule, summary]
  );

  const dynamicReportTypeBySlug = React.useMemo(() => {
    const merged = mergeSubTabsWithReports(
      currentModule.subTabs,
      summaryAvailableReports
    );
    const map: Record<string, number | undefined> = {};
    merged.forEach((tab) => {
      if (typeof tab.reportType === 'number') {
        map[tab.id] = tab.reportType;
      }
    });
    return map;
  }, [currentModule, summaryAvailableReports]);

  const subTabReportType =
    SUB_TAB_REPORT_TYPE[activeSubTab] ?? dynamicReportTypeBySlug[activeSubTab];
  const orderReportEnabled =
    hasAccess && activeModule === 'sales' && activeSubTab !== 'overview';

  const { data: orderReport, isLoading: orderReportLoading } =
    useStockAnalysisOrderReport(
      {
        filterType,
        startDate,
        endDate,
        reportType: subTabReportType,
      },
      { enabled: orderReportEnabled }
    );

  const qrSubTabReportType = QR_SUB_TAB_REPORT_TYPE[activeSubTab];
  const qrReportEnabled = hasAccess && activeModule === 'qr';

  const { data: qrReport, isLoading: qrReportLoading } =
    useStockAnalysisQrReport(
      {
        filterType,
        startDate,
        endDate,
        reportType: qrSubTabReportType,
      },
      { enabled: qrReportEnabled }
    );

  const paymentSubTabReportType =
    PAYMENT_SUB_TAB_REPORT_TYPE[activeSubTab] ??
    dynamicReportTypeBySlug[activeSubTab];
  const paymentReportEnabled =
    hasAccess && activeModule === 'payments' && activeSubTab !== 'overview';

  const { data: paymentReport, isLoading: paymentReportLoading } =
    useStockAnalysisPaymentReport(
      {
        filterType,
        startDate,
        endDate,
        reportType: paymentSubTabReportType,
      },
      { enabled: paymentReportEnabled }
    );

  const inventorySubTabReportType =
    INVENTORY_SUB_TAB_REPORT_TYPE[activeSubTab] ??
    dynamicReportTypeBySlug[activeSubTab];
  const inventoryReportEnabled =
    hasAccess &&
    activeModule === 'inventory' &&
    activeSubTab !== 'overview' &&
    typeof inventorySubTabReportType === 'number';

  const { data: inventoryReport, isLoading: inventoryReportLoading } =
    useStockAnalysisInventoryReport(
      {
        filterType,
        startDate,
        endDate,
        reportType: inventorySubTabReportType,
      },
      { enabled: inventoryReportEnabled }
    );

  const cogsMovementsEnabled =
    hasAccess && activeModule === 'inventory' && activeSubTab === 'overview';

  const { data: cogsMovementsData } = useStockAnalysisInventoryReport(
    { filterType, startDate, endDate, reportType: 22 },
    { enabled: cogsMovementsEnabled }
  );

  const effectiveSummary = React.useMemo(() => {
    if (!summary) return undefined;
    if (!cogsMovementsData || (summary.inventoryDetails?.totalCogs ?? 0) !== 0) {
      return summary;
    }
    const movements = cogsMovementsData as StockMovementItem[];
    const computedCogs = movements
      .filter((m) => (m.transactionType ?? '').toLowerCase() === 'sale')
      .reduce((sum, m) => {
        const v = Number(m.value);
        return sum + (Number.isFinite(v) ? v : 0);
      }, 0);
    return {
      ...summary,
      inventoryDetails: { ...summary.inventoryDetails, totalCogs: computedCogs },
    };
  }, [summary, cogsMovementsData]);

  const userSubTabReportType =
    USER_SUB_TAB_REPORT_TYPE[activeSubTab] ??
    dynamicReportTypeBySlug[activeSubTab];
  const userReportEnabled =
    hasAccess && activeModule === 'users' && activeSubTab !== 'overview';

  const { data: userReport, isLoading: userReportLoading } =
    useStockAnalysisUserReport(
      {
        filterType,
        startDate,
        endDate,
        reportType: userSubTabReportType,
      },
      { enabled: userReportEnabled }
    );

  const bookingSubTabReportType =
    BOOKING_SUB_TAB_REPORT_TYPE[activeSubTab] ??
    dynamicReportTypeBySlug[activeSubTab];
  const bookingReportEnabled =
    hasAccess && activeModule === 'bookings' && activeSubTab !== 'overview';

  const { data: bookingReport, isLoading: bookingReportLoading } =
    useStockAnalysisBookingReport(
      {
        filterType,
        startDate,
        endDate,
        reportType: bookingSubTabReportType,
      },
      { enabled: bookingReportEnabled }
    );

  const { exportTable, isExporting } = useStockAnalysisExport({
    module: activeModule,
    subTab: activeSubTab,
    filterType,
    startDate,
    endDate,
  });

  const activeModuleReports: AvailableReport[] = (() => {
    switch (activeModule) {
      case 'sales':
        return orderReport?.availableReport ?? [];
      case 'payments':
        return paymentReport?.availableReport ?? [];
      case 'users':
        return userReport?.availableReport ?? [];
      case 'bookings':
        return bookingReport?.availableReport ?? [];
      case 'qr':
        return [];
      default:
        return [];
    }
  })();

  const moduleAvailableReports = availableReportsForModule(
    activeModule,
    summary ?? undefined,
    activeModuleReports
  );

  const mergedSubTabs = mergeSubTabsWithReports(
    currentModule.subTabs,
    moduleAvailableReports
  );

  const subTabLabel =
    mergedSubTabs.find((t) => t.id === activeSubTab)?.label ?? activeSubTab;
  const activeReportType = (() => {
    switch (activeModule) {
      case 'sales':
        return subTabReportType;
      case 'payments':
        return paymentSubTabReportType;
      case 'inventory':
        return inventorySubTabReportType;
      case 'users':
        return userSubTabReportType;
      case 'bookings':
        return bookingSubTabReportType;
      case 'qr':
        return qrSubTabReportType;
      default:
        return undefined;
    }
  })();

  if (!hasAccess) {
    return null;
  }

  return (
    <div className="flex flex-col w-full gap-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-[24px] leading-8 font-semibold text-gray-900">
            Reports
          </h1>
          <p className="text-sm text-grey600 mt-1">
            View, filter and export across all modules
          </p>
        </div>
      </div>

      {/* Module tabs + sub-tabs card */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm">
        <ModuleTabsBar
          modules={MODULES}
          active={activeModule}
          onChange={handleModuleChange}
        />
        <div className="px-2 md:px-3 py-4 border-t border-gray-100">
          <SubTabsBar
            tabs={mergedSubTabs}
            active={activeSubTab}
            onChange={setActiveSubTab}
            availableReports={moduleAvailableReports}
          />
        </div>
      </div>

      {/* Period filter */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm px-4 md:px-6 py-4 flex flex-wrap items-center gap-3">
        <span className="text-sm font-medium text-gray-700">Period:</span>
        <div className="flex flex-wrap gap-2">
          {PERIODS.map((p) => {
            const isActive = activePeriod === p.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => {
                  setActivePeriod(p.id);
                  setCustomStart('');
                  setCustomEnd('');
                }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${
                  isActive
                    ? 'bg-primaryColor text-white border-primaryColor'
                    : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                }`}
              >
                {p.label}
              </button>
            );
          })}
        </div>
        <div className="flex items-center gap-2 ml-auto flex-wrap">
          <span className="text-sm font-medium text-gray-700">Custom</span>
          <input
            type="date"
            value={customStart}
            placeholder="dd / mm / yyyy"
            onChange={(e) => setCustomStart(e.target.value)}
            className="px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-700 focus:outline-none focus:border-primaryColor"
          />
          <span className="text-sm text-gray-500">to</span>
          <input
            type="date"
            value={customEnd}
            placeholder="dd / mm / yyyy"
            onChange={(e) => setCustomEnd(e.target.value)}
            className="px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-700 focus:outline-none focus:border-primaryColor"
          />
        </div>
      </div>

      {/* Active panel */}
      <PanelErrorBoundary resetKey={`${activeModule}:${activeSubTab}`}>
        <ActivePanel
          moduleId={activeModule}
          subTabId={activeSubTab}
          subTabLabel={subTabLabel}
          reportType={activeReportType}
          summary={effectiveSummary}
          isLoading={summaryLoading}
          orderReport={orderReport ?? undefined}
          orderReportLoading={orderReportLoading}
          paymentReport={paymentReport ?? undefined}
          paymentReportLoading={paymentReportLoading}
          inventoryReport={inventoryReport ?? undefined}
          inventoryReportLoading={inventoryReportLoading}
          userReport={userReport ?? undefined}
          userReportLoading={userReportLoading}
          qrReport={qrReport ?? undefined}
          qrReportLoading={qrReportLoading}
          bookingReport={bookingReport ?? undefined}
          bookingReportLoading={bookingReportLoading}
          comparisonLabel={filterTypeToComparisonLabel(filterType)}
          onExport={exportTable}
          isExporting={isExporting}
        />
      </PanelErrorBoundary>
    </div>
  );
};

const useHorizontalScrollControls = () => {
  const scrollerRef = React.useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const update = React.useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const tolerance = 1;
    setCanScrollLeft(el.scrollLeft > tolerance);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - tolerance);
  }, []);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;

    update();
    el.addEventListener('scroll', update, { passive: true });

    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(update);
      resizeObserver.observe(el);
      Array.from(el.children).forEach((child) => {
        resizeObserver?.observe(child as Element);
      });
    } else if (typeof window !== 'undefined') {
      window.addEventListener('resize', update);
    }

    return () => {
      el.removeEventListener('scroll', update);
      resizeObserver?.disconnect();
      if (typeof window !== 'undefined') {
        window.removeEventListener('resize', update);
      }
    };
  }, [update]);

  const scrollBy = React.useCallback((direction: 'left' | 'right') => {
    const el = scrollerRef.current;
    if (!el) return;
    const offset = direction === 'right' ? 240 : -240;
    el.scrollBy({ left: offset, behavior: 'smooth' });
  }, []);

  return { scrollerRef, canScrollLeft, canScrollRight, scrollBy };
};

interface ModuleTabsBarProps {
  modules: ModuleTab[];
  active: ModuleId;
  onChange: (id: ModuleId) => void;
}

const ModuleTabsBar: React.FC<ModuleTabsBarProps> = ({
  modules,
  active,
  onChange,
}) => {
  const { scrollerRef, canScrollLeft, canScrollRight, scrollBy } =
    useHorizontalScrollControls();

  return (
    <div className="flex items-center px-2 md:px-3 py-3 gap-2">
      {canScrollLeft && (
        <button
          type="button"
          onClick={() => scrollBy('left')}
          aria-label="Scroll modules left"
          className="flex items-center justify-center h-8 w-8 rounded-full border border-gray-200 text-gray-500 hover:bg-gray-50 shrink-0"
        >
          <IoIosArrowBack size={16} />
        </button>
      )}
      <div
        ref={scrollerRef}
        className="flex items-center overflow-x-auto scrollbar-hide flex-1 gap-1 scroll-smooth"
      >
        {modules.map((tab) => {
          const isActive = active === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onChange(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                isActive
                  ? 'text-primaryColor'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <span
                className={isActive ? 'text-primaryColor' : 'text-gray-500'}
              >
                {tab.icon}
              </span>
              <span>{tab.label}</span>
              {tab.badge && (
                <Chip
                  size="sm"
                  classNames={{
                    base: `h-5 px-2 ${
                      tab.badge.variant === 'alert'
                        ? 'bg-orange-50 text-orange-600'
                        : 'bg-pink200 text-primaryColor'
                    }`,
                    content: 'text-[11px] font-semibold px-0',
                  }}
                >
                  {tab.badge.value}
                </Chip>
              )}
            </button>
          );
        })}
      </div>
      {canScrollRight && (
        <button
          type="button"
          onClick={() => scrollBy('right')}
          aria-label="Scroll modules right"
          className="flex items-center justify-center h-8 w-8 rounded-full border border-gray-200 text-gray-500 hover:bg-gray-50 shrink-0"
        >
          <IoIosArrowForward size={16} />
        </button>
      )}
    </div>
  );
};

interface SubTabsBarProps {
  tabs: SubTab[];
  active: string;
  onChange: (id: string) => void;
  availableReports?: AvailableReport[];
}

const SubTabsBar: React.FC<SubTabsBarProps> = ({
  tabs,
  active,
  onChange,
  availableReports,
}) => {
  const { scrollerRef, canScrollLeft, canScrollRight, scrollBy } =
    useHorizontalScrollControls();

  const resolveLabel = (tab: SubTab): string => {
    if (tab.reportType === undefined) {
      return tab.label;
    }
    const found = availableReports?.find(
      (report) => report.reportType === tab.reportType
    );
    return found?.reportName ?? tab.label;
  };

  return (
    <div className="flex items-center gap-2">
      {canScrollLeft && (
        <button
          type="button"
          onClick={() => scrollBy('left')}
          aria-label="Scroll sub tabs left"
          className="flex items-center justify-center h-8 w-8 rounded-full border border-gray-200 text-gray-500 hover:bg-gray-50 shrink-0"
        >
          <IoIosArrowBack size={16} />
        </button>
      )}
      <div
        ref={scrollerRef}
        className="flex items-center overflow-x-auto scrollbar-hide flex-1 gap-2 scroll-smooth"
      >
        {tabs.map((tab) => {
          const isActive = active === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onChange(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border whitespace-nowrap shrink-0 transition-colors ${
                isActive
                  ? 'bg-pink200 text-primaryColor border-pink200'
                  : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
              }`}
            >
              <span
                className={isActive ? 'text-primaryColor' : 'text-gray-500'}
              >
                {tab.icon}
              </span>
              <span>{resolveLabel(tab)}</span>
            </button>
          );
        })}
      </div>
      {canScrollRight && (
        <button
          type="button"
          onClick={() => scrollBy('right')}
          aria-label="Scroll sub tabs right"
          className="flex items-center justify-center h-8 w-8 rounded-full border border-gray-200 text-gray-500 hover:bg-gray-50 shrink-0"
        >
          <IoIosArrowForward size={16} />
        </button>
      )}
    </div>
  );
};

interface ActivePanelProps {
  moduleId: ModuleId;
  subTabId: string;
  subTabLabel?: string;
  reportType?: number;
  summary?: ReportSummary;
  isLoading?: boolean;
  orderReport?: OrderReportResponse;
  orderReportLoading?: boolean;
  paymentReport?: PaymentReportResponse;
  paymentReportLoading?: boolean;
  inventoryReport?: unknown[];
  inventoryReportLoading?: boolean;
  userReport?: UserReportResponse;
  userReportLoading?: boolean;
  qrReport?: QrReportResponse;
  qrReportLoading?: boolean;
  bookingReport?: BookingReportResponse;
  bookingReportLoading?: boolean;
  comparisonLabel?: string;
  onExport: (exportType: number) => void | Promise<void>;
  isExporting?: boolean;
}

const ActivePanel: React.FC<ActivePanelProps> = ({
  moduleId,
  subTabId,
  subTabLabel,
  reportType,
  summary,
  isLoading,
  orderReport,
  orderReportLoading,
  paymentReport,
  paymentReportLoading,
  inventoryReport,
  inventoryReportLoading,
  userReport,
  userReportLoading,
  comparisonLabel,
  qrReport,
  qrReportLoading,
  bookingReport,
  bookingReportLoading,
  onExport,
  isExporting,
}) => {
  if (moduleId === 'sales') {
    if (subTabId === 'overview') {
      return (
        <SalesOverviewPanel
          data={summary?.orderDetails}
          isLoading={isLoading}
          comparisonLabel={comparisonLabel}
        />
      );
    }
    const subTabProps = {
      data: orderReport,
      isLoading: orderReportLoading,
      onExport,
      isExporting,
    };
    switch (subTabId) {
      case 'order-volumes':
        return <OrdersVolumesPanel {...subTabProps} />;
      case 'popular-items':
        return <PopularItemsPanel {...subTabProps} />;
      case 'employee-performance':
        return <EmployeePerformancePanel {...subTabProps} />;
      case 'category-performance':
        return <CategoryPerformancePanel {...subTabProps} />;
      case 'order-payment-summary':
        return <OrderPaymentSummaryPanel {...subTabProps} />;
      default:
        return (
          <GenericReportPanel
            reportName={subTabLabel ?? subTabId}
            reportType={reportType}
            data={
              orderReport as unknown as Record<string, unknown> | undefined
            }
            isLoading={orderReportLoading}
            onExport={onExport}
            isExporting={isExporting}
          />
        );
    }
  }

  if (moduleId === 'payments' && subTabId !== 'overview') {
    const paymentSubTabProps = {
      data: paymentReport,
      isLoading: paymentReportLoading,
      onExport,
      isExporting,
    };
    switch (subTabId) {
      case 'payment-summary':
        return <PaymentSummarySubPanel {...paymentSubTabProps} />;
      case 'payment-methods':
        return <PaymentMethodsSubPanel {...paymentSubTabProps} />;
      case 'net-revenue':
        return <NetRevenueSubPanel {...paymentSubTabProps} />;
      case 'outstanding-receivables':
        return <OutstandingReceivablesSubPanel {...paymentSubTabProps} />;
      default:
        return (
          <GenericReportPanel
            reportName={subTabLabel ?? subTabId}
            reportType={reportType}
            data={
              paymentReport as unknown as Record<string, unknown> | undefined
            }
            isLoading={paymentReportLoading}
            onExport={onExport}
            isExporting={isExporting}
          />
        );
    }
  }

  if (moduleId === 'qr') {
    const qrPanelProps = {
      data: qrReport,
      isLoading: qrReportLoading,
      onExport,
      isExporting,
    };
    switch (subTabId) {
      case 'overview':
        return <QrOverviewPanel {...qrPanelProps} />;
      case 'qr-details':
        return <QrDetailsPanel {...qrPanelProps} />;
      case 'qr-order-history':
        return <QrOrderHistoryPanel {...qrPanelProps} />;
      case 'qr-revenue-by-code':
        return <QrRevenueByCodePanel {...qrPanelProps} />;
      case 'qr-activity-timeline':
        return <QrActivityTimelinePanel {...qrPanelProps} />;
      default:
        return (
          <GenericReportPanel
            reportName={subTabLabel ?? subTabId}
            reportType={reportType}
            data={qrReport as unknown as Record<string, unknown> | undefined}
            isLoading={qrReportLoading}
            onExport={onExport}
            isExporting={isExporting}
          />
        );
    }
  }

  if (moduleId === 'bookings' && subTabId !== 'overview') {
    const bookingSubTabProps = {
      data: bookingReport,
      isLoading: bookingReportLoading,
      onExport,
      isExporting,
    };
    switch (subTabId) {
      case 'booking-summary':
        return <BookingSummaryPanel {...bookingSubTabProps} />;
      case 'reservation-summary':
        return <ReservationSummaryPanel {...bookingSubTabProps} />;
      case 'occupancy-utilization':
        return <OccupancyUtilizationPanel {...bookingSubTabProps} />;
      default:
        return (
          <GenericReportPanel
            reportName={subTabLabel ?? subTabId}
            reportType={reportType}
            data={
              bookingReport as unknown as Record<string, unknown> | undefined
            }
            isLoading={bookingReportLoading}
            onExport={onExport}
            isExporting={isExporting}
          />
        );
    }
  }

  if (moduleId === 'inventory' && subTabId !== 'overview') {
    const inventorySubTabProps = {
      data: inventoryReport,
      isLoading: inventoryReportLoading,
      onExport,
      isExporting,
    };
    switch (subTabId) {
      case 'stock-level':
        return <StockLevelPanel {...inventorySubTabProps} />;
      case 'stock-transfer':
        return <StockTransferPanel {...inventorySubTabProps} />;
      default:
        return (
          <GenericReportPanel
            reportName={subTabLabel ?? subTabId}
            reportType={reportType}
            data={inventoryReport}
            isLoading={inventoryReportLoading}
            onExport={onExport}
            isExporting={isExporting}
          />
        );
    }
  }

  if (moduleId === 'users' && subTabId !== 'overview') {
    const userSubTabProps = {
      data: userReport,
      isLoading: userReportLoading,
      onExport,
      isExporting,
    };
    switch (subTabId) {
      case 'activity-audit':
        return <ActivityAuditPanel {...userSubTabProps} />;
      case 'daily-sessions':
        return <DailySessionsPanel {...userSubTabProps} />;
      default:
        return (
          <GenericReportPanel
            reportName={subTabLabel ?? subTabId}
            reportType={reportType}
            data={
              userReport as unknown as Record<string, unknown> | undefined
            }
            isLoading={userReportLoading}
            onExport={onExport}
            isExporting={isExporting}
          />
        );
    }
  }

  if (subTabId === 'overview') {
    switch (moduleId) {
      case 'payments':
        return (
          <PaymentOverviewPanel
            data={summary?.paymentDetails}
            isLoading={isLoading}
            comparisonLabel={comparisonLabel}
          />
        );
      case 'bookings':
        return (
          <BookingOverviewPanel
            data={summary?.bookingDetails}
            isLoading={isLoading}
          />
        );
      case 'inventory':
        return (
          <InventoryOverviewPanel
            data={summary?.inventoryDetails}
            isLoading={isLoading}
            comparisonLabel={comparisonLabel}
          />
        );
      case 'users':
        return (
          <UserAuditOverviewPanel
            data={summary?.auditDetails}
            isLoading={isLoading}
          />
        );
      default:
        // Defensive fallback — should be unreachable.
        return <ComingSoonPanel />;
    }
  }

  // Defensive fallback — should be unreachable.
  return <ComingSoonPanel />;
};

export default StockAnalysisPage;
