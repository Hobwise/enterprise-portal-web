import { useCallback, useState } from 'react';
import {
  getReportAuditLogExport,
  getReportBookingExport,
  getReportInventoryExport,
  getReportOrderExport,
  getReportPaymentExport,
} from '@/app/api/controllers/dashboard/report';
import {
  dynamicExportConfig,
  getJsonItemFromLocalStorage,
  notify,
} from '@/lib/utils';
import { ModuleId } from './types';

export const ExportType = {
  Pdf: 0,
  Excel: 1,
} as const;

export type ExportTypeValue = (typeof ExportType)[keyof typeof ExportType];

const SUB_TAB_REPORT_TYPE: Record<string, number | undefined> = {
  // Sales
  'order-volumes': 0,
  'popular-items': 1,
  'employee-performance': 3,
  'category-performance': 14,
  'order-payment-summary': 15,
  // Payments
  'payment-summary': 4,
  'payment-methods': 5,
  'qr-revenue': 6,
  'net-revenue': 19,
  'outstanding-receivables': 20,
  // Bookings
  'booking-summary': 7,
  'reservation-summary': 8,
  'occupancy-utilization': 10,
  // Inventory
  'stock-level': 21,
  'stock-transfer': 22,
  'purchase-order': 23,
  // Users
  'activity-audit': 11,
  'daily-sessions': 12,
};

const SUB_TAB_FILE_NAME: Record<string, string> = {
  'order-volumes': 'OrdersVolumes',
  'popular-items': 'PopularItems',
  'employee-performance': 'EmployeePerformance',
  'category-performance': 'CategoryPerformance',
  'order-payment-summary': 'OrderPaymentSummary',
  'payment-summary': 'PaymentSummary',
  'payment-methods': 'PaymentMethods',
  'qr-revenue': 'QrRevenue',
  'net-revenue': 'NetRevenue',
  'outstanding-receivables': 'OutstandingReceivables',
  'booking-summary': 'BookingSummary',
  'reservation-summary': 'ReservationSummary',
  'occupancy-utilization': 'OccupancyUtilization',
  'stock-level': 'StockLevel',
  'stock-transfer': 'StockTransfer',
  'purchase-order': 'PurchaseOrder',
  'activity-audit': 'ActivityAudit',
  'daily-sessions': 'DailySessions',
  'qr-details': 'QrDetails',
  overview: 'Overview',
};

const MODULE_OVERVIEW_FILE_NAME: Record<ModuleId, string> = {
  sales: 'SalesOverview',
  payments: 'PaymentsOverview',
  bookings: 'BookingsOverview',
  inventory: 'InventoryOverview',
  qr: 'QrOverview',
  users: 'UsersOverview',
};

interface UseStockAnalysisExportArgs {
  module: ModuleId;
  subTab: string;
  filterType: number;
  startDate?: string;
  endDate?: string;
}

export const useStockAnalysisExport = ({
  module,
  subTab,
  filterType,
  startDate,
  endDate,
}: UseStockAnalysisExportArgs) => {
  const [isExporting, setIsExporting] = useState(false);

  const exportTable = useCallback(
    async (exportType: number) => {
      const business = getJsonItemFromLocalStorage('business');
      const businessId = business?.[0]?.businessId;
      if (!businessId) {
        notify({
          title: 'Error!',
          text: 'Business information unavailable',
          type: 'error',
        });
        return;
      }

      const reportType = SUB_TAB_REPORT_TYPE[subTab];
      const fileName =
        SUB_TAB_FILE_NAME[subTab] ?? MODULE_OVERVIEW_FILE_NAME[module] ?? 'Report';

      setIsExporting(true);
      try {
        let response;
        if (module === 'sales' || module === 'qr') {
          response = await getReportOrderExport(
            businessId,
            filterType,
            startDate,
            endDate,
            reportType,
            exportType
          );
        } else if (module === 'payments') {
          response = await getReportPaymentExport(
            businessId,
            filterType,
            startDate,
            endDate,
            reportType,
            exportType
          );
        } else if (module === 'bookings') {
          response = await getReportBookingExport(
            businessId,
            filterType,
            startDate,
            endDate,
            reportType,
            exportType
          );
        } else if (module === 'inventory') {
          response = await getReportInventoryExport(
            businessId,
            filterType,
            startDate,
            endDate,
            reportType,
            exportType
          );
        } else if (module === 'users') {
          response = await getReportAuditLogExport(
            businessId,
            filterType,
            startDate,
            endDate,
            reportType,
            exportType
          );
        } else {
          notify({
            title: 'Unavailable',
            text: 'Export is not supported for this section yet',
            type: 'warning',
          });
          return;
        }

        if (response?.status === 200) {
          dynamicExportConfig(response, fileName);
        } else {
          notify({
            title: 'Error!',
            text: 'Failed to download the file',
            type: 'error',
          });
        }
      } catch {
        notify({
          title: 'Error!',
          text: 'Failed to download the file',
          type: 'error',
        });
      } finally {
        setIsExporting(false);
      }
    },
    [module, subTab, filterType, startDate, endDate]
  );

  return { exportTable, isExporting };
};
