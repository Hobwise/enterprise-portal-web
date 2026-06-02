'use client';
import { getReportInventory } from '@/app/api/controllers/dashboard/report';
import { getJsonItemFromLocalStorage } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { InventoryReportPayload } from '@/components/ui/dashboard/report/types';

const isPlainObject = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v);

const isObjectArray = (v: unknown): v is Record<string, unknown>[] =>
  Array.isArray(v) && v.length > 0 && v.every(isPlainObject);

/**
 * Normalise the inventory report HTTP body into a flat array of row objects,
 * regardless of envelope shape:
 *  - `{ data: [...] }`            → the inner array (the common case)
 *  - `[...]`                       → used as-is
 *  - `{ data: { items: [...] } }`  → first array-of-objects value found
 *  - `{ items: [...], ... }`       → first array-of-objects value found
 * Returns `null` when no array of rows can be located.
 */
const extractReportRows = (body: unknown): unknown[] | null => {
  if (Array.isArray(body)) return body;
  if (!isPlainObject(body)) return null;

  const inner = body.data;
  if (Array.isArray(inner)) return inner;

  // Look one level deeper (either inside `data` or the body itself) for the
  // first array of row objects, mirroring GenericReportPanel's own heuristic.
  const scanTarget = isPlainObject(inner) ? inner : body;
  const firstObjectArray = Object.values(scanTarget).find(isObjectArray);
  if (firstObjectArray) return firstObjectArray;

  // Fall back to any array value (handles legitimately-empty reports).
  const firstArray = Object.values(scanTarget).find(Array.isArray);
  return (firstArray as unknown[] | undefined) ?? null;
};

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
    return extractReportRows(responseData?.data);
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
