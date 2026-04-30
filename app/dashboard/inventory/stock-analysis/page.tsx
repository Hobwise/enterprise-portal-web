'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Chip } from '@nextui-org/react';
import { FiDownload } from 'react-icons/fi';
import { IoIosArrowForward } from 'react-icons/io';
import {
  HiOutlineCreditCard,
  HiOutlineCube,
  HiOutlineQrcode,
} from 'react-icons/hi';
import { BsBookmark } from 'react-icons/bs';
import {
  MdOutlineBarChart,
  MdOutlineCategory,
  MdOutlinePeopleAlt,
  MdOutlinePayments,
  MdOutlineStar,
  MdOutlineGridView,
  MdOutlineCampaign,
  MdOutlineSupervisorAccount,
  MdOutlineHistory,
} from 'react-icons/md';
import { TbReportSearch } from 'react-icons/tb';
import { LuFileBarChart, LuPackage } from 'react-icons/lu';
import { FaRegCalendarCheck } from 'react-icons/fa';
import {
  formatDateTimeForPayload2,
  getJsonItemFromLocalStorage,
} from '@/lib/utils';
import { SalesOverviewPanel } from '@/components/ui/dashboard/inventory/stock-analysis/SalesPanels';
import { ComingSoonPanel } from '@/components/ui/dashboard/inventory/stock-analysis/SharedPanels';
import { InventoryOverviewPanel } from '@/components/ui/dashboard/inventory/stock-analysis/InventoryOverviewPanel';
import { PaymentOverviewPanel } from '@/components/ui/dashboard/inventory/stock-analysis/PaymentOverviewPanel';
import { BookingOverviewPanel } from '@/components/ui/dashboard/inventory/stock-analysis/BookingOverviewPanel';
import { UserAuditOverviewPanel } from '@/components/ui/dashboard/inventory/stock-analysis/UserAuditOverviewPanel';
import {
  FilterType,
  ModuleId,
  PeriodId,
  ReportSummary,
  periodToFilterType,
} from '@/components/ui/dashboard/inventory/stock-analysis/types';
import useStockAnalysisSummary from '@/hooks/cachedEndpoints/useStockAnalysisSummary';

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
}

const MODULES: ModuleTab[] = [
  {
    id: 'sales',
    label: 'Sales & Orders',
    icon: <MdOutlineBarChart size={18} />,
    badge: { value: '123k', variant: 'count' },
    subTabs: [
      { id: 'overview', label: 'Overview', icon: <MdOutlineGridView size={16} /> },
      {
        id: 'order-volumes',
        label: 'Orders Volumes',
        icon: <MdOutlineBarChart size={16} />,
      },
      {
        id: 'popular-items',
        label: 'Popular Items',
        icon: <MdOutlineStar size={16} />,
      },
      {
        id: 'employee-performance',
        label: 'Employee Performance',
        icon: <MdOutlinePeopleAlt size={16} />,
      },
      {
        id: 'category-performance',
        label: 'Category Performance',
        icon: <MdOutlineCategory size={16} />,
      },
      {
        id: 'order-payment-summary',
        label: 'Order Payment Summary',
        icon: <MdOutlinePayments size={16} />,
      },
    ],
  },
  {
    id: 'payments',
    label: 'Payment & Revenue',
    icon: <HiOutlineCreditCard size={18} />,
    badge: { value: '101 Alerts', variant: 'alert' },
    subTabs: [
      { id: 'overview', label: 'Overview', icon: <MdOutlineGridView size={16} /> },
      {
        id: 'payment-summary',
        label: 'Payment Summary',
        icon: <MdOutlinePayments size={16} />,
      },
      {
        id: 'payment-methods',
        label: 'Payment Methods',
        icon: <HiOutlineCreditCard size={16} />,
      },
      {
        id: 'qr-revenue',
        label: 'QR Revenue',
        icon: <HiOutlineQrcode size={16} />,
      },
      {
        id: 'net-revenue',
        label: 'Net Revenue',
        icon: <MdOutlineBarChart size={16} />,
      },
      {
        id: 'outstanding-receivables',
        label: 'Outstanding Receivables',
        icon: <TbReportSearch size={16} />,
      },
    ],
  },
  {
    id: 'bookings',
    label: 'Bookings & Reservation',
    icon: <BsBookmark size={16} />,
    badge: { value: '10 Alerts', variant: 'alert' },
    subTabs: [
      { id: 'overview', label: 'Overview', icon: <MdOutlineGridView size={16} /> },
      {
        id: 'booking-summary',
        label: 'Booking Summary',
        icon: <BsBookmark size={14} />,
      },
      {
        id: 'reservation-summary',
        label: 'Reservation Summary',
        icon: <FaRegCalendarCheck size={14} />,
      },
      {
        id: 'occupancy-utilization',
        label: 'Occupancy Utilization',
        icon: <LuFileBarChart size={16} />,
      },
    ],
  },
  {
    id: 'inventory',
    label: 'Inventory',
    icon: <HiOutlineCube size={18} />,
    badge: { value: '10 Alerts', variant: 'alert' },
    subTabs: [
      { id: 'overview', label: 'Overview', icon: <MdOutlineGridView size={16} /> },
      {
        id: 'stock-level',
        label: 'Stock Level',
        icon: <MdOutlineBarChart size={16} />,
      },
      {
        id: 'stock-transfer',
        label: 'Stock Transfer',
        icon: <MdOutlineStar size={16} />,
      },
      {
        id: 'purchase-order',
        label: 'Purchase Order',
        icon: <LuPackage size={16} />,
      },
    ],
  },
  {
    id: 'qr',
    label: 'QR Code',
    icon: <HiOutlineQrcode size={18} />,
    badge: { value: '2', variant: 'count' },
    subTabs: [
      { id: 'overview', label: 'Overview', icon: <MdOutlineGridView size={16} /> },
      {
        id: 'qr-details',
        label: 'QR Code Details',
        icon: <HiOutlineQrcode size={16} />,
      },
    ],
  },
  {
    id: 'campaigns',
    label: 'Campaigns',
    icon: <MdOutlineCampaign size={18} />,
    badge: { value: '10 Active', variant: 'alert' },
    subTabs: [
      { id: 'overview', label: 'Overview', icon: <MdOutlineGridView size={16} /> },
      {
        id: 'campaign-performance',
        label: 'Campaign Performance',
        icon: <MdOutlineCampaign size={16} />,
      },
    ],
  },
  {
    id: 'users',
    label: 'Users & Audits',
    icon: <MdOutlineSupervisorAccount size={18} />,
    badge: { value: '10 Logs', variant: 'alert' },
    subTabs: [
      { id: 'overview', label: 'Overview', icon: <MdOutlineGridView size={16} /> },
      {
        id: 'activity-audit',
        label: 'Activity Audit',
        icon: <MdOutlineBarChart size={16} />,
      },
      {
        id: 'daily-sessions',
        label: 'Daily Sessions',
        icon: <MdOutlineHistory size={16} />,
      },
    ],
  },
];

