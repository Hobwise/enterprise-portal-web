'use client';
import { useState } from 'react';
import {
  getInventoryCountHistory,
  getInventoryCountItems,
  submitInventoryCount,
  SubmitInventoryCountPayload,
  InventoryCountHistoryItem,
  InventoryCountHistoryResponse,
  InventoryItem,
} from '@/app/api/controllers/dashboard/inventory';
import { getJsonItemFromLocalStorage, notify } from '@/lib/utils';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchQueryConfig } from '@/lib/queryConfig';

interface InventoryCountItemsResult {
  items: InventoryItem[];
  totalCount: number;
  pageSize: number;
  currentPage: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

interface UseInventoryCountOptions {
  itemsPage?: number;
  itemsPageSize?: number;
  itemsSearch?: string;
}

const useInventoryCount = (options: UseInventoryCountOptions = {}) => {
  const { itemsPage = 1, itemsPageSize = 10, itemsSearch = '' } = options;

  const queryClient = useQueryClient();
  const businessInformation = getJsonItemFromLocalStorage('business');
  const businessId = businessInformation?.[0]?.businessId;

  // Pagination & filter state for history
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [pageSize, setPageSize] = useState(10);

  const emptyHistory: InventoryCountHistoryResponse = {
    history: [],
    totalCount: 0,
    pageSize: 10,
    currentPage: 1,
    totalPages: 1,
    hasNext: false,
    hasPrevious: false,
  };

  const emptyItems: InventoryCountItemsResult = {
    items: [],
    totalCount: 0,
    pageSize: itemsPageSize,
    currentPage: 1,
    totalPages: 1,
    hasNext: false,
    hasPrevious: false,
  };

  // Fetch inventory count items (from /api/v1/InventoryCount endpoint)
  const fetchItems = async (): Promise<InventoryCountItemsResult> => {
    if (!businessId) return emptyItems;

    try {
      const response = await getInventoryCountItems(businessId, itemsPage, itemsPageSize, itemsSearch || undefined);

      if (response?.data?.isSuccessful) {
        const responseData = response.data;
        const result = responseData.data;
        const rawItems = Array.isArray(result) ? result : (result?.items ?? result?.data ?? []);

        return {
          items: rawItems as InventoryItem[],
          totalCount: responseData.totalCount ?? result?.totalCount ?? rawItems.length,
          pageSize: responseData.pageSize ?? result?.pageSize ?? itemsPageSize,
          currentPage: responseData.currentPage ?? result?.currentPage ?? itemsPage,
          totalPages: responseData.totalPages ?? result?.totalPages ?? 1,
          hasNext: responseData.hasNext ?? result?.hasNext ?? false,
          hasPrevious: responseData.hasPrevious ?? result?.hasPrevious ?? false,
        };
      }

      return emptyItems;
    } catch (error) {
      return emptyItems;
    }
  };

  const {
    data: itemsData,
    isLoading: isLoadingItems,
    refetch: refetchItems,
  } = useQuery<InventoryCountItemsResult>({
    queryKey: ['inventoryCountItems', businessId, itemsPage, itemsPageSize, itemsSearch],
    queryFn: fetchItems,
    enabled: !!businessId,
    ...fetchQueryConfig(),
  });

  // Fetch inventory count history
  const fetchHistory = async (): Promise<InventoryCountHistoryResponse> => {
    if (!businessId) return emptyHistory;

    try {
      const response = await getInventoryCountHistory(businessId, page, pageSize, search || undefined);

      if (response?.data?.isSuccessful) {
        const result = response.data.data;
        // Handle different paginated response shapes from the API
        const items = Array.isArray(result)
          ? result
          : (result?.items ?? result?.history ?? result?.data ?? []);
        return {
          history: items as InventoryCountHistoryItem[],
          totalCount: result?.totalCount ?? result?.totalRecords ?? items.length,
          pageSize: result?.pageSize ?? pageSize,
          currentPage: result?.currentPage ?? result?.page ?? page,
          totalPages: result?.totalPages ?? 1,
          hasNext: result?.hasNext ?? false,
          hasPrevious: result?.hasPrevious ?? false,
        };
      }

      return emptyHistory;
    } catch (error) {
      return emptyHistory;
    }
  };

  const {
    data: historyData,
    isLoading: isLoadingHistory,
    refetch: refetchHistory,
  } = useQuery<InventoryCountHistoryResponse>({
    queryKey: ['inventoryCountHistory', businessId, page, search, pageSize],
    queryFn: fetchHistory,
    enabled: !!businessId,
    ...fetchQueryConfig(),
  });

  // Submit inventory count mutation
  const submitMutation = useMutation({
    mutationFn: async (payload: SubmitInventoryCountPayload) => {
      const currentBusiness = getJsonItemFromLocalStorage('business');
      const currentBusinessId = currentBusiness?.[0]?.businessId;
      if (!currentBusinessId) throw new Error('Business ID not found');
      return submitInventoryCount(currentBusinessId, payload);
    },
    onSuccess: (response) => {
      if (response?.data?.isSuccessful) {
        notify({ title: 'Success!', text: 'Inventory count submitted successfully', type: 'success' });
        queryClient.invalidateQueries({ queryKey: ['inventoryCountHistory'] });
        queryClient.invalidateQueries({ queryKey: ['inventoryCountItems'] });
        queryClient.invalidateQueries({ queryKey: ['inventoryItems'] });
      } else {
        notify({ title: 'Error!', text: response?.data?.error || 'Failed to submit inventory count', type: 'error' });
      }
    },
    onError: () => {
      notify({ title: 'Error!', text: 'Failed to submit inventory count', type: 'error' });
    },
  });

  return {
    // Items (from InventoryCount endpoint)
    items: itemsData?.items ?? emptyItems.items,
    itemsTotalCount: itemsData?.totalCount ?? emptyItems.totalCount,
    itemsTotalPages: itemsData?.totalPages ?? emptyItems.totalPages,
    itemsCurrentPage: itemsData?.currentPage ?? emptyItems.currentPage,
    itemsHasNext: itemsData?.hasNext ?? emptyItems.hasNext,
    itemsHasPrevious: itemsData?.hasPrevious ?? emptyItems.hasPrevious,
    isLoadingItems,
    refetchItems,

    // History
    history: historyData?.history ?? emptyHistory.history,
    totalCount: historyData?.totalCount ?? emptyHistory.totalCount,
    totalPages: historyData?.totalPages ?? emptyHistory.totalPages,
    currentPage: historyData?.currentPage ?? emptyHistory.currentPage,
    hasNext: historyData?.hasNext ?? emptyHistory.hasNext,
    hasPrevious: historyData?.hasPrevious ?? emptyHistory.hasPrevious,
    isLoadingHistory,
    refetchHistory,

    // Mutations
    submitInventoryCount: submitMutation.mutate,
    isSubmitting: submitMutation.isPending,

    // Pagination controls (history)
    page,
    setPage,
    search,
    setSearch,
    pageSize,
    setPageSize,
  };
};

export default useInventoryCount;
