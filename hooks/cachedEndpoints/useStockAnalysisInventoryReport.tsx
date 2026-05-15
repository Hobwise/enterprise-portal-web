'use client';
import { getReportInventory } from '@/app/api/controllers/dashboard/report';
import { getJsonItemFromLocalStorage } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { InventoryReportPayload } from '@/components/ui/dashboard/inventory/stock-analysis/types';

interface UseInventoryReportArgs {
  filterType: number;
  startDate?: string;
  endDate?: string;
  reportType?: number;
  inventoryItemId?: string;
  categoryId?: string;
  supplierId?: string;
}

const useStockAnalysisInventoryReport = (
  args: UseInventoryReportArgs,
  options?: { enabled?: boolean }
) => {
  const business = getJsonItemFromLocalStorage('business');

  const fetchInventoryReport = async ({ queryKey }: any) => {
    const [, payload] = queryKey as [string, InventoryReportPayload];
    const responseData = await getReportInventory(
      business?.[0]?.businessId,
      payload.filterType,
      payload.startDate,
      payload.endDate,
      payload.reportType,
      payload.inventoryItemId,
      payload.categoryId,
      payload.supplierId
    );
    return (responseData?.data?.data ?? null) as unknown[] | null;
  };

  const { data, isLoading, isError, refetch } = useQuery<unknown[] | null>({
    queryKey: ['stockAnalysisInventoryReport', args],
    queryFn: fetchInventoryReport,
    refetchOnWindowFocus: false,
    ...options,
  });

  return { data, isLoading, isError, refetch };
};

export default useStockAnalysisInventoryReport;