const PERIODS: { id: PeriodId; label: string }[] = [
  { id: 'today', label: 'Today' },
  { id: 'week', label: 'This week' },
  { id: 'year', label: 'Year' },
  { id: 'all', label: 'All' },
];

const StockAnalysisPage: React.FC = () => {
  const router = useRouter();
  const [hasAccess, setHasAccess] = useState(false);
  const [activeModule, setActiveModule] = useState<ModuleId>('sales');
  const [activeSubTab, setActiveSubTab] = useState<string>('overview');
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

  const currentModule = MODULES.find((m) => m.id === activeModule) ?? MODULES[0];

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
    ? `${formatDateTimeForPayload2(customStart)}Z`
    : undefined;
  const endDate = hasCustomRange
    ? `${formatDateTimeForPayload2(customEnd)}Z`
    : undefined;

  const { data: summary, isLoading: summaryLoading } = useStockAnalysisSummary(
    filterType,
    startDate,
    endDate,
    { enabled: hasAccess }
  );

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
        <div className="flex gap-3">
          <Button
            variant="bordered"
            startContent={<FiDownload size={16} />}
            className="border border-gray-200 text-gray-700 bg-white rounded-lg font-medium"
          >
            Export CSV
          </Button>
          <Button
            startContent={<FiDownload size={16} />}
            className="bg-primaryColor text-white rounded-lg font-medium"
          >
            Export PDF
          </Button>
        </div>
      </div>

      {/* Module tabs + sub-tabs card */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm">
        <ModuleTabsBar
          modules={MODULES}
          active={activeModule}
          onChange={handleModuleChange}
        />
        <div className="px-4 md:px-6 py-4 border-t border-gray-100">
          <SubTabsBar
            tabs={currentModule.subTabs}
            active={activeSubTab}
            onChange={setActiveSubTab}
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
                onClick={() => setActivePeriod(p.id)}
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
            onChange={(e) => setCustomStart(e.target.value)}
            className="px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-700 focus:outline-none focus:border-primaryColor"
          />
          <span className="text-sm text-gray-500">to</span>
          <input
            type="date"
            value={customEnd}
            onChange={(e) => setCustomEnd(e.target.value)}
            className="px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-700 focus:outline-none focus:border-primaryColor"
          />
        </div>
      </div>

      {/* Active panel */}
      <ActivePanel
        moduleId={activeModule}
        subTabId={activeSubTab}
        summary={summary}
        isLoading={summaryLoading}
      />
    </div>
  );
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
  const scrollerRef = React.useRef<HTMLDivElement>(null);

  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollerRef.current) {
      const offset = direction === 'right' ? 240 : -240;
      scrollerRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  return (
    <div className="flex items-center px-2 md:px-3 py-3 gap-2">
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
      <button
        type="button"
        onClick={() => handleScroll('right')}
        aria-label="Scroll modules right"
        className="flex items-center justify-center h-8 w-8 rounded-full border border-gray-200 text-gray-500 hover:bg-gray-50 shrink-0"
      >
        <IoIosArrowForward size={16} />
      </button>
    </div>
  );
};

interface SubTabsBarProps {
  tabs: SubTab[];
  active: string;
  onChange: (id: string) => void;
}

const SubTabsBar: React.FC<SubTabsBarProps> = ({ tabs, active, onChange }) => {
  return (
    <div className="flex flex-wrap gap-2">
      {tabs.map((tab) => {
        const isActive = active === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
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
            <span>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
};

interface ActivePanelProps {
  moduleId: ModuleId;
  subTabId: string;
  summary?: ReportSummary;
  isLoading?: boolean;
}

const ActivePanel: React.FC<ActivePanelProps> = ({
  moduleId,
  subTabId,
  summary,
  isLoading,
}) => {
  if (moduleId === 'sales') {
    if (subTabId === 'overview') {
      return (
        <SalesOverviewPanel
          data={summary?.orderDetails}
          isLoading={isLoading}
        />
      );
    }
    return <ComingSoonPanel />;
  }

  if (subTabId === 'overview') {
    switch (moduleId) {
      case 'payments':
        return (
          <PaymentOverviewPanel
            data={summary?.paymentDetails}
            isLoading={isLoading}
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
        return <ComingSoonPanel />;
    }
  }

  return <ComingSoonPanel />;
};

export default StockAnalysisPage;
